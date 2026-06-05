import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  ShoppingBag, 
  Check, 
  Plus, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  HelpCircle,
  QrCode,
  RotateCcw,
  Scissors,
  Heart,
  Share2
} from "lucide-react";
import { Product, CartItem, ApparelColor } from "../types";
import GlowCrown from "./GlowCrown";
import { UserSession } from "../services/firebase";
import ReviewsSection from "./ReviewsSection";

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onBack: () => void;
  onAddToCart: (item: CartItem) => void;
  onSelectProduct: (productId: string) => void;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  currentUser: UserSession | null;
  onLoginTrigger: () => void;
}

export default function ProductDetailPage({ 
  product, 
  allProducts,
  onBack, 
  onAddToCart,
  onSelectProduct,
  isWishlisted,
  onToggleWishlist,
  currentUser,
  onLoginTrigger
}: ProductDetailPageProps) {
  const [selectedSize, setSelectedSize] = useState<string>((product.sizes && product.sizes[0]) || "L");
  const [selectedColor, setSelectedColor] = useState<ApparelColor>((product.colors && product.colors[0]) || { name: "Bleach White", hex: "#FFFFFF", bgHex: "#1a1a1c" });
  const [added, setAdded] = useState<boolean>(false);
  const [adding, setAdding] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"specifications" | "manufacturing" | "shipping">("specifications");
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [showQrCode, setShowQrCode] = useState<boolean>(false);
  const [shareStatus, setShareStatus] = useState<string>("");
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;
    
    const clientX = (e.clientX !== undefined && e.clientX !== null && !isNaN(e.clientX)) ? e.clientX : (rect.left + rect.width / 2);
    const clientY = (e.clientY !== undefined && e.clientY !== null && !isNaN(e.clientY)) ? e.clientY : (rect.top + rect.height / 2);

    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
    
    if (!isNaN(x) && !isNaN(y)) {
      setZoomPos({ x, y });
    }
  };

  const handleShareClick = async () => {
    const shareData = {
      title: product.name,
      text: `${product.name} - ${product.description} (SKU: ${product.sku}) / PRESET VAULT SERIE`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        setShareStatus("SHARED");
        setTimeout(() => setShareStatus(""), 2000);
      } catch (err) {
        console.log("Web Share failed or cancelled:", err);
      }
    } else {
      // Fallback: Copy link to clipboard
      try {
        await navigator.clipboard.writeText(
          `${product.name}\n${product.description}\n\nLink: ${window.location.href}`
        );
        setShareStatus("LINK COPIED");
        setTimeout(() => setShareStatus(""), 2000);
      } catch (copyErr) {
        console.error("Clipboard copy failed:", copyErr);
      }
    }
  };

  // Scroll to top when changing products
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSelectedSize((product.sizes && product.sizes[0]) || "L");
    setSelectedColor((product.colors && product.colors[0]) || { name: "Bleach White", hex: "#FFFFFF", bgHex: "#1a1a1c" });
  }, [product]);

  const handleAddToCartClick = () => {
    if (adding || added) return;
    setAdding(true);

    const cartItem: CartItem = {
      id: `std-${product.id}-${selectedColor.name}-${selectedSize}`,
      product,
      selectedColor,
      selectedSize,
      quantity: 1,
    };

    setTimeout(() => {
      onAddToCart(cartItem);
      setAdding(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }, 600);
  };

  // Find related runs (excluding current product, limit to 2 or 3)
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  // If no related products from same category, take random ones
  const finalRelated = relatedProducts.length > 0 
    ? relatedProducts 
    : allProducts.filter((p) => p.id !== product.id).slice(0, 3);

  // Generate JSON-LD Structured Data for this premium product
  const productJsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": [
      selectedColor?.imageUrl || product.imageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop"
    ],
    "description": product.description,
    "sku": product.sku,
    "mpn": product.sku,
    "category": product.category,
    "brand": {
      "@type": "Brand",
      "name": "Cactus Bear"
    },
    "offers": {
      "@type": "Offer",
      "url": `${window.location.origin}/?product=${product.id}`,
      "priceCurrency": "NGN",
      "price": product.price,
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": 0,
          "currency": "NGN"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "NG"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "value": 2,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "value": 3,
            "unitCode": "DAY"
          }
        }
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "NG",
        "returnPolicyCategory": "https://schema.org/MerchantReturnWithdawalPolicy",
        "merchantReturnDays": 14,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn"
      },
      "seller": {
        "@type": "Organization",
        "name": "Cactus Bear Design Labs",
        "url": window.location.origin
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": String(12 + (product.name.length % 5))
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-10 relative z-10">
      
      {/* Rich Search Snippets Schema Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      
      {/* Back button breadcrumb row */}
      <div className="flex justify-between items-center mb-8 border-b border-zinc-900 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 group font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-400 hover:text-[#EFFF00] transition-colors cursor-pointer"
        >
          <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
          <span>⟵ BACK TO PRODUCTS</span>
        </button>

        <span className="font-mono text-[9px] text-zinc-650 tracking-[0.2em] uppercase hidden sm:inline">
          PRODUCT DETAILS // {product.sku}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* LEFT COLUMN: Garment Interactive Schematic Core */}
        <div className="lg:col-span-7 flex flex-col gap-6 w-full">
          
          {/* Main Visual showcase board */}
          <div className={`bg-[#050505] border border-zinc-900 flex flex-col items-center justify-center relative overflow-hidden group min-h-[350px] sm:min-h-[460px] md:min-h-[520px] ${
            (selectedColor.imageUrl || product.imageUrl) ? "p-0" : "p-6 md:p-12"
          }`}>
            
            {/* Soft Ambient Radial color aura behind garment representation */}
            <div 
              className="absolute inset-0 filter blur-[90px] opacity-25 group-hover:opacity-40 transition-all duration-700 rounded-full w-48 h-48 sm:w-72 sm:h-72 m-auto pointer-events-none"
              style={{ backgroundColor: selectedColor.hex }}
            />

            {/* Tactical overlay target grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#EFFF00_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.06] pointer-events-none" />

            {/* Corner Decorative Badges */}
            <div className="absolute top-4 left-4 font-mono text-[8px] text-zinc-600 uppercase tracking-widest hidden xs:block">
              SERIES 01 // IN STOCK
            </div>
            <div className="absolute top-4 right-4 font-mono text-[8px] text-zinc-600 uppercase tracking-widest flex items-center gap-1.5 hidden xs:inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EFFF00] animate-pulse" />
              AUTHENTIC DESIGN
            </div>

            {/* Visual presentation stage */}
            <div 
              className={`relative z-10 overflow-hidden cursor-crosshair flex items-center justify-center ${
                (selectedColor.imageUrl || product.imageUrl)
                  ? "absolute inset-0 w-full h-full"
                  : "w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80"
              }`}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => {
                setIsHovered(false);
                setZoomPos({ x: 50, y: 50 });
              }}
            >
              <motion.div 
                className="relative w-full h-full flex items-center justify-center select-none"
                style={{
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: isHovered ? "scale(2.5)" : "scale(1)",
                  transition: isHovered ? "transform 0.05s ease-out" : "transform 0.3s ease-in-out, transform-origin 0.3s ease-in-out"
                }}
                layoutId={`product-image-${product.id}`}
              >
                {(selectedColor.imageUrl || product.imageUrl) ? (
                  <img
                    src={selectedColor.imageUrl || product.imageUrl}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <RenderGarmentSVG id={product.id} colorHex={selectedColor.hex} mockupType={product.mockupType} isHovered={true} />
                )}

                {/* Embroidered Micro Logo badge overlay */}
                {!(selectedColor.imageUrl || product.imageUrl) && (
                  <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none w-[42px] h-[24px]"
                    style={{
                      transform: `translate(
                        calc(-50% + ${
                          product.id === "cb-buttonup-02" ? "13px" : "0px"
                        }), 
                        calc(-50% + ${
                          product.id === "cb-jersey-01" ? "-4px" :
                          product.id === "cb-buttonup-02" ? "-6px" :
                          product.id === "cb-sweatshirt-04" ? "-17px" :
                          product.id === "cb-trucker-05" ? "-11px" : "-2px"
                        })
                      )`
                    }}
                  >
                    <GlowCrown
                      size={"100%"}
                      color={selectedColor.name === "Bleach White" ? "#000000" : "#EFFF00"}
                      glow={true}
                    />
                  </div>
                )}
              </motion.div>
            </div>

            {/* Interaction Instruction Banner */}
            <div className="absolute bottom-4 inset-x-0 text-center font-mono text-[8px] tracking-wider z-20">
              {isHovered ? (
                <span className="text-[#EFFF00] font-black animate-pulse">
                  ✦ MAGNIFIER ACTIVE: X:{(zoomPos.x).toFixed(0)}% Y:{(zoomPos.y).toFixed(0)}% • 250% WEAVE DETAIL ✦
                </span>
              ) : (
                <span className="text-zinc-550">✦ HOVER OVER IMAGE TO ACTIVATE 250% MACRO TEXTURE INSPECTION ✦</span>
              )}
            </div>

          </div>

          {/* Quick Informational Grid in left column */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#050505] border border-zinc-900 p-3 h-20 flex flex-col justify-between font-mono text-[9px] text-zinc-500">
              <span className="uppercase text-zinc-600 block">FABRIC ORIGIN</span>
              <span className="text-white font-bold uppercase">100% ORGANIC WEAVE</span>
            </div>
            <div className="bg-[#050505] border border-zinc-900 p-3 h-20 flex flex-col justify-between font-mono text-[9px] text-zinc-500">
              <span className="uppercase text-zinc-600 block">WEIGHT PROFILE</span>
              <span className="text-white font-bold uppercase">400GSM HEAVYWEIGHT</span>
            </div>
            <div className="bg-[#050505] border border-zinc-900 p-3 h-20 flex flex-col justify-between font-mono text-[9px] text-zinc-500">
              <span className="uppercase text-zinc-600 block">LAUNCH SERIES</span>
              <span className="text-[#EFFF00] font-bold uppercase">PRESET_VAULT_01</span>
            </div>
            <div className="bg-[#050505] border border-zinc-900 p-3 h-20 flex flex-col justify-between font-mono text-[9px] text-zinc-500">
              <span className="uppercase text-zinc-600 block">RESTOCK FREQUENCY</span>
              <span className="text-white font-bold uppercase">VERY LIMITED</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Garment specifications & Checkout control portal */}
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
          
          <div className="bg-[#050505] border border-zinc-900 p-6 md:p-8 flex flex-col justify-between relative">
            
            {/* Top decorative SKU and status labels */}
            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 mb-6 border-b border-zinc-900 pb-4">
              <span>{product.sku}</span>
              <span className="text-[#EFFF00] font-black uppercase tracking-widest">{product.category}</span>
            </div>

            {/* Core Header info */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-sans font-black uppercase tracking-tight text-white mb-2 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-3 mt-4">
                <span className="font-mono text-xl sm:text-2xl font-black text-white bg-[#1a1a08] border border-[#EFFF00]/20 px-3 py-1">
                  ₦{product.price.toLocaleString()}
                </span>
                {product.stock !== undefined && product.stock <= 5 ? (
                  <span className="font-mono text-[9px] text-[#ff4b4b] uppercase tracking-widest border border-red-550/30 px-2.5 py-1 bg-black flex items-center gap-1.5 animate-pulse font-black">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4b4b]" />
                    LOW STOCK ({product.stock} REMAINING)
                  </span>
                ) : (
                  <span className="font-mono text-[9px] text-[#EFFF00] uppercase tracking-widest border border-[#EFFF00]/30 px-2.5 py-1 bg-black">
                    IN STOCK
                  </span>
                )}
              </div>
            </div>

            {/* Description quote block */}
            <p className="text-zinc-400 text-xs sm:text-sm font-sans leading-relaxed mb-6 border-l-2 border-[#EFFF00] pl-4 italic">
              {product.description}
            </p>

            {/* COLORWAYS */}
            <div className="mb-6 pb-6 border-b border-zinc-950">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-mono text-zinc-550 uppercase tracking-widest font-black">
                  01 / COLORWAY
                </span>
                <span className="font-mono text-[9px] text-[#EFFF00] uppercase">
                  {selectedColor.name}
                </span>
              </div>

              <div className="flex gap-2.5">
                {product.colors.map((color) => {
                  const isCSelected = selectedColor.name === color.name;
                  return (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 border transition-all cursor-pointer relative group ${
                        isCSelected ? "border-[#EFFF00] scale-110" : "border-zinc-800 hover:border-zinc-500"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {isCSelected && (
                        <div className="absolute inset-0.5 border border-black/50" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SIZING */}
            <div className="mb-6 pb-6 border-b border-zinc-950">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-mono text-zinc-550 uppercase tracking-widest font-black">
                  02 / SELECT SIZE
                </span>
                <span className="font-mono text-[10px] text-zinc-450 hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                  <Scissors size={10} className="text-[#EFFF00]" />
                  SIZE GUIDE
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((sz) => {
                  const isSSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`py-2 px-1 font-mono text-xs border transition-all cursor-pointer text-center ${
                        isSSelected
                          ? "bg-white text-black border-white font-black"
                          : "border-zinc-900 bg-black text-zinc-500 hover:border-zinc-650 hover:text-white"
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MAIN INTERACTION CALL TO ACTIONS */}
            <div className="flex flex-col gap-3 mb-8">
              <div className="flex gap-2.5">
                <button
                  onClick={handleAddToCartClick}
                  disabled={adding || added}
                  className={`flex-1 h-14 font-mono font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-3.5 rounded-none cursor-pointer ${
                    added
                      ? "bg-[#EFFF00] text-black"
                      : "bg-white hover:bg-[#EFFF00] text-black disabled:bg-zinc-800 disabled:text-zinc-500"
                  }`}
                >
                  {adding ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ADDING TO BAG...
                    </>
                  ) : added ? (
                    <>
                      <Check size={16} className="animate-bounce" />
                      ADDED TO CART
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={15} />
                      ADD TO CART — ₦{(product.price).toLocaleString()}
                    </>
                  )}
                </button>

                <button
                  onClick={onToggleWishlist}
                  className={`w-14 h-14 border flex items-center justify-center transition-all cursor-pointer relative ${
                    isWishlisted 
                      ? "border-[#EFFF00] text-[#EFFF00] bg-[#EFFF00]/5" 
                      : "border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-550 bg-black/40"
                  }`}
                  title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
                >
                  <Heart size={18} fill={isWishlisted ? "#EFFF00" : "none"} />
                </button>

                <button
                  onClick={handleShareClick}
                  className="w-14 h-14 border flex items-center justify-center transition-all cursor-pointer relative border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-550 bg-black/40"
                  title="Share product specs"
                >
                  <AnimatePresence>
                    {shareStatus && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-[#EFFF00] text-black text-[9px] font-mono font-black py-1 px-2.5 uppercase tracking-wider select-none pointer-events-none z-30"
                      >
                        [ {shareStatus} ]
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-t-[4px] border-t-[#EFFF00] border-x-[4px] border-x-transparent" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Share2 size={18} className={shareStatus ? "text-[#EFFF00]" : ""} />
                </button>
              </div>

              <button
                onClick={() => setShowQrCode(!showQrCode)}
                className="w-full h-11 border border-zinc-900 hover:border-zinc-700 bg-black text-zinc-400 hover:text-white font-mono text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 rounded-none cursor-pointer"
              >
                <QrCode size={13} className="text-[#EFFF00]" />
                {showQrCode ? "HIDE DETAILS" : "VERIFY ITEM AUTHENTICITY"}
              </button>
            </div>

            {/* Authentic Token ID QR/Verification Code area */}
            <AnimatePresence>
              {showQrCode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-black border border-zinc-900 p-4 mb-6 rounded-none relative overflow-hidden"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-white p-1 shrink-0 flex items-center justify-center">
                      <div className="w-full h-full bg-[linear-gradient(45deg,#000_25%,transparent_25%),linear-gradient(-45deg,#000_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#000_75%),linear-gradient(-45deg,transparent_75%,#000_75%)] [background-size:8px_8px] [background-position:0_0,0_4px,4px,-4px,-4px_0]" />
                    </div>
                    <div className="flex-1 font-mono text-[9px] text-zinc-500">
                      <span className="text-[#EFFF00] font-bold block uppercase mb-1">PRODUCT CODE:</span>
                      <code className="text-white select-all block break-all font-bold text-[8px] bg-zinc-950 p-1.5 border border-zinc-900 mb-1">{`CB-${product.id}-${product.sku}-${selectedColor.name.replace(" ", "-")}`}</code>
                      <span>Each garment includes an authentic secure care label. Secure tracking is provided on purchase.</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TABBED SPEC PANEL ACCORDIONS */}
            <div className="border border-zinc-900 bg-black">
              <div className="flex border-b border-zinc-900 font-mono text-[9px] tracking-wider">
                <button
                  onClick={() => setActiveTab("specifications")}
                  className={`flex-1 py-3 text-center border-r border-zinc-900 transition-colors uppercase ${
                    activeTab === "specifications" ? "bg-zinc-950 text-[#EFFF00] font-bold" : "text-zinc-550 hover:text-white"
                  }`}
                >
                  DETAILS
                </button>
                <button
                  onClick={() => setActiveTab("manufacturing")}
                  className={`flex-1 py-3 text-center border-r border-zinc-900 transition-colors uppercase ${
                    activeTab === "manufacturing" ? "bg-zinc-950 text-[#EFFF00] font-bold" : "text-zinc-550 hover:text-white"
                  }`}
                >
                  CRAFT
                </button>
                <button
                  onClick={() => setActiveTab("shipping")}
                  className={`flex-1 py-3 text-center transition-colors uppercase ${
                    activeTab === "shipping" ? "bg-zinc-950 text-[#EFFF00] font-bold" : "text-zinc-550 hover:text-white"
                  }`}
                >
                  SHIPPING
                </button>
              </div>

              <div className="p-4 min-h-[140px] flex flex-col justify-between font-mono text-[10px] text-zinc-400 leading-relaxed">
                <AnimatePresence mode="wait">
                  {activeTab === "specifications" && (
                    <motion.div
                      key="tab-specs"
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col gap-2.5"
                    >
                      {product.details.map((det, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-zinc-350">
                          <span className="text-[#EFFF00]">✦</span>
                          <span>{det}</span>
                        </div>
                      ))}
                      <div className="flex items-start gap-2 text-zinc-350">
                        <span className="text-[#EFFF00]">✦</span>
                        <span>Available in sizes {product.sizes.join(", ")}. Standard boxy fit.</span>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "manufacturing" && (
                    <motion.div
                      key="tab-manufacturing"
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col gap-2 h-full text-zinc-450"
                    >
                      <p>
                        <strong className="text-white uppercase">[ SUSTAINABLE ]</strong> Crafted in small batches in Lagos, Nigeria to reduce manufacturing waste.
                      </p>
                      <p className="mt-2 text-zinc-500 font-bold block">
                        THREADS: Double-stitched seams built for maximum comfort and long wear.
                      </p>
                    </motion.div>
                  )}

                  {activeTab === "shipping" && (
                    <motion.div
                      key="tab-shipping"
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col gap-3.5 h-full"
                    >
                      <div className="flex items-center gap-2">
                        <Truck size={12} className="text-[#EFFF00]" />
                        <span className="text-white uppercase font-bold">WORLDWIDE SHIPPING:</span>
                      </div>
                      <p>
                        Delivers inside Lagos in 24-48 hours. National and international orders ship via tracked couriers in 3-5 business days.
                      </p>
                      <div className="flex items-center gap-2 border-t border-zinc-950 pt-3 text-zinc-500">
                        <RotateCcw size={11} className="text-[#EFFF00]" />
                        <span>30-day hassle-free returns and exchanges.</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* TRUST CRITERIONS FOOTER OF THE CARD */}
            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-zinc-950 font-mono text-[9px] text-zinc-500">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={14} className="text-[#EFFF00]" />
                <div className="flex flex-col">
                  <span className="text-white font-bold uppercase">SECURE PAYMENT</span>
                  <span>SAFE & CHECKED CHECKOUT</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Sparkles size={14} className="text-[#EFFF00]" />
                <div className="flex flex-col">
                  <span className="text-white font-bold uppercase">100% UNIQUE</span>
                  <span>LIMITED QUANTITIES</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      <ReviewsSection
        product={product}
        currentUser={currentUser}
        onLoginTrigger={onLoginTrigger}
      />

      {/* DEDICATED ARCHIVE BROWSING BRIDGE */}
      <section className="mt-20 border-t border-zinc-900 pt-16">
        <div className="flex flex-col xs:flex-row justify-between items-start xs:items-end mb-8 gap-4">
          <div>
            <span className="text-[#EFFF00] font-mono text-[9px] tracking-widest block uppercase font-bold mb-1">
              [ CONTINUOUS COUTURE SERIES ]
            </span>
            <h2 className="text-2xl font-sans tracking-tight font-black uppercase text-white">
              COMPLEMENTARY SPECIALIST RUNS
            </h2>
          </div>
          
          <button
            onClick={onBack}
            className="font-mono text-[9px] tracking-widest uppercase text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            EXPLORE THE FULL VAULT ⟶
          </button>
        </div>

        {/* Small horizontal recommended products row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {finalRelated.map((p) => (
            <div 
              key={p.id}
              onClick={() => onSelectProduct(p.id)}
              className="bg-black border border-zinc-900 p-4 transition-all hover:border-white/20 flex flex-col justify-between cursor-pointer group"
            >
              <div className="w-full h-36 bg-zinc-950/40 flex items-center justify-center relative overflow-hidden mb-4">
                <div 
                  className="absolute inset-0 filter blur-2xl opacity-10 transition-opacity group-hover:opacity-20 rounded-full w-12 h-12 m-auto pointer-events-none"
                  style={{ backgroundColor: p.colors[0].hex }}
                />
                <div className={`transition-transform group-hover:scale-105 ${
                  (p.colors?.[0]?.imageUrl || p.imageUrl)
                    ? "absolute inset-0 w-full h-full"
                    : "w-24 h-24 relative z-10"
                }`}>
                  {(p.colors?.[0]?.imageUrl || p.imageUrl) ? (
                    <img 
                      src={p.colors?.[0]?.imageUrl || p.imageUrl} 
                      alt={p.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <RenderGarmentSVG id={p.id} colorHex={p.colors[0]?.hex || "#fff"} mockupType={p.mockupType} />
                  )}
                </div>
              </div>

              <div className="flex justify-between items-start gap-2">
                <div>
                  <h4 className="font-sans font-bold text-xs uppercase text-zinc-100 group-hover:text-[#EFFF00] transition-colors">{p.name}</h4>
                  <span className="font-mono text-[9px] text-zinc-500 uppercase mt-1 block">{p.category}</span>
                </div>
                <span className="font-mono text-xs font-black text-white bg-zinc-950 border border-zinc-900 px-1.5 py-0.5">₦{p.price.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

/* 
  MINI INTERNAL COPY OF RETRO SVGS RENDERER DIRECTS FROM PRODUCT CARD 
  TO PREVENT MULTIPLE FILES DEPENDENCY INACCURACIES
*/
function RenderGarmentSVG({ 
  id, 
  colorHex, 
  mockupType,
  isHovered = false 
}: { 
  id: string; 
  colorHex: string; 
  mockupType: string;
  isHovered?: boolean;
}) {
  return (
    <>
      {id === "cb-jersey-01" && (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.75)]">
          <defs>
            <pattern id="detail-camo-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="#444a30" />
              <path d="M0,5 C3,7 5,5 8,8 Q12,12 15,6 T20,10 L20,20 L0,20 Z" fill="#1c2211" opacity="0.8" />
              <path d="M5,2 Q10,0 12,4 T18,3 T15,10 Z" fill="#5c634c" opacity="0.6" />
              <path d="M2,15 Q8,18 12,14 T16,18 Z" fill="#2b311c" opacity="0.9" />
            </pattern>
          </defs>
          <path d="M 32,30 L 12,34 L 5,47 L 1,44 L 8,26 L 27,18 Z" fill="url(#detail-camo-pattern)" />
          <path d="M 68,30 L 88,34 L 95,47 L 99,44 L 92,26 L 73,18 Z" fill="url(#detail-camo-pattern)" />
          <path d="M 32,90 L 32,30 L 36,19 C 36,19 40,14 50,14 C 60,14 64,19 64,19 L 68,30 L 68,90 Z" fill={colorHex} className="transition-colors duration-300" />
          <path d="M 36,19 L 45,26 L 50,22 L 55,26 L 64,19 Z" fill="#141416" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
          <path d="M 49.5,22 L 49.5,35" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <circle cx="49.5" cy="27" r="1.2" fill="#fff" opacity="0.8" />
          <circle cx="49.5" cy="32" r="1.2" fill="#fff" opacity="0.8" />
          <text x="50" y="68" textAnchor="middle" fill="rgba(255,255,255,0.06)" fontSize="28" fontWeight="900" fontFamily="sans-serif" letterSpacing="1">00</text>
        </svg>
      )}

      {id === "cb-buttonup-02" && (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]">
          <path d="M 30,90 L 30,26 L 10,31 L 3,45 L 0,41 L 8,22 L 26,16 C 30,16 35,18 35,18 C 35,18 40,12 50,12 C 60,12 65,18 65,18 C 65,18 70,16 74,16 L 92,22 L 100,41 L 97,45 L 90,31 L 70,26 L 70,90 Z" fill={colorHex} className="transition-colors duration-300" />
          <path d="M 35,18 L 44,24 L 50,20 L 56,24 L 65,18 L 61,26 L 50,22 L 39,26 Z" fill="#18181b" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <line x1="50" y1="22" x2="50" y2="90" stroke="rgba(0,0,0,0.35)" strokeWidth="1.2" />
          <circle cx="50" cy="34" r="1.5" fill="#ca8a04" stroke="#1c1917" strokeWidth="0.5" />
          <circle cx="50" cy="48" r="1.5" fill="#ca8a04" stroke="#1c1917" strokeWidth="0.5" />
          <circle cx="50" cy="62" r="1.5" fill="#ca8a04" stroke="#1c1917" strokeWidth="0.5" />
          <circle cx="50" cy="76" r="1.5" fill="#ca8a04" stroke="#1c1917" strokeWidth="0.5" />
          <path d="M 57,36 L 65,36 L 65,48 L 61,52 L 57,48 Z" fill="rgba(0,0,0,0.15)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
          <path d="M 30,86 L 70,86" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" strokeDasharray="1.5,1.5" />
        </svg>
      )}

      {id === "cb-crop-03" && (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.65)]">
          <path d="M 28,66 L 28,26 L 6,31 L 0,44 L 4,46 L 9,33 L 26,20 C 26,20 30,21 35,21 C 35,21 40,15 50,15 C 60,15 65,21 65,21 C 65,21 70,20 74,20 L 91,33 L 96,44 L 100,41 L 94,31 L 72,26 L 72,66 Z" fill={colorHex} className="transition-colors duration-300" />
          <path d="M 35,21 C 35,28 65,28 65,21" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="3" />
          <path d="M 35,21 C 35,28 65,28 65,21" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <line x1="28" y1="66" x2="72" y2="66" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" />
          <line x1="28" y1="67.5" x2="72" y2="67.5" stroke="rgba(0,0,0,0.5)" strokeWidth="0.5" strokeDasharray="2,2" />
        </svg>
      )}

      {id === "cb-sweatshirt-04" && (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_10px_24px_rgba(0,0,0,0.8)]">
          <path d="M 28,86 L 24,34 L 12,38 L 4,48 L 1,60 L 8,64 L 14,54 L 23,40 L 24,33 C 24,33 28,34 32,34 C 32,34 37,21 50,21 C 63,21 68,34 68,34 C 68,34 72,33 76,33 L 77,40 L 86,54 L 92,64 L 99,60 L 96,48 L 88,38 L 76,34 L 72,86 Z" fill={colorHex} className="transition-colors duration-300" />
          <path d="M 32,34 C 35,41 65,41 68,34" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="3" />
          <path d="M 32,34 C 35,41 65,41 68,34" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <path d="M 25,52 L 28,85 L 31,85 L 29,52 Z" fill="rgba(0,0,0,0.12)" />
          <path d="M 75,52 L 72,85 L 69,85 L 71,52 Z" fill="rgba(0,0,0,0.12)" />
          <rect x="27.5" y="85" width="45" height="5" fill="rgba(0,0,0,0.25)" />
          <rect x="3" y="60.5" width="6" height="3.5" transform="rotate([-24 3 60.5])" fill="rgba(0,0,0,0.25)" />
          <rect x="91" y="60.5" width="6" height="3.5" transform="rotate([24 91 60.5])" fill="rgba(0,0,0,0.25)" />
          <rect x="37" y="44" width="26" height="24" rx="0.5" fill="rgba(0,0,0,0.2)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <line x1="40" y1="56" x2="60" y2="56" stroke="rgba(255,255,255,0.15)" strokeWidth="0.6" />
          <line x1="40" y1="59" x2="60" y2="59" stroke="rgba(255,255,255,0.15)" strokeWidth="0.6" />
          <line x1="40" y1="62" x2="52" y2="62" stroke="rgba(255,255,255,0.15)" strokeWidth="0.6" />
          <text x="50" y="52" textAnchor="middle" fill="#EFFF00" fontSize="3.5" fontWeight="900" fontFamily="monospace" letterSpacing="0.2">K.GIBRAN</text>
        </svg>
      )}

      {id === "cb-trucker-05" && (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]">
          <defs>
            <pattern id="detail-mesh" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.75" fill="rgba(0,0,0,0.3)" />
              <circle cx="2" cy="2" r="0.4" fill="rgba(255,255,255,0.06)" />
            </pattern>
          </defs>
          <path d="M 25,65 C 25,35 38,25 50,25 C 62,25 75,35 75,65 Z" fill="url(#detail-mesh)" />
          <path d="M 25,65 C 25,35 38,25 50,25 C 62,25 75,35 75,65 Z" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="1.2" />
          <path d="M 33,65 C 33,35 40,27 50,27 C 60,27 67,35 67,65 Z" fill={colorHex} className="transition-colors duration-300" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
          <path d="M 18,63 C 28,63 72,63 82,71 C 77,77 40,78 18,63 Z" fill={colorHex} opacity="0.95" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" />
          <path d="M 22,65 C 30,65 70,65 78,71" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.7" strokeDasharray="2,1" />
          <path d="M 24,67 C 32,67 68,67 76,72" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="0.7" strokeDasharray="2,1" />
          <ellipse cx="50" cy="25" rx="4.2" ry="1.6" fill="#121214" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        </svg>
      )}

      {!["cb-jersey-01", "cb-buttonup-02", "cb-crop-03", "cb-sweatshirt-04", "cb-trucker-05"].includes(id) && (
        <>
          {mockupType === "hoodie" && (
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
              <path d="M 30,90 L 25,38 L 15,44 L 5,53 L 2,49 L 10,40 L 24,19 L 36,20 L 36,10 L 50,7 L 64,10 L 64,20 L 76,19 L 90,40 L 98,49 L 95,53 L 85,44 L 75,38 L 70,90 Z" fill={colorHex} className="transition-colors duration-300" />
              <path d="M 36,20 C 38,27 62,27 64,20" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
              <rect x="29" y="86" width="42" height="4" fill="rgba(0,0,0,0.2)" />
            </svg>
          )}

          {mockupType === "puffer" && (
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
              <path d="M 28,90 L 25,28 L 12,32 L 4,43 L 1,58 L 8,62 L 15,53 L 25,43 L 25,28 L 36,20 C 36,20 40,12 50,12 C 60,12 64,20 64,20 L 75,28 L 75,43 L 85,53 L 92,62 L 99,58 L 96,43 L 88,32 L 75,28 L 72,90 Z" fill={colorHex} className="transition-colors duration-300" />
              <line x1="26" y1="42" x2="74" y2="42" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
              <line x1="26" y1="56" x2="74" y2="56" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
              <line x1="27" y1="70" x2="73" y2="70" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
              <line x1="50" y1="20" x2="50" y2="90" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
            </svg>
          )}

          {mockupType === "tee" && (
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
              <path d="M 32,90 L 32,30 L 12,34 L 5,47 L 1,44 L 8,26 L 27,18 L 36,19 C 36,19 40,14 50,14 C 60,14 64,19 64,19 L 73,18 L 92,26 L 99,44 L 95,47 L 88,34 L 88,30 L 68,90 Z" fill={colorHex} className="transition-colors duration-300" />
              <path d="M 36,19 C 36,24 64,24 64,19" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
            </svg>
          )}

          {mockupType === "cap" && (
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
              <path d="M 25,65 C 25,35 38,25 50,25 C 62,25 75,35 75,65 Z" fill={colorHex} className="transition-colors duration-300" />
              <path d="M 22,62 C 32,62 68,62 82,71 L 77,76 L 38,76 L 22,62 Z" fill={colorHex} opacity="0.9" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
              <ellipse cx="50" cy="25" rx="4" ry="1.5" fill="rgba(0,0,0,0.3)" />
            </svg>
          )}
        </>
      )}
    </>
  );
}
