import { db } from './index';
import { sql } from 'drizzle-orm';

async function migratePayments() {
  console.log('--- Starting Payments Schema Migration ---');

  // 1. Create Enums safely
  await db.execute(sql`
    DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_gateway_enum') THEN
            CREATE TYPE payment_gateway_enum AS ENUM ('STRIPE', 'PAYPAL');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gateway_mode_enum') THEN
            CREATE TYPE gateway_mode_enum AS ENUM ('TEST', 'LIVE');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
            CREATE TYPE payment_status_enum AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_type_enum') THEN
            CREATE TYPE payment_type_enum AS ENUM ('MEMBERSHIP_SUBSCRIPTION', 'WALLET_TOPUP');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wallet_transaction_type_enum') THEN
            CREATE TYPE wallet_transaction_type_enum AS ENUM ('PACKAGE_ALLOWANCE', 'CREDIT_PURCHASE', 'CONTACT_UNLOCK_DEBIT', 'ADMIN_ADJUSTMENT', 'REFUND_REVERSAL');
        END IF;
    END $$;
  `);
  console.log('✓ Payment enums verified/created');

  // 2. Create payment_gateways_config
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS payment_gateways_config (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      gateway payment_gateway_enum NOT NULL UNIQUE,
      mode gateway_mode_enum NOT NULL DEFAULT 'TEST',
      is_active boolean NOT NULL DEFAULT false,
      public_key varchar(255) NOT NULL,
      encrypted_secret_key text NOT NULL,
      encrypted_webhook_secret text NOT NULL,
      webhook_id varchar(120),
      settings_json jsonb NOT NULL DEFAULT '{}'::jsonb,
      last_tested_at timestamp with time zone,
      test_status varchar(30) DEFAULT 'UNTESTED',
      last_test_message text,
      updated_at timestamp with time zone NOT NULL DEFAULT now()
    );
  `);
  console.log('✓ payment_gateways_config table created/verified');

  // 3. Create payment_transactions
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS payment_transactions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      gateway payment_gateway_enum NOT NULL,
      gateway_transaction_id varchar(255) NOT NULL UNIQUE,
      gateway_event_id varchar(255),
      amount numeric(10, 2) NOT NULL,
      fee_amount numeric(10, 2) DEFAULT 0.00,
      net_amount numeric(10, 2),
      currency varchar(3) NOT NULL DEFAULT 'USD',
      status payment_status_enum NOT NULL DEFAULT 'PENDING',
      payment_type payment_type_enum NOT NULL,
      package_id integer REFERENCES packages(id) ON DELETE SET NULL,
      credits_purchased integer NOT NULL DEFAULT 0,
      raw_payload jsonb,
      created_at timestamp with time zone NOT NULL DEFAULT now(),
      updated_at timestamp with time zone NOT NULL DEFAULT now()
    );
  `);
  console.log('✓ payment_transactions table created/verified');

  // Indices for payment_transactions
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_transactions_user ON payment_transactions(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_transactions_status ON payment_transactions(status, created_at);
  `);

  // 4. Create wallet_ledger
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS wallet_ledger (
      id bigserial PRIMARY KEY,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      transaction_type wallet_transaction_type_enum NOT NULL,
      amount integer NOT NULL,
      reference_id uuid,
      notes text,
      created_at timestamp with time zone NOT NULL DEFAULT now()
    );
  `);
  console.log('✓ wallet_ledger table created/verified');

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_wallet_ledger_user ON wallet_ledger(user_id, created_at);
  `);

  // 5. Create processed_webhook_events
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS processed_webhook_events (
      event_id varchar(255) PRIMARY KEY,
      gateway payment_gateway_enum NOT NULL,
      event_type varchar(100) NOT NULL,
      processed_at timestamp with time zone NOT NULL DEFAULT now()
    );
  `);
  console.log('✓ processed_webhook_events table created/verified');

  // 6. Ensure default configuration rows for STRIPE and PAYPAL exist if empty
  await db.execute(sql`
    INSERT INTO payment_gateways_config (gateway, mode, is_active, public_key, encrypted_secret_key, encrypted_webhook_secret, settings_json, test_status, last_test_message)
    VALUES 
      ('STRIPE', 'TEST', true, 'pk_test_placeholder_key', 'sk_test_placeholder_key', 'whsec_placeholder', '{"allowApplePay": true, "allowGooglePay": true}'::jsonb, 'UNTESTED', 'Ready for configuration in Admin Panel'),
      ('PAYPAL', 'TEST', true, 'client_id_placeholder', 'client_secret_placeholder', 'webhook_placeholder', '{"currency": "USD"}'::jsonb, 'UNTESTED', 'Ready for configuration in Admin Panel')
    ON CONFLICT (gateway) DO NOTHING;
  `);
  console.log('✓ Default gateway rows initialized');

  console.log('--- Migration Completed Successfully! ---');
  process.exit(0);
}

migratePayments().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
