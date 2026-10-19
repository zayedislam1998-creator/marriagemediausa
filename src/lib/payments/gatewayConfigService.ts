import { db, paymentGatewaysConfig } from '@/db';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

export interface GatewayConfigRecord {
  gateway: 'STRIPE' | 'PAYPAL';
  mode: 'TEST' | 'LIVE';
  isActive: boolean;
  publicKey: string;
  secretKey: string;
  webhookSecret: string;
  webhookId?: string | null;
  settingsJson: Record<string, any>;
  lastTestedAt?: Date | null;
  testStatus?: string | null;
  lastTestMessage?: string | null;
}

export class GatewayConfigService {
  /**
   * Retrieves full gateway config for backend processing
   */
  static async getGatewayConfig(gateway: 'STRIPE' | 'PAYPAL'): Promise<GatewayConfigRecord | null> {
    try {
      const [record] = await db
        .select()
        .from(paymentGatewaysConfig)
        .where(eq(paymentGatewaysConfig.gateway, gateway));

      if (!record) return null;

      // Prefer DB stored key, fallback to ENV if placeholder
      let secretKey = record.encryptedSecretKey;
      let publicKey = record.publicKey;
      let webhookSecret = record.encryptedWebhookSecret;

      if (gateway === 'STRIPE') {
        if ((!secretKey || secretKey.includes('placeholder')) && process.env.STRIPE_SECRET_KEY) {
          secretKey = process.env.STRIPE_SECRET_KEY;
        }
        if ((!publicKey || publicKey.includes('placeholder')) && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
          publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        }
        if ((!webhookSecret || webhookSecret.includes('placeholder')) && process.env.STRIPE_WEBHOOK_SECRET) {
          webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        }
      } else if (gateway === 'PAYPAL') {
        if ((!publicKey || publicKey.includes('placeholder')) && process.env.PAYPAL_CLIENT_ID) {
          publicKey = process.env.PAYPAL_CLIENT_ID;
        }
        if ((!secretKey || secretKey.includes('placeholder')) && process.env.PAYPAL_CLIENT_SECRET) {
          secretKey = process.env.PAYPAL_CLIENT_SECRET;
        }
      }

      return {
        gateway: record.gateway,
        mode: record.mode,
        isActive: record.isActive,
        publicKey: publicKey || '',
        secretKey: secretKey || '',
        webhookSecret: webhookSecret || '',
        webhookId: record.webhookId,
        settingsJson: (record.settingsJson as Record<string, any>) || {},
        lastTestedAt: record.lastTestedAt,
        testStatus: record.testStatus,
        lastTestMessage: record.lastTestMessage,
      };
    } catch (error) {
      console.error(`Error retrieving gateway config for ${gateway}:`, error);
      return null;
    }
  }

  /**
   * Returns all gateway configurations with masked secrets for the Admin UI
   */
  static async getAllConfigsForAdmin(): Promise<any[]> {
    try {
      const rows = await db.select().from(paymentGatewaysConfig);
      return rows.map((r) => {
        const secretKey = r.encryptedSecretKey || '';
        const webhookSecret = r.encryptedWebhookSecret || '';
        const publicKey = r.publicKey || '';

        const isPlaceholder = secretKey.includes('placeholder');
        const maskedSecret = isPlaceholder
          ? ''
          : secretKey.length > 8
          ? `${secretKey.slice(0, 7)}••••••••${secretKey.slice(-4)}`
          : '••••••••';

        const maskedWebhook = webhookSecret.includes('placeholder')
          ? ''
          : webhookSecret.length > 8
          ? `${webhookSecret.slice(0, 6)}••••••••${webhookSecret.slice(-4)}`
          : '••••••••';

        return {
          id: r.id,
          gateway: r.gateway,
          mode: r.mode,
          isActive: r.isActive,
          publicKey: publicKey.includes('placeholder') ? '' : publicKey,
          secretKeyMasked: maskedSecret,
          secretKeyRaw: isPlaceholder ? '' : secretKey,
          webhookSecretMasked: maskedWebhook,
          webhookSecretRaw: webhookSecret.includes('placeholder') ? '' : webhookSecret,
          webhookId: r.webhookId || '',
          settingsJson: r.settingsJson,
          lastTestedAt: r.lastTestedAt,
          testStatus: r.testStatus,
          lastTestMessage: r.lastTestMessage,
        };
      });
    } catch (error) {
      console.error('Error fetching admin gateway configs:', error);
      throw error;
    }
  }

  /**
   * Updates or saves gateway configuration in PostgreSQL
   */
  static async saveGatewayConfig(
    gateway: 'STRIPE' | 'PAYPAL',
    data: {
      mode: 'TEST' | 'LIVE';
      isActive: boolean;
      publicKey: string;
      secretKey: string;
      webhookSecret?: string;
      webhookId?: string;
      settingsJson?: Record<string, any>;
    }
  ) {
    try {
      const updateData: Record<string, any> = {
        mode: data.mode,
        isActive: data.isActive,
        publicKey: data.publicKey,
        updatedAt: new Date(),
      };

      if (data.secretKey) {
        updateData.encryptedSecretKey = data.secretKey;
      }
      if (data.webhookSecret !== undefined) {
        updateData.encryptedWebhookSecret = data.webhookSecret;
      }
      if (data.webhookId !== undefined) {
        updateData.webhookId = data.webhookId;
      }
      if (data.settingsJson !== undefined) {
        updateData.settingsJson = data.settingsJson;
      }

      const [updated] = await db
        .update(paymentGatewaysConfig)
        .set(updateData)
        .where(eq(paymentGatewaysConfig.gateway, gateway))
        .returning();

      return { success: true, record: updated };
    } catch (error: any) {
      console.error(`Error saving config for ${gateway}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Performs an authentic live API ping to verify gateway credentials
   */
  static async testConnection(
    gateway: 'STRIPE' | 'PAYPAL',
    overrideCredentials?: {
      publicKey?: string;
      secretKey?: string;
      mode?: 'TEST' | 'LIVE';
    }
  ): Promise<{ success: boolean; latencyMs: number; message: string }> {
    const startTime = Date.now();

    try {
      // Fetch stored config if not fully overridden
      const stored = await this.getGatewayConfig(gateway);
      const secretKey = overrideCredentials?.secretKey || stored?.secretKey || '';
      const publicKey = overrideCredentials?.publicKey || stored?.publicKey || '';
      const mode = overrideCredentials?.mode || stored?.mode || 'TEST';

      if (!secretKey || secretKey.includes('placeholder')) {
        const errorMsg = `Cannot test connection: No Secret Key or Client Secret has been configured for ${gateway}.`;
        await this.recordTestResult(gateway, 'FAILED', errorMsg);
        return { success: false, latencyMs: 0, message: errorMsg };
      }

      if (gateway === 'STRIPE') {
        // Authenticate directly with Stripe API
        const stripe = new Stripe(secretKey, {
          apiVersion: '2025-02-24.acacia' as any,
          timeout: 10000,
        });

        // Ping balance API
        const balance = await stripe.balance.retrieve();
        const latencyMs = Date.now() - startTime;
        const availableCurrencies = balance.available.map((b) => b.currency.toUpperCase()).join(', ') || 'USD';
        const isLiveKey = secretKey.startsWith('sk_live_');
        const keyMode = isLiveKey ? 'LIVE PRODUCTION' : 'TEST/SANDBOX';

        const successMsg = `✓ Connected to Stripe successfully in ${latencyMs}ms! Key Mode: ${keyMode}. Available: [${availableCurrencies}].`;
        await this.recordTestResult(gateway, 'SUCCESS', successMsg);
        return { success: true, latencyMs, message: successMsg };
      } else if (gateway === 'PAYPAL') {
        const clientId = publicKey;
        const clientSecret = secretKey;
        const isSandbox = mode === 'TEST';
        const baseUrl = isSandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';

        const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials',
          cache: 'no-store',
        });

        const latencyMs = Date.now() - startTime;
        const data = await res.json();

        if (res.ok && data.access_token) {
          const successMsg = `✓ Connected to PayPal successfully in ${latencyMs}ms! Token acquired. Environment: ${isSandbox ? 'SANDBOX' : 'LIVE'}. App ID: ${data.app_id || 'Verified'}.`;
          await this.recordTestResult(gateway, 'SUCCESS', successMsg);
          return { success: true, latencyMs, message: successMsg };
        } else {
          const errorMsg = `PayPal Authentication Failed (${res.status}): ${data.error_description || data.error || 'Invalid Client ID or Secret'}.`;
          await this.recordTestResult(gateway, 'FAILED', errorMsg);
          return { success: false, latencyMs, message: errorMsg };
        }
      }

      return { success: false, latencyMs: 0, message: 'Unsupported gateway' };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      const errorMsg = `Connection Error (${gateway}): ${err.message}`;
      await this.recordTestResult(gateway, 'FAILED', errorMsg);
      return { success: false, latencyMs, message: errorMsg };
    }
  }

  private static async recordTestResult(gateway: 'STRIPE' | 'PAYPAL', status: 'SUCCESS' | 'FAILED', message: string) {
    try {
      await db
        .update(paymentGatewaysConfig)
        .set({
          lastTestedAt: new Date(),
          testStatus: status,
          lastTestMessage: message,
          updatedAt: new Date(),
        })
        .where(eq(paymentGatewaysConfig.gateway, gateway));
    } catch (e) {
      console.error('Failed to record test result in DB:', e);
    }
  }
}
