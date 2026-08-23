/**
 * Privacy Masking Utilities
 *
 * Used in the merchant payment confirmation flow to partially mask
 * consumer identity (name, email, wallet) for privacy while still
 * allowing the merchant to verify the right person.
 *
 * Rules:
 * - Show first 2 characters and last character of each word/segment
 * - Replace middle characters with asterisks
 * - Short strings (≤3 chars) show first char + asterisks
 */

/**
 * Mask a single word: show first 2 + last char, asterisks in between.
 * For short words (≤3 chars): show first char + asterisks.
 */
function maskWord(word: string): string {
  if (word.length <= 1) return word;
  if (word.length <= 3) return word[0] + "*".repeat(word.length - 1);
  return word.slice(0, 2) + "*".repeat(word.length - 3) + word.slice(-1);
}

/**
 * Mask a full name: each word is individually masked.
 * "Juan dela Cruz" → "Ju*n de*a Cr*z"
 */
export function maskName(name: string): string {
  if (!name || !name.trim()) return "";
  return name
    .trim()
    .split(/\s+/)
    .map((word) => maskWord(word))
    .join(" ");
}

/**
 * Mask an email address.
 * "juandelacruz@gmail.com" → "ju*********z@gm***l.com"
 *
 * Shows first 2 + last char of local part, first 2 + last char of domain name, full TLD.
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "";
  const [local, domain] = email.split("@");
  const maskedLocal = maskWord(local);

  const dotIndex = domain.lastIndexOf(".");
  if (dotIndex <= 0) return `${maskedLocal}@${maskWord(domain)}`;

  const domainName = domain.slice(0, dotIndex);
  const tld = domain.slice(dotIndex); // includes the dot

  return `${maskedLocal}@${maskWord(domainName)}${tld}`;
}

/**
 * Mask a Stellar wallet address.
 * "GABC1234...XYZ789ABCDEF" → "GA****...****EF"
 *
 * Shows first 4 + last 4 characters, asterisks in between.
 */
export function maskWallet(wallet: string): string {
  if (!wallet || wallet.length <= 8) return wallet || "";
  return wallet.slice(0, 4) + "****" + wallet.slice(-4);
}

/**
 * Get the display identifier for a consumer.
 * Uses full_name (masked) if available, otherwise falls back to email (masked).
 */
export function getConsumerDisplayName(name: string | null, email: string): string {
  if (name && name.trim()) return maskName(name);
  return maskEmail(email);
}
