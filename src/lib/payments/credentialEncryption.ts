import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const prefix = 'enc:v1:';

function getEncryptionKey() {
  const configured = process.env.PAYMENT_CREDENTIALS_ENCRYPTION_KEY || '';
  if (!/^[a-fA-F0-9]{64}$/.test(configured)) {
    throw new Error('PAYMENT_CREDENTIALS_ENCRYPTION_KEY must be set to a 32-byte hex key before saving gateway secrets.');
  }
  return Buffer.from(configured, 'hex');
}

export function encryptCredential(value: string) {
  if (!value) return '';
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${prefix}${iv.toString('hex')}:${tag.toString('hex')}:${ciphertext.toString('hex')}`;
}

export function decryptCredential(value: string | null | undefined) {
  if (!value) return '';
  if (!value.startsWith(prefix)) return value; // Legacy plaintext rows remain readable until rotated.
  const [, version, ivHex, tagHex, ciphertextHex] = value.split(':');
  if (version !== 'v1' || !ivHex || !tagHex || !ciphertextHex) throw new Error('Stored payment credential has an invalid encrypted format.');
  const decipher = createDecipheriv('aes-256-gcm', getEncryptionKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return Buffer.concat([decipher.update(Buffer.from(ciphertextHex, 'hex')), decipher.final()]).toString('utf8');
}

export function hasCredential(value: string | null | undefined) {
  return Boolean(value && !value.toLowerCase().includes('placeholder'));
}
