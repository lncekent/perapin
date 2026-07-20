import crypto from "crypto";

/**
 * AES-256-GCM Key Encryption Helper
 *
 * Enforces Hard Rule #3 from AGENTS.md:
 * "Custodial wallets — private keys are always encrypted with AES-256-GCM before DB storage"
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET || "perapin_development_secret_key_32bytes_long!!";
  // Ensure the key is exactly 32 bytes (256 bits) using SHA-256
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts a raw Stellar secret seed / private key using AES-256-GCM.
 * Output format: hex(iv + authTag + ciphertext)
 */
export function encryptPrivateKey(rawSecretKey: string): string {
  if (!rawSecretKey) throw new Error("No private key provided to encrypt");

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  const ciphertext = Buffer.concat([cipher.update(rawSecretKey, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Combine IV (12 bytes) + AuthTag (16 bytes) + Ciphertext
  const encryptedPackage = Buffer.concat([iv, authTag, ciphertext]);
  return encryptedPackage.toString("hex");
}

/**
 * Decrypts an AES-256-GCM encrypted string back into a raw Stellar secret seed.
 * Immediately scrubbed after use in API handlers.
 */
export function decryptPrivateKey(encryptedHex: string): string {
  if (!encryptedHex) throw new Error("No encrypted data provided to decrypt");

  const key = getEncryptionKey();
  const encryptedPackage = Buffer.from(encryptedHex, "hex");

  if (encryptedPackage.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error("Invalid encrypted payload length");
  }

  const iv = encryptedPackage.subarray(0, IV_LENGTH);
  const authTag = encryptedPackage.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = encryptedPackage.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString("utf8");
}
