import nodemailer from 'nodemailer';

export interface RegistrationEmailPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  country: string;
  gender: string;
  profileId: string;
  createdAt?: string;
}

export interface PackagePurchaseEmailPayload {
  fullName: string;
  email: string;
  packageName: string;
  amountUsd: string | number;
  contactCredits: number;
  paymentRef: string;
  expiresAt?: string;
}

/**
 * Returns a configured nodemailer transport if credentials exist, otherwise null (mock fallback)
 */
function getMailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587 or other ports
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
}

const FROM_EMAIL = process.env.SMTP_FROM || 'MuslimBibah Notifications <noreply@muslimbibah.com>';
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_ADMIN_EMAIL || 'admin@muslimbibah.com';

/**
 * Dispatches an email notification to the site administrator when a new user registers
 */
export async function sendAdminRegistrationAlert(payload: RegistrationEmailPayload) {
  const subject = `[MuslimBibah Alert] New Member Registered: ${payload.fullName} (#${payload.profileId})`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
        .header { background: linear-gradient(135deg, #064E3B 0%, #022C22 100%); padding: 28px 24px; color: #ffffff; text-align: center; }
        .badge { display: inline-block; background: rgba(16, 185, 129, 0.2); color: #34d399; font-size: 11px; font-weight: 700; letter-spacing: 1px; padding: 4px 12px; border-radius: 12px; margin-bottom: 8px; border: 1px solid rgba(16, 185, 129, 0.4); }
        .title { font-size: 20px; font-weight: 800; margin: 0; color: #ffffff; }
        .content { padding: 24px; }
        .data-table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }
        .data-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
        .data-table td.label { font-weight: 600; color: #64748b; width: 35%; }
        .data-table td.value { font-weight: 700; color: #0f172a; }
        .cta-btn { display: inline-block; background: #059669; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin-top: 24px; text-align: center; }
        .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="badge">ADMINISTRATOR EVENT ALERT</div>
          <h1 class="title">New Member Registration</h1>
        </div>
        <div class="content">
          <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.5;">
            Assalamu Alaikum Administrator,<br/>
            A new user has just registered an account on <strong>MuslimBibah.com</strong>. Here are the details:
          </p>
          <table class="data-table">
            <tr><td class="label">Full Legal Name</td><td class="value">${payload.fullName}</td></tr>
            <tr><td class="label">Profile ID</td><td class="value">#${payload.profileId}</td></tr>
            <tr><td class="label">Email Address</td><td class="value">${payload.email}</td></tr>
            <tr><td class="label">Phone Number</td><td class="value">${payload.phoneNumber}</td></tr>
            <tr><td class="label">Country</td><td class="value">${payload.country}</td></tr>
            <tr><td class="label">Gender</td><td class="value">${payload.gender}</td></tr>
            <tr><td class="label">Registration Time</td><td class="value">${new Date().toUTCString()}</td></tr>
          </table>
          <div style="text-align: center; margin-top: 20px;">
            <a href="https://muslimbibah.com/admin" class="cta-btn">Open Admin Console & Review Member</a>
          </div>
        </div>
        <div class="footer">
          MuslimBibah.com • Automated System Notification • Confidential
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmailInternal({
    to: ADMIN_EMAIL,
    subject,
    html,
  });
}

/**
 * Dispatches a warm Islamic welcome email to the newly registered member
 */
export async function sendMemberWelcomeEmail(payload: { fullName: string; email: string; profileId: string }) {
  const subject = `Welcome to MuslimBibah.com, ${payload.fullName}! Complete Half Your Deen`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
        .header { background: linear-gradient(135deg, #064E3B 0%, #022C22 100%); padding: 32px 24px; color: #ffffff; text-align: center; }
        .title { font-size: 22px; font-weight: 800; margin: 0; color: #ffffff; }
        .content { padding: 28px 24px; font-size: 15px; line-height: 1.6; }
        .tip-box { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 14px; color: #065f46; }
        .cta-btn { display: inline-block; background: #059669; color: #ffffff !important; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 28px; border-radius: 8px; margin-top: 16px; text-align: center; }
        .footer { background: #f8fafc; padding: 18px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div style="font-size: 28px; margin-bottom: 8px;">☪</div>
          <h1 class="title">Welcome to MuslimBibah.com</h1>
          <p style="margin: 6px 0 0; color: #a7f3d0; font-size: 13px;">100% Halal Islamic Matrimonial Network</p>
        </div>
        <div class="content">
          <p><strong>Assalamu Alaikum wa Rahmatullah ${payload.fullName},</strong></p>
          <p>
            Welcome to MuslimBibah.com. Your matrimonial profile has been established with Matrimonial ID <strong>#${payload.profileId}</strong>.
          </p>
          
          <div class="tip-box">
            <strong>Next Steps to Maximise Your Match Opportunities:</strong>
            <ul style="margin: 8px 0 0; padding-left: 20px;">
              <li>Complete your 5-step Biodata with accurate religious practice and family values.</li>
              <li>Provide Wali / Guardian contact info to enable verified introductions.</li>
              <li>Set your Purdah Photo Privacy Shield according to your modesty preference.</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 24px;">
            <a href="https://muslimbibah.com/dashboard" class="cta-btn">Go to Your Member Dashboard</a>
          </div>
        </div>
        <div class="footer">
          MuslimBibah.com • Pure Intention, Halal Marriage • Support: support@muslimbibah.com
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmailInternal({
    to: payload.email,
    subject,
    html,
  });
}

/**
 * Dispatches an email notification to admin when a user purchases a package
 */
export async function sendAdminPackagePurchaseAlert(payload: PackagePurchaseEmailPayload) {
  const subject = `[MuslimBibah Revenue] Package Purchased: ${payload.fullName} - ${payload.packageName} ($${payload.amountUsd})`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%); padding: 28px 24px; color: #ffffff; text-align: center; }
        .badge { display: inline-block; background: rgba(59, 130, 246, 0.2); color: #93c5fd; font-size: 11px; font-weight: 700; letter-spacing: 1px; padding: 4px 12px; border-radius: 12px; margin-bottom: 8px; border: 1px solid rgba(59, 130, 246, 0.4); }
        .content { padding: 24px; }
        .data-table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }
        .data-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
        .data-table td.label { font-weight: 600; color: #64748b; width: 35%; }
        .data-table td.value { font-weight: 700; color: #0f172a; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="badge">MEMBERSHIP UPGRADE TRANSACTION</div>
          <h1 style="font-size: 20px; font-weight: 800; margin: 0; color: #fff;">New Package Purchase</h1>
        </div>
        <div class="content">
          <p style="margin: 0 0 16px;">Assalamu Alaikum Administrator,<br/>A member has completed a membership package purchase:</p>
          <table class="data-table">
            <tr><td class="label">Member Name</td><td class="value">${payload.fullName}</td></tr>
            <tr><td class="label">Member Email</td><td class="value">${payload.email}</td></tr>
            <tr><td class="label">Package Tier</td><td class="value">${payload.packageName}</td></tr>
            <tr><td class="label">Amount Paid</td><td class="value" style="color: #059669; font-size: 16px;">$${payload.amountUsd} USD</td></tr>
            <tr><td class="label">Contact Credits</td><td class="value">${payload.contactCredits} Credits</td></tr>
            <tr><td class="label">Payment Reference</td><td class="value">${payload.paymentRef}</td></tr>
            <tr><td class="label">Timestamp</td><td class="value">${new Date().toUTCString()}</td></tr>
          </table>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmailInternal({
    to: ADMIN_EMAIL,
    subject,
    html,
  });
}

/**
 * Dispatches an email receipt to the member for their package purchase
 */
export async function sendMemberPackageReceiptEmail(payload: PackagePurchaseEmailPayload) {
  const subject = `Your MuslimBibah.com Membership Receipt - ${payload.packageName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #064E3B 0%, #022C22 100%); padding: 28px 24px; color: #ffffff; text-align: center; }
        .content { padding: 24px; font-size: 15px; }
        .receipt-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 style="font-size: 20px; font-weight: 800; margin: 0; color: #fff;">Payment Receipt & Membership Confirmation</h1>
        </div>
        <div class="content">
          <p>Assalamu Alaikum <strong>${payload.fullName}</strong>,</p>
          <p>Thank you for upgrading your MuslimBibah.com membership. Your subscription has been activated.</p>
          <div class="receipt-box">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Package:</span><strong>${payload.packageName}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Amount Paid:</span><strong>$${payload.amountUsd} USD</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Contact Credits Added:</span><strong>${payload.contactCredits} Credits</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Reference Number:</span><code>${payload.paymentRef}</code>
            </div>
          </div>
          <p style="font-size: 13px; color: #64748b;">
            You can now view verified member profiles, request contact details with Wali consent, and access direct proposals.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmailInternal({
    to: payload.email,
    subject,
    html,
  });
}

/**
 * Low-level email sending helper with graceful fallback
 */
async function sendEmailInternal({ to, subject, html }: { to: string; subject: string; html: string }) {
  const transporter = getMailTransporter();

  if (!transporter) {
    // Graceful simulated dispatch when SMTP environment variables are not yet provided
    console.log(`\n======================================================`);
    console.log(`[EMAIL DISPATCH - SIMULATED / LOGGED (NO SMTP CONFIGURED)]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Note: To send real emails, set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env`);
    console.log(`======================================================\n`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL DISPATCH - SUCCESS] Sent to ${to}, messageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId, simulated: false };
  } catch (err: any) {
    console.error(`[EMAIL DISPATCH - ERROR] Failed to send email to ${to}:`, err.message);
    // Never let email failure crash user registration or payments!
    return { success: false, error: err.message, simulated: false };
  }
}
