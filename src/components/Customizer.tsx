import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sliders, Check, Eye, Pocket, Sparkles, Layers, RefreshCw } from "lucide-react";
import { ApparelColor, CartItem, Product } from "../types";
import GlowCrown from "./GlowCrown";

interface CustomizerProps {
  onAddCustomItem: (item: CartItem) => void;
}

// Custom mock products specifically for customizer
const CUSTOM_BASE_PRODUCTS: Product[] = [
  {
    id: "cust-hoodie",
    name: "01 // OVERSIZED HOODIE",
    category: "Outerwear",
    price: 210,
    sku: "CB-HD-01",
    description: "Heavyweight 520GSM loopback organic cotton comfort hoodie.",
    details: ["520nd French Terry Cotton", "Clean drawstring-free neck hood", "Sturdy double-lock stitched cuffs"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Obsidian Black", hex: "#0c0c0d", bgHex: "#0c0c0d" },
      { name: "Neon Cactus", hex: "#EFFF00", bgHex: "#EFFF00", isYellowTint: true },
      { name: "Soot Grey", hex: "#22252a", bgHex: "#22252a" },
      { name: "Rust Orange", hex: "#aa4012", bgHex: "#aa4012" }
    ],
    mockupType: "hoodie"
  },
  {
    id: "cust-tee",
    name: "02 // BOXY JERSEY TEE",
    category: "Tees",
    price: 90,
    sku: "CB-TE-01",
    description: "Premium pre-shrunk boxy heavyweight cotton jersey tee.",
    details: ["280GSM Heavy jersey cotton", "Thick durable ribbed collar", "Reinforced shoulders style"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Obsidian Black", hex: "#0c0c0d", bgHex: "#0c0c0d" },
      { name: "Alabaster White", hex: "#e5e7eb", bgHex: "#e5e7eb" },
      { name: "Industrial Ochre", hex: "#9a7d32", bgHex: "#9a7d32", isYellowTint: true }
    ],
    mockupType: "tee"
  },
  {
    id: "cust-puffer",
    name: "03 // QUILTED DETACHABLE PUFFER",
    category: "Outerwear",
    price: 310,
    sku: "CB-PF-01",
    description: "Thick quilted warm insulated puffer jacket with removable accessories.",
    details: ["Water-resistant outer wind shell", "Maximum warmth premium synthetic fill", "Heavy YKK two-way zipper"],
    sizes: ["M", "L", "XL"],
    colors: [
      { name: "Obsidian Black", hex: "#0c0c0d", bgHex: "#0c0c0d" },
      { name: "Neon Cactus", hex: "#EFFF00", bgHex: "#EFFF00", isYellowTint: true },
      { name: "Charcoal Slate", hex: "#1f2937", bgHex: "#1f2937" }
    ],
    mockupType: "puffer"
  },
  {
    id: "cust-cap",
    name: "04 // TWILL DISTRESSED CAP",
    category: "Headwear",
    price: 60,
    sku: "CB-CP-01",
    description: "Washed twill vintage 6-panel cap with adjustable brass buckle.",
    details: ["Vintage washed heavy cotton twill", "Classic 6-panel construction style", "Adjustable strap with brass buckle"],
    sizes: ["OS (Adjustable)"],
    colors: [
      { name: "Obsidian Black", hex: "#0c0c0d", bgHex: "#0c0c0d" },
      { name: "Soot Grey", hex: "#22252a", bgHex: "#22252a" }
    ],
    mockupType: "cap"
  }
];

export default function Customizer({ onAddCustomItem }: CustomizerProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product>(CUSTOM_BASE_PRODUCTS[0]);
  const [activeColor, setActiveColor] = useState<ApparelColor>(CUSTOM_BASE_PRODUCTS[0].colors[0]);
  const [activeSize, setActiveSize] = useState<string>("L");
  const [scale, setScale] = useState<number>(1.0);
  const [position, setPosition] = useState<"front" | "back">("front");
  const [glowIntensity, setGlowIntensity] = useState<number>(85);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [addedMessage, setAddedMessage] = useState<boolean>(false);

  // Handle color & size default when switching garment types
  const handleProductChange = (prod: Product) => {
    setSelectedProduct(prod);
    setActiveColor(prod.colors[0]);
    setActiveSize(prod.sizes[0] || "L");
  };

  // Build temporary item for checkout
  const handleAddSelection = () => {
    setIsAdding(true);

    const cartItem: CartItem = {
      id: `custom-${selectedProduct.id}-${activeColor.name}-${activeSize}-${position}`,
      product: {
        ...selectedProduct,
        name: `${selectedProduct.name} (CUSTOMIZED)`,
        price: selectedProduct.price, // Customized price stays same
      },
      selectedColor: activeColor,
      selectedSize: activeSize,
      quantity: 1,
      customPrintScale: scale,
      customPrintPosition: position
    };

    setTimeout(() => {
      onAddCustomItem(cartItem);
      setIsAdding(false);
      setAddedMessage(true);
      setTimeout(() => setAddedMessage(false), 3000);
    }, 1200);
  };

  const handleReset = () => {
    setScale(1.0);
    setPosition("front");
    setGlowIntensity(85);
  };

  return (
    <section id="customizer-lab" className="w-full bg-[#050505] text-white py-20 px-4 md:px-8 border-t border-zinc-900 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1e10_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />
      
      {/* ATMOSPHERIC COMING SOON OVERLAY FOR STITCH LAB CUSTOMIZER */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-zinc-950 border border-[#EFFF00]/30 shadow-2xl p-8 md:p-12 relative flex flex-col items-center gap-6">
          <div className="w-20 h-10 rotate-[-10deg]">
            <GlowCrown size="100%" color="#EFFF00" glow={true} />
          </div>
          <div>
            <span className="text-[#EFFF00] font-mono text-xs tracking-widest font-bold uppercase block mb-1">
              ✦ DESIGN STUDIO • CUSTOM DESIGNS
            </span>
            <h3 className="text-3xl font-sans font-black tracking-tight uppercase text-white">
              CUSTOMIZER LAB
            </h3>
            <span className="font-mono text-[10px] bg-[#EFFF00] text-black px-3.5 py-1 mt-2.5 inline-block font-extrabold tracking-[0.2em] uppercase">
              COMING SOON
            </span>
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed font-sans">
            Our custom clothing design tools are launching soon. You will be able to choose custom cotton thread stitching, printing alignments, and unique back-prints.
          </p>
          <div className="w-full h-px bg-zinc-900" />
          <a
            href="#unlocked-terminal"
            className="w-full bg-zinc-900 border border-zinc-800 hover:border-[#EFFF00] text-white hover:text-[#EFFF00] font-mono text-[9px] py-3.5 tracking-widest uppercase transition-colors"
          >
            PRE-ORDER NEW RELEASES
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-start justify-between mb-12 gap-4">
          <div>
            <span className="text-[#EFFF00] font-mono text-xs tracking-widest font-semibold uppercase block mb-1">
              [ CUSTOM DESIGN LAB ]
            </span>
            <h2 className="text-4xl md:text-5xl font-sans tracking-tighter font-extrabold uppercase">
              CUSTOM <span className="text-[#EFFF00]">DESIGN</span> LAB
            </h2>
            <p className="text-zinc-550 text-sm max-w-xl mt-2">
              Select custom streetwear items, adjust the alignment of the crown graphic, and choose customized glows. Individually crafted and custom printed.
            </p>
          </div>
          
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 border border-zinc-800 hover:border-[#EFFF00] rounded-none text-xs font-mono tracking-wider hover:text-[#EFFF00] transition-colors"
          >
            <RefreshCw size={13} />
            RESET DESIGN
          </button>
        </div>

        {/* Customization Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT: Live Interactive SVG Garment Display */}
          <div className="lg:col-span-7 bg-[#0b0b0c] border border-zinc-900 p-8 flex flex-col justify-between items-center relative min-h-[460px] md:min-h-[550px]">
            {/* Design Watermark */}
            <div className="absolute top-4 left-4 font-mono text-[10px] text-zinc-700 tracking-wider">
              TEMPLATE: {selectedProduct.sku}
            </div>
            
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/40 px-3 py-1 border border-zinc-900 text-[10px] font-mono text-[#EFFF00]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EFFF00] animate-pulse" />
              STITCH LAB READY
            </div>

            {/* Main Visual Render Area */}
            <div className="relative w-full max-w-[340px] md:max-w-[420px] h-[340px] md:h-[420px] my-auto flex items-center justify-center">
              
              {/* SVG Silhouette Renderer with dynamic coloring */}
              <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
                {/* Hoodie Base Shape */}
                {selectedProduct.mockupType === "hoodie" && (
                  <g>
                    {/* Shadow layer */}
                    <path
                      d="M 120,380 L 100,160 L 60,190 L 30,225 L 15,240 L 5,225 L 20,180 L 55,130 L 110,80 L 140,84 L 140,60 L 200,50 L 260,60 L 260,84 L 290,80 L 345,130 L 380,180 L 395,225 L 385,240 L 370,225 L 340,190 L 300,160 L 280,380 Z"
                      fill="#030303"
                      opacity="0.4"
                    />
                    {/* Color Dyed Body and Sleeves */}
                    <path
                      d="M 120,380 L 100,160 L 60,190 L 30,225 L 15,240 L 5,225 L 20,180 L 55,130 L 110,80 L 140,84 C 140,84 155,50 200,50 C 245,50 260,84 260,84 L 290,80 L 345,130 L 380,180 L 395,225 L 385,240 L 370,225 L 340,190 L 300,160 L 280,380 Z"
                      fill={activeColor.hex}
                      className="transition-colors duration-500"
                    />
                    
                    {/* Pocket Stitch Detail */}
                    <path
                      d="M 150,370 L 160,285 L 240,285 L 250,370 Z"
                      fill="none"
                      stroke={activeColor.isYellowTint ? "#222" : "rgba(255,255,255,0.15)"}
                      strokeWidth="2"
                    />
                    {/* Shoulder Seams */}
                    <path d="M 110,80 L 140,140" stroke="rgba(0,0,0,0.3)" strokeWidth="2" />
                    <path d="M 290,80 L 260,140" stroke="rgba(0,0,0,0.3)" strokeWidth="2" />
                    {/* Hood stitch */}
                    <path d="M 140,84 C 150,115 250,115 260,84" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="2" />
                    <path d="M 170,84 C 170,120 230,120 230,84" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
                    
                    {/* Bottom and Sleeve Cuffs */}
                    <rect x="118" y="370" width="164" height="15" fill="rgba(0,0,0,0.2)" />
                    <path d="M 5,220 L 15,240" stroke="rgba(0,0,0,0.3)" strokeWidth="3" />
                    <path d="M 395,220 L 385,240" stroke="rgba(0,0,0,0.3)" strokeWidth="3" />
                  </g>
                )}

                {/* Boxy Tee Base Shape */}
                {selectedProduct.mockupType === "tee" && (
                  <g>
                    <path
                      d="M 125,385 L 125,120 L 50,140 L 25,195 L 2,185 L 32,105 L 105,70 L 145,74 C 145,74 160,54 200,54 C 240,54 255,74 255,74 L 295,70 L 368,105 L 398,185 L 375,195 L 350,140 L 350,120 L 275,385 Z"
                      fill={activeColor.hex}
                      className="transition-colors duration-500"
                    />
                    {/* Collar stitches */}
                    <path d="M 145,74 C 145,95 255,95 255,74" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="3" />
                    {/* Wrinkles overlay */}
                    <path d="M 125,135 C 110,145 105,160 115,170" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="2" />
                    <path d="M 275,135 C 290,145 295,160 285,170" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="2" />
                  </g>
                )}

                {/* Quilted Puffer Base Shape */}
                {selectedProduct.mockupType === "puffer" && (
                  <g>
                    {/* Shadow base */}
                    <path
                      d="M 115,380 L 105,100 L 45,115 L 15,150 L 5,235 L 20,255 L 45,215 L 105,170 L 115,380 Z"
                      fill="#030303"
                      opacity="0.3"
                    />
                    {/* Core Puffer Body */}
                    <path
                      d="M 110,380 L 100,105 L 45,120 L 15,165 L 5,235 L 22,255 L 45,215 L 100,175 L 100,105 L 145,75 C 145,75 160,50 200,50 C 240,50 255,75 255,75 L 300,105 L 300,175 L 355,215 L 378,255 L 395,235 L 385,165 L 355,120 L 300,105 L 290,380 Z"
                      fill={activeColor.hex}
                      className="transition-colors duration-500"
                    />
                    
                    {/* Quilted Panels details */}
                    {/* Ribs on Body */}
                    <line x1="105" y1="160" x2="295" y2="160" stroke="rgba(0,0,0,0.4)" strokeWidth="4" />
                    <line x1="105" y1="215" x2="295" y2="215" stroke="rgba(0,0,0,0.4)" strokeWidth="4" />
                    <line x1="105" y1="270" x2="295" y2="270" stroke="rgba(0,0,0,0.4)" strokeWidth="4" />
                    <line x1="107" y1="325" x2="293" y2="325" stroke="rgba(0,0,0,0.4)" strokeWidth="4" />

                    {/* Left/Right puffer seams & zip line */}
                    <line x1="200" y1="75" x2="200" y2="380" stroke="rgba(0,0,0,0.5)" strokeWidth="3" />
                    <path d="M 145,75 L 145,110 M 255,75 L 255,110" stroke="rgba(0,0,0,0.3)" strokeWidth="2" />
                    
                    {/* Collar puffed collar */}
                    <path d="M 145,75 C 145,110 255,110 255,75 Z" fill="rgba(0,0,0,0.15)" stroke="rgba(0,0,0,0.3)" />
                  </g>
                )}

                {/* Distressed Cap Base */}
                {selectedProduct.mockupType === "cap" && (
                  <g>
                    {/* Cap Crown Dome */}
                    <path
                      d="M 100,260 C 100,150 150,110 200,110 C 250,110 300,150 300,260 Z"
                      fill={activeColor.hex}
                      className="transition-colors duration-500"
                    />
                    
                    {/* Hat Visor Brim */}
                    <path
                      d="M 90,250 C 130,250 270,250 330,285 C 310,305 150,305 90,250 Z"
                      fill={activeColor.hex}
                      opacity="0.95"
                      stroke="rgba(0,0,0,0.3)"
                      strokeWidth="2.5"
                    />

                    {/* Cap Button */}
                    <ellipse cx="200" cy="110" rx="14" ry="6" fill="rgba(0,0,0,0.4)" />

                    {/* Panel Stitch Lines */}
                    <path d="M 200,110 Q 150,170 110,245" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1.8" />
                    <path d="M 200,110 Q 200,180 200,260" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1.8" />
                    <path d="M 200,110 Q 250,170 290,245" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1.8" />
                  </g>
                )}
              </svg>

              {/* FLOATING SVG LOGO LAYER - customized by scales and glow sliders */}
              <div
                className="absolute pointer-events-none flex items-center justify-center transition-all duration-300"
                style={{
                  transform: `scale(${scale})`,
                  top: selectedProduct.mockupType === "cap" ? "25%" : position === "back" ? "28%" : "30%",
                  left: "50%",
                  marginLeft: "-100px",
                  marginTop: "-50px",
                  filter: `drop-shadow(0 0 ${glowIntensity / 10}px #EFFF00)`,
                }}
              >
                <GlowCrown
                  size={selectedProduct.mockupType === "cap" ? 110 : 200}
                  color={activeColor.isYellowTint ? "#000000" : "#EFFF00"}
                  glow={glowIntensity > 20}
                />
              </div>

              {/* Side badge identifier if customizable back is selected */}
              {position === "back" && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-24 bg-black/80 text-zinc-400 font-mono text-[9px] px-3 py-1 border border-zinc-800 tracking-widest uppercase">
                  [ BACK PANEL VIEW ]
                </div>
              )}
            </div>

            {/* Micro Details info footer bar */}
            <div className="w-full flex justify-between items-center text-zinc-500 font-mono text-[10px] pt-4 border-t border-zinc-900">
              <span>FABRIC: 100% COTTON</span>
              <span>POSITION: {position.toUpperCase()}</span>
              <span>PRICE: ₦{selectedProduct.price.toLocaleString()}</span>
            </div>
          </div>

          {/* RIGHT: High-End Customization tactile controls */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            
            {/* Garment selection cards */}
            <div className="bg-[#0b0b0c] border border-zinc-900 p-6 flex flex-col gap-4">
              <span className="text-zinc-500 font-mono text-[10px] tracking-wider block">
                01 // SELECT APPAREL TYPE
              </span>
              
              <div className="grid grid-cols-2 gap-3">
                {CUSTOM_BASE_PRODUCTS.map((prod) => {
                  const isSelected = selectedProduct.id === prod.id;
                  return (
                    <button
                      key={prod.id}
                      onClick={() => handleProductChange(prod)}
                      className={`relative text-left p-3 border rounded-none transition-all flex flex-col justify-between h-20 ${
                        isSelected
                          ? "border-[#EFFF00] bg-[#121207] text-white"
                          : "border-zinc-850 bg-black/40 text-zinc-400 hover:border-zinc-650"
                      }`}
                    >
                      <span className="text-[10px] font-mono tracking-wide text-zinc-500">
                        {prod.sku}
                      </span>
                      <span className="font-sans font-extrabold text-xs tracking-tight truncate">
                        {prod.name.split("//")[1]}
                      </span>
                      {isSelected && (
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#EFFF00]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom wash selection */}
            <div className="bg-[#0b0b0c] border border-zinc-900 p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-mono text-[10px] tracking-wider block">
                  02 // SELECT COLOR
                </span>
                <span className="font-mono text-[10px] text-[#EFFF00]">
                  {activeColor.name}
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {selectedProduct.colors.map((color) => {
                  const isSelected = activeColor.name === color.name;
                  return (
                    <button
                      key={color.name}
                      onClick={() => setActiveColor(color)}
                      className={`relative w-10 h-10 border transition-all ${
                        isSelected ? "border-[#EFFF00] scale-105" : "border-zinc-800 hover:border-zinc-600"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                           <Check size={14} className={color.isYellowTint ? "text-black" : "text-[#EFFF00]"} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Position and Scale Panel */}
            <div className="bg-[#0b0b0c] border border-zinc-900 p-6 flex flex-col gap-6">
              <div>
                <span className="text-zinc-500 font-mono text-[10px] tracking-wider block mb-3">
                  03 // PRINT POSITION & SIZE
                </span>

                {/* Print Placement Toggle */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-black/80 border border-zinc-900 mb-6 font-bold">
                  <button
                    onClick={() => setPosition("front")}
                    disabled={selectedProduct.mockupType === "cap"}
                    className={`py-2 text-center font-mono text-[10px] tracking-widest disabled:opacity-30 ${
                      position === "front"
                        ? "bg-[#EFFF00] text-black font-bold"
                        : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    FRONT PRINT
                  </button>
                  <button
                    onClick={() => setPosition("back")}
                    disabled={selectedProduct.mockupType === "cap" || selectedProduct.mockupType === "puffer"}
                    className={`py-2 text-center font-mono text-[10px] tracking-widest disabled:opacity-30 ${
                      position === "back"
                        ? "bg-[#EFFF00] text-black font-bold"
                        : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    BACK PRINT
                  </button>
                </div>

                {/* Range Sliders for Scale and Glow */}
                <div className="flex flex-col gap-4">
                  {/* Print Scale */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between font-mono text-[10px] text-zinc-500">
                      <span>GRAPHIC SIZE</span>
                      <span className="text-white">{(scale * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="1.4"
                      step="0.05"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="w-full accent-[#EFFF00] bg-zinc-900 h-1 cursor-pointer"
                    />
                  </div>

                  {/* Radioactive Glow Intensity */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between font-mono text-[10px] text-zinc-500">
                      <span>GLOW BRIGHTNESS</span>
                      <span className="text-white">{glowIntensity}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={glowIntensity}
                      onChange={(e) => setGlowIntensity(parseInt(e.target.value))}
                      className="w-full accent-[#EFFF00] bg-zinc-900 h-1 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Sizing choosing grid */}
              <div>
                <span className="text-zinc-500 font-mono text-[10px] tracking-wider block mb-2">
                  04 // SELECT SIZE
                </span>
                <div className="flex gap-2">
                  {selectedProduct.sizes.map((size) => {
                    const isSelected = activeSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setActiveSize(size)}
                        className={`w-10 h-10 font-mono text-xs border rounded-none transition-colors ${
                          isSelected
                            ? "bg-white text-black border-white font-bold"
                            : "border-zinc-800 text-zinc-400 hover:border-zinc-500"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Price block and checkout trigger */}
            <div className="bg-[#121207] border border-[#EFFF00]/20 p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-zinc-500 font-mono text-[9px] block">
                    UNIT PRICE (STITCHED TO ORDER)
                  </span>
                  <span className="text-3xl font-extrabold font-sans tracking-tight">
                    ₦{selectedProduct.price.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-505 font-mono text-[9px] block">
                    SHIPPING LOGISTICS
                  </span>
                  <span className="font-mono text-xs text-[#EFFF00] font-semibold">
                    COMPLIMENTARY DHL
                  </span>
                </div>
              </div>

              {/* Add Custom Fit to Vault */}
              <button
                onClick={handleAddSelection}
                disabled={isAdding}
                className="w-full bg-[#EFFF00] hover:bg-[#EFFF22] text-black font-mono font-black text-xs py-4 tracking-widest transition-all rounded-none uppercase flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAdding ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} />
                    SEWING CUSTOM PREVIEW...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    ADD BESPOKE COMBINATION TO BAG
                  </>
                )}
              </button>

              <AnimatePresence>
                {addedMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center font-mono text-[10px] text-[#EFFF00]"
                  >
                    ✓ PIECE ADDED TO YOUR CART
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
