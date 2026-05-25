import React, { useState, useEffect } from "react";
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
  X
} from "lucide-react";

import { CartItem, ProductCat } from "./types";
import { DROPS_TIMELINE } from "./data";
import GlowCrown from "./components/GlowCrown";
import ProductCard from "./components/ProductCard";
import Customizer from "./components/Customizer";
import CartDrawer from "./components/CartDrawer";
import Lookbook from "./components/Lookbook";

import { dbService, authService, UserSession, DropTimerConfig } from "./services/firebase";
import GoogleAuthModal from "./components/GoogleAuthModal";
import AdminWorkspaceModal from "./components/AdminWorkspaceModal";

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCat | "All">("All");
  
  // Upcoming Drop Countdown states
  const [timerConfig, setTimerConfig] = useState<DropTimerConfig>({
    id: "active-drop-config",
    heading: "SÉRIE INCOMING // JULY SPECIALIST",
    subheading: "THE SAGE THORN DOUBLE-PLEAT PARACHUTE CARGOS",
    targetDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Premium heavy-dyed dual structured ripstop pants featuring our signature crown detailing.",
    isActivated: true,
    notifyEmails: []
  });
  const [alertFormEmail, setAlertFormEmail] = useState<string>("");
  const [alertSubscribed, setAlertSubscribed] = useState<boolean>(false);
  const [alertError, setAlertError] = useState<string>("");
  const [alertSubmitting, setAlertSubmitting] = useState<boolean>(false);

  // Auth, products and Admin Workspace modal states
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [authOpen, setAuthOpen] = useState<boolean>(false);
  const [adminOpen, setAdminOpen] = useState<boolean>(false);
  const [productsList, setProductsList] = useState<any[]>([]);

  const refreshDynamicProducts = async () => {
    try {
      const pList = await dbService.getProducts();
      setProductsList(pList);
      const tConf = await dbService.getTimerConfig();
      setTimerConfig(tConf);
    } catch (e) {
      console.error("Failed to load products/timer:", e);
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

  // Load cart and auth on startup
  useEffect(() => {
    refreshDynamicProducts();
    const savedCart = localStorage.getItem("cactus_bear_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Cart retrieval failed", e);
      }
    }
    
    // Check auth session
    const session = authService.getSession();
    if (session) {
      setCurrentUser(session);
    }
  }, []);

  // Sync state helpers
  const syncCart = (updated: CartItem[]) => {
    setCart(updated);
    localStorage.setItem("cactus_bear_cart", JSON.stringify(updated));
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
        await refreshDynamicProducts();
      } else {
        setAlertError("Patron verification: You are already subscribed to the upcoming release!");
      }
    } catch (err) {
      setAlertError("Database connection timed out. Please try again.");
    } finally {
      setAlertSubmitting(false);
    }
  };

  // Filter Catalog Presets
  const filteredProducts = selectedCategory === "All"
    ? productsList
    : productsList.filter((p) => p.category === selectedCategory);

  const cartItemsCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="w-full bg-black text-white font-sans selection:bg-[#EFFF00] selection:text-black min-h-screen flex flex-col justify-between">
      
      {/* GLOBAL BACKGROUND NOISE & SCANS GRID */}
      <div className="fixed inset-0 bg-[#020202] pointer-events-none z-0 overflow-hidden">
        {/* Dot pattern matrix */}
        <div className="absolute inset-0 bg-[radial-gradient(#1c1c11_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
        {/* Clean scanning lines overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0.3)_1px,transparent_1px)] [background-size:100%_4px]" />
      </div>

      {/* PERSISTENT HIGH-END STATIONS HEADER */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-zinc-950 px-4 md:px-8 py-4 flex justify-between items-center">
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-12 h-6 rotate-[-15deg] transition-transform group-hover:rotate-[15deg]">
            <GlowCrown size="100%" color="#EFFF00" glow={true} />
          </div>
          <span className="font-sans font-extrabold text-[#EFFF00] text-sm tracking-[0.2em] uppercase transition-colors">
            CACTUS BEAR
          </span>
        </a>

        {/* Anchor Quick Jump Bridges */}
        <nav className="hidden md:flex items-center gap-8 font-mono text-[11px] font-semibold tracking-[0.12em] text-zinc-350">
          <a href="#preset-capsule" className="hover:text-[#EFFF00] transition-colors uppercase">
            01 / COLLECTION
          </a>
          <a href="#customizer-lab" className="hover:text-[#EFFF00] transition-colors uppercase flex items-center gap-1.5">
            <span className="w-1 rounded-full bg-[#EFFF00] aspect-square animate-pulse" />
            02 / CUSTOMIZER (COMING SOON)
          </a>
          <a href="#brand-lookbook" className="hover:text-[#EFFF00] transition-colors uppercase">
            03 / MANIFESTO
          </a>
          <a href="#unlocked-terminal" className="hover:text-[#EFFF00] transition-colors uppercase">
            04 / UPCOMING DROP
          </a>
        </nav>

        {/* Navigation Actions and login buttons */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-900 px-3 py-1 text-xs">
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName}
                className="w-5 h-5 rounded-full border border-[#EFFF00]/30"
                referrerPolicy="no-referrer"
              />
              <span className="font-mono text-[9px] text-zinc-400 hidden sm:inline uppercase">
                {currentUser.displayName}
              </span>
              
              {currentUser.isAdmin && (
                <button
                  onClick={() => setAdminOpen(true)}
                  className="bg-[#EFFF00] hover:bg-yellow-400 text-black font-mono font-black text-[9px] px-2.5 py-1 uppercase tracking-wider transition-colors cursor-pointer"
                >
                  ADMIN
                </button>
              )}

              <button
                onClick={() => {
                  authService.signOut();
                  setCurrentUser(null);
                  setAdminOpen(false);
                }}
                className="text-red-400 hover:text-red-300 font-mono text-[9px] uppercase tracking-widest pl-2 border-l border-zinc-900 cursor-pointer"
              >
                OUT
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="flex items-center gap-1.5 border border-[#EFFF00]/25 bg-black hover:border-[#EFFF00] font-mono text-[9px] tracking-widest px-3 py-1.5 text-white hover:text-[#EFFF00] transition-all rounded-none cursor-pointer"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#EFFF00] animate-pulse" />
              LOGIN
            </button>
          )}

          {/* Vault cart trigger button */}
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-2 border border-zinc-900 bg-zinc-950 hover:border-[#EFFF00] font-mono text-[10px] tracking-widest px-4 py-2 hover:text-[#EFFF00] transition-all rounded-none cursor-pointer"
          >
            <ShoppingBag size={12} className="text-[#EFFF00]" />
            <span>BAG ({cartItemsCount})</span>
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden items-center justify-center border border-zinc-900 bg-zinc-950 hover:border-[#EFFF00] p-2 hover:text-[#EFFF00] transition-all rounded-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={13} className="text-[#EFFF00]" /> : <Menu size={13} className="text-[#EFFF00]" />}
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
            className="fixed inset-x-0 top-[65px] z-30 bg-black/98 border-b border-zinc-900 py-8 px-6 flex flex-col gap-6 md:hidden shadow-2xl backdrop-blur-lg"
          >
            <span className="text-[9px] font-mono text-zinc-500 tracking-[0.3em] uppercase block border-b border-zinc-950 pb-2">
              ✦ STUDIO ATELIER DIRECTORY
            </span>
            <div className="flex flex-col gap-5 font-sans text-base font-black tracking-tight text-zinc-100 uppercase">
              <a
                href="#preset-capsule"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#EFFF00] active:text-[#EFFF00] transition-all block"
              >
                01 / THE COLLECTION
              </a>
              <a
                href="#customizer-lab"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#EFFF00] active:text-[#EFFF00] transition-all flex items-center gap-2 block text-zinc-400"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                02 / CUSTOMIZER (COMING SOON)
              </a>
              <a
                href="#brand-lookbook"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#EFFF00] active:text-[#EFFF00] transition-all block"
              >
                03 / ATELIER MANIFESTO
              </a>
              <a
                href="#unlocked-terminal"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#EFFF00] active:text-[#EFFF00] transition-all block"
              >
                04 / UPCOMING DROP
              </a>
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
              className="text-6xl sm:text-7xl md:text-9xl font-sans tracking-tighter font-black uppercase text-white leading-none selection:bg-white"
            >
              CACTUS <span className="text-[#EFFF00] glow-text-yellow">BEAR</span>
            </motion.h1>
            
            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-zinc-550 font-mono text-xs tracking-[0.25em] h-5 mb-8 text-[#EFFF00] uppercase mt-4"
            >
              RESILIENCE IN THXRN // HEAVYWEIGHT INDUSTRIAL SPECIFICATIONS
            </motion.p>

            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center gap-4 mt-2"
            >
              <a
                href="#preset-capsule"
                className="bg-[#EFFF00] hover:bg-white text-black font-mono font-black py-4 px-8 text-xs tracking-widest transition-colors rounded-none uppercase flex items-center gap-2"
              >
                EXPLORE COLLECTION '01
                <ChevronRight size={13} />
              </a>

              <a
                href="#customizer-lab"
                className="bg-transparent border border-zinc-800 hover:border-[#EFFF00] font-mono hover:text-[#EFFF00] py-4 px-8 text-xs tracking-widest transition-colors rounded-none uppercase"
              >
                STUDIO DESIGN CUSTOMIZER
              </a>
            </motion.div>
          </div>

          {/* Scroll anchor bridge */}
          <div className="absolute bottom-6 flex flex-col items-center justify-center font-mono text-[9px] text-zinc-650 tracking-widest">
            <span className="uppercase block mb-1">PULL DOWN FOR CATALOGUE</span>
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
                  [ CATALOGUE_BASE // DROP_01 ]
                </span>
                <h2 className="text-4xl md:text-5xl font-sans tracking-tighter font-extrabold uppercase text-white">
                  THE PRESET <span className="text-zinc-800">VAULT</span>
                </h2>
                <p className="text-zinc-550 text-xs mt-1.5 max-w-md">
                  Browse immediate numbered fabric runs. Prepared from heavy pre-shrunk organic weaves. Complete with high-contrast crown seals.
                </p>
              </div>

              {/* Dynamic Categories Tab filters */}
              <div className="flex flex-wrap gap-2 p-1 bg-[#050505] border border-zinc-900 rounded-none max-w-max">
                {(["All", "Outerwear", "Tees", "Headwear"] as const).map((cat) => {
                  const isChose = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 font-mono text-[10px] tracking-widest transition-colors rounded-none ${
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

            {/* Core Products Grid mapping */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

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
                <div className="grid grid-cols-4 gap-3 md:gap-4 max-w-lg mt-4">
                  <div className="bg-zinc-950 border border-zinc-900 p-4 font-mono text-center relative overflow-hidden">
                    <span className="text-[9px] text-zinc-650 block uppercase tracking-widest font-bold">DAYS</span>
                    <span className="text-3xl md:text-4xl font-black text-[#EFFF00] tracking-wider block mt-2">
                      {String(timeLeft.days).padStart(2, '0')}
                    </span>
                    <div className="absolute top-1 right-2 text-[7px] text-zinc-850">C1</div>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-900 p-4 font-mono text-center relative overflow-hidden">
                    <span className="text-[9px] text-zinc-650 block uppercase tracking-widest font-bold">HOURS</span>
                    <span className="text-3xl md:text-4xl font-black text-white tracking-wider block mt-2">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <div className="absolute top-1 right-2 text-[7px] text-zinc-850">C2</div>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-900 p-4 font-mono text-center relative overflow-hidden">
                    <span className="text-[9px] text-zinc-650 block uppercase tracking-widest font-bold">MINS</span>
                    <span className="text-3xl md:text-4xl font-black text-white tracking-wider block mt-2">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <div className="absolute top-1 right-2 text-[7px] text-zinc-850">C3</div>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-900 p-4 font-mono text-center relative overflow-hidden">
                    <span className="text-[9px] text-zinc-650 block uppercase tracking-widest font-bold">SECS</span>
                    <span className="text-3xl md:text-4xl font-black text-[#EFFF00] tracking-wider block mt-2">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                    <div className="absolute top-1 right-2 text-[7px] text-zinc-850">C4</div>
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

      </main>

      {/* FOOTER: DESIGN STUDIO FOOTER */}
      <footer className="bg-black text-zinc-650 border-t border-zinc-950 py-16 px-4 md:px-8 relative z-20 font-mono text-[10px] tracking-wide">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          
          {/* Trademark details */}
          <div className="flex flex-col gap-2">
            <span className="font-sans font-black text-white text-sm tracking-wider uppercase">[ CACTUS BEAR ]</span>
            <span>EXPERIMENTAL PREMIUM APPAREL</span>
            <span>LONDON & CHESHIRE DESIGN STUDIO</span>
          </div>

          <div className="flex flex-col md:items-end gap-1 text-zinc-500">
            <span>Cactus Bear Studio</span>
            <span>Premium Streetwear & Heavyweight Garments</span>
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
      />

      {/* GOOGLE SIGN-IN MODAL */}
      <GoogleAuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onLoginSuccess={(session) => {
          setCurrentUser(session);
        }}
      />

      {/* ADMINISTRATIVE WORKSPACE MODAL */}
      {currentUser?.isAdmin && (
        <AdminWorkspaceModal
          isOpen={adminOpen}
          onClose={() => setAdminOpen(false)}
          onRefreshProducts={refreshDynamicProducts}
        />
      )}

    </div>
  );
}
