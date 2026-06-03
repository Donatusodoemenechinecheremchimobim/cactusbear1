import { Product, CartItem } from "../types";
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
  updateDoc 
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

// Detect if Firebase has been provisioned with real credentials
const isFirebaseConfigured = !!(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey.trim() !== "");

let app: any = null;
export let db: any = null;
export let auth: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
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

// Main Database actions class handling BOTH modes natively
class DatabaseService {
  private localProducts: Product[] = getInitialProducts();
  private localOrders: DbOrder[] = getInitialOrders();
  private localTimer: DropTimerConfig = getInitialTimer();

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
        const querySnapshot = await getDocs(collection(db, "orders"));
        const list: DbOrder[] = [];
        querySnapshot.forEach((doc) => {
          list.push(doc.data() as DbOrder);
        });
        
        // Seed default order if empty
        if (list.length === 0) {
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

  public async addOrder(order: Omit<DbOrder, "id" | "createdAt" | "status">): Promise<DbOrder> {
    const orderId = "CB-OR-" + Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
    const createdAt = new Date().toISOString();
    const newOrder: DbOrder = {
      ...order,
      id: orderId,
      status: "Pending",
      createdAt: createdAt
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "orders", orderId), newOrder);
        return newOrder;
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `orders/${orderId}`);
      }
    }

    this.refreshLocal();
    this.localOrders.unshift(newOrder);
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(this.localOrders));
    return newOrder;
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

  constructor() {
    const saved = localStorage.getItem(STORAGE_SESSION_KEY);
    if (saved) {
      try {
        this.currentSession = JSON.parse(saved);
      } catch {
        this.currentSession = null;
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
        return userSession;
      } catch (error) {
        console.error("Firebase Google Auth error:", error);
        throw error;
      }
    }

    // Standard high-fidelity developer simulation bypass
    return this.signInWithGoogleSimulate("chibundusadiq@gmail.com");
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
        return userSession;
      } catch (error) {
        console.error("Firebase GitHub Auth error:", error);
        throw error;
      }
    }

    // High fidelity simulation
    return this.signInWithGithubSimulate("github-patron@cactusbear.club");
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
            return userSession;
          } catch (signupError: any) {
            console.error("Firebase email signup error:", signupError);
            throw signupError;
          }
        }
        throw error;
      }
    }

    return this.signInWithEmailSimulate(cleanEmail, passwordInput);
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
    return userSession;
  }
}

export const authService = new AuthService();
