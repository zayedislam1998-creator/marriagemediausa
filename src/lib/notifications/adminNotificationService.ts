import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import {
  sendAdminRegistrationAlert,
  sendAdminPackagePurchaseAlert,
  RegistrationEmailPayload,
  PackagePurchaseEmailPayload,
} from '@/lib/email/emailService';

export interface AdminNotification {
  id: string;
  type: 'REGISTRATION' | 'PAYMENT' | 'KYC' | 'PROPOSAL' | 'SYSTEM';
  title: string;
  message: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

// In-memory persistent cache for quick real-time reactive access in the admin console
const inMemoryAdminNotifications: AdminNotification[] = [
  {
    id: 'notif-seed-1',
    type: 'SYSTEM',
    title: 'MuslimBibah Portal Online',
    message: 'System initialization complete. Database connected with 85+ Halal profile attributes.',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
];

/**
 * Creates an admin notification, logs to PostgreSQL audit_logs, and dispatches an email alert
 */
export async function notifyAdminOfEvent({
  type,
  title,
  message,
  metadata = {},
}: {
  type: AdminNotification['type'];
  title: string;
  message: string;
  metadata?: Record<string, any>;
}) {
  const notif: AdminNotification = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    title,
    message,
    metadata,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  // 1. Add to real-time notification memory
  inMemoryAdminNotifications.unshift(notif);
  if (inMemoryAdminNotifications.length > 100) {
    inMemoryAdminNotifications.pop();
  }

  // 2. Persist audit log to PostgreSQL if database connection is available
  try {
    await db.insert(auditLogs).values({
      action: `NOTIFICATION_${type}`,
      entityName: 'ADMIN_NOTIFICATION',
      entityId: notif.id,
      meta: { title, message, ...metadata },
    });
  } catch (err: any) {
    console.warn('[NOTIFICATIONS] Failed to write audit log to PostgreSQL (continuing):', err.message);
  }

  // 3. Trigger email dispatches depending on event type
  try {
    if (type === 'REGISTRATION' && metadata?.userPayload) {
      await sendAdminRegistrationAlert(metadata.userPayload as RegistrationEmailPayload);
    } else if (type === 'PAYMENT' && metadata?.paymentPayload) {
      await sendAdminPackagePurchaseAlert(metadata.paymentPayload as PackagePurchaseEmailPayload);
    }
  } catch (err: any) {
    console.error('[NOTIFICATIONS] Error triggering email from notification service:', err.message);
  }

  return notif;
}

/**
 * Retrieves all admin notifications from PostgreSQL audit logs & in-memory cache
 */
export async function getAdminNotifications(): Promise<AdminNotification[]> {
  try {
    const rows = await db
      .select()
      .from(auditLogs)
      .orderBy(auditLogs.createdAt)
      .limit(50);

    if (rows && rows.length > 0) {
      const dbNotifs: AdminNotification[] = rows
        .filter((r) => r.action?.startsWith('NOTIFICATION_') || r.entityName === 'ADMIN_NOTIFICATION')
        .reverse()
        .map((r) => {
          const meta = (r.meta as any) || {};
          let type: AdminNotification['type'] = 'SYSTEM';
          if (r.action?.includes('REGISTRATION')) type = 'REGISTRATION';
          else if (r.action?.includes('PAYMENT')) type = 'PAYMENT';
          else if (r.action?.includes('KYC')) type = 'KYC';
          else if (r.action?.includes('PROPOSAL')) type = 'PROPOSAL';

          return {
            id: r.entityId || `audit-${r.id}`,
            type,
            title: meta.title || r.action || 'System Notification',
            message: meta.message || `System event logged at ${new Date(r.createdAt).toLocaleTimeString()}`,
            metadata: meta,
            isRead: false,
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
          };
        });

      if (dbNotifs.length > 0) {
        return dbNotifs;
      }
    }
  } catch (err: any) {
    console.warn('[NOTIFICATIONS] Failed to query PostgreSQL audit logs:', err.message);
  }

  return inMemoryAdminNotifications;
}

/**
 * Marks a notification as read
 */
export async function markAdminNotificationAsRead(id: string): Promise<boolean> {
  const notif = inMemoryAdminNotifications.find((n) => n.id === id);
  if (notif) {
    notif.isRead = true;
    return true;
  }
  return true;
}

/**
 * Marks all notifications as read
 */
export async function markAllAdminNotificationsAsRead(): Promise<void> {
  inMemoryAdminNotifications.forEach((n) => (n.isRead = true));
}
