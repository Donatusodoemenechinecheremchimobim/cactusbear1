import { Product, CartItem } from "../types";
import { CACTUS_BEAR_PRODUCTS } from "../data";

// Type definitions for Db Pre-Orders
export interface DbOrder {
  id: string;
  name: string;
  email: string;
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
}

// Global persistence store inside localStorage
const STORAGE_PRODUCTS_KEY = "cactus_bear_dynamic_products";
const STORAGE_ORDERS_KEY = "cactus_bear_dynamic_orders";
const STORAGE_SESSION_KEY = "cactus_bear_auth_session";
const STORAGE_TIMER_KEY = "cactus_bear_timer_config";

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
    notifyEmails: ["vip-patron@couture.com"]
  };
  localStorage.setItem(STORAGE_TIMER_KEY, JSON.stringify(defaultTimer));
  return defaultTimer;
};

// Init default products in DB if empty
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

// Initial orders
const getInitialOrders = (): DbOrder[] => {
  const saved = localStorage.getItem(STORAGE_ORDERS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  // Let's create a beautiful default pre-order from a simulated user so the Admin has data to inspect immediately!
  const defaultOrders: DbOrder[] = [
    {
      id: "CB-PRE-70A5F",
      name: "Marcus Aurelius",
      email: "marcus.aurelius@rome.org",
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
        },
        {
          id: "std-cb-buttonup-02-Obsidian Black-XL",
          product: CACTUS_BEAR_PRODUCTS[1],
          selectedColor: CACTUS_BEAR_PRODUCTS[1].colors[0],
          selectedSize: "XL",
          quantity: 1
        }
      ]
    }
  ];
  localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(defaultOrders));
  return defaultOrders;
};

// Main Database actions class
class DatabaseService {
  private products: Product[] = getInitialProducts();
  private orders: DbOrder[] = getInitialOrders();
  private timer: DropTimerConfig = getInitialTimer();

  // Retrieve products list
  public getProducts(): Product[] {
    this.refreshLocal();
    return this.products;
  }

  // Refreshes data cache
  private refreshLocal() {
    const pSaved = localStorage.getItem(STORAGE_PRODUCTS_KEY);
    if (pSaved) {
      try { this.products = JSON.parse(pSaved); } catch {}
    }
    const oSaved = localStorage.getItem(STORAGE_ORDERS_KEY);
    if (oSaved) {
      try { this.orders = JSON.parse(oSaved); } catch {}
    }
    const tSaved = localStorage.getItem(STORAGE_TIMER_KEY);
    if (tSaved) {
      try { this.timer = JSON.parse(tSaved); } catch {}
    }
  }

  // Timer getters & subscription handlers
  public getTimerConfig(): DropTimerConfig {
    this.refreshLocal();
    return this.timer;
  }

  public saveTimerConfig(config: DropTimerConfig): void {
    this.timer = config;
    localStorage.setItem(STORAGE_TIMER_KEY, JSON.stringify(config));
  }

  public subscribeToDrop(email: string): boolean {
    this.refreshLocal();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return false;
    
    if (this.timer.notifyEmails.includes(cleanEmail)) {
      return false; // Alrd subscribed
    }
    
    const updatedEmails = [...this.timer.notifyEmails, cleanEmail];
    this.timer = { ...this.timer, notifyEmails: updatedEmails };
    localStorage.setItem(STORAGE_TIMER_KEY, JSON.stringify(this.timer));
    return true;
  }

  // Add Product (Admin Action)
  public addProduct(p: Product): void {
    this.refreshLocal();
    const exists = this.products.some(item => item.id === p.id);
    if (exists) {
      this.products = this.products.map(item => item.id === p.id ? p : item);
    } else {
      this.products.push(p);
    }
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(this.products));
  }

  // Delete product
  public deleteProduct(id: string): void {
    this.refreshLocal();
    this.products = this.products.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(this.products));
  }

  // Order Operations
  public getOrders(): DbOrder[] {
    this.refreshLocal();
    return this.orders;
  }

  public addOrder(order: Omit<DbOrder, "id" | "createdAt" | "status">): DbOrder {
    this.refreshLocal();
    const newOrder: DbOrder = {
      ...order,
      id: "CB-OR-" + Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase(),
      status: "Pending",
      createdAt: new Date().toISOString()
    };
    this.orders.unshift(newOrder);
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(this.orders));
    return newOrder;
  }

  public updateOrderStatus(id: string, status: DbOrder["status"]): void {
    this.refreshLocal();
    this.orders = this.orders.map(order => 
      order.id === id ? { ...order, status } : order
    );
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(this.orders));
  }
}

export const dbService = new DatabaseService();

// AUTH SERVICE - SIMULATED SLEEK GOOGLE POPUP LOGIN WITH SECTIONS
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
  }

  // Mock standard Google popup select
  public signInWithGoogleSimulate(emailAddress: string): UserSession {
    const standardName = emailAddress.split("@")[0];
    const cleanName = standardName.charAt(0).toUpperCase() + standardName.slice(1);
    
    // Check if user is chibundusadiq (admin bypass)
    // The user's exact email is "chibundusadiq@gmail.com"
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
}

export const authService = new AuthService();
