//! # PeraPin Soroban Smart Contract
//!
//! Blockchain logic for the PeraPin micropayment system on Stellar Testnet.
//!
//! ## Overview
//! PeraPin is a Merchant-Pull payment system. The consumer carries a static QR
//! sticker (containing their Stellar public key). The merchant scans it, enters
//! an amount, and hands their phone to the consumer who types a 4-digit PIN.
//! This contract validates the PIN hash and executes the XLM transfer atomically.
//!
//! ## PIN Hashing Convention
//! The PIN hash must always be computed as:
//!   `SHA-256(raw_4_digit_pin + consumer_stellar_public_key_string)`
//!
//! Hashing is done client-side in the browser using the Web Crypto API.
//! The raw PIN NEVER leaves the consumer's browser. Only the hex-encoded hash
//! is submitted to the server and forwarded to this contract.
//!
//! ## Security Properties
//! - Brute-force protection: 3 failed attempts → 15-minute on-chain lockout
//! - Lockout uses Stellar ledger timestamp (tamper-proof, no server involvement)
//! - Successful payment resets the failed attempt counter to 0
//! - PIN hash stored on-chain is one way — the raw PIN cannot be recovered

#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror,
    Address, BytesN, Env, Symbol,
    log,
};

// ─────────────────────────────────────────────────────────────────
//  Storage Key Definitions
// ─────────────────────────────────────────────────────────────────

/// All persistent storage keys used by the contract.
/// Each key is namespaced by wallet address to avoid collisions.
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    /// Stores the SHA-256 pin hash for a given wallet.
    /// Set once during `register`, updated by `change_pin`.
    PinHash(Address),

    /// Counts consecutive failed PIN attempts for a wallet.
    /// Range: 0 (clean) to 3 (locked).
    /// Resets to 0 on any successful payment.
    FailedAttempts(Address),

    /// Ledger timestamp (u64) recorded when FailedAttempts reaches 3.
    /// Used to check whether the 15-minute lockout window has elapsed.
    LockTimestamp(Address),
}

// ─────────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────────

/// Lockout duration in seconds: 15 minutes = 900 seconds.
/// Stellar ledger timestamps are Unix timestamps in seconds.
const LOCKOUT_DURATION_SECONDS: u64 = 900;

/// Maximum failed attempts before a wallet is locked.
const MAX_FAILED_ATTEMPTS: u32 = 3;


// ─────────────────────────────────────────────────────────────────
//  Error Codes
// ─────────────────────────────────────────────────────────────────

/// Contract error codes returned to the caller.
/// These map to HTTP 400 error response bodies in the API layer.
/// Uses #[contracterror] (not #[contracttype]) so that soroban-sdk v22
/// can auto-generate the TryFrom<Error> / Into<Error> conversions required
/// by #[contractimpl] when functions return Result<T, ContractError>.
#[contracterror]
#[derive(Copy, Clone, Debug, PartialEq)]
pub enum ContractError {
    /// Wallet has no pin_hash registered — QR sticker not linked to PeraPin.
    WalletNotRegistered = 1,

    /// Wallet is already registered — prevents overwriting existing PIN.
    WalletAlreadyRegistered = 2,

    /// Submitted PIN hash does not match the stored hash.
    InvalidPin = 3,

    /// Wallet is in the 15-minute lockout state due to too many failed attempts.
    WalletLocked = 4,

    /// Consumer wallet has insufficient XLM balance for the requested amount.
    InsufficientBalance = 5,

    /// Transfer amount must be greater than zero.
    InvalidAmount = 6,

    /// Old PIN hash did not match — change_pin failed.
    InvalidOldPin = 7,

    /// Caller is not authorized to perform this operation.
    Unauthorized = 8,
}

// ─────────────────────────────────────────────────────────────────
//  Contract Definition
// ─────────────────────────────────────────────────────────────────

#[contract]
pub struct PeraPinContract;

#[contractimpl]
impl PeraPinContract {

    // ─────────────────────────────────────────────────────────────
    //  REGISTRATION
    // ─────────────────────────────────────────────────────────────

    /// Registers a wallet address with its PIN hash.
    ///
    /// Called once during consumer onboarding. The pin_hash must be:
    ///   `SHA-256(raw_4_digit_pin + stellar_public_key_string)`
    ///   computed client-side in the browser using the Web Crypto API.
    ///
    /// # Arguments
    /// * `wallet` - The consumer's Stellar wallet address
    /// * `pin_hash` - 32-byte SHA-256 hash of (PIN + public_key)
    ///
    /// # Errors
    /// * `WalletAlreadyRegistered` - if this wallet already has a pin_hash stored
    pub fn register(
        env: Env,
        wallet: Address,
        pin_hash: BytesN<32>,
    ) -> Result<(), ContractError> {
        // Require authorization from the wallet owner.
        // This prevents anyone else from registering on behalf of a wallet.
        wallet.require_auth();

        // Check if already registered — prevent overwriting existing PINs
        let key = DataKey::PinHash(wallet.clone());
        if env.storage().persistent().has(&key) {
            log!(&env, "PeraPin: Wallet already registered: {}", wallet);
            return Err(ContractError::WalletAlreadyRegistered);
        }

        // Store the pin hash with persistent storage (survives ledger expiry)
        env.storage().persistent().set(&key, &pin_hash);

        // Initialize failed attempts counter to 0
        env.storage()
            .persistent()
            .set(&DataKey::FailedAttempts(wallet.clone()), &0u32);

        log!(&env, "PeraPin: Wallet registered: {}", wallet);
        Ok(())
    }

    // ─────────────────────────────────────────────────────────────
    //  PAYMENT
    // ─────────────────────────────────────────────────────────────

    /// Executes a payment from consumer to merchant after verifying the PIN hash.
    ///
    /// This is the core function of the PeraPin system. The flow is:
    /// 1. Check lockout state
    /// 2. Verify PIN hash
    /// 3. Check balance
    /// 4. Transfer XLM
    /// 5. Reset failed attempts on success
    ///
    /// Note: This contract does NOT directly transfer XLM. XLM transfers on Stellar
    /// are handled at the transaction level by the Stellar protocol itself.
    /// This contract validates the PIN and authorizes the transfer — the API layer
    /// signs the Stellar transaction (including the payment operation) with the
    /// consumer's decrypted private key before submitting.
    ///
    /// What this contract DOES:
    /// - Validates the PIN hash on-chain (tamper-proof)
    /// - Enforces lockout policy
    /// - Emits a payment event for auditability
    /// - Resets the attempt counter on success
    ///
    /// # Arguments
    /// * `from` - Consumer's Stellar wallet address
    /// * `to` - Merchant's Stellar wallet address
    /// * `amount_stroops` - Payment amount in stroops (1 XLM = 10_000_000 stroops)
    /// * `submitted_hash` - SHA-256 hash of (PIN + consumer_public_key) from browser
    ///
    /// # Returns
    /// * `Ok(true)` — PIN verified, proceed with transfer
    ///
    /// # Errors
    /// * `WalletNotRegistered` — from wallet has no stored PIN hash
    /// * `WalletLocked` — too many failed attempts, in lockout window
    /// * `InvalidPin` — submitted hash doesn't match stored hash
    /// * `InvalidAmount` — amount_stroops is zero or negative
    pub fn pay(
        env: Env,
        from: Address,
        to: Address,
        amount_stroops: i128,
        submitted_hash: BytesN<32>,
    ) -> Result<bool, ContractError> {
        // Require authorization from the consumer's wallet.
        // The API layer signs this invocation with the consumer's private key.
        from.require_auth();

        // Guard: amount must be positive
        if amount_stroops <= 0 {
            return Err(ContractError::InvalidAmount);
        }

        // ── Step 1: Check lockout ──────────────────────────────────
        if Self::is_locked_internal(&env, &from) {
            log!(&env, "PeraPin: Wallet is locked: {}", from);
            return Err(ContractError::WalletLocked);
        }

        // ── Step 2: Verify wallet is registered ────────────────────
        let pin_key = DataKey::PinHash(from.clone());
        let stored_hash: BytesN<32> = env
            .storage()
            .persistent()
            .get(&pin_key)
            .ok_or(ContractError::WalletNotRegistered)?;

        // ── Step 3: Verify PIN hash ─────────────────────────────────
        if submitted_hash != stored_hash {
            // Wrong PIN — increment failed attempts
            let attempt_key = DataKey::FailedAttempts(from.clone());
            let attempts: u32 = env
                .storage()
                .persistent()
                .get(&attempt_key)
                .unwrap_or(0u32);

            let new_attempts = attempts + 1;
            env.storage().persistent().set(&attempt_key, &new_attempts);

            log!(
                &env,
                "PeraPin: Invalid PIN for {}. Attempt {}/{}",
                from,
                new_attempts,
                MAX_FAILED_ATTEMPTS
            );

            // If we hit the max, set lockout timestamp
            if new_attempts >= MAX_FAILED_ATTEMPTS {
                let now = env.ledger().timestamp();
                env.storage()
                    .persistent()
                    .set(&DataKey::LockTimestamp(from.clone()), &now);
                log!(&env, "PeraPin: Wallet locked at timestamp: {}", now);
            }

            return Ok(false);
        }

        // ── Step 4: PIN verified — emit authorization event ─────────
        // The actual XLM transfer is executed at the Stellar protocol level
        // by the API layer (signed transaction). This contract call is
        // bundled in the same transaction as the payment operation.
        //
        // Emit an on-chain event for auditability and indexing.
        env.events().publish(
            (Symbol::new(&env, "payment"), from.clone()),
            (to.clone(), amount_stroops),
        );

        // ── Step 5: Reset failed attempts on success ─────────────────
        env.storage()
            .persistent()
            .set(&DataKey::FailedAttempts(from.clone()), &0u32);

        log!(
            &env,
            "PeraPin: Payment authorized — {} → {} : {} stroops",
            from,
            to,
            amount_stroops
        );

        Ok(true)
    }

    // ─────────────────────────────────────────────────────────────
    //  LOCKOUT MANAGEMENT
    // ─────────────────────────────────────────────────────────────

    /// Returns true if the wallet is currently in a lockout state.
    ///
    /// A wallet is locked if:
    /// - FailedAttempts >= MAX_FAILED_ATTEMPTS (3)
    /// - AND the elapsed time since LockTimestamp < LOCKOUT_DURATION_SECONDS (900s)
    ///
    /// Once 15 minutes have passed, the wallet is automatically considered
    /// unlocked without any admin action — the next payment attempt will
    /// trigger auto-unlock via this check.
    ///
    /// # Arguments
    /// * `wallet` - Wallet address to check
    pub fn is_locked(env: Env, wallet: Address) -> bool {
        Self::is_locked_internal(&env, &wallet)
    }

    /// Internal lockout check helper (avoids env clone issues).
    fn is_locked_internal(env: &Env, wallet: &Address) -> bool {
        let attempt_key = DataKey::FailedAttempts(wallet.clone());
        let attempts: u32 = env
            .storage()
            .persistent()
            .get(&attempt_key)
            .unwrap_or(0u32);

        if attempts < MAX_FAILED_ATTEMPTS {
            return false; // Not enough failures to be locked
        }

        // Check if lockout window has expired
        let lock_key = DataKey::LockTimestamp(wallet.clone());
        let lock_timestamp: u64 = match env.storage().persistent().get(&lock_key) {
            Some(ts) => ts,
            None => return false, // No timestamp recorded = not locked
        };

        let now = env.ledger().timestamp();
        let elapsed = now.saturating_sub(lock_timestamp);

        if elapsed >= LOCKOUT_DURATION_SECONDS {
            // Lockout window has expired — wallet is effectively unlocked.
            // The counter and timestamp will be reset on the next successful payment.
            // We don't clear here to avoid unnecessary storage writes on every check.
            false
        } else {
            true // Still within the 15-minute lockout window
        }
    }

    /// Returns the remaining lockout time in seconds for a wallet.
    /// Returns 0 if the wallet is not locked.
    ///
    /// # Arguments
    /// * `wallet` - Wallet address to check
    pub fn lockout_remaining(env: Env, wallet: Address) -> u64 {
        let attempt_key = DataKey::FailedAttempts(wallet.clone());
        let attempts: u32 = env
            .storage()
            .persistent()
            .get(&attempt_key)
            .unwrap_or(0u32);

        if attempts < MAX_FAILED_ATTEMPTS {
            return 0;
        }

        let lock_key = DataKey::LockTimestamp(wallet.clone());
        let lock_timestamp: u64 = match env.storage().persistent().get(&lock_key) {
            Some(ts) => ts,
            None => return 0,
        };

        let now = env.ledger().timestamp();
        let elapsed = now.saturating_sub(lock_timestamp);

        LOCKOUT_DURATION_SECONDS.saturating_sub(elapsed)
    }

    /// Manually resets a wallet's lockout state.
    /// Only callable by the wallet owner themselves.
    /// In practice, auto-unlock via `is_locked` is the normal path.
    /// This function exists for support scenarios where a user wants
    /// to explicitly clear their lock state after the 15-min window.
    ///
    /// # Arguments
    /// * `wallet` - Wallet address to unlock
    ///
    /// # Errors
    /// * `WalletLocked` — if called before the 15-minute window has elapsed
    pub fn unlock(env: Env, wallet: Address) -> Result<(), ContractError> {
        wallet.require_auth();

        // Only allow unlock after the lockout window has passed
        if Self::is_locked_internal(&env, &wallet) {
            return Err(ContractError::WalletLocked);
        }

        // Reset state
        env.storage()
            .persistent()
            .set(&DataKey::FailedAttempts(wallet.clone()), &0u32);
        env.storage()
            .persistent()
            .remove(&DataKey::LockTimestamp(wallet.clone()));

        log!(&env, "PeraPin: Wallet unlocked: {}", wallet);
        Ok(())
    }

    // ─────────────────────────────────────────────────────────────
    //  PIN MANAGEMENT
    // ─────────────────────────────────────────────────────────────

    /// Changes a wallet's PIN hash, requiring the old PIN hash to be correct.
    ///
    /// Both old_hash and new_hash must follow the convention:
    ///   `SHA-256(raw_pin + stellar_public_key_string)`
    ///
    /// # Arguments
    /// * `wallet` - Consumer's wallet address
    /// * `old_hash` - Current PIN hash (for verification)
    /// * `new_hash` - New PIN hash to store
    ///
    /// # Errors
    /// * `WalletNotRegistered` — wallet has no stored PIN
    /// * `WalletLocked` — too many failed attempts
    /// * `InvalidOldPin` — old_hash doesn't match stored hash
    pub fn change_pin(
        env: Env,
        wallet: Address,
        old_hash: BytesN<32>,
        new_hash: BytesN<32>,
    ) -> Result<(), ContractError> {
        wallet.require_auth();

        // Check lockout first
        if Self::is_locked_internal(&env, &wallet) {
            return Err(ContractError::WalletLocked);
        }

        // Verify wallet is registered
        let pin_key = DataKey::PinHash(wallet.clone());
        let stored_hash: BytesN<32> = env
            .storage()
            .persistent()
            .get(&pin_key)
            .ok_or(ContractError::WalletNotRegistered)?;

        // Verify old PIN
        if old_hash != stored_hash {
            // Treat failed change_pin as a failed payment attempt for lockout purposes
            let attempt_key = DataKey::FailedAttempts(wallet.clone());
            let attempts: u32 = env
                .storage()
                .persistent()
                .get(&attempt_key)
                .unwrap_or(0u32);
            let new_attempts = attempts + 1;
            env.storage().persistent().set(&attempt_key, &new_attempts);

            if new_attempts >= MAX_FAILED_ATTEMPTS {
                let now = env.ledger().timestamp();
                env.storage()
                    .persistent()
                    .set(&DataKey::LockTimestamp(wallet.clone()), &now);
            }

            return Err(ContractError::InvalidOldPin);
        }

        // Update PIN hash
        env.storage().persistent().set(&pin_key, &new_hash);

        // Reset failed attempts after successful PIN change
        env.storage()
            .persistent()
            .set(&DataKey::FailedAttempts(wallet.clone()), &0u32);

        log!(&env, "PeraPin: PIN changed for wallet: {}", wallet);
        Ok(())
    }

    // ─────────────────────────────────────────────────────────────
    //  READ-ONLY GETTERS
    // ─────────────────────────────────────────────────────────────

    /// Returns the number of consecutive failed PIN attempts for a wallet.
    /// Range: 0 (clean) to MAX_FAILED_ATTEMPTS (3, locked).
    ///
    /// # Arguments
    /// * `wallet` - Wallet address to query
    pub fn get_failed_attempts(env: Env, wallet: Address) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::FailedAttempts(wallet))
            .unwrap_or(0u32)
    }

    /// Returns true if a wallet is registered (has a stored PIN hash).
    ///
    /// # Arguments
    /// * `wallet` - Wallet address to check
    pub fn is_registered(env: Env, wallet: Address) -> bool {
        env.storage()
            .persistent()
            .has(&DataKey::PinHash(wallet))
    }
}

// ─────────────────────────────────────────────────────────────────
//  TESTS
// ─────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::{Address as _, Ledger}, Env};

    /// Helper: create a mock SHA-256 hash (32 bytes) for testing.
    /// In production, this would be SHA-256(pin + public_key) from browser.
    fn make_hash(env: &Env, seed: u8) -> BytesN<32> {
        let mut bytes = [0u8; 32];
        bytes[0] = seed;
        bytes[31] = seed;
        BytesN::from_array(env, &bytes)
    }

    fn setup() -> (Env, PeraPinContractClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(PeraPinContract, ());
        let client = PeraPinContractClient::new(&env, &contract_id);
        (env, client)
    }

    // ── Registration Tests ────────────────────────────────────────

    #[test]
    fn test_register_success() {
        let (env, client) = setup();
        let wallet = Address::generate(&env);
        let pin_hash = make_hash(&env, 1);

        let result = client.try_register(&wallet, &pin_hash);
        assert!(result.is_ok());
        assert!(client.is_registered(&wallet));
    }

    #[test]
    fn test_register_duplicate_fails() {
        let (env, client) = setup();
        let wallet = Address::generate(&env);
        let pin_hash = make_hash(&env, 1);

        client.register(&wallet, &pin_hash);

        // Second registration should fail
        let result = client.try_register(&wallet, &pin_hash);
        assert_eq!(
            result.unwrap_err().unwrap(),
            ContractError::WalletAlreadyRegistered
        );
    }

    // ── Payment Tests ─────────────────────────────────────────────

    #[test]
    fn test_pay_success() {
        let (env, client) = setup();
        let consumer = Address::generate(&env);
        let merchant = Address::generate(&env);
        let pin_hash = make_hash(&env, 42);

        client.register(&consumer, &pin_hash);

        let result = client.pay(&consumer, &merchant, &10_000_000i128, &pin_hash);
        assert_eq!(result, true);

        // Failed attempts should be reset to 0
        assert_eq!(client.get_failed_attempts(&consumer), 0);
    }

    #[test]
    fn test_pay_wrong_pin_increments_attempts() {
        let (env, client) = setup();
        let consumer = Address::generate(&env);
        let merchant = Address::generate(&env);
        let correct_hash = make_hash(&env, 42);
        let wrong_hash = make_hash(&env, 99);

        client.register(&consumer, &correct_hash);

        // First failed attempt
        let result = client.pay(&consumer, &merchant, &10_000_000i128, &wrong_hash);
        assert_eq!(result, false);
        assert_eq!(client.get_failed_attempts(&consumer), 1);

        // Second failed attempt
        assert_eq!(client.pay(&consumer, &merchant, &10_000_000i128, &wrong_hash), false);
        assert_eq!(client.get_failed_attempts(&consumer), 2);
    }

    #[test]
    fn test_pay_lockout_after_three_failures() {
        let (env, client) = setup();
        let consumer = Address::generate(&env);
        let merchant = Address::generate(&env);
        let correct_hash = make_hash(&env, 42);
        let wrong_hash = make_hash(&env, 99);

        client.register(&consumer, &correct_hash);

        // Three failed attempts → lockout
        for _ in 0..3 {
            assert_eq!(client.pay(&consumer, &merchant, &10_000_000i128, &wrong_hash), false);
        }

        assert!(client.is_locked(&consumer));

        // Even correct PIN now fails while locked
        let result = client.try_pay(&consumer, &merchant, &10_000_000i128, &correct_hash);
        assert_eq!(result.unwrap_err().unwrap(), ContractError::WalletLocked);
    }

    #[test]
    fn test_lockout_expires_after_15_minutes() {
        let (env, client) = setup();
        let consumer = Address::generate(&env);
        let merchant = Address::generate(&env);
        let correct_hash = make_hash(&env, 42);
        let wrong_hash = make_hash(&env, 99);

        client.register(&consumer, &correct_hash);

        // Lock the wallet
        for _ in 0..3 {
            assert_eq!(client.pay(&consumer, &merchant, &10_000_000i128, &wrong_hash), false);
        }

        assert!(client.is_locked(&consumer));

        // Advance ledger time by 901 seconds (just past 15-minute window)
        env.ledger().with_mut(|l| l.timestamp += 901);

        // Should no longer be locked
        assert!(!client.is_locked(&consumer));

        // Payment with correct PIN should now succeed
        let result = client.pay(&consumer, &merchant, &10_000_000i128, &correct_hash);
        assert_eq!(result, true);
    }

    #[test]
    fn test_pay_resets_counter_on_success() {
        let (env, client) = setup();
        let consumer = Address::generate(&env);
        let merchant = Address::generate(&env);
        let correct_hash = make_hash(&env, 42);
        let wrong_hash = make_hash(&env, 99);

        client.register(&consumer, &correct_hash);

        // Two failed attempts
        assert_eq!(client.pay(&consumer, &merchant, &10_000_000i128, &wrong_hash), false);
        assert_eq!(client.pay(&consumer, &merchant, &10_000_000i128, &wrong_hash), false);
        assert_eq!(client.get_failed_attempts(&consumer), 2);

        // Correct PIN — should succeed and reset counter
        client.pay(&consumer, &merchant, &10_000_000i128, &correct_hash);
        assert_eq!(client.get_failed_attempts(&consumer), 0);
    }

    // ── PIN Change Tests ──────────────────────────────────────────

    #[test]
    fn test_change_pin_success() {
        let (env, client) = setup();
        let wallet = Address::generate(&env);
        let old_hash = make_hash(&env, 1);
        let new_hash = make_hash(&env, 2);
        let merchant = Address::generate(&env);

        client.register(&wallet, &old_hash);

        // Change PIN
        let result = client.try_change_pin(&wallet, &old_hash, &new_hash);
        assert!(result.is_ok());

        // Old hash should no longer work
        let pay_result = client.pay(&wallet, &merchant, &10_000_000i128, &old_hash);
        assert_eq!(pay_result, false);

        // New hash should work
        let pay_result = client.pay(&wallet, &merchant, &10_000_000i128, &new_hash);
        assert_eq!(pay_result, true);
    }

    #[test]
    fn test_change_pin_wrong_old_hash_fails() {
        let (env, client) = setup();
        let wallet = Address::generate(&env);
        let correct_hash = make_hash(&env, 1);
        let wrong_hash = make_hash(&env, 9);
        let new_hash = make_hash(&env, 2);

        client.register(&wallet, &correct_hash);

        let result = client.try_change_pin(&wallet, &wrong_hash, &new_hash);
        assert_eq!(result.unwrap_err().unwrap(), ContractError::InvalidOldPin);
    }

    // ── Getter Tests ──────────────────────────────────────────────

    #[test]
    fn test_unregistered_wallet_not_locked() {
        let (env, client) = setup();
        let wallet = Address::generate(&env);
        assert!(!client.is_locked(&wallet));
        assert!(!client.is_registered(&wallet));
    }

    #[test]
    fn test_pay_unregistered_wallet_fails() {
        let (env, client) = setup();
        let consumer = Address::generate(&env);
        let merchant = Address::generate(&env);
        let hash = make_hash(&env, 1);

        let result = client.try_pay(&consumer, &merchant, &10_000_000i128, &hash);
        assert_eq!(result.unwrap_err().unwrap(), ContractError::WalletNotRegistered);
    }

    #[test]
    fn test_pay_zero_amount_fails() {
        let (env, client) = setup();
        let consumer = Address::generate(&env);
        let merchant = Address::generate(&env);
        let hash = make_hash(&env, 1);

        client.register(&consumer, &hash);

        let result = client.try_pay(&consumer, &merchant, &0i128, &hash);
        assert_eq!(result.unwrap_err().unwrap(), ContractError::InvalidAmount);
    }
}
