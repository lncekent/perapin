import {
  CustomerAccount,
  Transaction,
  InspectorLog,
  MerchantAccount,
} from "../types";

const DEMO_MERCHANTS: MerchantAccount[] = [
  {
    id: "PP-MERCH-81",
    name: "Aling Nena's Sari-Sari Store",
    owner: "Elena Santos",
    stellarPublicKey: "GBMERCHANT81XXXXXXXXXXXXXXPERAPIN818181",
    balance: 5000.0,
  },
  {
    id: "PP-MERCH-09",
    name: "Berto's Tricycle Services",
    owner: "Alberto Cruz",
    stellarPublicKey: "GBMERCHANT09XXXXXXXXXXXXXXPERAPIN090909",
    balance: 150.0,
  },
  {
    id: "PP-MERCH-55",
    name: "Mang Tomas Carinderia",
    owner: "Tomas Macapagal",
    stellarPublicKey: "GBMERCHANT55XXXXXXXXXXXXXXPERAPIN555555",
    balance: 1280.0,
  },
];

const DEMO_CUSTOMERS: CustomerAccount[] = [
  {
    customerId: "PP-0988-610291",
    name: "Maria Dela Cruz",
    phone: "09175551234",
    kycType: "UMID",
    kycId: "UMID-90812-A",
    pin: "1234",
    stellarPublicKey: "GBA7CR5MCHUNKYSTELARVPERAPIN992817291823912",
    balance: 380.0,
    registeredAt: "2026-07-04T12:00:00Z",
  },
  {
    customerId: "PP-0812-748921",
    name: "Juan Santos",
    phone: "09185558123",
    kycType: "Postal ID",
    kycId: "POSTAL-8219-B",
    pin: "4321",
    stellarPublicKey: "GBK9817291823912B127CR5MCHUNKYSTELARVPERAPIN",
    balance: 1250.0,
    registeredAt: "2026-07-05T09:30:00Z",
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx_mock_1",
    type: "signup_bonus",
    amount: 500.0,
    partnerName: "Soroban Stellar Ledger",
    partnerId: "SYSTEM",
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: "success",
    ledgerIndex: 6421092,
    txHash:
      "0x82f1b822d991b29a8fcf12398d7912a7a8d8e1c2e1f292398282717a2818a721",
  },
];

export const mockStorage = {
  getCustomers(): CustomerAccount[] {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("perapin_customers");
    if (!saved) {
      localStorage.setItem("perapin_customers", JSON.stringify(DEMO_CUSTOMERS));
      return DEMO_CUSTOMERS;
    }
    return JSON.parse(saved);
  },

  saveCustomers(customers: CustomerAccount[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem("perapin_customers", JSON.stringify(customers));
  },

  getTransactions(): Transaction[] {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("perapin_transactions");
    if (!saved) {
      localStorage.setItem(
        "perapin_transactions",
        JSON.stringify(INITIAL_TRANSACTIONS),
      );
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(saved);
  },

  saveTransactions(txs: Transaction[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem("perapin_transactions", JSON.stringify(txs));
  },

  getMerchants(): MerchantAccount[] {
    return DEMO_MERCHANTS;
  },

  getActiveCustomer(): CustomerAccount | null {
    if (typeof window === "undefined") return null;
    const customers = this.getCustomers();
    // Exclude demo customers to find if a new user has registered
    const userCreated = customers.filter(
      (c) =>
        !c.customerId.startsWith("PP-0988") &&
        !c.customerId.startsWith("PP-0812"),
    );
    if (userCreated.length > 0) {
      return userCreated[userCreated.length - 1];
    }
    return customers[0] || null;
  },

  getInspectorLogs(): InspectorLog[] {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("perapin_inspector_logs");
    return saved ? JSON.parse(saved) : [];
  },

  logToInspector(
    type: "info" | "success" | "warning" | "blockchain",
    title: string,
    message: string,
    details?: any,
  ) {
    if (typeof window === "undefined") return;
    const logs = this.getInspectorLogs();
    const newLog: InspectorLog = {
      time: new Date().toLocaleTimeString("en-US", { hour12: false }),
      type,
      title,
      message,
      details,
    };
    const updated = [newLog, ...logs].slice(0, 50); // Keep last 50
    localStorage.setItem("perapin_inspector_logs", JSON.stringify(updated));
    // Dispatch a custom event to notify listeners (e.g. dev inspector UI)
    window.dispatchEvent(new CustomEvent("perapin_log", { detail: newLog }));
  },
};
