import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, Eye, Plus, Check } from "lucide-react";
import { Product, CartItem, ApparelColor } from "../types";
import GlowCrown from "./GlowCrown";

interface ProductCardProps {
  key?: string;
  product: Product;
  onAddToCart: (item: CartItem) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || "L");
  const [selectedColor, setSelectedColor] = useState<ApparelColor>(product.colors[0]);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [added, setAdded] = useState<boolean>(false);
  const [detailedPanel, setDetailedPanel] = useState<boolean>(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const cartItem: CartItem = {
      id: `std-${product.id}-${selectedColor.name}-${selectedSize}`,
      product,
      selectedColor,
      selectedSize,
      quantity: 1,
    };

    onAddToCart(cartItem);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-[#050505] border border-zinc-900 overflow-hidden flex flex-col justify-between relative transition-all duration-300 hover:border-[#EFFF00]/40"
    >
      {/* Top Header Grid info */}
      <div className="flex justify-between items-center px-4 py-2 bg-black/40 border-b border-zinc-900 text-[10px] font-mono text-zinc-500">
        <span>{product.sku}</span>
        <span className="text-[#EFFF00] font-bold">{product.category.toUpperCase()}</span>
      </div>

      {/* Main product showcase box */}
      <div 
        onClick={() => setDetailedPanel(!detailedPanel)}
        className="relative h-[280px] w-full flex items-center justify-center cursor-pointer bg-gradient-to-b from-black/20 to-zinc-950/40 p-6 overflow-hidden"
      >
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

        {/* Dynamic Vector schematic of the item */}
        <div className="relative w-44 h-44 transition-transform duration-500 group-hover:scale-105 flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] rounded-none"
            />
          ) : (
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

          {/* Micro embroidery branding icon over vector garment / product picture */}
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-75 pointer-events-none transition-transform duration-300 group-hover:scale-110"
            style={{
              width: product.mockupType === "cap" ? "20px" : "38px",
              height: product.mockupType === "cap" ? "10px" : "19px"
            }}
          >
            {!product.imageUrl && (
              <GlowCrown
                size={"100%"}
                color={selectedColor.isYellowTint ? "#000000" : "#EFFF00"}
                glow={isHovered}
              />
            )}
          </div>
        </div>

        {/* Hover quick details slide */}
        <div className="absolute inset-x-0 bottom-0 bg-black/85 backdrop-blur-sm p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 border-t border-zinc-900 flex justify-between items-center">
          <span className="font-mono text-[9px] text-[#EFFF00]">
            VIEW DETAILED SPECIFICATIONS
          </span>
          <div className="flex items-center gap-1.5 font-mono text-[9px] text-zinc-400">
            <Eye size={11} />
            SPECIFICATIONS
          </div>
        </div>
      </div>

      {/* Info Blocks and purchase commands */}
      <div className="p-4 border-t border-zinc-900 bg-black/60">
        <div className="flex justify-between items-start gap-1">
          <h3 className="font-sans font-extrabold text-sm text-white tracking-tight uppercase group-hover:text-[#EFFF00] transition-colors">
            {product.name}
          </h3>
          <span className="font-mono text-xs font-black text-white bg-[#1a1a08] border border-[#EFFF00]/15 px-1.5 py-0.5">
            ${product.price}
          </span>
        </div>

        <p className="text-zinc-500 text-[11px] font-sans mt-1.5 line-clamp-2 h-8 leading-tight">
          {product.description}
        </p>

        {/* Interfacing panel toggling colors and sizes */}
        <div className="mt-4 flex flex-col gap-3 pt-3 border-t border-zinc-950">
          
          {/* Colors row */}
          <div className="flex gap-2 items-center">
            <span className="text-[9px] font-mono text-zinc-600 uppercase">COLOR BASE</span>
            <div className="flex gap-1.5">
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
          <div className="flex justify-between items-center">
            <div className="flex gap-1 items-center">
              <span className="text-[9px] font-mono text-zinc-600 uppercase">SIZE SELECTION</span>
              <div className="flex gap-1">
                {product.sizes.map((sz) => {
                  const isSSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-1.5 py-0.5 font-mono text-[9px] border ${
                        isSSelected
                          ? "bg-white text-black border-white font-bold"
                          : "border-zinc-900 text-zinc-500 hover:border-zinc-650"
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
              disabled={added}
              className={`flex items-center justify-center w-8 h-8 rounded-none transition-all ${
                added
                  ? "bg-[#EFFF00] text-black"
                  : "bg-zinc-900 border border-zinc-800 text-white hover:border-[#EFFF00] hover:text-[#EFFF00]"
              }`}
              title="Add to Vault Cart"
            >
              {added ? <Check size={14} className="animate-bounce" /> : <Plus size={14} />}
            </button>
          </div>

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
                <span className="font-mono text-[#EFFF00] text-[10px] tracking-widest">PRODUCT SPECIFICATIONS</span>
                <button
                  onClick={() => setDetailedPanel(false)}
                  className="text-zinc-500 hover:text-white font-mono text-[9px] tracking-widest cursor-pointer"
                >
                  CLOSE
                </button>
              </div>

              <h4 className="text-sm font-sans font-black text-white mb-2">{product.name} specs</h4>
              <ul className="flex flex-col gap-2">
                {product.details.map((det, i) => (
                  <li key={i} className="font-mono text-[10px] text-zinc-450 flex items-start gap-2 line-clamp-1">
                    <span className="text-[#EFFF00] font-black">❯</span>
                    {det}
                  </li>
                ))}
              </ul>

              <div className="mt-6 bg-zinc-950 p-3 border border-zinc-900 mt-4 rounded-none">
                <span className="text-zinc-655 font-mono text-[9px] uppercase block mb-1">SKU IDENTIFIER</span>
                <code className="text-[#EFFF00] font-mono text-[10px]">{product.sku}</code>
              </div>
            </div>

            <button
              onClick={(e) => {
                handleQuickAdd(e);
                setDetailedPanel(false);
              }}
              className="w-full bg-white hover:bg-[#EFFF00] text-black font-mono font-bold text-xs py-2 transition-colors uppercase cursor-pointer"
            >
              ADD TO BAG — ${product.price}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
