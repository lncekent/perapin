/**
 * Client-Side SHA-256 PIN Hashing Helper
 *
 * Enforces Hard Rule #4 from AGENTS.md:
 * "PIN hashing is client-side — SHA-256(pin + public_key) using Web Crypto API; never server-side raw PIN handling"
 *
 * This function runs in the browser using native window.crypto.subtle.
 * The raw 4-digit PIN NEVER leaves the browser.
 */

export async function computePinHash(rawPin: string, consumerPublicKey: string): Promise<string> {
  if (!rawPin || rawPin.length !== 4 || !/^\d{4}$/.test(rawPin)) {
    throw new Error("PIN must be exactly 4 numeric digits");
  }

  if (!consumerPublicKey) {
    throw new Error("Consumer public key is required as salt for PIN hashing");
  }

  // Preimage formula locked in AGENTS.md: raw_4_digit_pin + consumer_stellar_public_key
  const saltedPreimage = `${rawPin}${consumerPublicKey}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(saltedPreimage);

  // Compute SHA-256 hash natively via Web Crypto API
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return hexHash;
}
