import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, SlidersHorizontal, ArrowUpDown, ArrowLeft, X, AlertCircle } from "lucide-react";
import { Product, CartItem } from "../types";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";

interface CollectionPageProps {
  productsList: Product[];
  onAddToCart: (item: CartItem) => void;
  onSelectProduct: (productId: string) => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onBack: () => void;
  searchQuery?: string;
  onSearchQueryChange?: (q: string) => void;
  productsLoading?: boolean;
}

export default function CollectionPage({
  productsList,
  onAddToCart,
  onSelectProduct,
  wishlist,
  onToggleWishlist,
  onBack,
  searchQuery: externalSearchQuery,
  onSearchQueryChange,
  productsLoading = false,
}: CollectionPageProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const activeSearchQuery = onSearchQueryChange !== undefined ? (externalSearchQuery || "") : localSearchQuery;
  const updateSearchQuery = (q: string) => {
    if (onSearchQueryChange) {
      onSearchQueryChange(q);
    } else {
      setLocalSearchQuery(q);
    }
  };

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"sku" | "price-asc" | "price-desc" | "name-asc">("sku");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Filter Categories
  const categoriesList = ["All", "Outerwear", "Tees", "Headwear"];

  // Processed products (Search -> Filter -> Sort)
  const processedProducts = useMemo(() => {
    let result = [...productsList];

    // 1. Search Query Filter
    if (activeSearchQuery.trim()) {
      const q = activeSearchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // 2. Category Filter
    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // 3. Stock Level Filter
    if (showLowStockOnly) {
      result = result.filter((p) => p.stock !== undefined && p.stock <= 5);
    }

    // 4. Sort implementation
    if (sortBy === "sku") {
      result.sort((a, b) => a.sku.localeCompare(b.sku));
    } else if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [productsList, activeSearchQuery, selectedCategory, sortBy, showLowStockOnly]);

  const resetFilters = () => {
    updateSearchQuery("");
    setSelectedCategory("All");
    setSortBy("sku");
    setShowLowStockOnly(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-[#030303] text-white py-12 px-4 md:px-8 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto z-10 relative">
        {/* Breadcrumb back button */}
        <button
          onClick={onBack}
          className="group flex items-center gap-2.5 font-mono text-[9px] tracking-[0.25em] text-zinc-500 hover:text-[#EFFF00] uppercase mb-10 transition-colors cursor-pointer"
        >
          <ArrowLeft size={10} className="transition-transform group-hover:-translate-x-1" />
          <span>BACK TO ATELIER ENTRY</span>
        </button>

        {/* Head Block */}
        <div className="border-b border-zinc-950 pb-8 mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#EFFF00] font-mono text-[10px] tracking-widest uppercase font-black mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EFFF00] animate-pulse" />
              FULL COLLECTION // ALL Streetwear
            </div>
            <h1 className="text-4xl md:text-6xl font-sans tracking-tighter font-extrabold uppercase text-white">
              SHOP THE <span className="text-zinc-800">COLLECTION</span>
            </h1>
            <p className="text-zinc-500 text-xs mt-2 max-w-xl font-mono">
              [ {processedProducts.length} ARTICLES of {productsList.length} ] High-quality heavyweight cotton streetwear designed in Lagos, Nigeria.
            </p>
          </div>

          <button
            onClick={resetFilters}
            className="text-[9px] font-mono tracking-widest text-[#EFFF05]/80 hover:text-white border border-[#EFFF00]/20 hover:border-white px-4 py-2 uppercase bg-zinc-950 transition-all cursor-pointer"
          >
            RESET ALL FILTERS
          </button>
        </div>

        {/* Filters and Controls Workspace layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          {/* Controls Panel */}
          <div className="lg:col-span-12 bg-zinc-950 border border-zinc-900 p-6 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Search input field */}
              <div className="md:col-span-5 relative flex flex-col gap-1.5">
                <label className="font-mono text-[9px] text-zinc-550 uppercase tracking-widest">
                  SEARCH PRODUCTS
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-650" size={13} />
                  <input
                    type="text"
                    value={activeSearchQuery}
                    onChange={(e) => updateSearchQuery(e.target.value)}
                    placeholder="Search by keyword, SKU or name..."
                    className="w-full bg-black border border-zinc-900 focus:border-[#EFFF00] pl-10 pr-10 py-2.5 font-mono text-xs outline-none text-[#EFFF00] transition-colors"
                  />
                  {activeSearchQuery && (
                    <button
                      onClick={() => updateSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-zinc-550 hover:text-white cursor-pointer"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              </div>

              {/* Category tabs */}
              <div className="md:col-span-4 flex flex-col gap-1.5">
                <label className="font-mono text-[9px] text-zinc-550 uppercase tracking-widest">
                  CATEGORIES
                </label>
                <div className="flex gap-1 bg-black p-0.5 border border-zinc-900 overflow-x-auto scrollbar-none">
                  {categoriesList.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 font-mono text-[9px] tracking-widest transition-all whitespace-nowrap cursor-pointer flex-1 ${
                        selectedCategory === cat
                          ? "bg-white text-black font-extrabold"
                          : "text-zinc-500 hover:text-white"
                      }`}
                    >
                      {cat.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort selector */}
              <div className="md:col-span-3 flex flex-col gap-1.5">
                <label className="font-mono text-[9px] text-zinc-550 uppercase tracking-widest">
                  SORT BY
                </label>
                <div className="relative">
                  <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-650 pointer-events-none" size={12} />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full bg-black border border-zinc-900 focus:border-[#EFFF00] pl-10 pr-4 py-2.5 font-mono text-xs outline-none text-[#EFFF00] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="sku">DEFAULT SORT</option>
                    <option value="price-asc">PRICE: LOW TO HIGH</option>
                    <option value="price-desc">PRICE: HIGH TO LOW</option>
                    <option value="name-asc">NAME Index: A → Z</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Filter checkbox toggles */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-zinc-900/40">
              <label className="flex items-center gap-3 font-mono text-[10px] tracking-wider text-zinc-400 cursor-pointer group select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={showLowStockOnly}
                    onChange={(e) => setShowLowStockOnly(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 border transition-colors flex items-center justify-center ${
                    showLowStockOnly ? "border-[#EFFF00] bg-[#EFFF00]/10" : "border-zinc-800 bg-black group-hover:border-zinc-550"
                  }`}>
                    {showLowStockOnly && <div className="w-1.5 h-1.5 bg-[#EFFF00]" />}
                  </div>
                </div>
                <span className={showLowStockOnly ? "text-[#EFFF00]" : "text-zinc-400 group-hover:text-zinc-250"}>
                  ONLY SHOW ITEMS UNDER 5 STOCK ITEMS
                </span>
              </label>

              {/* Search descriptors */}
              <div className="ml-auto flex items-center gap-2 font-mono text-[9px] text-zinc-600">
                <SlidersHorizontal size={10} />
                <span>FILTERS ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main matching layouts */}
        <AnimatePresence mode="popLayout">
          {productsLoading ? (
            <motion.div
              layout
              className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6"
            >
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={`skel-collection-${idx}`}>
                  <ProductCardSkeleton />
                </div>
              ))}
            </motion.div>
          ) : processedProducts.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6"
            >
              {processedProducts.map((prod) => (
                <motion.div
                  key={prod.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProductCard
                    product={prod}
                    onAddToCart={onAddToCart}
                    onSelect={onSelectProduct}
                    isWishlisted={wishlist.includes(prod.id)}
                    onToggleWishlist={() => onToggleWishlist(prod.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full bg-[#050505] border border-zinc-900 py-20 px-4 text-center flex flex-col items-center justify-center gap-4"
            >
              <AlertCircle size={32} className="text-[#EFFF00] animate-pulse" />
              <div className="flex flex-col gap-1 max-w-md">
                <h3 className="font-mono text-xs font-black uppercase text-[#EFFF00] tracking-widest">
                  NO PRODUCTS FOUND
                </h3>
                <p className="text-zinc-550 text-[11px] font-mono leading-relaxed">
                  No streetwear items match your search. Try checking your spelling or reset the filters.
                </p>
              </div>
              <button
                onClick={resetFilters}
                className="mt-2 font-mono text-[9px] tracking-widest bg-zinc-950 border border-zinc-800 hover:border-[#EFFF00] px-4 py-2 uppercase hover:text-[#EFFF00] transition-colors cursor-pointer"
              >
                [ RESET ALL FILTERS ]
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
