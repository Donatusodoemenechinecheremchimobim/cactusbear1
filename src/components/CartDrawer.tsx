import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Trash2, ShieldCheck, Truck, ShoppingCart, KeyRound } from "lucide-react";
import { CartItem } from "../types";
import GlowCrown from "./GlowCrown";
import { dbService } from "../services/firebase";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  onClearCart
}: CartDrawerProps) {
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "shipping" | "confirm">("cart");
  const [shippingForm, setShippingForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    country: "",
    cryptKey: ""
  });
  const [orderHash, setOrderHash] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Math equations
  const cartSubtotal = cart.reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0);
  const coreShippingFee = cartSubtotal > 300 ? 0 : cart.length > 0 ? 15 : 0;
  const vaultTotal = cartSubtotal + coreShippingFee;

  const triggerSecureCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    setTimeout(() => {
      const savedOrder = dbService.addOrder({
        name: shippingForm.name,
        email: shippingForm.email,
        address: shippingForm.address,
        city: shippingForm.city,
        country: shippingForm.country,
        items: cart,
        totalPrice: vaultTotal
      });
      setOrderHash(savedOrder.id);
      setSubmitting(false);
      setCheckoutStep("confirm");
    }, 1500);
  };

  const handleCompleteFlow = () => {
    onClearCart();
    setCheckoutStep("cart");
    setShippingForm({ name: "", email: "", address: "", city: "", country: "", cryptKey: "" });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 backdrop-blur-sm"
          />

          {/* Core sliding vault cart drawer sidepane */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-[#09090a] border-l border-zinc-900 z-50 text-white flex flex-col justify-between"
          >
            {/* Header section with ticker detail */}
            <div className="p-6 border-b border-zinc-900 bg-black/50">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={16} className="text-[#EFFF00]" />
                  <span className="font-sans font-black text-lg uppercase tracking-tight">
                    CACTUS BEAR <span className="text-[#EFFF00]">SHOPPING BAG</span>
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-none border border-zinc-900 hover:border-zinc-700 flex items-center justify-center transition-all bg-black cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
              <span className="block font-mono text-[9px] text-zinc-500 tracking-wider">
                EXCLUSIVE ACCESSORIES & APPAREL / TOTAL ITEMS: ({cart.length})
              </span>
            </div>

            {/* Middle state panel */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 gap-4">
                  <div className="opacity-15">
                    <GlowCrown size={90} color="#666" glow={false} />
                  </div>
                  <div>
                    <span className="font-mono text-xs text-zinc-500 block uppercase">
                      YOUR BAG IS EMPTY
                    </span>
                    <p className="text-zinc-500 text-[11px] max-w-xs mt-1.5 font-sans">
                      Select ready-to-wear garments or design a bespoke combination in our customizer lab above to populate your list.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Step ONE: Cart items inspector */}
                  {checkoutStep === "cart" && (
                    <div className="flex flex-col gap-4">
                      {cart.map((item) => {
                        const isCustom = item.id.startsWith("custom-");
                        return (
                          <div
                            key={item.id}
                            className={`p-4 border flex justify-between gap-4 items-start relative ${
                              isCustom ? "border-[#EFFF00]/25 bg-[#121207]/30" : "border-zinc-900 bg-black/40"
                            }`}
                          >
                            {/* Graphic visualizer swatch */}
                            <div className="w-16 h-16 bg-zinc-950 border border-zinc-900 flex items-center justify-center relative flex-shrink-0">
                              {/* Glowing marker indicator on custom */}
                              {isCustom && (
                                <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-[#EFFF00] animate-pulse" />
                              )}
                              
                              <div className="rotate-[12deg] w-10 h-10 select-none">
                                <GlowCrown
                                  size="100%"
                                  color={item.selectedColor.isYellowTint ? "#000000" : "#EFFF00"}
                                  glow={false}
                                />
                              </div>
                            </div>

                            {/* Core description block */}
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <h4 className="font-sans font-extrabold text-xs text-white uppercase tracking-tight select-all">
                                  {item.product.name}
                                </h4>
                                
                                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[9px] font-mono text-zinc-500">
                                  <span>SZ: <strong className="text-white">{item.selectedSize}</strong></span>
                                  <span>BASE: <strong className="text-white">{item.selectedColor.name}</strong></span>
                                  {isCustom && (
                                    <>
                                      <span>SCALE: <strong className="text-[#EFFF00]">{(item.customPrintScale! * 100).toFixed(0)}%</strong></span>
                                      <span>LOC: <strong className="text-[#EFFF00]">{item.customPrintPosition?.toUpperCase()}</strong></span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Qty incrementer and delete */}
                              <div className="flex items-center gap-3 mt-3">
                                <div className="flex items-center border border-zinc-900 bg-black">
                                  <button
                                    onClick={() => onUpdateQty(item.id, -1)}
                                    className="px-2 py-0.5 text-xs text-zinc-505 hover:text-white"
                                  >
                                    -
                                  </button>
                                  <span className="px-2 font-mono text-xs font-bold text-[#EFFF00]">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => onUpdateQty(item.id, 1)}
                                    className="px-2 py-0.5 text-xs text-zinc-505 hover:text-white"
                                  >
                                    +
                                  </button>
                                </div>

                                <button
                                  onClick={() => onRemoveItem(item.id)}
                                  className="text-zinc-600 hover:text-red-400 p-1 transition-colors"
                                  title="Retract Item"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>

                            {/* Aggregation pricing display */}
                            <div className="text-right">
                              <span className="font-mono text-xs font-extrabold block text-white select-all">
                                ${item.product.price * item.quantity}
                              </span>
                              <span className="text-[9px] font-mono text-zinc-500">
                                @ ${item.product.price}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Step TWO: Brutalist Shipping Manifest inputs */}
                  {checkoutStep === "shipping" && (
                    <form onSubmit={triggerSecureCheckout} className="flex flex-col gap-4">
                      <span className="font-mono text-[10px] text-[#EFFF00] tracking-wider block mb-2">
                        [ MANDATORY SHIPPING PARAMETERS ]
                      </span>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[9px] text-zinc-500 uppercase">FULL NAME / CONSIGNEE</label>
                        <input
                          required
                          type="text"
                          value={shippingForm.name}
                          onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                          className="w-full bg-black border border-zinc-900 rounded-none py-1.5 px-3 font-mono text-xs focus:border-[#EFFF00] outline-none transition-colors"
                          placeholder="Consignee identifier name..."
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[9px] text-zinc-500 uppercase">SECURED EMAIL (DHL UPDATES)</label>
                        <input
                          required
                          type="email"
                          value={shippingForm.email}
                          onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                          className="w-full bg-black border border-zinc-900 rounded-none py-1.5 px-3 font-mono text-xs focus:border-[#EFFF00] outline-none transition-colors"
                          placeholder="name@securedomain.com"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[9px] text-zinc-500 uppercase">STREET ADDRESS CODES</label>
                        <input
                          required
                          type="text"
                          value={shippingForm.address}
                          onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                          className="w-full bg-black border border-zinc-900 rounded-none py-1.5 px-3 font-mono text-xs focus:border-[#EFFF00] outline-none transition-colors"
                          placeholder="Flat, building details, core street..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-[9px] text-zinc-500 uppercase">CITY METROPOLIS</label>
                          <input
                            required
                            type="text"
                            value={shippingForm.city}
                            onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                            className="w-full bg-black border border-zinc-900 rounded-none py-1.5 px-3 font-mono text-xs focus:border-[#EFFF00] outline-none transition-colors"
                            placeholder="London"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-[9px] text-zinc-500 uppercase">NATION DISTRICT</label>
                          <input
                            required
                            type="text"
                            value={shippingForm.country}
                            onChange={(e) => setShippingForm({ ...shippingForm, country: e.target.value })}
                            className="w-full bg-black border border-zinc-900 rounded-none py-1.5 px-3 font-mono text-xs focus:border-[#EFFF00] outline-none transition-colors"
                            placeholder="United Kingdom"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 mt-2">
                        <label className="font-mono text-[9px] text-[#EFFF00] uppercase flex items-center gap-1">
                          <KeyRound size={10} />
                          PASS CODE ACCESS OPTIONAL
                        </label>
                        <input
                          type="text"
                          value={shippingForm.cryptKey}
                          onChange={(e) => setShippingForm({ ...shippingForm, cryptKey: e.target.value })}
                          className="w-full bg-black border border-[#EFFF00]/15 rounded-none py-1.5 px-3 font-mono text-xs focus:border-[#EFFF00] outline-none transition-colors text-[#EFFF00]"
                          placeholder="Leave blank unless registered in list..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-[#EFFF00] hover:bg-[#EFFF22] disabled:bg-[#EFFF00]/40 text-black font-mono font-bold text-xs py-3 tracking-widest uppercase transition-colors rounded-none mt-6 flex items-center justify-center gap-2"
                      >
                        {submitting ? "DIGITALIZING SHIPMENT..." : "VERIFY SECURE SHIPPING DATA & LOCK"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setCheckoutStep("cart")}
                        className="w-full bg-transparent border border-zinc-900 hover:border-zinc-700 font-mono text-[9px] py-2 uppercase tracking-wide transition-colors"
                      >
                        [ BACK TO ORDER DIRECTORY ]
                      </button>
                    </form>
                  )}

                  {/* Step THREE: Confirmation - COMING SOON Announcement */}
                  {checkoutStep === "confirm" && (
                    <motion.div
                      initial={{ scale: 0.96, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col gap-6 text-center py-6"
                    >
                      <div className="flex justify-center text-[#EFFF00]">
                        <Truck size={40} className="animate-bounce text-[#EFFF00]" />
                      </div>

                      <div>
                        <span className="text-[#EFFF00] font-mono text-[11px] tracking-widest font-black uppercase block mb-1">
                          COMING SOON
                        </span>
                        <h3 className="text-xl font-sans font-black uppercase tracking-tight text-white">
                          PRE-ORDER RECOGNIZED
                        </h3>
                        <p className="text-zinc-400 text-xs mt-3 leading-relaxed font-sans px-2">
                          Our final checkout gates are opening soon. We have officially registered and recorded your pre-order in our atelier database. You will be the very first notified upon your order's presentation and dispatch!
                        </p>
                      </div>

                      <div className="bg-zinc-950 border border-zinc-900 p-4 font-mono text-[10px] text-left text-zinc-400 flex flex-col gap-2">
                        <div>
                          <span className="text-zinc-600 uppercase font-black">RECIPIENT:</span> {shippingForm.name}
                        </div>
                        <div>
                          <span className="text-zinc-600 uppercase font-black">EMAIL:</span> {shippingForm.email}
                        </div>
                        <div>
                          <span className="text-zinc-600 uppercase font-black">DELIVERY AREA:</span> {shippingForm.address}, {shippingForm.city}, {shippingForm.country}
                        </div>
                        <div className="border-t border-zinc-900 pt-2 mt-2 flex justify-between">
                          <span className="text-[#EFFF00]">PRE-ORDER RESERVATION PASS:</span>
                          <strong className="text-white select-all">{orderHash}</strong>
                        </div>
                      </div>

                      <div className="border border-[#EFFF00]/25 bg-[#121207]/30 p-3 mt-2">
                        <span className="font-mono text-[9px] text-[#EFFF00] tracking-wide block uppercase">
                          ⚡ PRE-ORDER ACCESS REGISTERED
                        </span>
                        <p className="text-zinc-500 text-[9px] uppercase font-mono mt-1">
                          Actual payment is disabled until standard collections drop. No charges have been made.
                        </p>
                      </div>

                      <button
                        onClick={handleCompleteFlow}
                        className="w-full bg-white hover:bg-[#EFFF00] text-black font-mono font-bold text-xs py-3.5 tracking-widest transition-all rounded-none uppercase mt-6 cursor-pointer"
                      >
                        CLOSE SHOPPING BAG
                      </button>
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* Bottom aggregate sums */}
            {cart.length > 0 && checkoutStep !== "confirm" && (
              <div className="p-6 border-t border-zinc-900 bg-black/60 flex flex-col gap-4">
                <div className="flex flex-col gap-2 font-mono text-xs">
                  <div className="flex justify-between text-zinc-500">
                    <span>SUB-TOTAL:</span>
                    <span className="text-white">${cartSubtotal}.00</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>STANDARD SHIPPING:</span>
                    <span className="text-[#EFFF00] font-bold">
                      {coreShippingFee === 0 ? "FREE" : `$${coreShippingFee}.00`}
                    </span>
                  </div>
                  <div className="border-t border-zinc-950 pt-3 flex justify-between items-center text-sm font-semibold">
                    <span className="font-sans font-black tracking-wide text-white">TOTAL VALUE:</span>
                    <span className="text-xl font-extrabold text-[#EFFF00] select-all">${vaultTotal}.00</span>
                  </div>
                </div>

                {checkoutStep === "cart" && (
                  <button
                    onClick={() => setCheckoutStep("shipping")}
                    className="w-full bg-[#EFFF00] hover:bg-[#EFFF22] text-black font-mono font-black text-xs py-4 tracking-widest uppercase transition-colors rounded-none flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck size={14} />
                    PROCEED TO PRE-ORDER CHECKOUT
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
