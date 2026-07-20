import {
  Keypair,
  Horizon,
  rpc as SorobanRpc,
  TransactionBuilder,
  Address,
  Operation,
  nativeToScVal,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk";

export const STELLAR_NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_SOROBAN_NETWORK_PASSPHRASE ||
  "Test SDF Network ; September 2015";

export const STELLAR_RPC_URL =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ||
  "https://soroban-testnet.stellar.org";

export const HORIZON_URL = "https://horizon-testnet.stellar.org";

export const CONTRACT_ID =
  process.env.NEXT_PUBLIC_SOROBAN_CONTRACT_ID ||
  "CBJZXQKOAVURMAJXOBUNHOXCYEULO33OJATYKSXAMTPGL22WPHBIH7ND";

const sorobanServer = new SorobanRpc.Server(STELLAR_RPC_URL);
const horizonServer = new Horizon.Server(HORIZON_URL);

/**
 * Generates a new random Stellar keypair for onboarding a consumer or merchant.
 */
export function generateStellarKeyPair(): { publicKey: string; secretKey: string } {
  const pair = Keypair.random();
  return {
    publicKey: pair.publicKey(),
    secretKey: pair.secret(),
  };
}

/**
 * Funds a new testnet wallet using Stellar Friendbot.
 */
export async function fundTestnetWallet(publicKey: string): Promise<boolean> {
  try {
    const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Gets the current XLM balance of a Stellar wallet address from Horizon.
 */
export async function getWalletBalanceXlm(publicKey: string): Promise<string> {
  try {
    const account = await horizonServer.loadAccount(publicKey);
    const native = account.balances.find((b) => b.asset_type === "native");
    return native ? native.balance : "0.0000000";
  } catch {
    return "0.0000000";
  }
}

/**
 * Checks whether a wallet is locked on-chain in the PeraPin Soroban contract.
 */
export async function checkIsLockedOnChain(walletAddress: string): Promise<boolean> {
  try {
    const addressScVal = new Address(walletAddress).toScVal();
    const result = await sorobanServer.simulateTransaction(
      await buildContractTx(walletAddress, "is_locked", [addressScVal])
    );
    if (SorobanRpc.Api.isSimulationSuccess(result) && result.result) {
      return Boolean(scValToNative(result.result.retval));
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Helper to build an un-signed Soroban contract invocation transaction.
 */
async function buildContractTx(
  sourceAddress: string,
  functionName: string,
  args: xdr.ScVal[] = []
) {
  const account = await sorobanServer.getAccount(sourceAddress);

  const tx = new TransactionBuilder(account, {
    fee: "10000",
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.invokeContractFunction({
        contract: CONTRACT_ID,
        function: functionName,
        args,
      })
    )
    .setTimeout(30)
    .build();

  return tx;
}

/**
 * Onboarding step: Invokes register(wallet_address, pin_hash) on the Soroban smart contract.
 */
export async function invokeRegisterOnChain(
  walletSecretKey: string,
  pinHashHex: string
): Promise<{ success: boolean; hash?: string; error?: string }> {
  try {
    const keypair = Keypair.fromSecret(walletSecretKey);
    const walletAddress = keypair.publicKey();
    const pinHashBytes = Buffer.from(pinHashHex, "hex");

    if (pinHashBytes.length !== 32) {
      return { success: false, error: "pin_hash must be 32 bytes hex" };
    }

    const tx = await buildContractTx(walletAddress, "register", [
      new Address(walletAddress).toScVal(),
      nativeToScVal(pinHashBytes, { type: "bytes" }),
    ]);

    const simResult = await sorobanServer.simulateTransaction(tx);
    if (!SorobanRpc.Api.isSimulationSuccess(simResult)) {
      return { success: false, error: "Simulation failed for register" };
    }

    const preparedTx = SorobanRpc.assembleTransaction(tx, simResult).build();
    preparedTx.sign(keypair);

    const sendResult = await sorobanServer.sendTransaction(preparedTx);
    if (sendResult.status === "ERROR" || !sendResult.hash) {
      return { success: false, error: `Transaction submission error: ${sendResult.status}` };
    }

    return { success: true, hash: sendResult.hash };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to register on-chain" };
  }
}

/**
 * Core PeraPin Payment Flow: Invokes pay(from, to, amount_stroops, pin_hash) on-chain.
 * Signs transaction with consumer's decrypted private key.
 */
export async function invokePayOnChain(
  consumerSecretKey: string,
  merchantPublicKey: string,
  amountXlm: number,
  pinHashHex: string
): Promise<{ success: boolean; txHash?: string; isLocked?: boolean; error?: string }> {
  try {
    const consumerPair = Keypair.fromSecret(consumerSecretKey);
    const consumerAddress = consumerPair.publicKey();
    const pinHashBytes = Buffer.from(pinHashHex, "hex");

    if (pinHashBytes.length !== 32) {
      return { success: false, error: "pin_hash must be 32 bytes hex" };
    }

    // Convert XLM to stroops (1 XLM = 10,000,000 stroops)
    const amountStroops = BigInt(Math.round(amountXlm * 10_000_000));

    const tx = await buildContractTx(consumerAddress, "pay", [
      new Address(consumerAddress).toScVal(),
      new Address(merchantPublicKey).toScVal(),
      nativeToScVal(amountStroops, { type: "i128" }),
      nativeToScVal(pinHashBytes, { type: "bytes" }),
    ]);

    const simResult = await sorobanServer.simulateTransaction(tx);
    if (!SorobanRpc.Api.isSimulationSuccess(simResult)) {
      return { success: false, error: "Simulation failed. Check PIN or wallet registration." };
    }

    const preparedTx = SorobanRpc.assembleTransaction(tx, simResult).build();
    preparedTx.sign(consumerPair);

    const sendResult = await sorobanServer.sendTransaction(preparedTx);
    if (sendResult.status === "ERROR" || !sendResult.hash) {
      return { success: false, error: `On-chain submission error: ${sendResult.status}` };
    }

    return { success: true, txHash: sendResult.hash };
  } catch (err: any) {
    return { success: false, error: err.message || "Soroban payment invocation failed" };
  }
}
