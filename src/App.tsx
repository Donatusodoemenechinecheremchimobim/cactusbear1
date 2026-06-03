import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  ChevronRight,
  Sparkles,
  Layers,
  Lock,
  Mail,
  Check,
  Flame,
  Globe,
  Plus,
  ArrowDown,
  Cpu,
  Menu,
  X,
  Clock,
  Package,
  Search,
  User,
  Home
} from "lucide-react";

import { CartItem, ProductCat } from "./types";
import { DROPS_TIMELINE } from "./data";
import GlowCrown from "./components/GlowCrown";
import ProductCard, { ProductCardSkeleton } from "./components/ProductCard";
import Customizer from "./components/Customizer";
import CartDrawer from "./components/CartDrawer";
import Lookbook from "./components/Lookbook";
import ProductDetailPage from "./components/ProductDetailPage";
import CollectionPage from "./components/CollectionPage";

import { dbService, authService, UserSession, DropTimerConfig } from "./services/firebase";
import GoogleAuthModal from "./components/GoogleAuthModal";
import AdminWorkspaceModal from "./components/AdminWorkspaceModal";
import OrdersLookupModal from "./components/OrdersLookupModal";
import OrderHistoryModal from "./components/OrderHistoryModal";

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCat | "All">("All");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [headerSearchQuery, setHeaderSearchQuery] = useState<string>("");
  
  const [activePage, setActivePage] = useState<"home" | "collection">("home");
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "info" | "alert"; timestamp: string }[]>([]);

  const addToast = (message: string, type: "success" | "info" | "alert" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setToasts((prev) => [...prev, { id, message, type, timestamp }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };
  
  
  // Upcoming Drop Countdown states
  const [timerConfig, setTimerConfig] = useState<DropTimerConfig>({
    id: "active-drop-config",
    heading: "NEW JULY COLLECTION DROP",
    subheading: "SAGE THORN COTTON CARGO PANTS",
    targetDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Premium heavy cotton ripstop pants featuring vintage crown stitch detail.",
    isActivated: true,
    notifyEmails: []
  });
  const [alertFormEmail, setAlertFormEmail] = useState<string>("");
  const [alertSubscribed, setAlertSubscribed] = useState<boolean>(false);
  const [alertError, setAlertError] = useState<string>("");
  const [alertSubmitting, setAlertSubmitting] = useState<boolean>(false);

  // Auth, products and Admin Workspace modal states
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [authOpen, setAuthOpen] = useState<boolean>(false);
  const [adminOpen, setAdminOpen] = useState<boolean>(false);
   const [ordersLookupOpen, setOrdersLookupOpen] = useState<boolean>(false);
   const [orderHistoryOpen, setOrderHistoryOpen] = useState<boolean>(false);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(true);

  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const isAlready = prev.includes(productId);
      const updated = isAlready ? prev.filter((id) => id !== productId) : [...prev, productId];
      localStorage.setItem("cactus_bear_wishlist", JSON.stringify(updated));
      
      const prod = productsList.find((p) => p.id === productId);
      const prodName = prod ? prod.name : "ITEM";
      if (isAlready) {
        addToast(`REMOVED: ${prodName.toUpperCase()}`, "info");
      } else {
        addToast(`SAVED TO WISHLIST: ${prodName.toUpperCase()}`, "success");
      }

      if (currentUser) {
        dbService.saveUserWishlist(currentUser.uid, updated).catch(err => console.error("Wishlist sync failed", err));
      }
      return updated;
    });
  };

  const refreshDynamicProducts = async () => {
    setProductsLoading(true);
    try {
      const pList = await dbService.getProducts();
      setProductsList(pList);
      const tConf = await dbService.getTimerConfig();
      setTimerConfig(tConf);
    } catch (e) {
      console.error("Failed to load products/timer:", e);
    } finally {
      setProductsLoading(false);
    }
  };

  // Time calculation mechanics for live drop countdown timer
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(timerConfig.targetDate) - +new Date();
      let left = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        left = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return left;
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [timerConfig.targetDate]);

  // Load cart and auth on startup with database synchronization
  useEffect(() => {
    refreshDynamicProducts();
    
    // Subscribe to Firebase Auth (or active simulation config)
    const unsubscribeAuth = authService.subscribe(async (session) => {
      setCurrentUser(session);
      if (session) {
        try {
          // User-specific isolated cart from of user database profile
          const dbCart = await dbService.loadUserCart(session.uid);
          if (dbCart && dbCart.length > 0) {
            setCart(dbCart);
            localStorage.setItem("cactus_bear_cart", JSON.stringify(dbCart));
          } else {
            const savedCart = localStorage.getItem("cactus_bear_cart");
            if (savedCart) {
              const parsed = JSON.parse(savedCart);
              if (parsed.length > 0) {
                await dbService.saveUserCart(session.uid, parsed);
              }
            }
          }

          // User-specific isolated wishlist from user database profile
          const dbWishlist = await dbService.loadUserWishlist(session.uid);
          if (dbWishlist && dbWishlist.length > 0) {
            setWishlist(dbWishlist);
            localStorage.setItem("cactus_bear_wishlist", JSON.stringify(dbWishlist));
          } else {
            const savedWishlist = localStorage.getItem("cactus_bear_wishlist");
            if (savedWishlist) {
              const parsed = JSON.parse(savedWishlist);
              if (parsed.length > 0) {
                await dbService.saveUserWishlist(session.uid, parsed);
              }
            }
          }
        } catch (err) {
          console.error("Failed to load user-scoped database values:", err);
        }
      } else {
        // Guest mode fallback load values
        const savedCart = localStorage.getItem("cactus_bear_cart");
        if (savedCart) {
          try { setCart(JSON.parse(savedCart)); } catch {}
        }
        const savedWishlist = localStorage.getItem("cactus_bear_wishlist");
        if (savedWishlist) {
          try { setWishlist(JSON.parse(savedWishlist)); } catch {}
        }
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Sync state helpers
  const syncCart = (updated: CartItem[]) => {
    setCart(updated);
    localStorage.setItem("cactus_bear_cart", JSON.stringify(updated));
    if (currentUser) {
      dbService.saveUserCart(currentUser.uid, updated).catch((err) =>
        console.error("Cart sync failed", err)
      );
    }
  };

  const handleAddToCart = (item: CartItem) => {
    const existingIdx = cart.findIndex((i) => i.id === item.id);
    if (existingIdx > -1) {
      const updated = [...cart];
      updated[existingIdx].quantity += 1;
      syncCart(updated);
    } else {
      syncCart([...cart, item]);
    }
    
    const garName = (item.product.name || "GARMENT").toUpperCase();
    addToast(`ADDED TO BAG: ${garName} (SIZE ${item.selectedSize})`, "success");

    // Auto-open cart on additions
    setCartOpen(true);
  };

  const handleUpdateQty = (id: string, delta: number) => {
    const updated = cart
      .map((item) => {
        if (item.id === id) {
          const nextQty = item.quantity + delta;
          return { ...item, quantity: nextQty };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);
    syncCart(updated);
  };

  const handleRemoveItem = (id: string) => {
    const updated = cart.filter((item) => item.id !== id);
    syncCart(updated);
  };

  const handleClearCart = () => {
    syncCart([]);
  };

  // Subscribe to upcoming drops
  const handleAlertSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertFormEmail.trim()) return;
    setAlertSubmitting(true);
    setAlertError("");

    try {
      const isNew = await dbService.subscribeToDrop(alertFormEmail);
      if (isNew) {
        setAlertSubscribed(true);
        setAlertFormEmail("");
        addToast(`SUBSCRIBED SUCCESSFULLY FOR UPDATES`, "success");
        await refreshDynamicProducts();
      } else {
        setAlertError("You are already subscribed to the upcoming release!");
        addToast(`YOU ARE ALREADY SUBSCRIBED`, "info");
      }
    } catch (err) {
      setAlertError("Connection check timed out. Please try again.");
      addToast(`CONNECTION ERROR. PLEASE TRY AGAIN.`, "alert");
    } finally {
      setAlertSubmitting(false);
    }
  };

  const handleNavToSection = (sectionId: string) => {
    setSelectedProductId(null);
    setActivePage("home");
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 120);
  };

  // Filter Catalog Presets
  const filteredProducts = useMemo(() => {
    let result = productsList;
    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }
    if (headerSearchQuery.trim() !== "") {
      const q = headerSearchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [productsList, selectedCategory, headerSearchQuery]);

  const cartItemsCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="w-full bg-black text-white font-sans selection:bg-[#EFFF00] selection:text-black min-h-screen flex flex-col justify-between pb-16 md:pb-0">
      
      {/* GLOBAL BACKGROUND NOISE & SCANS GRID */}
      <div className="fixed inset-0 bg-[#020202] pointer-events-none z-0 overflow-hidden">
        {/* Dot pattern matrix */}
        <div className="absolute inset-0 bg-[radial-gradient(#1c1c11_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
        {/* Clean scanning lines overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0.3)_1px,transparent_1px)] [background-size:100%_4px]" />
      </div>

      {/* PERSISTENT HIGH-END STATIONS HEADER */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-zinc-950 px-4 md:px-8 py-4 flex justify-between items-center">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setSelectedProductId(null);
            setActivePage("home");
          }}
          className="flex items-center gap-3 group"
        >
          <div className="w-12 h-6 rotate-[-15deg] transition-transform group-hover:rotate-[15deg]">
            <GlowCrown size="100%" color="#EFFF00" glow={true} />
          </div>
          <span className="font-sans font-extrabold text-[#EFFF00] text-sm tracking-[0.2em] uppercase transition-colors">
            CACTUS BEAR
          </span>
        </a>

        {/* Anchor Quick Jump Bridges */}
        <nav className="hidden md:flex items-center gap-8 font-mono text-[11px] font-semibold tracking-[0.12em] text-zinc-350">
          <button
            onClick={() => {
              setSelectedProductId(null);
              setActivePage("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`hover:text-[#EFFF00] transition-colors uppercase cursor-pointer ${
              activePage === "home" ? "text-zinc-100 font-bold" : ""
            }`}
          >
            HOME
          </button>
          <button
            onClick={() => {
              setSelectedProductId(null);
              setActivePage("collection");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`hover:text-[#EFFF00] transition-colors uppercase cursor-pointer ${
              activePage === "collection" ? "text-[#EFFF00] font-bold" : ""
            }`}
          >
            SHOP CATALOG
          </button>
          <button
            onClick={() => handleNavToSection("customizer-lab")}
            className="hover:text-[#EFFF00] transition-colors uppercase flex items-center gap-1.5 cursor-pointer"
          >
            <span className="w-1 rounded-full bg-[#EFFF00] aspect-square animate-pulse" />
            STITCH LAB
          </button>
          <button
            onClick={() => handleNavToSection("brand-lookbook")}
            className="hover:text-[#EFFF00] transition-colors uppercase cursor-pointer"
          >
            OUR STORY
          </button>
          <button
            onClick={() => handleNavToSection("unlocked-terminal")}
            className="hover:text-[#EFFF00] transition-colors uppercase cursor-pointer"
          >
            UPCOMING DROP
          </button>
          <button 
            onClick={() => setOrdersLookupOpen(true)}
            className="hover:text-[#EFFF00] transition-colors uppercase font-mono text-[11px] font-semibold tracking-[0.12em] text-zinc-350 cursor-pointer text-left"
          >
            TRACK ORDER
          </button>
        </nav>

         {/* Navigation Actions and login buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Seek & Search Catalog Bar */}
          <div className="relative flex items-center w-32 sm:w-40 border border-zinc-900 bg-zinc-950 py-1.5 px-2.5 transition-all focus-within:border-[#EFFF00]">
            <Search size={11} className="text-zinc-600 mr-1.5 flex-shrink-0" />
            <input
              type="text"
              value={headerSearchQuery}
              onChange={(e) => {
                setHeaderSearchQuery(e.target.value);
                if (selectedProductId) {
                  setSelectedProductId(null);
                }
              }}
              placeholder="SEARCH CATALOGUE"
              className="w-full bg-transparent font-mono text-[9px] uppercase tracking-[0.1em] text-white placeholder-zinc-700 outline-none"
            />
            {headerSearchQuery && (
              <button
                onClick={() => setHeaderSearchQuery("")}
                className="text-zinc-500 hover:text-white p-0.5 ml-1 flex-shrink-0 cursor-pointer"
              >
                <X size={10} />
              </button>
            )}
          </div>

          {currentUser ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 border border-zinc-900 bg-zinc-950 hover:border-[#EFFF00] px-3 py-1.5 transition-all outline-none rounded-none cursor-pointer"
                title="Account ledger and trackers"
              >
                <img
                  src={currentUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.displayName}`}
                  alt={currentUser.displayName}
                  className="w-5 h-5 rounded-full border border-[#EFFF00]/40 flex-shrink-0 object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="font-mono text-[9px] tracking-wider text-zinc-300 uppercase truncate max-w-[80px]">
                  {currentUser.displayName.split(" ")[0]}
                </span>
                <span className="text-zinc-600 text-[8px]">▼</span>
              </button>

              {/* FLOATING ACTION LEDGER DROPDOWN */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-45 bg-transparent" 
                      onClick={() => setProfileDropdownOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 mt-2 w-56 z-50 bg-[#080809] border border-zinc-800 shadow-2xl p-4 font-mono text-[10px]"
                    >
                      <div className="border-b border-zinc-900 pb-2.5 mb-2 px-1">
                        <span className="text-zinc-550 block text-[8px] tracking-wider uppercase">SIGNED IN AS</span>
                        <span className="text-[#EFFF00] block text-[11px] font-sans font-bold uppercase truncate tracking-tight">{currentUser.displayName}</span>
                        <span className="text-zinc-500 block text-[8px] truncate mt-0.5">{currentUser.email}</span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setOrderHistoryOpen(true);
                          }}
                          className="w-full text-left py-2 px-2.5 rounded-none hover:bg-zinc-950 hover:text-[#EFFF00] transition-all flex items-center justify-between cursor-pointer text-zinc-300"
                        >
                          <span>ACCOUNT LEDGER</span>
                          <span className="text-zinc-650">➔</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setOrdersLookupOpen(true);
                          }}
                          className="w-full text-left py-2 px-2.5 rounded-none hover:bg-zinc-950 hover:text-[#EFFF00] transition-all flex items-center justify-between cursor-pointer text-zinc-300"
                        >
                          <span>ORDER TRACKER</span>
                          <span className="text-zinc-650">➔</span>
                        </button>

                        {currentUser.isAdmin && (
                          <button
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              setAdminOpen(true);
                            }}
                            className="w-full text-left py-2 px-2.5 rounded-none bg-[#EFFF00]/5 text-white hover:bg-[#EFFF00] hover:text-black font-black transition-all flex items-center justify-between cursor-pointer"
                          >
                            <span className="text-[#EFFF00] uppercase">ADMIN WORKSPACE</span>
                            <span className="text-zinc-500">❖</span>
                          </button>
                        )}

                        <div className="h-px bg-zinc-900 my-1" />

                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            authService.signOut();
                            setCurrentUser(null);
                            setAdminOpen(false);
                            addToast("DISCONNECTED DECK", "info");
                          }}
                          className="w-full text-left py-2 px-2.5 rounded-none hover:bg-red-950/20 text-red-400 hover:text-red-300 transition-all flex items-center justify-between cursor-pointer"
                        >
                          <span>LOGOUT DECK</span>
                          <span>✖</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="hidden md:flex items-center gap-1.5 border border-[#EFFF00]/25 bg-black hover:border-[#EFFF00] font-mono text-[9px] tracking-widest px-3 py-1.5 text-white hover:text-[#EFFF00] transition-all rounded-none cursor-pointer"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#EFFF00] animate-pulse" />
              LOGIN
            </button>
          )}

          {/* Vault cart trigger button - Hidden on mobile as it's persistently on bottom navbar */}
          <button
            onClick={() => setCartOpen(true)}
            className="hidden md:flex items-center gap-1.5 sm:gap-2 border border-zinc-900 bg-zinc-950 hover:border-[#EFFF00] font-mono text-[10px] tracking-widest px-3 sm:px-4 py-2 hover:text-[#EFFF00] transition-all rounded-none cursor-pointer"
          >
            <ShoppingBag size={12} className="text-[#EFFF00]" />
            <span>BAG ({cartItemsCount})</span>
          </button>
        </div>
      </header>

      {/* MOBILE FULL-SCREEN NAVIGATION MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed inset-x-0 top-[65px] bottom-[56px] z-30 bg-black/98 border-t border-b border-zinc-900 py-8 px-6 flex flex-col gap-6 md:hidden shadow-2xl backdrop-blur-lg justify-between overflow-y-auto"
          >
            <span className="text-[9px] font-mono text-zinc-500 tracking-[0.3em] uppercase block border-b border-zinc-950 pb-2">
              ✦ NAVIGATE SHOP
            </span>
            <div className="flex flex-col gap-5 font-sans text-base font-black tracking-tight text-zinc-100 uppercase">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSelectedProductId(null);
                  setActivePage("home");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`hover:text-[#EFFF00] text-left transition-all block ${activePage === "home" ? "text-[#EFFF00]" : ""}`}
              >
                HOME
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSelectedProductId(null);
                  setActivePage("collection");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`hover:text-[#EFFF00] text-left transition-all block ${activePage === "collection" ? "text-[#EFFF00]" : ""}`}
              >
                SHOP CATALOG
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleNavToSection("customizer-lab");
                }}
                className="hover:text-[#EFFF00] text-left transition-colors block cursor-pointer"
              >
                CUSTOMIZER
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleNavToSection("brand-lookbook");
                }}
                className="hover:text-[#EFFF00] text-left transition-all block cursor-pointer"
              >
                OUR STORY
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleNavToSection("unlocked-terminal");
                }}
                className="hover:text-[#EFFF00] text-left transition-all block cursor-pointer"
              >
                UPCOMING DROP
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setOrdersLookupOpen(true);
                }}
                className="hover:text-[#EFFF00] text-left transition-all block font-sans text-base font-black tracking-tight text-zinc-100 uppercase cursor-pointer"
              >
                TRACK ORDER
              </button>
              
              {currentUser && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setOrderHistoryOpen(true);
                  }}
                  className="hover:text-[#EFFF00] text-left transition-all block font-sans text-base font-black tracking-tight text-[#EFFF00] uppercase cursor-pointer"
                >
                  ORDER HISTORY
                </button>
              )}
            </div>

            {/* Mobile Session Actions Shortcut */}
            <div className="mt-2 pt-4 border-t border-zinc-950 flex flex-col gap-3">
              {currentUser ? (
                <div className="flex items-center justify-between bg-zinc-950 border border-zinc-900 p-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName}
                      className="w-6 h-6 rounded-full border border-[#EFFF00]/30"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex flex-col">
                      <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest">
                        PATRON
                      </span>
                      <span className="font-sans font-bold text-xs text-white">
                        {currentUser.displayName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentUser.isAdmin && (
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setAdminOpen(true);
                        }}
                        className="bg-[#EFFF00] text-black font-mono font-black text-[9px] px-2.5 py-1.5 uppercase tracking-wide cursor-pointer"
                      >
                        ADMIN
                      </button>
                    )}
                    <button
                      onClick={() => {
                        authService.signOut();
                        setCurrentUser(null);
                        setAdminOpen(false);
                        setMobileMenuOpen(false);
                      }}
                      className="text-red-400 hover:text-red-300 font-mono text-[9px] uppercase tracking-wider pl-2.5 border-l border-zinc-900 cursor-pointer"
                    >
                      LOGOUT
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 border border-[#EFFF00]/25 bg-black hover:border-[#EFFF00] py-3 text-center text-[10px] font-mono tracking-widest text-[#EFFF00] uppercase cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EFFF00] animate-pulse" />
                  LOGIN
                </button>
              )}
            </div>
            
            <div className="pt-4 border-t border-zinc-900 flex justify-between items-center text-[10px] font-mono text-zinc-500">
              <span>CACTUS BEAR DESIGN LABS</span>
              <span className="text-[#EFFF00]">EST. 2026</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 01: HERO LANDING ENVIRONMENT (WORLD-CLASS STREETWEAR PRESENTATION) */}
      <main className="relative z-10 flex-1 flex flex-col">
        {selectedProductId && productsList.some(p => p.id === selectedProductId) ? (
          <ProductDetailPage
            product={productsList.find(p => p.id === selectedProductId)!}
            allProducts={productsList}
            onBack={() => setSelectedProductId(null)}
            onAddToCart={handleAddToCart}
            onSelectProduct={(productId) => setSelectedProductId(productId)}
            isWishlisted={wishlist.includes(selectedProductId)}
            onToggleWishlist={() => handleToggleWishlist(selectedProductId)}
            currentUser={currentUser}
            onLoginTrigger={() => setAuthOpen(true)}
          />
        ) : activePage === "collection" ? (
          <CollectionPage
            productsList={productsList}
            onAddToCart={handleAddToCart}
            onSelectProduct={(productId) => setSelectedProductId(productId)}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onBack={() => setActivePage("home")}
            searchQuery={headerSearchQuery}
            onSearchQueryChange={setHeaderSearchQuery}
            productsLoading={productsLoading}
          />
        ) : (
          <>
            <section className="relative w-full py-28 md:py-40 px-4 flex flex-col items-center justify-center text-center overflow-hidden border-b border-zinc-950">
          
          {/* Subtle slow spinning logo banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="w-64 md:w-96 select-none opacity-90 relative mb-8"
          >
            <GlowCrown size="100%" color="#EFFF00" glow={true} />
          </motion.div>

          {/* Staggered brand typography block */}
          <div className="flex flex-col items-center max-w-4xl px-4 relative">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-5xl sm:text-6xl md:text-8xl font-sans tracking-tighter font-black uppercase text-white leading-none selection:bg-white"
            >
              CACTUS <span className="text-[#EFFF00] glow-text-yellow">BEAR</span>
            </motion.h1>
            
            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-zinc-400 font-mono text-xs tracking-[0.22em] h-5 mb-8 text-[#EFFF00] uppercase mt-5"
            >
              PREMIUM STREETWEAR DESIGNED IN NIGERIA
            </motion.p>

            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center gap-4 mt-2"
            >
              <button
                onClick={() => {
                  setSelectedProductId(null);
                  setActivePage("collection");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="bg-[#EFFF00] hover:bg-white text-black font-mono font-black py-4 px-8 text-xs tracking-widest transition-colors rounded-none uppercase flex items-center gap-2 cursor-pointer"
              >
                EXPLORE COLLECTION '01
                <ChevronRight size={13} />
              </button>

              <button
                onClick={() => handleNavToSection("customizer-lab")}
                className="bg-transparent border border-zinc-800 hover:border-[#EFFF00] font-mono hover:text-[#EFFF00] py-4 px-8 text-xs tracking-widest transition-colors rounded-none uppercase cursor-pointer"
              >
                CUSTOM DESIGN LAB
              </button>
            </motion.div>
          </div>

          {/* Scroll anchor bridge */}
          <div className="absolute bottom-6 flex flex-col items-center justify-center font-mono text-[9px] text-zinc-650 tracking-widest">
            <span className="uppercase block mb-1">SCROLL DOWN TO SHOP</span>
            <ArrowDown size={10} className="animate-bounce text-[#EFFF00]" />
          </div>
        </section>

        {/* SECTION 02: DYNAMIC PRODUCT ARCHIVE (THE CORE STOCK GRID) */}
        <section id="preset-capsule" className="w-full py-20 px-4 md:px-8 border-b border-zinc-950">
          <div className="max-w-7xl mx-auto">
            
            {/* Archive Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <span className="text-[#EFFF00] font-mono text-xs tracking-widest block uppercase font-semibold mb-1">
                  [ NEW ARRIVALS ]
                </span>
                <h2 className="text-4xl md:text-5xl font-sans tracking-tighter font-extrabold uppercase text-white">
                  SHOP THE <span className="text-zinc-800">COLLECTION</span>
                </h2>
                <p className="text-zinc-550 text-xs mt-1.5 max-w-md">
                  Explore high-quality streetwear crafted from premium organic cotton, designed for comfort and durability.
                </p>
              </div>

              {/* Dynamic Categories Tab filters with horizontal swipe for mobile */}
              <div className="w-full overflow-x-auto scrollbar-none pb-2 md:pb-0">
                <div className="flex gap-2 p-1 bg-[#050505] border border-zinc-900 rounded-none w-max max-w-full">
                  {(["All", "Outerwear", "Tees", "Headwear"] as const).map((cat) => {
                    const isChose = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 font-mono text-[10px] tracking-widest transition-colors rounded-none whitespace-nowrap cursor-pointer ${
                          isChose
                            ? "bg-white text-black font-bold"
                            : "text-zinc-500 hover:text-white"
                        }`}
                      >
                        {cat.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

             {/* Core Products Grid mapping with dense 2-column layout for mobile */}
            {productsLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <ProductCardSkeleton key={`skel-home-${idx}`} />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {filteredProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onAddToCart={handleAddToCart}
                    onSelect={setSelectedProductId}
                    isWishlisted={wishlist.includes(prod.id)}
                    onToggleWishlist={() => handleToggleWishlist(prod.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="w-full bg-[#050505] border border-zinc-900 py-16 px-4 text-center flex flex-col items-center justify-center gap-4">
                <span className="text-[#EFFF00] font-mono text-[10px] tracking-widest uppercase font-black animate-pulse">
                  [ NO PRODUCTS FOUND ]
                </span>
                <p className="text-zinc-500 font-mono text-xs max-w-sm leading-relaxed">
                  No items match "{headerSearchQuery}". Try adjusting your keywords.
                </p>
                <button
                  onClick={() => setHeaderSearchQuery("")}
                  className="font-mono text-[10px] tracking-widest bg-zinc-950 border border-zinc-800 hover:border-[#EFFF00] px-4 py-2 uppercase hover:text-[#EFFF00] transition-colors cursor-pointer"
                >
                  [ RESET SEARCH ]
                </button>
              </div>
            )}

          </div>
        </section>

        {/* SECTION 03: THE INTERACTIVE CUSTOM SEWING LAB */}
        <Customizer onAddCustomItem={handleAddToCart} />

        {/* SECTION 04: EDITORIAL CONCEPT & SOUND NODE */}
        <Lookbook />

        {/* SECTION 05: INCOMING DROP & COUNTDOWN PORTAL */}
        <section id="unlocked-terminal" className="w-full bg-[#050505] border-t border-zinc-950 py-24 px-4 md:px-8 relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Configurable Countdown and dynamic release definitions */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div>
                  <span className="text-[#EFFF00] font-mono text-xs tracking-widest block font-black uppercase mb-1">
                    ✦ UPCOMING COLLECTION DROP
                  </span>
                  <h2 className="text-4xl md:text-5xl font-sans tracking-tighter font-extrabold uppercase text-white">
                    {timerConfig.heading}
                  </h2>
                  <h3 className="text-xl font-mono text-zinc-400 mt-2 uppercase tracking-wide">
                    {timerConfig.subheading}
                  </h3>
                  <p className="text-zinc-500 text-xs max-w-xl mt-3 leading-relaxed font-sans">
                    {timerConfig.description}
                  </p>
                </div>

                {/* Gorgeous Monospace LCD Timer Block */}
                <div className="grid grid-cols-4 gap-2 xs:gap-3 md:gap-4 max-w-lg mt-4">
                  <div className="bg-zinc-950 border border-zinc-900 p-2.5 xs:p-3 sm:p-4 font-mono text-center relative overflow-hidden">
                    <span className="text-[8px] xs:text-[9px] text-zinc-650 block uppercase tracking-widest font-bold">DAYS</span>
                    <span className="text-2xl xs:text-3xl md:text-4xl font-black text-[#EFFF00] tracking-wider block mt-1.5 xs:mt-2">
                      {String(timeLeft.days).padStart(2, '0')}
                    </span>
                    <div className="absolute top-1 right-1.5 text-[6px] xs:text-[7px] text-zinc-850">C1</div>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-900 p-2.5 xs:p-3 sm:p-4 font-mono text-center relative overflow-hidden">
                    <span className="text-[8px] xs:text-[9px] text-zinc-650 block uppercase tracking-widest font-bold">HOURS</span>
                    <span className="text-2xl xs:text-3xl md:text-4xl font-black text-white tracking-wider block mt-1.5 xs:mt-2">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <div className="absolute top-1 right-1.5 text-[6px] xs:text-[7px] text-zinc-850">C2</div>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-900 p-2.5 xs:p-3 sm:p-4 font-mono text-center relative overflow-hidden">
                    <span className="text-[8px] xs:text-[9px] text-zinc-650 block uppercase tracking-widest font-bold">MINS</span>
                    <span className="text-2xl xs:text-3xl md:text-4xl font-black text-white tracking-wider block mt-1.5 xs:mt-2">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <div className="absolute top-1 right-1.5 text-[6px] xs:text-[7px] text-zinc-850">C3</div>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-900 p-2.5 xs:p-3 sm:p-4 font-mono text-center relative overflow-hidden">
                    <span className="text-[8px] xs:text-[9px] text-zinc-650 block uppercase tracking-widest font-bold">SECS</span>
                    <span className="text-2xl xs:text-3xl md:text-4xl font-black text-[#EFFF00] tracking-wider block mt-1.5 xs:mt-2">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                    <div className="absolute top-1 right-1.5 text-[6px] xs:text-[7px] text-zinc-850">C4</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-[9px] text-zinc-600 mt-2">
                  <span className="flex items-center gap-1.5 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EFFF00] animate-ping" />
                    LIVE COUNTDOWN
                  </span>
                  <span>|</span>
                  <span>RELEASE TIME: {new Date(timerConfig.targetDate).toLocaleDateString()} {new Date(timerConfig.targetDate).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Right Column: Alert Registry Form */}
              <div className="lg:col-span-5 bg-[#0b0b0c] border border-zinc-900 p-8 flex flex-col justify-between relative min-h-[380px]">
                <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-zinc-700 tracking-widest">
                  NOTIFICATIONS
                </div>

                <div>
                  <h3 className="font-sans font-extrabold text-lg uppercase tracking-tight text-white mb-2">
                    RELEASE NOTIFICATION
                  </h3>
                  <p className="text-zinc-500 text-xs font-sans leading-relaxed">
                    Leave your email to receive early access instructions the moment this collection officially drops.
                  </p>
                </div>

                {/* Subscribed or Form wrapper with transitions */}
                <AnimatePresence mode="wait">
                  {!alertSubscribed ? (
                    <motion.form
                      key="alert-signup-form"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleAlertSignup}
                      className="flex flex-col gap-4 mt-8"
                    >
                      <div className="flex flex-col gap-1">
                        <label className="font-mono text-[9px] text-zinc-650 uppercase">
                          YOUR EMAIL ADDRESS
                        </label>
                        <input
                          required
                          type="email"
                          value={alertFormEmail}
                          onChange={(e) => setAlertFormEmail(e.target.value)}
                          className="w-full bg-black border border-zinc-900 focus:border-[#EFFF00] rounded-none py-3 px-4 font-mono text-xs outline-none text-[#EFFF00] transition-colors"
                          placeholder="your.email@example.com"
                        />
                        {alertError && (
                          <span className="font-mono text-[9px] text-red-400 mt-1 block uppercase font-bold">
                            ⚠ {alertError}
                          </span>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={alertSubmitting}
                        className="w-full bg-white hover:bg-[#EFFF00] text-black font-mono font-black text-xs py-3.5 tracking-widest transition-colors rounded-none uppercase flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {alertSubmitting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            SUBSCRIBING...
                          </>
                        ) : (
                          <>
                            <Mail size={14} />
                            NOTIFY ME ON RELEASE
                          </>
                        )}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="alert-unlocked"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-8 flex flex-col gap-4"
                    >
                      <div className="border border-[#EFFF00] bg-[#121207] p-6 relative overflow-hidden">
                        <span className="font-mono text-[8px] text-[#EFFF00]/50 tracking-wider block mb-2">
                          NEWSLETTER REGISTRATION
                        </span>
                        
                        <div className="flex items-center gap-2 text-white">
                          <Check size={14} className="text-[#EFFF00]" />
                          <h4 className="font-mono text-xs font-black uppercase tracking-wider text-[#EFFF00]">
                            YOU'RE ON THE LIST!
                          </h4>
                        </div>
                        <p className="text-zinc-400 text-[11px] font-sans mt-2 leading-relaxed">
                          Your email was saved in our notification list. You will receive an exclusive early shopping pass the second the countdown timer runs out.
                        </p>

                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#EFFF00]/20 font-mono text-[8px] text-[#EFFF00]/60">
                          <span>NOTIFICATIONS: ENABLED</span>
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#EFFF00] animate-pulse" />
                            EMAIL REGISTERED
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setAlertSubscribed(false)}
                        className="w-full bg-transparent border border-zinc-900 hover:border-zinc-800 text-zinc-550 font-mono text-[9px] py-2 uppercase tracking-wide transition-colors cursor-pointer"
                      >
                        [ SUBSCRIBE ANOTHER EMAIL ]
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
                
              </div>

            </div>
          </div>
        </section>
          </>
        )}
      </main>

      {/* FOOTER: DESIGN STUDIO FOOTER */}
      <footer className="bg-black text-zinc-650 border-t border-zinc-950 py-16 px-4 md:px-8 relative z-20 font-mono text-[10px] tracking-wide">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          
          {/* Trademark details */}
          <div className="flex flex-col gap-2">
            <span className="font-sans font-black text-white text-sm tracking-wider uppercase">[ CACTUS BEAR ]</span>
            <span>HEAVYWEIGHT COTTON STREETWEAR</span>
            <span>LAGOS & YABA DESIGNS, NIGERIA</span>
          </div>

          <div className="flex flex-col md:items-end gap-1 text-zinc-500">
            <span>Cactus Bear Studio</span>
            <span>Lagos Streetwear & Heavyweight Garments</span>
            <span>© 2026 CACTUS BEAR APPAREL GROUP. ALL RIGHTS RESERVED.</span>
          </div>

        </div>
      </footer>

      {/* SHOPPING CART DRAWER */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        wishlist={productsList.filter((p) => wishlist.includes(p.id))}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onAddToast={addToast}
      />

      {/* GOOGLE SIGN-IN MODAL */}
      <GoogleAuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onLoginSuccess={(session) => {
          setCurrentUser(session);
          addToast(`PATRON ACCESS AUTHORIZED // WELCOME RETURNING CREW: ${session.displayName.toUpperCase()}`, "success");
        }}
      />

      {/* ORDERS LOOKUP AND LIVE TRACKING PORTAL */}
      <OrdersLookupModal
        isOpen={ordersLookupOpen}
        onClose={() => setOrdersLookupOpen(false)}
        currentUser={currentUser}
      />

      {/* ACCOUNT BOUND ORDER HISTORY LEDGER */}
      <OrderHistoryModal
        isOpen={orderHistoryOpen}
        onClose={() => setOrderHistoryOpen(false)}
        currentUser={currentUser}
      />

      {/* ADMINISTRATIVE WORKSPACE MODAL */}
      {currentUser?.isAdmin && (
        <AdminWorkspaceModal
          isOpen={adminOpen}
          onClose={() => setAdminOpen(false)}
          onRefreshProducts={refreshDynamicProducts}
        />
      )}

      {/* TOASTS STACK INTERACTIVE CONTAINER */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 50, transition: { duration: 0.2 } }}
              className="pointer-events-auto bg-[#080809] border border-zinc-800 p-4 shadow-[0_12px_24px_rgba(0,0,0,0.85)] backdrop-blur-md relative overflow-hidden"
            >
              {/* Left sidebar color bar indication */}
              <div
                className={`absolute top-0 left-0 bottom-0 w-1 ${
                  toast.type === "success" ? "bg-[#EFFF00]" : toast.type === "alert" ? "bg-red-500" : "bg-cyan-400"
                }`}
              />

              <div className="flex items-start justify-between gap-3 pl-2">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1 gap-4">
                    <span className="font-mono text-[8px] text-zinc-550 tracking-wider">
                      SYSTEM MESSAGE // {toast.timestamp}
                    </span>
                    <span
                      className={`font-mono text-[7px] px-1 py-0.5 uppercase tracking-widest font-black ${
                        toast.type === "success"
                          ? "bg-[#161607] text-[#EFFF00]"
                          : toast.type === "alert"
                          ? "bg-red-950/40 text-red-400"
                          : "bg-cyan-950/40 text-cyan-400"
                      }`}
                    >
                      {toast.type}
                    </span>
                  </div>
                  <p className="font-sans text-[11px] text-zinc-100 uppercase tracking-tight leading-relaxed font-semibold">
                    {toast.message}
                  </p>
                </div>

                <button
                  onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                  className="text-zinc-650 hover:text-white p-0.5 hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <X size={10} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* MOBILE PERSISTENT BOTTOM NAVIGATION TAB BAR */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-900 py-2.5 px-4 flex md:hidden justify-around items-center gap-1 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        
        {/* TAB 01: HOME */}
        <button
          onClick={() => {
            setSelectedProductId(null);
            setActivePage("home");
            setMobileMenuOpen(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex flex-col items-center gap-1 flex-1 cursor-pointer transition-colors outline-none ${
            activePage === "home" && !selectedProductId ? "text-[#EFFF00]" : "text-zinc-550 hover:text-white"
          }`}
        >
          <Home size={18} className={activePage === "home" && !selectedProductId ? "text-[#EFFF00]" : "text-zinc-550"} />
          <span className="font-mono text-[8px] font-bold uppercase tracking-wider">HOME</span>
        </button>

        {/* TAB 02: CATALOG / SHOP */}
        <button
          onClick={() => {
            setSelectedProductId(null);
            setActivePage("collection");
            setMobileMenuOpen(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex flex-col items-center gap-1 flex-1 cursor-pointer transition-colors outline-none ${
            activePage === "collection" || selectedProductId ? "text-[#EFFF00]" : "text-zinc-550 hover:text-white"
          }`}
        >
          <Package size={18} className={activePage === "collection" || selectedProductId ? "text-[#EFFF00]" : "text-zinc-550"} />
          <span className="font-mono text-[8px] font-bold uppercase tracking-wider">CATALOG</span>
        </button>

        {/* TAB 03: STITCH DESIGN LAB */}
        <button
          onClick={() => {
            setSelectedProductId(null);
            setActivePage("home");
            setMobileMenuOpen(false);
            // Direct scroll to customizer-lab
            setTimeout(() => {
              const el = document.getElementById("customizer-lab");
              if (el) {
                el.scrollIntoView({ behavior: "smooth" });
              }
            }, 80);
          }}
          className="flex flex-col items-center gap-1 flex-1 cursor-pointer text-zinc-550 hover:text-white transition-colors outline-none"
        >
          <div className="relative">
            <Cpu size={18} />
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#EFFF00] animate-pulse" />
          </div>
          <span className="font-mono text-[8px] font-bold uppercase tracking-wider">STITCH LAB</span>
        </button>

        {/* TAB 04: BAG (CART) */}
        <button
          onClick={() => {
            setMobileMenuOpen(false);
            setCartOpen(true);
          }}
          className="flex flex-col items-center gap-1 flex-1 cursor-pointer text-zinc-550 hover:text-white transition-colors relative outline-none"
        >
          <div className="relative">
            <ShoppingBag size={18} />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-[#EFFF00] text-black font-mono text-[7px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-black shadow-lg">
                {cartItemsCount}
              </span>
            )}
          </div>
          <span className="font-mono text-[8px] font-bold uppercase tracking-wider">BAG</span>
        </button>

        {/* TAB 05: ACCOUNT DECK PORTAL / MENU */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`flex flex-col items-center gap-1 flex-1 cursor-pointer transition-colors outline-none ${
            mobileMenuOpen ? "text-[#EFFF00]" : "text-zinc-550 hover:text-white"
          }`}
        >
          {currentUser ? (
            <img
              src={currentUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.displayName}`}
              alt={currentUser.displayName}
              className={`w-5 h-5 rounded-full border bg-zinc-950 ${
                mobileMenuOpen ? "border-[#EFFF00]" : "border-zinc-800"
              } object-cover`}
              referrerPolicy="no-referrer"
            />
          ) : (
            <User size={18} className={mobileMenuOpen ? "text-[#EFFF00]" : "text-zinc-550"} />
          )}
          <span className="font-mono text-[8px] font-bold uppercase tracking-wider">
            {currentUser ? "ACCOUNT" : "MENU"}
          </span>
        </button>

      </div>

    </div>
  );
}
