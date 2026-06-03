import { Product, CartItem, Review } from "../types";
import { CACTUS_BEAR_PRODUCTS } from "../data";
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  updateDoc,
  query,
  where
} from "firebase/firestore";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Type definitions for Db Pre-Orders
export interface DbOrder {
  id: string;
  name: string;
  email: string;
  phone?: string; // Contact phone/WhatsApp number
  address: string;
  city: string;
  country: string;
  items: CartItem[];
  totalPrice: number;
  status: "Pending" | "Shipped" | "Delivered" | "Canceled";
  createdAt: string;
  userId?: string;
}

// Type definitions for Db Upcoming Drop Timer Config
export interface DropTimerConfig {
  id: string;
  heading: string;
  subheading: string;
  targetDate: string; // ISO string for the countdown
  description: string;
  isActivated: boolean;
  notifyEmails: string[];
  adminWhatsapp?: string; // Configurable phone number to receive WhatsApp alerts
  adminEmail?: string;    // Configurable email address to receive order notifications
}

// Global persistence store inside localStorage (for fallback mode)
const STORAGE_PRODUCTS_KEY = "cactus_bear_dynamic_products";
const STORAGE_ORDERS_KEY = "cactus_bear_dynamic_orders";
const STORAGE_SESSION_KEY = "cactus_bear_auth_session";
const STORAGE_TIMER_KEY = "cactus_bear_timer_config";
const STORAGE_REVIEWS_KEY = "cactus_bear_dynamic_reviews";

// Detect if Firebase has been provisioned with real credentials
export const isFirebaseConfigured = !!(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey.trim() !== "");

let app: any = null;
export let db: any = null;
export let auth: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || "(default)");
    auth = getAuth(app);
    console.log("Firebase DB initialized successfully (Production Live Mode).");
  } catch (err) {
    console.error("Firebase startup exception:", err);
  }
} else {
  console.log("Using LocalStorage fallback database mode.");
}

// Error Handling spec matching Phase 3 / Pillar 8 rules
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Payload: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Setup initial drop config
const getInitialTimer = (): DropTimerConfig => {
  const saved = localStorage.getItem(STORAGE_TIMER_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // JSON issues
    }
  }
  const defaultTarget = new Date();
  defaultTarget.setDate(defaultTarget.getDate() + 9);
  defaultTarget.setHours(18, 0, 0, 0); // 6:00 PM
  
  const defaultTimer: DropTimerConfig = {
    id: "active-drop-config",
    heading: "SÉRIE INCOMING // JULY SPECIALIST",
    subheading: "THE SAGE THORN DOUBLE-PLEAT PARACHUTE CARGOS",
    targetDate: defaultTarget.toISOString(),
    description: "Premium heavy-dyed dual structured ripstop pants featuring our signature crown detailing, pleated knee boxes, and tactical release waist buckles.",
    isActivated: true,
    notifyEmails: ["vip-patron@couture.com"],
    adminWhatsapp: "2348123456789", // Preset default WhatsApp (e.g. support line)
    adminEmail: "chibundusadiq@gmail.com" // Preset default Email (matches owner exactly)
  };
  localStorage.setItem(STORAGE_TIMER_KEY, JSON.stringify(defaultTimer));
  return defaultTimer;
};

const getInitialProducts = (): Product[] => {
  const saved = localStorage.getItem(STORAGE_PRODUCTS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return CACTUS_BEAR_PRODUCTS;
    }
  }
  localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(CACTUS_BEAR_PRODUCTS));
  return CACTUS_BEAR_PRODUCTS;
};

const getInitialOrders = (): DbOrder[] => {
  const saved = localStorage.getItem(STORAGE_ORDERS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  
  const defaultOrders: DbOrder[] = [
    {
      id: "CB-PRE-70A5F",
      name: "Marcus Aurelius",
      email: "marcus.aurelius@rome.org",
      phone: "+39 06 67101",
      address: "1 Palace Row, Forum Romanum",
      city: "Rome",
      country: "Italy",
      status: "Pending",
      createdAt: new Date().toISOString(),
      totalPrice: 205,
      items: [
        {
          id: "std-cb-jersey-01-Woodland Green Camo-L",
          product: CACTUS_BEAR_PRODUCTS[0],
          selectedColor: CACTUS_BEAR_PRODUCTS[0].colors[0],
          selectedSize: "L",
          quantity: 1
        }
      ]
    }
  ];
  localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(defaultOrders));
  return defaultOrders;
};

const getInitialReviews = (): Review[] => {
  const saved = localStorage.getItem(STORAGE_REVIEWS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // JSON issues
    }
  }
  
  // Seed initial high-quality reviews
  const defaultReviews: Review[] = [
    {
      id: "rev-1",
      productId: "cb-jersey-01",
      userId: "user-101",
      userName: "Alexander K.",
      userPhoto: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Alexander",
      rating: 5,
      comment: "Absolutely premium weight and high-end feel. The custom embroidery detail is outstanding. Extremely satisfied.",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "rev-2",
      productId: "cb-jersey-01",
      userId: "user-202",
      userName: "Sophia Thorne",
      userPhoto: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Sophia",
      rating: 4,
      comment: "Beautiful texture and details. Very comfortable and fits perfect.",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  localStorage.setItem(STORAGE_REVIEWS_KEY, JSON.stringify(defaultReviews));
  return defaultReviews;
};

// Main Database actions class handling BOTH modes natively
class DatabaseService {
  private localProducts: Product[] = getInitialProducts();
  private localOrders: DbOrder[] = getInitialOrders();
  private localTimer: DropTimerConfig = getInitialTimer();
  private localReviews: Review[] = getInitialReviews();

  // Retrieve products list
  public async getProducts(): Promise<Product[]> {
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const list: Product[] = [];
        querySnapshot.forEach((doc) => {
          list.push(doc.data() as Product);
        });

        // Seed initial products to Firestore if collection is empty
        if (list.length === 0) {
          console.log("Seeding initial products to Firestore...");
          for (const item of CACTUS_BEAR_PRODUCTS) {
            await setDoc(doc(db, "products", item.id), item);
            list.push(item);
          }
        }
        return list;
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, "products");
      }
    }

    // Local Storage Fallback Mode
    this.refreshLocal();
    return this.localProducts;
  }

  // Refreshes data cache
  private refreshLocal() {
    const pSaved = localStorage.getItem(STORAGE_PRODUCTS_KEY);
    if (pSaved) {
      try { this.localProducts = JSON.parse(pSaved); } catch {}
    }
    const oSaved = localStorage.getItem(STORAGE_ORDERS_KEY);
    if (oSaved) {
      try { this.localOrders = JSON.parse(oSaved); } catch {}
    }
    const tSaved = localStorage.getItem(STORAGE_TIMER_KEY);
    if (tSaved) {
      try { this.localTimer = JSON.parse(tSaved); } catch {}
    }
    const rSaved = localStorage.getItem(STORAGE_REVIEWS_KEY);
    if (rSaved) {
      try { this.localReviews = JSON.parse(rSaved); } catch {}
    }
  }

  // Timer getters & subscription handlers
  public async getTimerConfig(): Promise<DropTimerConfig> {
    if (isFirebaseConfigured && db) {
      try {
        const docSnap = await getDoc(doc(db, "drops", "active-drop-config"));
        if (docSnap.exists()) {
          return docSnap.data() as DropTimerConfig;
        } else {
          const defaultTimer = getInitialTimer();
          await setDoc(doc(db, "drops", "active-drop-config"), defaultTimer);
          return defaultTimer;
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, "drops/active-drop-config");
      }
    }

    this.refreshLocal();
    return this.localTimer;
  }

  public async saveTimerConfig(config: DropTimerConfig): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "drops", "active-drop-config"), config);
        return;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, "drops/active-drop-config");
      }
    }

    this.localTimer = config;
    localStorage.setItem(STORAGE_TIMER_KEY, JSON.stringify(config));
  }

  public async subscribeToDrop(email: string): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return false;

    if (isFirebaseConfigured && db) {
      try {
        const config = await this.getTimerConfig();
        if (config.notifyEmails.includes(cleanEmail)) {
          return false;
        }
        const updatedEmails = [...config.notifyEmails, cleanEmail];
        const updated = { ...config, notifyEmails: updatedEmails };
        await setDoc(doc(db, "drops", "active-drop-config"), updated);
        return true;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, "drops/active-drop-config");
      }
    }

    this.refreshLocal();
    if (this.localTimer.notifyEmails.includes(cleanEmail)) {
      return false; // Alrd subscribed
    }
    
    const updatedEmails = [...this.localTimer.notifyEmails, cleanEmail];
    this.localTimer = { ...this.localTimer, notifyEmails: updatedEmails };
    localStorage.setItem(STORAGE_TIMER_KEY, JSON.stringify(this.localTimer));
    return true;
  }

  // Add Product (Admin Action)
  public async addProduct(p: Product): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "products", p.id), p);
        return;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `products/${p.id}`);
      }
    }

    this.refreshLocal();
    const exists = this.localProducts.some(item => item.id === p.id);
    if (exists) {
      this.localProducts = this.localProducts.map(item => item.id === p.id ? p : item);
    } else {
      this.localProducts.push(p);
    }
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(this.localProducts));
  }

  // Delete product
  public async deleteProduct(id: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, "products", id));
        return;
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
      }
    }

    this.refreshLocal();
    this.localProducts = this.localProducts.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(this.localProducts));
  }

  // Order Operations
  public async getOrders(): Promise<DbOrder[]> {
    if (isFirebaseConfigured && db) {
      try {
        const currentUserId = auth?.currentUser?.uid || authService.getSession()?.uid;
        const isAdminUser = auth?.currentUser?.email === "chibundusadiq@gmail.com" || authService.getSession()?.isAdmin;

        let querySnapshot;
        if (isAdminUser) {
          querySnapshot = await getDocs(collection(db, "orders"));
        } else if (currentUserId) {
          const q = query(collection(db, "orders"), where("userId", "==", currentUserId));
          querySnapshot = await getDocs(q);
        } else {
          return [];
        }

        const list: DbOrder[] = [];
        querySnapshot.forEach((doc) => {
          list.push(doc.data() as DbOrder);
        });
        
        // Seed default order if empty and user is admin
        if (list.length === 0 && isAdminUser) {
          const defaults = getInitialOrders();
          for (const ord of defaults) {
            await setDoc(doc(db, "orders", ord.id), ord);
            list.push(ord);
          }
        }
        return list;
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, "orders");
      }
    }

    this.refreshLocal();
    return this.localOrders;
  }

  private runAutomations(order: DbOrder): void {
    try {
      // Load current log index from localStorage safely
      let logs: any[] = [];
      try {
        logs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
        if (!Array.isArray(logs)) logs = [];
      } catch {}

      const formattedMessage = 
        `✦ ATELIER PRE-ORDER DIGEST: ${order.id} ✦\n\n` +
        `• Customer Pin: ${order.email}\n` +
        `• Full Name: ${order.name || "Authenticated Patron"}\n` +
        `• Mobile: ${order.phone || "N/A"}\n` +
        `• Shipping Dest: ${order.address || "N/A"}, ${order.city || "N/A"} (${order.country || "N/A"})\n` +
        `• Transacted: ₦${(order.totalPrice * 1500).toLocaleString()} ($${order.totalPrice} USD)\n\n` +
        `• Core Items:\n` +
        order.items.map((it: any, i: number) => 
          `  [${i + 1}] ${it.product?.name || "Premium Item"} - Size: ${it.selectedSize || "N/A"} (${it.selectedColor?.name || "N/A"})`
        ).join("\n") +
        `\n\n✦ CRYPTOGRAPHIC ATELIER LEDGER ✦`;

      // 1. Direct Webhook Integration
      const webhookEnabled = localStorage.getItem("cactus_bear_autom_webhook_enabled") === "true";
      const webhookUrl = localStorage.getItem("cactus_bear_autom_webhook_url") || "";
      if (webhookEnabled && webhookUrl) {
        const logEntry = {
          id: "log-" + Math.floor(Math.random() * 100000),
          timestamp: new Date().toISOString(),
          type: "WEBHOOK",
          payload: { orderId: order.id, totalPrice: order.totalPrice, email: order.email },
          status: 102,
          statusText: "Processing Dispatch"
        };

        fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order)
        })
        .then(res => {
          logEntry.status = res.status;
          logEntry.statusText = res.statusText || (res.ok ? "SUCCESS" : "ERROR");
          try {
            const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
            const updated = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
            localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updated));
          } catch {}
        })
        .catch(err => {
          logEntry.status = 502;
          logEntry.statusText = err?.message || "Trigger Connect Failed";
          try {
            const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
            const updated = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
            localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updated));
          } catch {}
        });
      }

      // 2. Direct Email Alert (Default Destination & Custom Formspree / Email Hook)
      const emailEnabled = localStorage.getItem("cactus_bear_autom_email_enabled") !== "false"; // Default to enabled
      const emailTarget = localStorage.getItem("cactus_bear_autom_email_target") || "chibundusadiq@gmail.com";
      const emailFormspreeKey = localStorage.getItem("cactus_bear_autom_email_key") || "xojzazgo"; // Custom Formspree Form ID
      
      if (emailEnabled && emailTarget) {
        const logEntry = {
          id: "log-" + Math.floor(Math.random() * 100000),
          timestamp: new Date().toISOString(),
          type: "EMAIL DISPATCH",
          payload: { destination: emailTarget, orderId: order.id },
          status: 102,
          statusText: "Sending Email"
        };

        // Determine destination endpoint. We default to standard Formspree form submission endpoint or an easy public dispatcher
        const emailEndpoint = `https://formspree.io/f/${emailFormspreeKey}`;

        fetch(emailEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            _subject: `✦ NEW CACTUS BEAR PRE-ORDER: ${order.id} ✦`,
            recipient: emailTarget,
            message: formattedMessage,
            orderId: order.id,
            buyer: order.name || order.email,
            buyerPhone: order.phone || "N/A",
            totalNgn: `₦${(order.totalPrice * 1500).toLocaleString()}`,
            totalUsd: `$${order.totalPrice}`,
            itemsOrdered: order.items.map((it: any) => `${it.product?.name} (${it.selectedSize})`).join(", ")
          })
        })
        .then(res => {
          logEntry.status = res.status;
          logEntry.statusText = res.ok ? "Email Sent Successfully" : "Email Forward Rejected";
          try {
            const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
            const updated = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
            localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updated));
          } catch {}
        })
        .catch(err => {
          logEntry.status = 502;
          logEntry.statusText = err?.message || "Email Connect Post Blocked";
          try {
            const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
            const updated = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
            localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updated));
          } catch {}
        });
      }

      // 3. Direct WhatsApp Alert (Twilio / CallMeBot Webhook)
      const whatsappEnabled = localStorage.getItem("cactus_bear_autom_whatsapp_enabled") === "true";
      const whatsappPhone = localStorage.getItem("cactus_bear_autom_whatsapp_phone") || "2348123456789";
      const whatsappApiKey = localStorage.getItem("cactus_bear_autom_whatsapp_apikey") || ""; // CallMeBot API key
      const whatsappCustomWebhook = localStorage.getItem("cactus_bear_autom_whatsapp_webhook") || "";

      if (whatsappEnabled && whatsappPhone) {
        const logEntry = {
          id: "log-" + Math.floor(Math.random() * 100000),
          timestamp: new Date().toISOString(),
          type: "WHATSAPP DISPATCH",
          payload: { phone: whatsappPhone, orderId: order.id },
          status: 102,
          statusText: "Sending WhatsApp Alert"
        };

        if (whatsappCustomWebhook) {
          // Custom Twilio direct hook dispatch
          fetch(whatsappCustomWebhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: whatsappPhone,
              message: formattedMessage,
              orderId: order.id
            })
          })
          .then(res => {
            logEntry.status = res.status;
            logEntry.statusText = res.ok ? "Custom Hook Posted Successfully" : "Webhook Connection Lost";
            try {
              const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
              const updated = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
              localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updated));
            } catch {}
          })
          .catch(err => {
            logEntry.status = 503;
            logEntry.statusText = err?.message || "WhatsApp Webhook Error";
            try {
              const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
              const updated = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
              localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updated));
            } catch {}
          });
        } else if (whatsappApiKey) {
          // Send via popular developer lightweight WhatsApp API (CallMeBot)
          const cleanPhone = whatsappPhone.replace(/\D/g, "");
          const encodedText = encodeURIComponent(formattedMessage);
          const callMeBotUrl = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodedText}&apikey=${whatsappApiKey.trim()}`;
          
          fetch(callMeBotUrl, { mode: "no-cors" })
          .then(() => {
            logEntry.status = 200;
            logEntry.statusText = "Dispatched via CallMeBot Bot Channel";
            try {
              const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
              const updated = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
              localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updated));
            } catch {}
          })
          .catch(err => {
            logEntry.status = 502;
            logEntry.statusText = err?.message || "WhatsApp API Request Timeout";
            try {
              const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
              const updated = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
              localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updated));
            } catch {}
          });
        } else {
          // If neither is configured but WhatsApp is toggled, record trigger logic dispatch link
          logEntry.status = 202;
          logEntry.statusText = "Setup CallMeBot API Key / Custom Link in Settings";
          try {
            const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
            const updated = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
            localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updated));
          } catch {}
        }
      }

      // 4. Direct Slack Channel hook
      const slackEnabled = localStorage.getItem("cactus_bear_autom_slack_enabled") === "true";
      const slackUrl = localStorage.getItem("cactus_bear_autom_slack_url") || "";
      if (slackEnabled && slackUrl) {
        const logEntry = {
          id: "log-" + Math.floor(Math.random() * 100000),
          timestamp: new Date().toISOString(),
          type: "SLACK HUB",
          payload: { orderId: order.id, value: order.totalPrice },
          status: 102,
          statusText: "Posting Alert"
        };

        const slackText = `✦ *NEW PRE-ORDER DISPATCHED:* ${order.id} ✦\n• *Client:* ${order.email}\n• *Total:* ₦${(order.totalPrice * 1500).toLocaleString()} ($${order.totalPrice} USD)\n• *Items:* ${order.items.map((it: any) => `${it.product?.name || "Premium Item"} (${it.selectedSize || "N/A"})`).join(", ")}`;

        fetch(slackUrl, {
          method: "POST",
          mode: "no-cors",
          body: JSON.stringify({ text: slackText })
        })
        .then(() => {
          logEntry.status = 200;
          logEntry.statusText = "OK (Triggered Dispatch)";
          try {
            const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
            const updated = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
            localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updated));
          } catch {}
        })
        .catch(err => {
          logEntry.status = 500;
          logEntry.statusText = err?.message || "Slack Post Blocked";
          try {
            const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
            const updated = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
            localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updated));
          } catch {}
        });
      }

      // 5. Direct Discord Dispatcher
      const discordEnabled = localStorage.getItem("cactus_bear_autom_discord_enabled") === "true";
      const discordUrl = localStorage.getItem("cactus_bear_autom_discord_url") || "";
      if (discordEnabled && discordUrl) {
        const logEntry = {
          id: "log-" + Math.floor(Math.random() * 100000),
          timestamp: new Date().toISOString(),
          type: "DISCORD HOOK",
          payload: { orderId: order.id, region: order.city || "Lagos" },
          status: 102,
          statusText: "Posting Embed"
        };

        const discordBody = {
          embeds: [{
            title: `✦ SECURED COLLECTION PRE-ORDER: ${order.id} ✦`,
            description: `Automated dispatch logged to the local atelier register database.`,
            color: 15728384, // #EFFF00
            fields: [
              { name: "Patron Email", value: order.email, inline: true },
              { name: "Order Value (₦ / $)", value: `₦${(order.totalPrice * 1500).toLocaleString()} / $${order.totalPrice} USD`, inline: true },
              { name: "Fulfillment Location", value: `${order.address || "N/A"}, ${order.city || "N/A"} (${order.country || "N/A"})` }
            ],
            timestamp: new Date().toISOString()
          }]
        };

        fetch(discordUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(discordBody)
        })
        .then(res => {
          logEntry.status = res.status;
          logEntry.statusText = res.statusText || "OK";
          try {
            const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
            const updated = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
            localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updated));
          } catch {}
        })
        .catch(err => {
          logEntry.status = 502;
          logEntry.statusText = err?.message || "Discord Post Blocked";
          try {
            const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
            const updated = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
            localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updated));
          } catch {}
        });
      }

      // 6. Trace log fallback guarantee
      if (!webhookEnabled && !slackEnabled && !discordEnabled && !emailEnabled && !whatsappEnabled) {
        const logEntry = {
          id: "log-" + Math.floor(Math.random() * 100000),
          timestamp: new Date().toISOString(),
          type: "TRIGGER INSTANCE",
          payload: { orderId: order.id, totalPrice: order.totalPrice, status: "Awaiting Production Batch" },
          status: 200,
          statusText: "Built-In Dispatch OK"
        };
        localStorage.setItem("cactus_bear_autom_logs", JSON.stringify([logEntry, ...logs].slice(0, 50)));
      }
    } catch (e) {
      console.error("Autotarget failed:", e);
    }
  }

  public async addOrder(order: Omit<DbOrder, "id" | "createdAt" | "status">): Promise<DbOrder> {
    const orderId = "CB-OR-" + Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
    const createdAt = new Date().toISOString();
    const currentUserId = auth?.currentUser?.uid || authService.getSession()?.uid;

    const newOrder: DbOrder & { userId?: string } = {
      ...order,
      id: orderId,
      status: "Pending",
      createdAt: createdAt,
      ...(currentUserId ? { userId: currentUserId } : {})
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "orders", orderId), newOrder);
        this.runAutomations(newOrder as DbOrder);
        return newOrder as DbOrder;
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `orders/${orderId}`);
      }
    }

    this.refreshLocal();
    this.localOrders.unshift(newOrder as DbOrder);
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(this.localOrders));
    this.runAutomations(newOrder as DbOrder);
    return newOrder as DbOrder;
  }

  public async updateOrderStatus(id: string, status: DbOrder["status"]): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "orders", id), { status });
        return;
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `orders/${id}`);
      }
    }

    this.refreshLocal();
    this.localOrders = this.localOrders.map(order => 
      order.id === id ? { ...order, status } : order
    );
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(this.localOrders));
  }

  // Reviews Operations
  public async getReviews(productId: string): Promise<Review[]> {
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, "reviews"));
        const list: Review[] = [];
        querySnapshot.forEach((docSnap) => {
          const item = docSnap.data() as Review;
          if (item.productId === productId) {
            list.push(item);
          }
        });
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, "reviews");
      }
    }

    this.refreshLocal();
    return this.localReviews
      .filter((r) => r.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async addReview(reviewData: Omit<Review, "id" | "createdAt">): Promise<Review> {
    const reviewId = "rev-" + Math.floor(100000 + Math.random() * 900000).toString();
    const createdAt = new Date().toISOString();
    const newReview: Review = {
      ...reviewData,
      id: reviewId,
      createdAt
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "reviews", reviewId), newReview);
        return newReview;
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `reviews/${reviewId}`);
      }
    }

    this.refreshLocal();
    this.localReviews.unshift(newReview);
    localStorage.setItem(STORAGE_REVIEWS_KEY, JSON.stringify(this.localReviews));
    return newReview;
  }

  // Support Cart storage in Firestore
  public async saveUserCart(userId: string, cart: CartItem[]): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "users", userId), { cart }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
      }
    }
  }

  public async loadUserCart(userId: string): Promise<CartItem[]> {
    if (isFirebaseConfigured && db) {
      try {
        const docSnap = await getDoc(doc(db, "users", userId));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.cart) {
            return data.cart as CartItem[];
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${userId}`);
      }
    }
    return [];
  }

  // Support Wishlist storage in Firestore
  public async saveUserWishlist(userId: string, wishlist: string[]): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "users", userId), { wishlist }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
      }
    }
  }

  public async loadUserWishlist(userId: string): Promise<string[]> {
    if (isFirebaseConfigured && db) {
      try {
        const docSnap = await getDoc(doc(db, "users", userId));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.wishlist) {
            return data.wishlist as string[];
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${userId}`);
      }
    }
    return [];
  }
}

export const dbService = new DatabaseService();

// AUTH SERVICE - SIMULATED WITH REAL SEED CAPABILITIES
export interface UserSession {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  isAdmin: boolean;
}

class AuthService {
  private currentSession: UserSession | null = null;
  private listeners: ((session: UserSession | null) => void)[] = [];

  constructor() {
    const saved = localStorage.getItem(STORAGE_SESSION_KEY);
    if (saved) {
      try {
        this.currentSession = JSON.parse(saved);
      } catch {
        this.currentSession = null;
      }
    }

    if (isFirebaseConfigured && auth) {
      onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          const emailAddress = fbUser.email || "";
          const isAdminUser = emailAddress.trim().toLowerCase() === "chibundusadiq@gmail.com";
          
          const userSession: UserSession = {
            uid: fbUser.uid,
            email: emailAddress,
            displayName: fbUser.displayName || emailAddress.split("@")[0] || "Patron",
            photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${fbUser.uid}`,
            isAdmin: isAdminUser
          };
          this.currentSession = userSession;
          localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(userSession));
          // Synchronize profile to physical Firestore database to ensure every user has its database profile
          await this.syncUserProfile(userSession);
          this.notifyListeners(userSession);
        } else {
          // If signed out in firebase, but session in localStorage has a firebase uid, clean it
          if (this.currentSession && !this.currentSession.uid.startsWith("google-uid-") && !this.currentSession.uid.startsWith("github-uid-") && !this.currentSession.uid.startsWith("email-uid-") && !this.currentSession.uid.startsWith("guest-uid-")) {
            this.currentSession = null;
            localStorage.removeItem(STORAGE_SESSION_KEY);
            this.notifyListeners(null);
          }
        }
      });
    }
  }

  public subscribe(callback: (session: UserSession | null) => void) {
    this.listeners.push(callback);
    callback(this.currentSession);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(session: UserSession | null) {
    this.listeners.forEach(cb => cb(session));
  }

  public async syncUserProfile(session: UserSession) {
    if (isFirebaseConfigured && db) {
      try {
        const userDocRef = doc(db, "users", session.uid);
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          await updateDoc(userDocRef, {
            uid: session.uid,
            email: session.email,
            displayName: session.displayName,
            photoURL: session.photoURL,
            isAdmin: session.isAdmin,
            updatedAt: new Date().toISOString()
          });
        } else {
          await setDoc(userDocRef, {
            uid: session.uid,
            email: session.email,
            displayName: session.displayName,
            photoURL: session.photoURL,
            isAdmin: session.isAdmin,
            createdAt: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error("Failed to sync user profile to Firestore:", error);
      }
    }
  }

  public getSession(): UserSession | null {
    return this.currentSession;
  }

  // Sign out
  public signOut(): void {
    this.currentSession = null;
    localStorage.removeItem(STORAGE_SESSION_KEY);
    this.notifyListeners(null);
    if (isFirebaseConfigured && auth) {
      try {
        firebaseSignOut(auth);
      } catch (err) {
        console.error("Firebase Auth sign out failure:", err);
      }
    }
  }

  // Real or Simulated Google Sign In
  public async signInWithGoogle(): Promise<UserSession> {
    if (isFirebaseConfigured && auth) {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const fbUser = result.user;
        const emailAddress = fbUser.email || "";
        const isAdminUser = emailAddress.trim().toLowerCase() === "chibundusadiq@gmail.com";
        
        const userSession: UserSession = {
          uid: fbUser.uid,
          email: emailAddress,
          displayName: fbUser.displayName || emailAddress.split("@")[0],
          photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
          isAdmin: isAdminUser
        };

        this.currentSession = userSession;
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(userSession));
        await this.syncUserProfile(userSession);
        this.notifyListeners(userSession);
        return userSession;
      } catch (error) {
        console.error("Firebase Google Auth error:", error);
        throw error;
      }
    }

    // Standard high-fidelity developer simulation bypass
    const sim = this.signInWithGoogleSimulate("chibundusadiq@gmail.com");
    this.notifyListeners(sim);
    return sim;
  }

  // Backup Google simulation with email input bypass
  public signInWithGoogleSimulate(emailAddress: string): UserSession {
    const standardName = emailAddress.split("@")[0];
    const cleanName = standardName.charAt(0).toUpperCase() + standardName.slice(1);
    
    // Check if user is chibundusadiq (admin bypass)
    const isAdminUser = emailAddress.trim().toLowerCase() === "chibundusadiq@gmail.com";
    
    const userSession: UserSession = {
      uid: "google-uid-" + Math.floor(10000 + Math.random() * 90000),
      email: emailAddress.trim().toLowerCase(),
      displayName: cleanName,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${standardName}`,
      isAdmin: isAdminUser
    };

    this.currentSession = userSession;
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(userSession));
    this.notifyListeners(userSession);
    return userSession;
  }

  // Real or Simulated GitHub Sign In
  public async signInWithGithub(): Promise<UserSession> {
    if (isFirebaseConfigured && auth) {
      try {
        const provider = new GithubAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const fbUser = result.user;
        const emailAddress = fbUser.email || "";
        const isAdminUser = emailAddress.trim().toLowerCase() === "chibundusadiq@gmail.com";
        
        const userSession: UserSession = {
          uid: fbUser.uid,
          email: emailAddress,
          displayName: fbUser.displayName || emailAddress.split("@")[0] || "GitHub Patron",
          photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${fbUser.uid}`,
          isAdmin: isAdminUser
        };

        this.currentSession = userSession;
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(userSession));
        await this.syncUserProfile(userSession);
        this.notifyListeners(userSession);
        return userSession;
      } catch (error) {
        console.error("Firebase GitHub Auth error:", error);
        throw error;
      }
    }

    // High fidelity simulation
    const sim = this.signInWithGithubSimulate("github-patron@cactusbear.club");
    this.notifyListeners(sim);
    return sim;
  }

  public signInWithGithubSimulate(emailAddress: string): UserSession {
    const standardName = emailAddress.split("@")[0];
    const cleanName = standardName.charAt(0).toUpperCase() + standardName.slice(1);
    const isAdminUser = emailAddress.trim().toLowerCase() === "chibundusadiq@gmail.com";
    
    const userSession: UserSession = {
      uid: "github-uid-" + Math.floor(10000 + Math.random() * 90000),
      email: emailAddress.trim().toLowerCase(),
      displayName: cleanName + " (Github)",
      photoURL: `https://api.dicebear.com/7.x/identicon/svg?seed=${standardName}`,
      isAdmin: isAdminUser
    };

    this.currentSession = userSession;
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(userSession));
    this.notifyListeners(userSession);
    return userSession;
  }

  // Real or Simulated Email & Password sign-in / registration
  public async signInWithEmail(emailAddress: string, passwordInput: string): Promise<UserSession> {
    const cleanEmail = emailAddress.trim().toLowerCase();
    
    if (isFirebaseConfigured && auth) {
      try {
        const result = await signInWithEmailAndPassword(auth, cleanEmail, passwordInput);
        const fbUser = result.user;
        const isAdminUser = cleanEmail === "chibundusadiq@gmail.com";
        const userSession: UserSession = {
          uid: fbUser.uid,
          email: cleanEmail,
          displayName: fbUser.displayName || cleanEmail.split("@")[0],
          photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${fbUser.uid}`,
          isAdmin: isAdminUser
        };
        this.currentSession = userSession;
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(userSession));
        await this.syncUserProfile(userSession);
        this.notifyListeners(userSession);
        return userSession;
      } catch (error: any) {
        // If user not found or password doesn't match, or if register dynamic scenario
        if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
          // Attempt automatic registration for convenience
          try {
            const signupResult = await createUserWithEmailAndPassword(auth, cleanEmail, passwordInput);
            const fbUser = signupResult.user;
            const isAdminUser = cleanEmail === "chibundusadiq@gmail.com";
            const userSession: UserSession = {
              uid: fbUser.uid,
              email: cleanEmail,
              displayName: cleanEmail.split("@")[0],
              photoURL: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${fbUser.uid}`,
              isAdmin: isAdminUser
            };
            this.currentSession = userSession;
            localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(userSession));
            await this.syncUserProfile(userSession);
            this.notifyListeners(userSession);
            return userSession;
          } catch (signupError: any) {
            console.error("Firebase email signup error:", signupError);
            throw signupError;
          }
        }
        throw error;
      }
    }

    const sim = this.signInWithEmailSimulate(cleanEmail, passwordInput);
    this.notifyListeners(sim);
    return sim;
  }

  // Mock Email & Password login select
  public signInWithEmailSimulate(emailAddress: string, password?: string): UserSession {
    const standardName = emailAddress.split("@")[0];
    const cleanName = standardName.charAt(0).toUpperCase() + standardName.slice(1);
    
    const isAdminUser = emailAddress.trim().toLowerCase() === "chibundusadiq@gmail.com";
    
    const userSession: UserSession = {
      uid: "email-uid-" + Math.floor(10000 + Math.random() * 90000),
      email: emailAddress.trim().toLowerCase(),
      displayName: cleanName,
      photoURL: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${standardName}`,
      isAdmin: isAdminUser
    };

    this.currentSession = userSession;
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(userSession));
    this.notifyListeners(userSession);
    return userSession;
  }

  // Mock Guest/VIP login select
  public signInGuestSimulate(): UserSession {
    const guestId = Math.floor(1000 + Math.random() * 9000);
    const userSession: UserSession = {
      uid: "guest-uid-" + guestId,
      email: `guest-${guestId}@cactusbear.club`,
      displayName: `Guest Patron #${guestId}`,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=guest-${guestId}`,
      isAdmin: false
    };

    this.currentSession = userSession;
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(userSession));
    this.notifyListeners(userSession);
    return userSession;
  }
}

export const authService = new AuthService();
