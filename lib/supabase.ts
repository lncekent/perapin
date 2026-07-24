import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface UserRecord {
  id: string;
  email: string;
  role: "consumer" | "merchant";
  business_name?: string | null;
  stellar_public_key: string;
  stellar_private_key_enc: string;
  created_at: string;
  last_login?: string;
  pin_registered_at?: string | null;
}

export interface TransactionRecord {
  id: string;
  stellar_tx_hash: string;
  from_user_id: string;
  from_public_key: string;
  to_user_id: string;
  to_public_key: string;
  amount_xlm: number;
  status: "success" | "failed";
  created_at: string;
}

export interface FeedbackRecord {
  id: string;
  user_id?: string | null;
  role: "consumer" | "merchant";
  rating: number;
  comments: string;
  created_at: string;
}

// Global in-memory fallback database for local dev prior to Supabase credentials
const memoryStore = {
  users: new Map<string, UserRecord>(),
  usersByEmail: new Map<string, UserRecord>(),
  usersByPublicKey: new Map<string, UserRecord>(),
  transactions: [] as TransactionRecord[],
};

let supabaseClient: SupabaseClient | null = null;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Polyfill globalThis.WebSocket for Node 20 server environments if not defined
if (typeof window === "undefined" && !globalThis.WebSocket) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    globalThis.WebSocket = require("ws");
  } catch {
    // Ignore if ws is unavailable
  }
}

if (
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.startsWith("PUT_YOUR") &&
  !supabaseKey.startsWith("PUT_YOUR")
) {
  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
}

export const isSupabaseConfigured = (): boolean => supabaseClient !== null;

// ─────────────────────────────────────────────────────────────────
//  DATABASE ACCESS LAYER (Supabase with in-memory fallback)
// ─────────────────────────────────────────────────────────────────

export async function dbGetUserByEmail(email: string): Promise<UserRecord | null> {
  if (supabaseClient) {
    const { data, error } = await supabaseClient
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();
    if (error || !data) return null;
    return data as UserRecord;
  }
  return memoryStore.usersByEmail.get(email.toLowerCase()) || null;
}

export async function dbGetUserByPublicKey(publicKey: string): Promise<UserRecord | null> {
  if (supabaseClient) {
    const { data, error } = await supabaseClient
      .from("users")
      .select("*")
      .eq("stellar_public_key", publicKey)
      .single();
    if (error || !data) return null;
    return data as UserRecord;
  }
  return memoryStore.usersByPublicKey.get(publicKey) || null;
}

export async function dbGetUserById(id: string): Promise<UserRecord | null> {
  if (supabaseClient) {
    const { data, error } = await supabaseClient.from("users").select("*").eq("id", id).single();
    if (error || !data) return null;
    return data as UserRecord;
  }
  return memoryStore.users.get(id) || null;
}

export async function dbCreateUser(user: Omit<UserRecord, "created_at">): Promise<UserRecord> {
  const newRecord: UserRecord = {
    ...user,
    id: user.id || crypto.randomUUID(),
    email: user.email.toLowerCase(),
    created_at: new Date().toISOString(),
  };

  if (supabaseClient) {
    const { data, error } = await supabaseClient
      .from("users")
      .insert([newRecord])
      .select()
      .single();
    if (error) throw new Error(`Supabase Insert User Error: ${error.message}`);
    return data as UserRecord;
  }

  // Memory fallback
  memoryStore.users.set(newRecord.id, newRecord);
  memoryStore.usersByEmail.set(newRecord.email, newRecord);
  memoryStore.usersByPublicKey.set(newRecord.stellar_public_key, newRecord);
  return newRecord;
}

export async function dbMarkPinRegistered(userId: string): Promise<void> {
  const timestamp = new Date().toISOString();
  if (supabaseClient) {
    const { error } = await supabaseClient
      .from("users")
      .update({ pin_registered_at: timestamp })
      .eq("id", userId);
    if (error) throw new Error(`Supabase PIN registration update error: ${error.message}`);
    return;
  }
  const user = memoryStore.users.get(userId);
  if (!user) throw new Error("User not found");
  user.pin_registered_at = timestamp;
}

export async function dbUpdateLastLogin(userId: string): Promise<void> {
  const timestamp = new Date().toISOString();
  if (supabaseClient) {
    await supabaseClient.from("users").update({ last_login: timestamp }).eq("id", userId);
    return;
  }
  const user = memoryStore.users.get(userId);
  if (user) user.last_login = timestamp;
}

export async function dbRecordTransaction(
  tx: Omit<TransactionRecord, "id" | "created_at">,
): Promise<TransactionRecord> {
  const record: TransactionRecord = {
    ...tx,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };

  if (supabaseClient) {
    const { data, error } = await supabaseClient
      .from("transactions")
      .insert([record])
      .select()
      .single();
    if (error) throw new Error(`Supabase Insert Transaction Error: ${error.message}`);
    return data as TransactionRecord;
  }

  memoryStore.transactions.unshift(record);
  return record;
}

export async function dbGetTransactionsForUser(publicKey: string): Promise<TransactionRecord[]> {
  if (supabaseClient) {
    const { data, error } = await supabaseClient
      .from("transactions")
      .select("*")
      .or(`from_public_key.eq.${publicKey},to_public_key.eq.${publicKey}`)
      .order("created_at", { ascending: false });
    if (error) return [];
    return data as TransactionRecord[];
  }

  return memoryStore.transactions.filter(
    (t) => t.from_public_key === publicKey || t.to_public_key === publicKey,
  );
}

export async function dbRecordFeedback(
  feedback: Omit<FeedbackRecord, "id" | "created_at">,
): Promise<FeedbackRecord> {
  const record: FeedbackRecord = {
    ...feedback,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  if (supabaseClient) {
    const { data, error } = await supabaseClient
      .from("feedback")
      .insert([record])
      .select()
      .single();
    if (error) throw new Error(`Supabase feedback insert error: ${error.message}`);
    return data as FeedbackRecord;
  }
  return record;
}
