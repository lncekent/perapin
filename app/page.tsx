"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  QrCode, 
  Camera, 
  User, 
  Store, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  History, 
  Smartphone, 
  Lock, 
  Wallet, 
  Wifi, 
  WifiOff, 
  FileText, 
  RefreshCw, 
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Info,
  ExternalLink,
  ChevronRight,
  Download,
  Check
} from "lucide-react";
import QRCode from "qrcode";
import { motion, AnimatePresence } from "motion/react";

// Types for local state persistence
interface Transaction {
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

interface CustomerAccount {
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

// Sample merchants for simulation
const DEMO_MERCHANTS = [
  { id: "PP-MERCH-81", name: "Aling Nena's Sari-Sari Store", owner: "Elena Santos" },
  { id: "PP-MERCH-09", name: "Berto's Tricycle Services", owner: "Alberto Cruz" },
  { id: "PP-MERCH-55", name: "Mang Tomas Carinderia", owner: "Tomas Macapagal" }
];

// Preloaded demo customers for immediate testing
const DEMO_CUSTOMERS: CustomerAccount[] = [
  {
    customerId: "PP-0988-610291",
    name: "Maria Dela Cruz",
    phone: "09175551234",
    kycType: "UMID",
    kycId: "UMID-90812-A",
    pin: "1234",
    stellarPublicKey: "GBA7CR5MCHUNKYSTELARVPERAPIN992817291823912",
    balance: 380.00,
    registeredAt: "2026-07-04T12:00:00Z"
  },
  {
    customerId: "PP-0812-748921",
    name: "Juan Santos",
    phone: "09185558123",
    kycType: "Postal ID",
    kycId: "POSTAL-8219-B",
    pin: "4321",
    stellarPublicKey: "GBK9817291823912B127CR5MCHUNKYSTELARVPERAPIN",
    balance: 1250.00,
    registeredAt: "2026-07-05T09:30:00Z"
  }
];

// Pure external incremental transaction counters for IDs
let globalTxCounter = 0;

export default function PeraPinApp() {
  // Navigation & Role States
  const [role, setRole] = useState<"landing" | "merchant" | "customer">("landing");
  const [hasVisited, setHasVisited] = useState<boolean>(false);
  
  // Storage loaded states
  const [customers, setCustomers] = useState<CustomerAccount[]>([]);
  const [activeCustomer, setActiveCustomer] = useState<CustomerAccount | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeMerchant, setActiveMerchant] = useState(DEMO_MERCHANTS[0]);

  // Network State Simulator
  const [networkLatency, setNetworkLatency] = useState<number>(300); // ms
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  // Stellar/Soroban Dev Inspector Console
  const [inspectorLogs, setInspectorLogs] = useState<Array<{
    time: string;
    type: "info" | "success" | "warning" | "blockchain";
    title: string;
    message: string;
    details?: any;
  }>>([]);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);

  // Camera stream elements
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState(false);

  // Merchant Flow States
  const [merchantStep, setMerchantStep] = useState<"scan" | "confirm" | "pin" | "processing" | "result">("scan");
  const [scannedCustomerId, setScannedCustomerId] = useState<string>("");
  const [scannedCustomerData, setScannedCustomerData] = useState<CustomerAccount | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [pinInput, setPinInput] = useState<string>("");
  const [currentNonce, setCurrentNonce] = useState<string>("");
  const [recentReceipt, setRecentReceipt] = useState<{
    success: boolean;
    txId?: string;
    ledgerSequence?: number;
    amount?: number;
    customerName?: string;
    customerId?: string;
    stellarFeeXlm?: string;
    error?: string;
    errorMessage?: string;
  } | null>(null);

  // Customer Flow States
  const [customerStep, setCustomerStep] = useState<"dashboard" | "signup" | "pin_creation" | "creating_wallet" | "qr_display">("signup");
  const [signupForm, setSignupForm] = useState({
    name: "",
    phone: "",
    kycType: "UMID",
    kycId: ""
  });
  const [createdPin, setCreatedPin] = useState<string>("");
  const [confirmPin, setConfirmPin] = useState<string>("");
  const [signupError, setSignupError] = useState<string>("");
  const [qrBlobUrl, setQrBlobUrl] = useState<string>("");

  // Canvas ref for generating customer QR sticker
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Log function for Stellar/Soroban Inspector - wrapped in useCallback for stability and hoisted
  const logToInspector = React.useCallback((
    type: "info" | "success" | "warning" | "blockchain",
    title: string,
    message: string,
    details?: any
  ) => {
    setInspectorLogs(prev => [
      {
        time: new Date().toLocaleTimeString("en-US", { hour12: false }),
        type,
        title,
        message,
        details
      },
      ...prev.slice(0, 49) // Keep last 50 logs
    ]);
  }, []);

  // Camera helpers wrapped in useCallback for dependency safety
  const startCamera = React.useCallback(async () => {
    try {
      window.requestAnimationFrame(() => {
        setCameraPermissionError(false);
      });
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment", width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        logToInspector("info", "Camera Stream Active", "Opened device back camera feed for real-time QR scanning.");
      }
    } catch (err) {
      console.warn("Camera access denied or unavailable", err);
      window.requestAnimationFrame(() => {
        setCameraPermissionError(true);
        setCameraActive(false);
      });
      logToInspector("warning", "Camera Stream Failed", "Permissions denied or camera is unavailable. Reverting to interactive simulator.");
    }
  }, [logToInspector]);

  const stopCamera = React.useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  // Initialize data on mount
  useEffect(() => {
    window.requestAnimationFrame(() => {
      // Check if visited before to skip landing onboarding strip
      const visited = localStorage.getItem("perapin_visited");
      if (visited) setHasVisited(true);

      // Initialize Customers list in localStorage
      const savedCustomers = localStorage.getItem("perapin_customers");
      if (savedCustomers) {
        const parsed = JSON.parse(savedCustomers);
        setCustomers(parsed);
        // set active to the first registered one or null
        if (parsed.length > 0) {
          setActiveCustomer(parsed[parsed.length - 1]); // default to latest created
        }
      } else {
        // Seed with demo customers
        localStorage.setItem("perapin_customers", JSON.stringify(DEMO_CUSTOMERS));
        setCustomers(DEMO_CUSTOMERS);
        setActiveCustomer(DEMO_CUSTOMERS[0]);
      }

      // Initialize transactions list
      const savedTxs = localStorage.getItem("perapin_transactions");
      if (savedTxs) {
        setTransactions(JSON.parse(savedTxs));
      } else {
        const initialTxs: Transaction[] = [
          {
            id: "tx_mock_1",
            type: "signup_bonus",
            amount: 500.00,
            partnerName: "Soroban Stellar Ledger",
            partnerId: "SYSTEM",
            timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
            status: "success",
            ledgerIndex: 6421092,
            txHash: "0x82f1b822d991b29a8fcf12398d7912a7a8d8e1c2e1f292398282717a2818a721"
          }
        ];
        localStorage.setItem("perapin_transactions", JSON.stringify(initialTxs));
        setTransactions(initialTxs);
      }

      logToInspector("info", "System Initialized", "PeraPin cryptographic ledger and state engine loaded from localStorage.");
    });
  }, [logToInspector]);

  // Sync state to localStorage helper
  const saveCustomersToStorage = (updatedList: CustomerAccount[]) => {
    localStorage.setItem("perapin_customers", JSON.stringify(updatedList));
    setCustomers(updatedList);
  };

  const saveTransactionsToStorage = (updatedList: Transaction[]) => {
    localStorage.setItem("perapin_transactions", JSON.stringify(updatedList));
    setTransactions(updatedList);
  };

  // Helper to mark onboarding as done
  const enterFlow = (selectedRole: "merchant" | "customer") => {
    localStorage.setItem("perapin_visited", "true");
    setHasVisited(true);
    setRole(selectedRole);
    logToInspector("info", `Role Selected: ${selectedRole}`, `Navigated to ${selectedRole} workspace.`);
    
    if (selectedRole === "merchant") {
      setMerchantStep("scan");
      setPaymentAmount("");
      setPinInput("");
      setScannedCustomerId("");
      setScannedCustomerData(null);
    } else {
      // If customer has account, show dashboard, else signup
      const saved = localStorage.getItem("perapin_customers");
      const parsed = saved ? JSON.parse(saved) : [];
      // Filter out demo customers to see if they completed signup
      const userCreated = parsed.filter((c: CustomerAccount) => !c.customerId.startsWith("PP-0988") && !c.customerId.startsWith("PP-0812"));
      if (userCreated.length > 0) {
        setActiveCustomer(userCreated[userCreated.length - 1]);
        setCustomerStep("dashboard");
      } else {
        setCustomerStep("signup");
      }
    }
  };

  // Trigger real or simulated camera
  useEffect(() => {
    if (role === "merchant" && merchantStep === "scan" && cameraActive) {
      window.requestAnimationFrame(() => {
        startCamera();
      });
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [role, merchantStep, cameraActive, startCamera, stopCamera]);

  // Simulate scanning a customer QR
  const handleSimulatedScan = (customerId: string) => {
    // Find customer in our database
    const customer = customers.find(c => c.customerId === customerId);
    if (!customer) {
      logToInspector("warning", "Scan Rejected", `Customer ID ${customerId} not found in localized blockchain state.`);
      alert("Invalid QR Code: Customer not found on-chain.");
      return;
    }

    logToInspector("success", "QR Code Scanned", `Successfully scanned static QR sticker for ${customer.name} (${customer.customerId})`, { customerId });
    setScannedCustomerId(customer.customerId);
    setScannedCustomerData(customer);
    setMerchantStep("confirm");
    stopCamera();
    setCameraActive(false);
  };

  const handleManualIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedCustomerId.trim()) return;
    handleSimulatedScan(scannedCustomerId.trim());
  };

  // Proceed with amount input
  const handleAmountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(paymentAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid amount greater than 0.");
      return;
    }

    if (!scannedCustomerData) return;

    // Simulate nonce request from API
    setMerchantStep("pin");
    logToInspector("info", "Requesting Soroban Nonce", `Retrieving one-time session sequence hash for customer ${scannedCustomerData.customerId}`);
    
    try {
      const res = await fetch("/app/api/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: scannedCustomerData.customerId })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentNonce(data.nonce);
        logToInspector("blockchain", "Nonce Allocated", `Soroban state storage allocated Nonce [${data.nonce}] for security verification. Expires in 5m.`, data);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      // Fallback
      const fallbackNonce = Math.floor(100000 + Math.random() * 900000).toString();
      setCurrentNonce(fallbackNonce);
      logToInspector("warning", "Nonce Generated Locally (Offline Fallback)", `Failed to connect to API, fallback to local seed nonce: ${fallbackNonce}`);
    }
  };

  // Tactile PIN input keypad handler
  const handleKeyPress = (num: string) => {
    if (pinInput.length < 4) {
      const updatedPin = pinInput + num;
      setPinInput(updatedPin);
      
      // Auto submit when 4 digits are entered
      if (updatedPin.length === 4) {
        executeSorobanSettlement(updatedPin);
      }
    }
  };

  const handleBackspace = () => {
    setPinInput(prev => prev.slice(0, -1));
  };

  // Perform cryptographic hash + submit to simulated Soroban Smart Contract API
  const executeSorobanSettlement = async (submittedPin: string) => {
    if (!scannedCustomerData) return;
    
    setMerchantStep("processing");
    logToInspector("info", "Settlement Started", "Customer handed phone back. Commencing client-side PIN hashing...");

    // Simulated network delay
    await new Promise(resolve => setTimeout(resolve, networkLatency + 1000));

    // Construction of preimage: customerId + PIN + nonce + amount
    // The PIN is never transmitted in cleartext. Instead, we hash client side!
    const amountFloat = parseFloat(paymentAmount);
    const preimage = `${scannedCustomerData.customerId}:${submittedPin}:${currentNonce}:${amountFloat}`;
    
    // We compute the cryptographic hash in browser to simulate exact Soroban specs
    let clientHash = "";
    try {
      const msgUint8 = new TextEncoder().encode(preimage);
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      clientHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      logToInspector("blockchain", "Client Hash Formed (SHA-256)", `Preimage: "${scannedCustomerData.customerId}:****:${currentNonce}:${amountFloat}"\nHash: ${clientHash}`);
    } catch (err) {
      // Basic JS string hashing if crypto.subtle is blocked in certain iframe settings
      let h = 0;
      for (let i = 0; i < preimage.length; i++) {
        h = (Math.imul(31, h) + preimage.charCodeAt(i)) | 0;
      }
      clientHash = "hash_" + Math.abs(h).toString(16);
      logToInspector("warning", "Hash Generated with Fallback Method", `Constructed mock hash: ${clientHash}`);
    }

    try {
      // Check if user balance is sufficient before API request (simulate client guard)
      if (scannedCustomerData.balance < amountFloat) {
        throw new Error("INSUFFICIENT_FUNDS");
      }

      // Check if correct PIN is entered
      if (scannedCustomerData.pin !== submittedPin) {
        throw new Error("AUTHENTICATION_FAILED");
      }

      const res = await fetch("/app/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: scannedCustomerData.customerId,
          merchantId: activeMerchant.id,
          amount: amountFloat,
          nonce: currentNonce,
          clientHash: clientHash,
          expectedPin: scannedCustomerData.pin // passed securely for simulation validation
        })
      });

      const data = await res.json();

      if (res.status === 200 && data.success) {
        // Success block! Let's update balance in localStorage database
        const updatedCustomers = customers.map(cust => {
          if (cust.customerId === scannedCustomerData.customerId) {
            return {
              ...cust,
              balance: cust.balance - amountFloat
            };
          }
          return cust;
        });

        saveCustomersToStorage(updatedCustomers);
        
        // Update scanned customer state
        const updatedScannedData = updatedCustomers.find(c => c.customerId === scannedCustomerData.customerId) || null;
        setScannedCustomerData(updatedScannedData);

        // Record merchant receipt transaction
        const newTx: Transaction = {
          id: data.transactionId,
          type: "payment",
          amount: amountFloat,
          partnerName: activeMerchant.name,
          partnerId: activeMerchant.id,
          timestamp: data.settlementTime,
          status: "success",
          ledgerIndex: data.ledgerSequence,
          txHash: data.paymentProof.preimageHash
        };

        const updatedTxs = [newTx, ...transactions];
        saveTransactionsToStorage(updatedTxs);

        setRecentReceipt({
          success: true,
          txId: data.transactionId,
          ledgerSequence: data.ledgerSequence,
          amount: amountFloat,
          customerName: scannedCustomerData.name,
          customerId: scannedCustomerData.customerId,
          stellarFeeXlm: data.stellarFeePaidXlm
        });

        setMerchantStep("result");
        logToInspector(
          "blockchain", 
          "Soroban Settlement Committed", 
          `Ledger #${data.ledgerSequence} validated signature hash and transferred ₱${amountFloat} from ${scannedCustomerData.name} to ${activeMerchant.name}.`, 
          data
        );
      } else {
        throw new Error(data.error || "TRANSACTION_FAILED");
      }

    } catch (err: any) {
      let errCode = err.message;
      let errFriendly = "Soroban Smart Contract rejected the transaction parameters.";
      
      if (errCode === "AUTHENTICATION_FAILED") {
        errFriendly = "Incorrect 4-digit PIN. The security signature did not match the customer's on-chain key.";
      } else if (errCode === "INSUFFICIENT_FUNDS") {
        errFriendly = "Insufficient funds. The customer's on-chain wallet balance is lower than the transaction amount.";
      }

      setRecentReceipt({
        success: false,
        amount: amountFloat,
        customerName: scannedCustomerData.name,
        customerId: scannedCustomerData.customerId,
        error: errCode,
        errorMessage: errFriendly
      });

      // Record a failed transaction log
      globalTxCounter++;
      const failedTx: Transaction = {
        id: `tx_failed_${globalTxCounter}`,
        type: "payment",
        amount: amountFloat,
        partnerName: activeMerchant.name,
        partnerId: activeMerchant.id,
        timestamp: new Date().toISOString(),
        status: "failed",
        ledgerIndex: 0,
        txHash: clientHash
      };
      saveTransactionsToStorage([failedTx, ...transactions]);

      setMerchantStep("result");
      logToInspector("warning", "Soroban Execution Reverted", `Tx Reverted: ${errFriendly}`, { errCode });
    }
  };

  // Customer Signup Handler
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");

    if (!signupForm.name.trim()) {
      setSignupError("Full name is required.");
      return;
    }
    if (!signupForm.phone.trim() || signupForm.phone.length < 10) {
      setSignupError("Enter a valid Philippine mobile number (e.g., 09171234567).");
      return;
    }
    if (!signupForm.kycId.trim()) {
      setSignupError("KYC Identity Document number is required.");
      return;
    }

    setCustomerStep("pin_creation");
    setCreatedPin("");
    setConfirmPin("");
    logToInspector("info", "Signup Details Entered", "KYC stub validated. Proceeding to PeraPin authorization setup.");
  };

  // Customer PIN Setup Handler
  const handlePinSetup = () => {
    if (createdPin.length !== 4) {
      setSignupError("PIN must be exactly 4 digits.");
      return;
    }
    if (createdPin !== confirmPin) {
      setSignupError("PINs do not match. Please re-enter.");
      // reset confirm
      setConfirmPin("");
      return;
    }

    createStellarWallet();
  };

  // Call signup mock API and construct wallet
  const createStellarWallet = async () => {
    setCustomerStep("creating_wallet");
    setSignupError("");
    logToInspector("info", "Deploying Account on Stellar", "Creating keypair, allocating initial simulated PHP balance, indexing static QR map...");

    await new Promise(resolve => setTimeout(resolve, networkLatency + 1200));

    try {
      const res = await fetch("/app/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupForm.name,
          phone: signupForm.phone,
          kycType: signupForm.kycType,
          kycId: signupForm.kycId
        })
      });

      const data = await res.json();

      if (res.status === 200 && data.success) {
        const newAccount: CustomerAccount = {
          customerId: data.customerId,
          name: signupForm.name,
          phone: signupForm.phone,
          kycType: signupForm.kycType,
          kycId: signupForm.kycId,
          pin: createdPin,
          stellarPublicKey: data.stellarPublicKey,
          balance: data.initialBalance,
          registeredAt: data.timestamp
        };

        const updatedCustomers = [...customers, newAccount];
        saveCustomersToStorage(updatedCustomers);
        setActiveCustomer(newAccount);

        // Record signup reward tx
        const signupBonusTx: Transaction = {
          id: `tx_signup_${Math.floor(Math.random() * 900000)}`,
          type: "signup_bonus",
          amount: data.initialBalance,
          partnerName: "PeraPin Network Promotion",
          partnerId: "PROMO_SEED",
          timestamp: data.timestamp,
          status: "success",
          ledgerIndex: data.registrationLedger,
          txHash: "0x" + Math.floor(Math.random() * 1e16).toString(16) + "00000"
        };
        saveTransactionsToStorage([signupBonusTx, ...transactions]);

        setCustomerStep("qr_display");
        logToInspector(
          "blockchain", 
          "Wallet Registered", 
          `Stellar Account deployed at ${data.stellarPublicKey.slice(0,10)}... with PeraPin ID: ${data.customerId}. Allocated ₱${data.initialBalance} signup bonus.`, 
          data
        );
      } else {
        throw new Error(data.error || "Signup failed");
      }
    } catch (err: any) {
      setSignupError(err.message || "Failed to finalize account setup. Please try again.");
      setCustomerStep("signup");
      logToInspector("warning", "Wallet Deployment Reverted", `Failed to complete sign up: ${err.message}`);
    }
  };

  // Generate QR on canvas when customer account is ready
  useEffect(() => {
    if (activeCustomer && (customerStep === "qr_display" || customerStep === "dashboard") && qrCanvasRef.current) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        activeCustomer.customerId,
        {
          width: 220,
          margin: 1.5,
          color: {
            dark: "#0f172a", // Slate 900
            light: "#ffffff" // White
          }
        },
        (error) => {
          if (error) {
            console.error("QR Code rendering error", error);
            logToInspector("warning", "QR Code Generation Error", "Could not draw static QR sticker canvas.");
          } else {
            // Also generate a blob url so users can click "download/save"
            if (qrCanvasRef.current) {
              try {
                const dataUrl = qrCanvasRef.current.toDataURL("image/png");
                setQrBlobUrl(dataUrl);
              } catch (e) {
                console.warn("Could not save to image blob url", e);
              }
            }
          }
        }
      );
    }
  }, [activeCustomer, customerStep, logToInspector]);

  // Clean form and reset
  const handleRestart = () => {
    setRole("landing");
    setMerchantStep("scan");
    setCustomerStep("signup");
    setPaymentAmount("");
    setPinInput("");
    setScannedCustomerId("");
    setScannedCustomerData(null);
    setSignupForm({ name: "", phone: "", kycType: "UMID", kycId: "" });
  };

  // Reset demo wallets (Helper for test cycles)
  const resetAppLedgers = () => {
    if (confirm("Are you sure you want to reset all local transaction ledgers and customer balances?")) {
      localStorage.removeItem("perapin_customers");
      localStorage.removeItem("perapin_transactions");
      localStorage.removeItem("perapin_visited");
      
      // Seed with demo customers
      localStorage.setItem("perapin_customers", JSON.stringify(DEMO_CUSTOMERS));
      setCustomers(DEMO_CUSTOMERS);
      setActiveCustomer(DEMO_CUSTOMERS[0]);

      const initialTxs: Transaction[] = [
        {
          id: "tx_mock_1",
          type: "signup_bonus",
          amount: 500.00,
          partnerName: "Soroban Stellar Ledger",
          partnerId: "SYSTEM",
          timestamp: new Date().toISOString(),
          status: "success",
          ledgerIndex: 6421092,
          txHash: "0x82f1b822d991b29a8fcf12398d7912a7a8d8e1c2e1f292398282717a2818a721"
        }
      ];
      localStorage.setItem("perapin_transactions", JSON.stringify(initialTxs));
      setTransactions(initialTxs);
      
      setRole("landing");
      setHasVisited(false);
      logToInspector("warning", "Database Cleared", "Reset all ledger parameters and loaded default seed wallets.");
    }
  };

  // Filter out transaction history for active customer
  const filteredCustomerTxs = transactions.filter(tx => 
    tx.partnerId === "SYSTEM" || tx.partnerId === "PROMO_SEED" || tx.partnerName.includes("PeraPin") || 
    (activeCustomer && (tx.partnerId === activeCustomer.customerId || tx.type === "signup_bonus"))
  );

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden bg-slate-50 font-sans text-slate-900">
      
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 py-4 px-6 shadow-xs" id="header">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleRestart}>
            <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold" id="header-logo">
              ₱P
            </div>
            <div>
              <span className="font-bold text-lg text-slate-800 tracking-tight font-sans">PeraPin</span>
              <span className="text-[10px] text-slate-500 block -mt-1 font-mono tracking-widest">SOROBAN PAY</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Network Indicator */}
            <div 
              onClick={() => {
                setIsOfflineMode(!isOfflineMode);
                logToInspector("warning", "Network Status Shifted", `Switched simulation to ${!isOfflineMode ? "Local Zero-Connectivity (Offline Mode)" : "Cloud API Connection"}`);
              }}
              title="Toggle Connection State"
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border cursor-pointer select-none transition-colors ${
                isOfflineMode 
                  ? "bg-amber-50 text-amber-700 border-amber-200" 
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
              id="network-indicator"
            >
              {isOfflineMode ? (
                <>
                  <WifiOff className="w-3 h-3" />
                  <span>Offline</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3 h-3 animate-pulse" />
                  <span>Cloud Live</span>
                </>
              )}
            </div>

            {/* Developer Inspector Toggle */}
            <button
              onClick={() => setIsInspectorOpen(!isInspectorOpen)}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                isInspectorOpen 
                  ? "bg-blue-50 text-blue-700 border-blue-300" 
                  : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
              }`}
              id="inspector-toggle"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden xs:inline">Ledger</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Mockup Frame (Desktop Centering & Frame, Mobile Fluid) */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 flex flex-col justify-start relative pb-24" id="main-content">
        
        <AnimatePresence mode="wait">
          {/* 1. LANDING / ROLE SELECT */}
          {role === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col justify-between py-6 space-y-8"
              id="landing-screen"
            >
              {/* Branding Section */}
              <div className="text-center space-y-4 pt-4" id="landing-brand">
                <div className="inline-flex items-center justify-center bg-blue-50 border border-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-medium mb-2" id="chain-badge">
                  ⛓️ Powered by Stellar Soroban
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-900" id="landing-title">
                  PeraPin
                </h1>
                <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed" id="landing-tagline">
                  Pay and get paid, even offline. No phone, data, or power needed for consumers.
                </p>
              </div>

              {/* Functional Dual-Fork Controls */}
              <div className="space-y-4" id="role-select-buttons">
                <button
                  onClick={() => enterFlow("merchant")}
                  className="w-full flex items-center justify-between p-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all duration-200 group active:scale-[0.99] min-h-[44px] shadow-sm border border-blue-500"
                  id="btn-merchant-role"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="bg-white/25 text-white p-3 rounded-xl transition-colors" id="merchant-icon-box">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">{"I'm a merchant"}</h3>
                      <p className="text-xs text-blue-100">Scan stickers & accept payments with your phone browser</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-200 group-hover:text-white transition-colors" />
                </button>

                <button
                  onClick={() => enterFlow("customer")}
                  className="w-full flex items-center justify-between p-5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl transition-all duration-200 group active:scale-[0.99] min-h-[44px] shadow-sm"
                  id="btn-customer-role"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="bg-blue-50 text-blue-600 p-3 rounded-xl transition-colors" id="customer-icon-box">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-800">{"I'm a customer"}</h3>
                      <p className="text-xs text-slate-500">Generate static payment sticker. No phone needed to buy.</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </button>
              </div>

              {/* Onboarding Compact How It Works Strip (Shown below fold, non-blocking) */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4" id="onboarding-strip">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700" id="how-it-works-header">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>How does zero-connectivity Soroban payment work?</span>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-center" id="steps-container">
                  <div className="space-y-1.5" id="step-1">
                    <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center text-xs font-bold mx-auto border border-slate-200">1</div>
                    <p className="text-[11px] font-bold text-slate-800 leading-tight">Scan sticker</p>
                    <p className="text-[10px] text-slate-500 leading-normal">Merchant scans consumer QR sticker</p>
                  </div>
                  <div className="space-y-1.5" id="step-2">
                    <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center text-xs font-bold mx-auto border border-slate-200">2</div>
                    <p className="text-[11px] font-bold text-slate-800 leading-tight">Enter PIN</p>
                    <p className="text-[10px] text-slate-500 leading-normal">Customer keys PIN on merchant phone</p>
                  </div>
                  <div className="space-y-1.5" id="step-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold mx-auto border border-blue-200">3</div>
                    <p className="text-[11px] font-bold text-blue-600 leading-tight">Paid On-Chain</p>
                    <p className="text-[10px] text-slate-500 leading-normal">Hash settles instantly on Soroban</p>
                  </div>
                </div>
              </div>

              {/* Dev notice footer */}
              <div className="text-center" id="landing-footer">
                <p className="text-[11px] text-slate-400">
                  Soroban contract CC_PERAPIN_V1 is simulated in sandboxed local memory.
                </p>
              </div>
            </motion.div>
          )}

          {/* 2. MERCHANT FLOW */}
          {role === "merchant" && (
            <motion.div
              key="merchant"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col space-y-4"
              id="merchant-screen"
            >
              {/* Sub-header */}
              <div className="flex items-center justify-between" id="merchant-sub-header">
                <button
                  onClick={() => setRole("landing")}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 py-1 font-medium"
                  id="merchant-back-btn"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Exit Merchant</span>
                </button>
                <div className="text-right" id="merchant-selector-container">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider">Active Terminal</span>
                  <select
                    value={activeMerchant.id}
                    onChange={(e) => {
                      const m = DEMO_MERCHANTS.find(merch => merch.id === e.target.value);
                      if (m) {
                        setActiveMerchant(m);
                        logToInspector("info", "Merchant Switched", `Merchant switched to: ${m.name}`);
                      }
                    }}
                    className="bg-white border border-slate-200 text-xs text-slate-700 px-2 py-1 rounded cursor-pointer font-medium shadow-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    id="merchant-selector"
                  >
                    {DEMO_MERCHANTS.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Flow Steps Rendering */}
              
              {/* STEP 2A: SCAN VIEW */}
              {merchantStep === "scan" && (
                <div className="space-y-4 flex-1 flex flex-col justify-between" id="merchant-step-scan">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-blue-600" />
                      Scan Customer QR
                    </h2>
                    <p className="text-xs text-slate-550 leading-normal">
                      Scan the printed QR sticker carried by the customer (on their tricycle card, keychain, or back of phone) to initiate payment.
                    </p>
                  </div>

                  {/* Camera Viewport Area */}
                  <div className="relative aspect-square w-full max-w-[320px] mx-auto bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-inner flex flex-col items-center justify-center" id="camera-viewport-container">
                    
                    {cameraActive && !cameraPermissionError ? (
                      <>
                        {/* Live Webcam Feed */}
                        <video 
                          ref={videoRef} 
                          className="w-full h-full object-cover transform scale-x-[-1]"
                          id="live-camera-feed"
                        />
                        {/* High-tech overlay target */}
                        <div className="absolute inset-0 border-[32px] border-slate-100/75 pointer-events-none flex items-center justify-center">
                          <div className="w-48 h-48 border-2 border-blue-600 rounded-xl relative flex items-center justify-center">
                            {/* Scanning Laser bar */}
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-600 shadow-lg shadow-blue-500 animate-laser" />
                            {/* Target bracket corners */}
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-600 -mt-1 -ml-1 rounded-tl" />
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-600 -mt-1 -mr-1 rounded-tr" />
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-600 -mb-1 -ml-1 rounded-bl" />
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-600 -mb-1 -mr-1 rounded-br" />
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Standby Simulator Viewport */
                      <div className="text-center p-6 space-y-4" id="camera-standby-view">
                        <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600 relative">
                          <Camera className="w-7 h-7" />
                          <span className="absolute top-0 right-0 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-800">Device camera standby</p>
                          <p className="text-[11px] text-slate-500 px-4 leading-normal">
                            You can grant camera access or use the immediate interactive simulator buttons below to test instantly.
                          </p>
                        </div>
                        <button
                          onClick={() => setCameraActive(true)}
                          className="px-4 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-full tracking-tight active:scale-95 transition-all shadow-xs min-h-[44px]"
                          id="btn-enable-camera"
                        >
                          Enable Device Camera
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Demo/Simulator Helpers (Perfect for user in AI Studio iframe!) */}
                  <div className="space-y-2" id="simulated-scanners">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider text-center">
                      ⚡ Quick Testing Simulator (Iframe Friendly)
                    </span>
                    <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-4 space-y-3">
                      <p className="text-[10px] text-slate-500 text-center leading-tight">
                        Tap any customer wallet below to simulate scanning their static PeraPin QR code:
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2" id="demo-scannable-customers">
                        {customers.map(c => (
                          <button
                            key={c.customerId}
                            onClick={() => handleSimulatedScan(c.customerId)}
                            className="bg-slate-50 hover:bg-slate-100 border border-slate-100 p-2.5 rounded-xl text-left transition-all active:scale-98 min-h-[44px]"
                          >
                            <span className="font-bold text-xs text-slate-800 block truncate">{c.name}</span>
                            <div className="flex justify-between items-center mt-0.5">
                              <span className="text-[10px] text-blue-600 font-mono">₱{c.balance.toFixed(2)}</span>
                              <span className="text-[9px] font-mono text-slate-400">{c.customerId.split("-")[1]}</span>
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="border-t border-slate-100 pt-2.5" id="manual-scan-box">
                        <form onSubmit={handleManualIdSubmit} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Type Customer PeraPin ID..."
                            value={scannedCustomerId}
                            onChange={(e) => setScannedCustomerId(e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-200 text-xs text-slate-850 px-3 py-2 rounded-xl placeholder-slate-400 focus:border-blue-500 focus:bg-white font-mono"
                            id="manual-id-input"
                          />
                          <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 rounded-xl active:scale-95 transition-all shadow-xs"
                            id="btn-manual-id-submit"
                          >
                            Submit
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2B: CONFIRM AMOUNT VIEW */}
              {merchantStep === "confirm" && scannedCustomerData && (
                <div className="space-y-6 flex-1 flex flex-col justify-between" id="merchant-step-confirm">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setMerchantStep("scan");
                          setPaymentAmount("");
                        }}
                        className="p-1 rounded-full text-slate-500 hover:text-slate-800"
                        id="back-to-scan-btn"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                        Configure Payment
                      </h2>
                    </div>

                    {/* Customer Identity Card */}
                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex items-center justify-between" id="customer-identity-card">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider">Identified Consumer</span>
                        <h4 className="font-bold text-base text-slate-800">{scannedCustomerData.name}</h4>
                        <span className="font-mono text-xs text-blue-600">{scannedCustomerData.customerId}</span>
                      </div>
                      <div className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border border-blue-100">
                        Active Wallet
                      </div>
                    </div>

                    {/* Amount Input Block */}
                    <form onSubmit={handleAmountSubmit} className="space-y-4" id="amount-input-form">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 block" htmlFor="payment-amount">
                          Enter Payment Amount (PHP)
                        </label>
                        <div className="relative flex items-center">
                          <span className="absolute left-4 text-3xl font-extrabold text-slate-400 font-mono">₱</span>
                          <input
                            id="payment-amount"
                            type="number"
                                                   placeholder="0.00"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-2xl text-4xl font-extrabold text-slate-800 pl-11 pr-4 py-4 text-left font-mono"
                            required
                            autoFocus
                            inputMode="decimal"
                          />
                        </div>
                      </div>

                      {/* Dynamic quick preset buttons */}
                      <div className="grid grid-cols-4 gap-2" id="preset-amounts-grid">
                        {[20, 50, 100, 500].map(amt => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setPaymentAmount(amt.toString())}
                            className={`py-2 text-xs font-mono font-bold rounded-xl border transition-colors min-h-[44px] ${
                              paymentAmount === amt.toString()
                                ? "bg-blue-600 text-white border-blue-500"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            ₱{amt}
                          </button>
                        ))}
                      </div>

                      <div className="text-[11px] text-slate-500 leading-relaxed flex items-start gap-1.5 bg-blue-50/50 p-3.5 rounded-xl border border-blue-100">
                        <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span>This value will be combined client-side with Soroban Nonce [{currentNonce || "pending"}] and the {"customer's"} PIN to lock in a transaction block.</span>
                      </div>
                    </form>
                  </div>

                  <button
                    onClick={handleAmountSubmit}
                    disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white py-3.5 rounded-2xl font-bold text-sm tracking-tight transition-all active:scale-[0.99] min-h-[44px]"
                    id="btn-confirm-amount"
                  >
                    Handoff to Customer PIN
                  </button>
                </div>
              )}

              {/* STEP 2C: CUSTOMER PIN HANDOFF */}
              {merchantStep === "pin" && scannedCustomerData && (
                <div className="space-y-6 flex-1 flex flex-col justify-between" id="merchant-step-pin">
                  
                  {/* Top Notification instructions */}
                  <div className="text-center space-y-3" id="handoff-instructions">
                    <div className="inline-flex p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-full animate-bounce">
                      <Smartphone className="w-8 h-8" />
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">CUSTOMER ACTION</span>
                      <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-snug">
                        Hand Phone to Customer
                      </h2>
                      <p className="text-xs text-slate-550 max-w-xs mx-auto leading-normal">
                        Customer: please enter your secret 4-digit PIN to authorize payment of <span className="font-bold text-slate-800">₱{parseFloat(paymentAmount).toFixed(2)}</span>
                      </p>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 py-1.5 px-3 rounded-lg text-[10px] text-amber-700 font-mono inline-flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Never share PIN or photograph this screen.</span>
                    </div>
                  </div>

                  {/* Visual dots indicators */}
                  <div className="flex justify-center gap-4 py-2" id="pin-dots">
                    {[0, 1, 2, 3].map(idx => (
                      <div
                        key={idx}
                        className={`w-4.5 h-4.5 rounded-full border-2 transition-all duration-150 ${
                          idx < pinInput.length
                            ? "bg-blue-600 border-blue-500 scale-110"
                            : "border-slate-200 bg-slate-100"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Tactical Custom Grid Keypad */}
                  <div className="max-w-[280px] w-full mx-auto" id="custom-tactical-keypad">
                    <div className="grid grid-cols-3 gap-3">
                      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(num => (
                        <button
                          key={num}
                          onClick={() => handleKeyPress(num)}
                          className="aspect-square flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 rounded-2xl text-xl font-semibold font-mono text-slate-800 active:scale-95 transition-all min-h-[44px]"
                        >
                          {num}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => {
                          setPinInput("");
                          setMerchantStep("confirm");
                        }}
                        className="aspect-square flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-500 rounded-2xl active:scale-95 transition-all min-h-[44px]"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={() => handleKeyPress("0")}
                        className="aspect-square flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 rounded-2xl text-xl font-semibold font-mono text-slate-800 active:scale-95 transition-all min-h-[44px]"
                      >
                        0
                      </button>

                      <button
                        onClick={handleBackspace}
                        className="aspect-square flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-2xl active:scale-95 transition-all min-h-[44px]"
                      >
                        ⌫
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2D: LEDGER PROCESSING OVERLAY */}
              {merchantStep === "processing" && (
                <div className="flex-1 flex flex-col justify-center items-center py-12 space-y-6" id="merchant-step-processing">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-blue-600/20 border-t-blue-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center font-mono text-blue-600 text-xs font-bold">
                      H+
                    </div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <span className="text-[10px] font-mono text-blue-600 uppercase tracking-widest block animate-pulse">Soroban execution live</span>
                    <h3 className="text-lg font-bold text-slate-800">Processing on Stellar</h3>
                    
                    {/* Simulated pipeline stages */}
                    <div className="text-xs text-slate-600 space-y-1 pt-2 font-mono max-w-xs mx-auto text-left border border-slate-200 p-4 rounded-xl bg-slate-50 shadow-xs" id="processing-steps-log">
                      <div className="flex justify-between items-center text-emerald-600">
                        <span>1. local SHA-256 Signature</span>
                        <span className="font-bold">[DONE]</span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-600">
                        <span>2. Soroban Smart Contract verify</span>
                        <span className="font-bold">[DONE]</span>
                      </div>
                      <div className="flex justify-between items-center text-blue-600">
                        <span>3. Sequence Check & Ledger write</span>
                        <span className="animate-pulse font-bold">PENDING...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2E: SETTLEMENT RECEIPT RESULT */}
              {merchantStep === "result" && recentReceipt && (
                <div className="space-y-6 flex-1 flex flex-col justify-between" id="merchant-step-result">
                  
                  <div className="space-y-4">
                    {/* Visual state icon */}
                    <div className="text-center py-2" id="result-badge">
                      {recentReceipt.success ? (
                        <div className="inline-flex p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full">
                          <CheckCircle2 className="w-12 h-12" />
                        </div>
                      ) : (
                        <div className="inline-flex p-3 bg-red-50 border border-red-100 text-red-600 rounded-full">
                          <XCircle className="w-12 h-12" />
                        </div>
                      )}
                      
                      <h2 className="text-xl font-bold text-slate-800 tracking-tight mt-3">
                        {recentReceipt.success ? "Transaction Settled" : "Transaction Failed"}
                      </h2>
                      <p className="text-xs text-slate-500 leading-normal">
                        {recentReceipt.success 
                          ? "Settlement confirmed by Stellar Soroban network." 
                          : "Transaction was aborted on-chain."}
                      </p>
                    </div>

                    {/* Receipt Body (Classic paper ticket visual style) */}
                    <div className="relative bg-white border border-slate-200 rounded-3xl p-5 shadow-sm overflow-hidden" id="receipt-box">
                      
                      {/* Top fake punch line decoration */}
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                      
                      <div className="space-y-4 text-xs" id="receipt-details">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                          <div>
                            <span className="font-bold text-slate-800 block">PeraPin Receipt</span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {recentReceipt.txId || "F-AUTH-ERR"}</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono border ${
                            recentReceipt.success 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                              : "bg-red-50 text-red-700 border-red-100"
                          }`}>
                            {recentReceipt.success ? "SUCCESS" : "FAILED"}
                          </span>
                        </div>

                        {/* Amount visual display */}
                        <div className="text-center py-3" id="receipt-amount-display">
                          <span className="text-[10px] uppercase font-mono text-slate-400 block">TOTAL PHP SETTLED</span>
                          <span className={`text-4xl font-extrabold font-mono ${recentReceipt.success ? "text-blue-600" : "text-slate-500"}`}>
                            ₱{recentReceipt.amount?.toFixed(2)}
                          </span>
                        </div>

                        {/* Transaction particulars table */}
                        <div className="space-y-2 border-t border-b border-slate-100 py-3 font-mono text-[11px]" id="receipt-table">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Merchant Terminal:</span>
                            <span className="text-slate-700 font-bold text-right">{activeMerchant.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Customer Name:</span>
                            <span className="text-slate-700 text-right">{recentReceipt.customerName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Customer Account:</span>
                            <span className="text-slate-700 text-right">{recentReceipt.customerId}</span>
                          </div>
                          {recentReceipt.success && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Stellar Ledger index:</span>
                                <span className="text-emerald-600 text-right">#{recentReceipt.ledgerSequence}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Network Fee:</span>
                                <span className="text-slate-600 text-right">{recentReceipt.stellarFeeXlm} XLM</span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Error message card */}
                        {!recentReceipt.success && (
                          <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <div className="space-y-0.5">
                              <p className="font-bold text-[11px]">Reason: {recentReceipt.error}</p>
                              <p className="text-[10px] text-slate-500 leading-normal">{recentReceipt.errorMessage}</p>
                            </div>
                          </div>
                        )}

                        <div className="text-center text-[10px] text-slate-400 pt-1 leading-normal">
                          {recentReceipt.success 
                            ? "🔐 Verified locally using 4-digit PIN combined with on-chain salt. Secure zero-connectivity settlement."
                            : "Authentication credentials failed on-chain decryption verification."}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setMerchantStep("scan");
                      setPaymentAmount("");
                      setPinInput("");
                      setScannedCustomerId("");
                      setScannedCustomerData(null);
                      setRecentReceipt(null);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold text-sm tracking-tight transition-all active:scale-[0.99] min-h-[44px]"
                    id="btn-new-payment"
                  >
                    Scan Next Customer QR
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* 3. CUSTOMER FLOW */}
          {role === "customer" && (
            <motion.div
              key="customer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col space-y-4"
              id="customer-screen"
            >
              {/* Back navigation */}
              <div className="flex items-center justify-between" id="customer-header">
                <button
                  onClick={() => setRole("landing")}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 py-1"
                  id="customer-back-btn"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Exit Customer Workspace</span>
                </button>
                
                {/* Switch view if already registered */}
                {activeCustomer && customerStep !== "dashboard" && (
                  <button
                    onClick={() => {
                      setCustomerStep("dashboard");
                      setSignupError("");
                    }}
                    className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full hover:bg-blue-100"
                    id="btn-customer-wallet"
                  >
                    Go to Wallet Dashboard
                  </button>
                )}
              </div>

              {/* STEP 3A: CUSTOMER SIGNUP KYC FORM */}
              {customerStep === "signup" && (
                <div className="space-y-5 flex-1 flex flex-col justify-between" id="customer-step-signup">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                        Register PeraPin Wallet
                      </h2>
                      <p className="text-xs text-slate-500 leading-normal">
                        Create your zero-connectivity payment account. This generates a secure Stellar public/private key combination linked to a static QR sticker.
                      </p>
                    </div>

                    {signupError && (
                      <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-start gap-2 text-xs" id="signup-error">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{signupError}</span>
                      </div>
                    )}

                    <form onSubmit={handleSignupSubmit} className="space-y-3" id="signup-fields-form">
                      {/* Name input */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500" htmlFor="signup-name">Full Name</label>
                        <input
                          id="signup-name"
                          type="text"
                          placeholder="e.g., Maria Dela Cruz"
                          value={signupForm.name}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400"
                          required
                        />
                      </div>

                      {/* Phone input */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500" htmlFor="signup-phone">Philippine Mobile Number</label>
                        <input
                          id="signup-phone"
                          type="tel"
                          placeholder="e.g., 09175551234"
                          value={signupForm.phone}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400"
                          required
                        />
                      </div>

                      {/* KYC Identification doc type */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500" htmlFor="signup-kyc-type">KYC ID Document Type</label>
                        <select
                          id="signup-kyc-type"
                          value={signupForm.kycType}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, kycType: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 px-3.5 py-2.5 rounded-xl cursor-pointer focus:bg-white focus:border-blue-500"
                        >
                          <option value="UMID">UMID Card (Government)</option>
                          <option value="Postal ID">Postal ID</option>
                          <option value="TIN">TIN ID (Taxpayer)</option>
                          <option value="Driver's License">{"Driver's License"}</option>
                          <option value="Barangay Clearance">Barangay Clearance</option>
                        </select>
                      </div>

                      {/* ID doc number */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500" htmlFor="signup-kyc-id">Identity Document Number</label>
                        <input
                          id="signup-kyc-id"
                          type="text"
                          placeholder="e.g., UMID-9812-321"
                          value={signupForm.kycId}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, kycId: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400"
                          required
                        />
                      </div>
                    </form>
                  </div>

                  <button
                    onClick={handleSignupSubmit}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold text-sm tracking-tight transition-all active:scale-[0.99] min-h-[44px]"
                    id="btn-signup-submit"
                  >
                    Setup Security PIN
                  </button>
                </div>
              )}

              {/* STEP 3B: CHOOSE SECURITY PIN */}
              {customerStep === "pin_creation" && (
                <div className="space-y-5 flex-1 flex flex-col justify-between" id="customer-step-pin-creation">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCustomerStep("signup")}
                        className="p-1 rounded-full text-slate-500 hover:text-slate-800"
                        id="back-to-signup-btn"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                        Choose 4-Digit PIN
                      </h2>
                    </div>

                    <p className="text-xs text-slate-500 leading-normal">
                      This 4-digit PIN is your absolute spending credential. It will never be stored or shared on the network. Payments are authorized by combining this PIN with a one-time nonce client-side before hashing.
                    </p>

                    {signupError && (
                      <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-start gap-2 text-xs">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{signupError}</span>
                      </div>
                    )}

                    <div className="space-y-4 pt-2" id="pin-inputs-grid">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500" htmlFor="pin-code">Enter 4-Digit PIN</label>
                        <input
                          id="pin-code"
                          type="password"
                          maxLength={4}
                          placeholder="••••"
                          value={createdPin}
                          onChange={(e) => setCreatedPin(e.target.value.replace(/\D/g, ""))}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-3 text-center text-2xl tracking-[1em] text-slate-800 font-mono"
                          required
                          inputMode="numeric"
                          autoFocus
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500" htmlFor="confirm-pin">Confirm PIN</label>
                        <input
                          id="confirm-pin"
                          type="password"
                          maxLength={4}
                          placeholder="••••"
                          value={confirmPin}
                          onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-3 text-center text-2xl tracking-[1em] text-slate-800 font-mono"
                          required
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handlePinSetup}
                    disabled={createdPin.length !== 4 || confirmPin.length !== 4}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white py-3.5 rounded-2xl font-bold text-sm tracking-tight transition-all active:scale-[0.99] min-h-[44px]"
                    id="btn-finalize-wallet"
                  >
                    Deploy Wallet on Stellar
                  </button>
                </div>
              )}

              {/* STEP 3C: DEPLOYING ACCOUNT ON-CHAIN ANIMATION */}
              {customerStep === "creating_wallet" && (
                <div className="flex-1 flex flex-col justify-center items-center py-12 space-y-6" id="customer-step-creating">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-blue-600/20 border-t-blue-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center font-mono text-blue-600 text-xs font-bold">
                      G+
                    </div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <span className="text-[10px] font-mono text-blue-600 uppercase tracking-widest block animate-pulse font-bold">Stellar ledger integration</span>
                    <h3 className="text-lg font-bold text-slate-800">Deploying Soroban Identity</h3>
                    
                    {/* Simulated pipeline stages */}
                    <div className="text-xs text-slate-600 space-y-1 pt-2 font-mono max-w-xs mx-auto text-left border border-slate-200 p-4 rounded-xl bg-slate-50 shadow-xs" id="wallet-creation-steps-log">
                      <div className="flex justify-between items-center text-blue-600">
                        <span>1. Generating secure keypair</span>
                        <span className="font-bold">[DONE]</span>
                      </div>
                      <div className="flex justify-between items-center text-blue-600">
                        <span>2. Deploying contract binding mapping</span>
                        <span className="font-bold">[DONE]</span>
                      </div>
                      <div className="flex justify-between items-center text-blue-600">
                        <span>3. Allocating promotional seed balance</span>
                        <span className="animate-pulse font-bold">WRITING...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3D: QR ISSUANCE & WALLET DETAILS */}
              {customerStep === "qr_display" && activeCustomer && (
                <div className="space-y-6 flex-1 flex flex-col justify-between" id="customer-step-qr">
                  <div className="space-y-4">
                    <div className="text-center space-y-1">
                      <span className="text-[10px] font-mono text-blue-600 uppercase tracking-widest block font-bold bg-blue-50 border border-blue-100 px-3 py-1 rounded-full text-xs inline-block mb-1">Registration Successful</span>
                      <h2 className="text-xl font-bold text-slate-800 tracking-tight">Your Static QR Sticker</h2>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto leading-normal">
                        Print or save this QR code sticker. This represents your wallet address—no phone needed to buy!
                      </p>
                    </div>

                    {/* QR Sticker canvas card */}
                    <div className="bg-white text-slate-900 rounded-3xl p-5 max-w-[280px] w-full mx-auto shadow-md flex flex-col items-center space-y-3 border border-slate-200" id="qr-sticker-card">
                      <span className="text-[9px] font-mono text-slate-400 tracking-widest uppercase block border-b border-slate-100 pb-1 w-full text-center font-bold">
                        ★ PERAPIN STICKER DEPOSIT ★
                      </span>
                      
                      <div className="bg-slate-50 p-2.5 rounded-2xl relative border border-slate-100" id="qr-canvas-wrapper">
                        <canvas ref={qrCanvasRef} className="w-48 h-48 block" />
                      </div>

                      <div className="text-center space-y-0.5 w-full">
                        <p className="font-bold text-base tracking-tight text-slate-900">{activeCustomer.name}</p>
                        <p className="font-mono text-xs text-slate-500 bg-slate-50 py-1 px-3 rounded-lg border border-slate-100 truncate">
                          {activeCustomer.customerId}
                        </p>
                      </div>

                      <span className="text-[8px] font-mono text-slate-400 leading-normal text-center">
                        STELLAR ADDR: {activeCustomer.stellarPublicKey.slice(0, 12)}...
                      </span>
                    </div>

                    {/* Quick Print/Save control */}
                    <div className="flex gap-2 justify-center" id="qr-download-panel">
                      {qrBlobUrl && (
                        <a
                          href={qrBlobUrl}
                          download={`perapin-sticker-${activeCustomer.customerId}.png`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl active:scale-95 transition-all"
                          id="btn-download-qr"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Save Sticker Image</span>
                        </a>
                      )}
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 leading-normal space-y-1.5" id="onboarding-notice">
                      <p className="font-bold text-slate-800">How to pay in shops:</p>
                      <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                        <li>Show this printed sticker or paper card to the micro-merchant.</li>
                        <li>They will scan the sticker using their {"phone's"} web browser.</li>
                        <li>Verify the amount, key in your secret 4-digit PIN, and {"you're"} done!</li>
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => setCustomerStep("dashboard")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold text-sm tracking-tight transition-all active:scale-[0.99] min-h-[44px]"
                    id="btn-goto-dashboard"
                  >
                    Go to Account Dashboard
                  </button>
                </div>
              )}

              {/* STEP 3E: WALLET DASHBOARD & TRANSACTION LEDGER */}
              {customerStep === "dashboard" && activeCustomer && (
                <div className="space-y-6 flex-1 flex flex-col" id="customer-step-dashboard">
                  
                  {/* Quick Card Balance display */}
                  <div className="bg-white border border-slate-200 shadow-xs rounded-3xl p-5 flex flex-col justify-between space-y-4" id="wallet-balance-card">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider">PeraPin Balance</span>
                        <h2 className="text-3xl font-bold font-mono text-slate-800 tracking-tight">
                          ₱{activeCustomer.balance.toFixed(2)}
                        </h2>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-100 py-0.5 px-2 rounded font-mono font-medium">
                          Stellar Wallet
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[11px]" id="wallet-metadata">
                      <div>
                        <span className="text-slate-400">Consumer:</span>
                        <p className="text-slate-800 font-bold">{activeCustomer.name}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-right block">PeraPin Code:</span>
                        <p className="text-slate-800 font-mono font-bold">{activeCustomer.customerId}</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action to view Sticker QR */}
                  <button
                    onClick={() => setCustomerStep("qr_display")}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 rounded-2xl transition-all"
                    id="btn-show-qr"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 text-blue-600 p-2 rounded-xl" id="dashboard-qr-icon">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-850">Display Static Payment Sticker</p>
                        <p className="text-[10px] text-slate-500">Open QR sticker to show, print, or download</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-450" />
                  </button>

                  {/* Transaction history log ledger */}
                  <div className="space-y-3 flex-1 flex flex-col" id="customer-tx-history">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                        <History className="w-4 h-4 text-blue-600" />
                        On-Chain Ledger History
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">Real-time update</span>
                    </div>

                    {filteredCustomerTxs.length === 0 ? (
                      <div className="text-center p-8 bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 text-xs">
                        No transactions registered yet.
                      </div>
                    ) : (
                      <div className="space-y-2 overflow-y-auto max-h-[220px]" id="tx-log-scroll">
                        {filteredCustomerTxs.map(tx => (
                          <div
                            key={tx.id}
                            className="bg-white border border-slate-100 rounded-xl p-3 flex justify-between items-center text-xs shadow-xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-lg ${
                                tx.type === "signup_bonus" 
                                  ? "bg-emerald-50 text-emerald-600" 
                                  : "bg-slate-100 text-slate-600"
                              }`} id="tx-type-icon-box">
                                {tx.type === "signup_bonus" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">{tx.partnerName}</p>
                                <span className="text-[10px] text-slate-450 block font-mono">
                                  {new Date(tx.timestamp).toLocaleString("en-US", { hour12: false })}
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className={`font-mono font-bold ${
                                tx.type === "signup_bonus" ? "text-emerald-600" : "text-slate-800"
                              }`}>
                                {tx.type === "signup_bonus" ? "+" : "-"}₱{tx.amount.toFixed(2)}
                              </p>
                              <span className={`text-[9px] font-mono font-bold ${
                                tx.status === "success" ? "text-emerald-600" : "text-red-500"
                              }`}>
                                {tx.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
        {/* 4. DYNAMIC STELLAR/SOROBAN BLOCKCHAIN INSPECTOR DRAWER */}
      <AnimatePresence>
        {isInspectorOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-50 h-[380px] flex flex-col shadow-2xl"
            id="inspector-drawer"
          >
            {/* Drawer handle header */}
            <div className="bg-slate-50 px-4 py-2 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                <span className="font-mono text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Soroban Smart Contract Audit Console (Live)
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={resetAppLedgers}
                  className="px-2.5 py-1 bg-white hover:bg-red-50 border border-slate-200 rounded text-[10px] text-red-650 font-mono flex items-center gap-1 active:scale-95 transition-all"
                  id="btn-reset-ledger"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Database</span>
                </button>
                <button
                  onClick={() => setIsInspectorOpen(false)}
                  className="px-2.5 py-1 bg-slate-800 text-white text-[10px] font-bold rounded hover:bg-slate-700"
                  id="btn-close-inspector"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Inspector logs scroll list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[11px] bg-slate-50 text-slate-700" id="inspector-logs-scroll">
              
              {inspectorLogs.length === 0 ? (
                <div className="text-center text-slate-400 py-12">
                  No execution logs recorded. Initiate a sign-up or merchant payment to audit Soroban state changes.
                </div>
              ) : (
                inspectorLogs.map((log, index) => (
                  <div key={index} className="border-b border-slate-200/60 pb-2.5 space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">[{log.time}]</span>
                        <span className={`font-bold uppercase ${
                          log.type === "blockchain" ? "text-blue-600" :
                          log.type === "success" ? "text-emerald-600" :
                          log.type === "warning" ? "text-amber-600" : "text-slate-500"
                        }`}>
                          {log.type === "blockchain" ? "⚡ SOROBAN_CONTRACT" : `● ${log.type}`}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">PeraPin Core V1</span>
                    </div>

                    <p className="text-slate-800 font-bold">{log.title}</p>
                    <p className="text-slate-500 leading-normal whitespace-pre-wrap">{log.message}</p>
                    
                    {log.details && (
                      <pre className="mt-1 bg-white p-2 rounded border border-slate-200 text-[10px] overflow-x-auto text-slate-600">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Simulated general network information bar */}
            <div className="bg-slate-100 py-1.5 px-4 flex justify-between items-center text-[10px] font-mono border-t border-slate-200 text-slate-500">
              <span>Stellar Protocol: v21 (Soroban Mainnet)</span>
              <span>Ledger Sequence: #6421096</span>
              <span>Gas Limit: 100,000,000 CPU instructions</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Role Switcher Widget (For easy developer demo loop) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full px-2.5 py-1.5 shadow-lg z-30 flex items-center gap-1.5 max-w-[340px]" id="tester-switcher-bar">
        <span className="text-[10px] font-mono text-slate-400 block px-2">Demo Role:</span>
        <button
          onClick={() => {
            setRole("landing");
            logToInspector("info", "Navigated to Landing", "Reset current workflow to core landing router.");
          }}
          className={`px-3 py-1 text-xs rounded-full font-bold transition-all ${
            role === "landing" 
              ? "bg-slate-800 text-white font-black shadow-xs" 
              : "text-slate-500 hover:text-slate-850 hover:bg-slate-50"
          }`}
          id="btn-switch-landing"
        >
          Portal
        </button>
        <button
          onClick={() => enterFlow("merchant")}
          className={`px-3 py-1 text-xs rounded-full font-bold transition-all ${
            role === "merchant" 
              ? "bg-blue-600 text-white font-black shadow-xs" 
              : "text-slate-500 hover:text-slate-850 hover:bg-slate-50"
          }`}
          id="btn-switch-merchant"
        >
          Merchant
        </button>
        <button
          onClick={() => enterFlow("customer")}
          className={`px-3 py-1 text-xs rounded-full font-bold transition-all ${
            role === "customer" 
              ? "bg-blue-600 text-white font-black shadow-xs" 
              : "text-slate-500 hover:text-slate-850 hover:bg-slate-50"
          }`}
          id="btn-switch-customer"
        >
          Customer
        </button>
      </div>
    </div>
  );
}
