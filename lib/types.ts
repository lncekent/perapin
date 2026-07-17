export interface Transaction {
  id: string;
  type: "payment" | "receive" | "signup_bonus";
  amount: number;
  partnerName: string;
  partnerId: string;
  timestamp: string;
  status: "success" | "failed";
  ledgerIndex: number;
  txHash: string;
}

export interface CustomerAccount {
  customerId: string;
  name: string;
  phone: string;
  kycType: string;
  kycId: string;
  pin: string;
  stellarPublicKey: string;
  balance: number;
  registeredAt: string;
}

export interface InspectorLog {
  time: string;
  type: "info" | "success" | "warning" | "blockchain";
  title: string;
  message: string;
  details?: any;
}

export interface MerchantAccount {
  id: string;
  name: string;
  owner: string;
  stellarPublicKey: string;
  balance: number;
}
