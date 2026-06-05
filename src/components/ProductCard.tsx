import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, Eye, Plus, Check, Heart } from "lucide-react";
import { Product, CartItem, ApparelColor } from "../types";
import GlowCrown from "./GlowCrown";

interface ProductCardProps {
  key?: string;
  product: Product;
  onAddToCart: (item: CartItem) => void;
  onSelect?: (productId: string) => void;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
}

export default function ProductCard({ product, onAddToCart, onSelect, isWishlisted, onToggleWishlist }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<string>((product.sizes && product.sizes[0]) || "L");
  const [selectedColor, setSelectedColor] = useState<ApparelColor>((product.colors && product.colors[0]) || { name: "Bleach White", hex: "#FFFFFF", bgHex: "#1a1a1c" });
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [added, setAdded] = useState<boolean>(false);
  const [adding, setAdding] = useState<boolean>(false);
  const [detailedPanel, setDetailedPanel] = useState<boolean>(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleQuickBuyDefault = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (adding || added) return;
    setAdding(true);
    
    const defaultSize = product.sizes[0] || "L";
    const defaultColor = product.colors[0];
    
    const cartItem: CartItem = {
      id: `std-${product.id}-${defaultColor.name}-${defaultSize}`,
      product,
      selectedColor: defaultColor,
      selectedSize: defaultSize,
      quantity: 1,
    };

    setTimeout(() => {
      onAddToCart(cartItem);
      setAdding(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }, 600);
  };

  const handleShowDetails = (e: React.MouseEvent) => {
    if (onSelect) {
      e.stopPropagation();
      onSelect(product.id);
    } else {
      setDetailedPanel(!detailedPanel);
    }
  };

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.015, y: -2 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group bg-[#050505] border border-zinc-900 overflow-hidden flex flex-col justify-between relative transition-all duration-300 hover:border-[#EFFF00]/40"
    >
      {/* Top Header Grid info */}
      <div className="flex justify-between items-center px-4 py-2 bg-black/40 border-b border-zinc-900 text-[10px] font-mono text-zinc-500">
        <span>{product.sku}</span>
        <span className="text-[#EFFF00] font-bold">{product.category.toUpperCase()}</span>
      </div>

      {/* Main product showcase box with responsive heights */}
      <div 
        onClick={handleShowDetails}
        className="relative h-[200px] sm:h-[280px] w-full flex items-center justify-center cursor-pointer bg-gradient-to-b from-black/20 to-zinc-950/40 p-4 sm:p-6 overflow-hidden"
      >
        {/* Floating Low Stock Badge */}
        {product.stock !== undefined && product.stock <= 5 && (
          <div className="absolute top-3 left-3 z-20 bg-black/80 border border-red-550/60 text-[#ff4b4b] font-mono text-[8.5px] font-black px-2 py-1 uppercase tracking-widest flex items-center gap-1.5 select-none shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff4b4b] animate-pulse" />
            LOW STOCK ({product.stock})
          </div>
        )}

        {/* Floating Wishlist Heart Tag */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist();
          }}
          className={`absolute top-3 right-3 z-20 w-8 h-8 rounded-none border flex items-center justify-center transition-all cursor-pointer ${
            isWishlisted 
              ? "bg-[#EFFF00] border-[#EFFF00] text-black" 
              : "bg-black/60 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700"
          }`}
          title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
        >
          <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        {/* Real-time ambient background glow matching selected product color */}
        <div 
          className="absolute inset-0 filter blur-3xl opacity-20 group-hover:opacity-45 transition-all duration-500 rounded-full w-24 h-24 sm:w-36 sm:h-36 m-auto pointer-events-none"
          style={{ backgroundColor: selectedColor.hex }}
        />

        {/* Subtle decorative target grid on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[radial-gradient(#EFFF00_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Dynamic Vector schematic of the item with responsive sizes or full-bleed magnified product image */}
        <div className={`transition-transform duration-500 group-hover:scale-105 flex items-center justify-center ${
          (selectedColor.imageUrl || product.imageUrl) 
            ? "absolute inset-0 w-full h-full" 
            : "relative w-32 h-32 sm:w-44 sm:h-44"
        }`}>
          {(selectedColor.imageUrl || product.imageUrl) ? (
            <img
              src={selectedColor.imageUrl || product.imageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              {/* Product ID Specific Premium Mockups */}
              {product.id === "cb-jersey-01" && (
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.75)]">
                  <defs>
                    <pattern id="camo-pattern-polo" width="20" height="20" patternUnits="userSpaceOnUse">
                      <rect width="20" height="20" fill="#444a30" />
                      <path d="M0,5 C3,7 5,5 8,8 Q12,12 15,6 T20,10 L20,20 L0,20 Z" fill="#1c2211" opacity="0.8" />
                      <path d="M5,2 Q10,0 12,4 T18,3 T15,10 Z" fill="#5c634c" opacity="0.6" />
                      <path d="M2,15 Q8,18 12,14 T16,18 Z" fill="#2b311c" opacity="0.9" />
                    </pattern>
                  </defs>
                  
                  {/* Camo sleeves */}
                  <path
                    d="M 32,30 L 12,34 L 5,47 L 1,44 L 8,26 L 27,18 Z"
                    fill="url(#camo-pattern-polo)"
                  />
                  <path
                    d="M 68,30 L 88,34 L 95,47 L 99,44 L 92,26 L 73,18 Z"
                    fill="url(#camo-pattern-polo)"
                  />
                  
                  {/* Polo Core Body */}
                  <path
                    d="M 32,90 L 32,30 L 36,19 C 36,19 40,14 50,14 C 60,14 64,19 64,19 L 68,30 L 68,90 Z"
                    fill={selectedColor.hex}
                    className="transition-colors duration-300"
                  />
                  
                  {/* Ribbed knit polo collar wings */}
                  <path d="M 36,19 L 45,26 L 50,22 L 55,26 L 64,19 Z" fill="#141416" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                  <path d="M 49.5,22 L 49.5,35" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <circle cx="49.5" cy="27" r="1.2" fill="#fff" opacity="0.8" />
                  <circle cx="49.5" cy="32" r="1.2" fill="#fff" opacity="0.8" />
                  
                  {/* Faint bold camo sports graphic print */}
                  <text x="50" y="68" textAnchor="middle" fill="rgba(255,255,255,0.06)" fontSize="28" fontWeight="900" fontFamily="sans-serif" letterSpacing="1">00</text>
                </svg>
              )}

              {product.id === "cb-buttonup-02" && (
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]">
                  {/* Boxy Short-sleeve core shirt outline */}
                  <path
                    d="M 30,90 L 30,26 L 10,31 L 3,45 L 0,41 L 8,22 L 26,16 C 30,16 35,18 35,18 C 35,18 40,12 50,12 C 60,12 65,18 65,18 C 65,18 70,16 74,16 L 92,22 L 100,41 L 97,45 L 90,31 L 70,26 L 70,90 Z"
                    fill={selectedColor.hex}
                    className="transition-colors duration-300"
                  />
                  
                  {/* Dynamic Notched flat Collar fold */}
                  <path d="M 35,18 L 44,24 L 50,20 L 56,24 L 65,18 L 61,26 L 50,22 L 39,26 Z" fill="#18181b" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
                  
                  {/* Front vertical placket seam line */}
                  <line x1="50" y1="22" x2="50" y2="90" stroke="rgba(0,0,0,0.35)" strokeWidth="1.2" />
                  
                  {/* Miniature Seed Buttons */}
                  <circle cx="50" cy="34" r="1.5" fill="#ca8a04" stroke="#1c1917" strokeWidth="0.5" />
                  <circle cx="50" cy="48" r="1.5" fill="#ca8a04" stroke="#1c1917" strokeWidth="0.5" />
                  <circle cx="50" cy="62" r="1.5" fill="#ca8a04" stroke="#1c1917" strokeWidth="0.5" />
                  <circle cx="50" cy="76" r="1.5" fill="#ca8a04" stroke="#1c1917" strokeWidth="0.5" />
                  
                  {/* Left breast pocket (visually right) */}
                  <path d="M 57,36 L 65,36 L 65,48 L 61,52 L 57,48 Z" fill="rgba(0,0,0,0.15)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                  
                  {/* Seamless hem line */}
                  <path d="M 30,86 L 70,86" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" strokeDasharray="1.5,1.5" />
                </svg>
              )}

              {product.id === "cb-crop-03" && (
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.65)]">
                  {/* High-box crop body & short sleeves */}
                  <path
                    d="M 28,66 L 28,26 L 6,31 L 0,44 L 4,46 L 9,33 L 26,20 C 26,20 30,21 35,21 C 35,21 40,15 50,15 C 60,15 65,21 65,21 C 65,21 70,20 74,20 L 91,33 L 96,44 L 100,41 L 94,31 L 72,26 L 72,66 Z"
                    fill={selectedColor.hex}
                    className="transition-colors duration-300"
                  />
                  {/* Thick retro crewneck collar band */}
                  <path d="M 35,21 C 35,28 65,28 65,21" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="3" />
                  <path d="M 35,21 C 35,28 65,28 65,21" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                  {/* Shredded raw edge crop line */}
                  <line x1="28" y1="66" x2="72" y2="66" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" />
                  <line x1="28" y1="67.5" x2="72" y2="67.5" stroke="rgba(0,0,0,0.5)" strokeWidth="0.5" strokeDasharray="2,2" />
                </svg>
              )}

              {product.id === "cb-sweatshirt-04" && (
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_10px_24px_rgba(0,0,0,0.8)]">
                  {/* Massive Crewneck Fleece body */}
                  <path
                    d="M 28,86 L 24,34 L 12,38 L 4,48 L 1,60 L 8,64 L 14,54 L 23,40 L 24,33 C 24,33 28,34 32,34 C 32,34 37,21 50,21 C 63,21 68,34 68,34 C 68,34 72,33 76,33 L 77,40 L 86,54 L 92,64 L 99,60 L 96,48 L 88,38 L 76,34 L 72,86 Z"
                    fill={selectedColor.hex}
                    className="transition-colors duration-300"
                  />
                  
                  {/* Crew neck opening */}
                  <path d="M 32,34 C 35,41 65,41 68,34" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="3" />
                  <path d="M 32,34 C 35,41 65,41 68,34" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  
                  {/* Ribbed side extenders */}
                  <path d="M 25,52 L 28,85 L 31,85 L 29,52 Z" fill="rgba(0,0,0,0.12)" />
                  <path d="M 75,52 L 72,85 L 69,85 L 71,52 Z" fill="rgba(0,0,0,0.12)" />
                  
                  {/* Heavy Waistband & cuffed ankles */}
                  <rect x="27.5" y="85" width="45" height="5" fill="rgba(0,0,0,0.25)" />
                  <rect x="3" y="60.5" width="6" height="3.5" transform="rotate([-24 3 60.5])" fill="rgba(0,0,0,0.25)" />
                  <rect x="91" y="60.5" width="6" height="3.5" transform="rotate([24 91 60.5])" fill="rgba(0,0,0,0.25)" />
                  
                  {/* Poetic literary text frame block */}
                  <rect x="37" y="44" width="26" height="24" rx="0.5" fill="rgba(0,0,0,0.2)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                  <line x1="40" y1="56" x2="60" y2="56" stroke="rgba(255,255,255,0.15)" strokeWidth="0.6" />
                  <line x1="40" y1="59" x2="60" y2="59" stroke="rgba(255,255,255,0.15)" strokeWidth="0.6" />
                  <line x1="40" y1="62" x2="52" y2="62" stroke="rgba(255,255,255,0.15)" strokeWidth="0.6" />
                  <text x="50" y="52" textAnchor="middle" fill="#EFFF00" fontSize="3.5" fontWeight="900" fontFamily="monospace" letterSpacing="0.2">K.GIBRAN</text>
                </svg>
              )}

              {product.id === "cb-trucker-05" && (
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]">
                  <defs>
                    <pattern id="mesh-pattern-trucker" width="4" height="4" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="0.75" fill="rgba(0,0,0,0.3)" />
                      <circle cx="2" cy="2" r="0.4" fill="rgba(255,255,255,0.06)" />
                    </pattern>
                  </defs>

                  {/* Mesh back */}
                  <path
                    d="M 25,65 C 25,35 38,25 50,25 C 62,25 75,35 75,65 Z"
                    fill="url(#mesh-pattern-trucker)"
                  />
                  <path
                    d="M 25,65 C 25,35 38,25 50,25 C 62,25 75,35 75,65 Z"
                    fill="none"
                    stroke="rgba(0,0,0,0.35)"
                    strokeWidth="1.2"
                  />

                  {/* Foam crown front panel */}
                  <path
                    d="M 33,65 C 33,35 40,27 50,27 C 60,27 67,35 67,65 Z"
                    fill={selectedColor.hex}
                    className="transition-colors duration-300"
                    stroke="rgba(0,0,0,0.2)"
                    strokeWidth="0.5"
                  />
                  
                  {/* Visor curved bill with triple raw stitching */}
                  <path
                    d="M 18,63 C 28,63 72,63 82,71 C 77,77 40,78 18,63 Z"
                    fill={selectedColor.hex}
                    opacity="0.95"
                    stroke="rgba(0,0,0,0.4)"
                    strokeWidth="1.5"
                  />
                  <path d="M 22,65 C 30,65 70,65 78,71" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.7" strokeDasharray="2,1" />
                  <path d="M 24,67 C 32,67 68,67 76,72" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="0.7" strokeDasharray="2,1" />

                  {/* Top center button */}
                  <ellipse cx="50" cy="25" rx="4.2" ry="1.6" fill="#121214" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
                </svg>
              )}

              {/* Dynamic / Fallback structures for newly added custom admin products */}
              {!["cb-jersey-01", "cb-buttonup-02", "cb-crop-03", "cb-sweatshirt-04", "cb-trucker-05"].includes(product.id) && (
                <>
                  {product.mockupType === "hoodie" && (
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
                      <path
                        d="M 30,90 L 25,38 L 15,44 L 5,53 L 2,49 L 10,40 L 24,19 L 36,20 L 36,10 L 50,7 L 64,10 L 64,20 L 76,19 L 90,40 L 98,49 L 95,53 L 85,44 L 75,38 L 70,90 Z"
                        fill={selectedColor.hex}
                        className="transition-colors duration-300"
                      />
                      <path d="M 36,20 C 38,27 62,27 64,20" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
                      <rect x="29" y="86" width="42" height="4" fill="rgba(0,0,0,0.2)" />
                    </svg>
                  )}

                  {product.mockupType === "puffer" && (
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
                      <path
                        d="M 28,90 L 25,28 L 12,32 L 4,43 L 1,58 L 8,62 L 15,53 L 25,43 L 25,28 L 36,20 C 36,20 40,12 50,12 C 60,12 64,20 64,20 L 75,28 L 75,43 L 85,53 L 92,62 L 99,58 L 96,43 L 88,32 L 75,28 L 72,90 Z"
                        fill={selectedColor.hex}
                        className="transition-colors duration-300"
                      />
                      <line x1="26" y1="42" x2="74" y2="42" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
                      <line x1="26" y1="56" x2="74" y2="56" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
                      <line x1="27" y1="70" x2="73" y2="70" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
                      <line x1="50" y1="20" x2="50" y2="90" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
                    </svg>
                  )}

                  {product.mockupType === "tee" && (
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
                      <path
                        d="M 32,90 L 32,30 L 12,34 L 5,47 L 1,44 L 8,26 L 27,18 L 36,19 C 36,19 40,14 50,14 C 60,14 64,19 64,19 L 73,18 L 92,26 L 99,44 L 95,47 L 88,34 L 88,30 L 68,90 Z"
                        fill={selectedColor.hex}
                        className="transition-colors duration-300"
                      />
                      <path d="M 36,19 C 36,24 64,24 64,19" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
                    </svg>
                  )}

                  {product.mockupType === "cap" && (
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
                      <path
                        d="M 25,65 C 25,35 38,25 50,25 C 62,25 75,35 75,65 Z"
                        fill={selectedColor.hex}
                        className="transition-colors duration-300"
                      />
                      <path
                        d="M 22,62 C 32,62 68,62 82,71 C 77,76 38,76 22,62 Z"
                        fill={selectedColor.hex}
                        opacity="0.9"
                        stroke="rgba(0,0,0,0.2)"
                        strokeWidth="1"
                      />
                      <ellipse cx="50" cy="25" rx="4" ry="1.5" fill="rgba(0,0,0,0.3)" />
                    </svg>
                  )}
                </>
              )}
            </>
          )}

          {/* Micro embroidery branding icon over vector garment / product picture (Precisely positioned per garment ID) */}
          {!(selectedColor.imageUrl || product.imageUrl) && (
            <div
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 group-hover:scale-110 ${
                isHovered ? "opacity-100" : "opacity-80"
              }`}
              style={{
                width: product.id === "cb-trucker-05" ? "24px" : "38px",
                height: product.id === "cb-trucker-05" ? "14px" : "22px",
                transform: `translate(
                  calc(-50% + ${
                    product.id === "cb-buttonup-02" ? "11px" : "0px"
                  }), 
                  calc(-50% + ${
                    product.id === "cb-jersey-01" ? "-4px" :
                    product.id === "cb-buttonup-02" ? "-6px" :
                    product.id === "cb-sweatshirt-04" ? "-15px" :
                    product.id === "cb-trucker-05" ? "-10px" : "-2px"
                  })
                )`
              }}
            >
              <GlowCrown
                size={"100%"}
                color={selectedColor.name === "Bleach White" ? "#000000" : "#EFFF00"}
                glow={isHovered}
              />
            </div>
          )}
        </div>

        {/* Hover quick details slide */}
        <div className="absolute inset-x-0 bottom-0 bg-black/90 backdrop-blur-md p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 border-t border-zinc-900 flex gap-2 items-center">
          <button
            onClick={handleQuickBuyDefault}
            disabled={adding || added}
            className="flex-1 bg-[#EFFF00] hover:bg-white disabled:bg-[#EFFF00]/50 disabled:text-black/50 text-black font-mono font-black text-[9px] tracking-wider py-2 uppercase transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
          >
            {adding ? (
              <>
                <div className="w-3 h-3 border border-black border-t-transparent rounded-full animate-spin" />
                LOADING...
              </>
            ) : added ? (
              "ADDED!"
            ) : (
              "QUICK BUY"
            )}
          </button>
          <button
            onClick={handleShowDetails}
            className="flex-1 bg-zinc-950 border border-zinc-800 hover:border-zinc-500 text-white font-mono text-[9px] tracking-wider py-2 uppercase transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
          >
            <Eye size={10} />
            DETAILS
          </button>
        </div>
      </div>

      {/* Info Blocks and purchase commands */}
      <div className="p-4 border-t border-zinc-900 bg-black/60">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:justify-between sm:items-start sm:gap-2">
          <h3 
            onClick={handleShowDetails}
            className="font-sans font-extrabold text-xs sm:text-sm text-white tracking-tight uppercase group-hover:text-[#EFFF00] transition-colors cursor-pointer line-clamp-2 min-h-[2rem] sm:min-h-0"
          >
            {product.name}
          </h3>
          <span className="font-mono text-[10px] sm:text-xs font-black text-[#EFFF00] sm:text-white bg-[#1a1a08] border border-[#EFFF00]/15 px-1.5 py-0.5 whitespace-nowrap self-start">
            ₦{product.price.toLocaleString()}
          </span>
        </div>

        <p className="text-zinc-550 text-[11px] font-sans mt-1.5 line-clamp-2 h-8 leading-tight">
          {product.description}
        </p>

        {/* Interfacing panel toggling colors and sizes */}
        <div className="mt-4 flex flex-col gap-3 pt-3 border-t border-zinc-950">
          
          {/* Colors row */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <span className="text-[9px] font-mono text-zinc-500 uppercase">COLOR</span>
            <div className="flex gap-1.5 flex-wrap">
              {product.colors.map((color) => {
                const isCSelected = selectedColor.name === color.name;
                return (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`w-3.5 h-3.5 border transition-all ${
                      isCSelected ? "border-[#EFFF00] scale-125" : "border-zinc-800 hover:border-zinc-500"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                );
              })}
            </div>
          </div>

          {/* Sizing choosing row */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-between sm:items-center">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-1.5">
              <span className="text-[9px] font-mono text-zinc-500 uppercase">SIZE</span>
              <div className="flex gap-1 flex-wrap">
                {product.sizes.map((sz) => {
                  const isSSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-1.5 py-0.5 font-mono text-[9px] border transition-all ${
                        isSSelected
                          ? "bg-white text-black border-white font-bold"
                          : "border-zinc-900 text-zinc-500 hover:border-zinc-500"
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick-add button */}
            <button
              onClick={handleQuickAdd}
              disabled={adding || added}
              className={`flex items-center justify-center gap-1.5 h-8 rounded-none transition-all font-mono text-[9px] tracking-widest ${
                added
                  ? "bg-[#EFFF00] text-black w-full sm:w-8"
                  : "bg-zinc-900 border border-zinc-800 text-white hover:border-[#EFFF00] hover:text-[#EFFF00] w-full sm:w-8"
              }`}
              title="Add to Bag"
            >
              <span className="inline sm:hidden font-bold uppercase transition-all">
                {adding ? "ADDING..." : added ? "ADDED" : "ADD TO BAG"}
              </span>
              {adding ? (
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              ) : added ? (
                <Check size={12} className="animate-bounce" />
              ) : (
                <Plus size={12} />
              )}
            </button>
          </div>

          {/* Quick Buy Button Strip */}
          <button
            onClick={handleQuickBuyDefault}
            disabled={adding || added}
            className={`w-full font-mono text-[9px] font-bold tracking-[0.15em] uppercase transition-all py-2.5 border flex items-center justify-center gap-1.5 hover:scale-[1.01] cursor-pointer ${
              added
                ? "bg-[#EFFF00] text-black border-[#EFFF00]"
                : "bg-black hover:bg-[#EFFF00] hover:text-black border-zinc-900 hover:border-[#EFFF00] text-zinc-400"
            }`}
          >
            {adding ? (
              <>
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                SECURING APPAREL...
              </>
            ) : added ? (
              <>
                <Check size={11} className="animate-bounce" />
                SECURED TO BAG
              </>
            ) : (
              <>
                <ShoppingBag size={11} />
                QUICK BUY ({product.sizes[0] || "L"})
              </>
            )}
          </button>

        </div>
      </div>

      {/* Expanded detailed parameters overlay panel */}
      <AnimatePresence>
        {detailedPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/98 z-10 p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-900">
                <span className="font-mono text-[#EFFF00] text-[10px] tracking-widest">PRODUCT DETAILS</span>
                <button
                  onClick={() => setDetailedPanel(false)}
                  className="text-zinc-500 hover:text-white font-mono text-[9px] tracking-widest cursor-pointer"
                >
                  CLOSE
                </button>
              </div>

              <h4 className="text-sm font-sans font-black text-white mb-2">{product.name} Details</h4>
              <ul className="flex flex-col gap-2">
                {product.details.map((det, i) => (
                  <li key={i} className="font-mono text-[10px] text-zinc-450 flex items-start gap-2 line-clamp-1">
                    <span className="text-[#EFFF00] font-black">❯</span>
                    {det}
                  </li>
                ))}
              </ul>

              <div className="mt-6 bg-zinc-950 p-3 border border-zinc-900 mt-4 rounded-none">
                <span className="text-zinc-500 font-mono text-[9px] uppercase block mb-1">SKU IDENTIFIER</span>
                <code className="text-[#EFFF00] font-mono text-[10px]">{product.sku}</code>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
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
                  setDetailedPanel(false);
                  setTimeout(() => setAdded(false), 2000);
                }, 600);
              }}
              disabled={adding || added}
              className="w-full bg-white hover:bg-[#EFFF00] disabled:bg-zinc-800 text-black disabled:text-zinc-550 font-mono font-bold text-xs py-2 transition-colors uppercase cursor-pointer flex items-center justify-center gap-2"
            >
              {adding ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ADDING TO BAG...
                </>
              ) : added ? (
                "ADDED!"
              ) : (
                `ADD TO BAG — ₦${product.price.toLocaleString()}`
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-[#050505] border border-zinc-900 overflow-hidden flex flex-col justify-between relative animate-pulse select-none">
      {/* Top Header Grid info */}
      <div className="flex justify-between items-center px-4 py-2 bg-black/40 border-b border-zinc-900">
        <div className="h-3 w-14 bg-zinc-900 rounded" />
        <div className="h-3 w-16 bg-zinc-900 rounded" />
      </div>

      {/* Main product showcase box */}
      <div className="relative h-[200px] sm:h-[280px] w-full flex items-center justify-center bg-gradient-to-b from-black/20 to-zinc-950/40 p-4 sm:p-6 overflow-hidden">
        {/* Wishlist item placeholder */}
        <div className="absolute top-3 right-3 w-8 h-8 bg-black/65 border border-zinc-900" />
        
        {/* Central Vector mock placeholder */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 bg-zinc-950/70 border border-zinc-900/50 flex flex-col items-center justify-center p-3">
          {/* Tech layout aesthetics inside */}
          <div className="w-full h-full border border-dashed border-zinc-800/40 relative flex items-center justify-center">
            {/* Corner dots */}
            <span className="absolute top-1 left-1 w-1 h-1 bg-zinc-800/60" />
            <span className="absolute top-1 right-1 w-1 h-1 bg-zinc-800/60" />
            <span className="absolute bottom-1 left-1 w-1 h-1 bg-zinc-800/60" />
            <span className="absolute bottom-1 right-1 w-1 h-1 bg-zinc-800/60" />
            
            {/* Abstract apparel graphic skeleton inside */}
            <div className="w-12 h-16 bg-zinc-900/65 opacity-60 border border-zinc-800/70" />
          </div>
        </div>
      </div>

      {/* Info Blocks and purchase commands */}
      <div className="p-4 border-t border-zinc-900 bg-black/60">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start sm:gap-2">
          {/* Product name skeleton */}
          <div className="h-4 bg-zinc-900 rounded w-2/3 my-1" />
          {/* Price skeleton */}
          <div className="h-5 bg-zinc-900 rounded w-14" />
        </div>

        {/* Description lines */}
        <div className="space-y-2 mt-3">
          <div className="h-2.5 bg-zinc-900 rounded w-full" />
          <div className="h-2.5 bg-zinc-900 rounded w-4/5" />
        </div>

        {/* Interfacing panel toggling colors and sizes */}
        <div className="mt-4 flex flex-col gap-3.5 pt-3.5 border-t border-zinc-950">
          {/* Colors row */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <div className="h-2.5 bg-zinc-900 w-10 rounded" />
            <div className="flex gap-1.5">
              <div className="w-3.5 h-3.5 bg-zinc-900" />
              <div className="w-3.5 h-3.5 bg-zinc-900" />
              <div className="w-3.5 h-3.5 bg-zinc-900" />
            </div>
          </div>

          {/* Sizing choosing row */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-between sm:items-center">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-1.5">
              <div className="h-2.5 bg-zinc-900 w-8 rounded" />
              <div className="flex gap-1">
                <div className="w-6 h-4 bg-zinc-900" />
                <div className="w-6 h-4 bg-zinc-900" />
                <div className="w-6 h-4 bg-zinc-900" />
              </div>
            </div>

            {/* Quick-add button placeholder */}
            <div className="h-8 bg-zinc-900 w-full sm:w-8" />
          </div>

          {/* Quick Buy Button Strip placeholder */}
          <div className="w-full h-9 bg-zinc-900" />
        </div>
      </div>
    </div>
  );
}

