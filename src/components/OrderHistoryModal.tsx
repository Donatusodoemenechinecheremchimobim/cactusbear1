import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  ShoppingBag, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  Hash,
  Sparkles,
  ClipboardCheck
} from "lucide-react";
import { dbService, DbOrder, UserSession } from "../services/firebase";

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession | null;
}

export default function OrderHistoryModal({
  isOpen,
  onClose,
  currentUser
}: OrderHistoryModalProps) {
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<DbOrder | null>(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadUserOrders();
    } else {
      setSelectedOrder(null);
      setErrorMsg("");
    }
  }, [isOpen, currentUser]);

  const loadUserOrders = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      // Securely fetch using dbService which scopes orders to active logged-in userId
      const orderList = await dbService.getOrders();
      
      // Filter strictly by current user's UID to prevent caching leakage 
      const strictlyFiltered = orderList.filter(o => o.userId === currentUser?.uid);

      // Sort with newest on top
      strictlyFiltered.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setOrders(strictlyFiltered);
    } catch (err: any) {
      console.error("Order History loading failed:", err);
      setErrorMsg("Failed to synchronize with order database ledger.");
    } finally {
      setLoading(false);
    }
  };

  const formatNgn = (nairaOrUsdAmount: number) => {
    const actualPrice = nairaOrUsdAmount < 1000 ? nairaOrUsdAmount * 1500 : nairaOrUsdAmount;
    return `₦${actualPrice.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "delivered":
        return {
          bg: "bg-[#EFFF00]/10",
          text: "text-[#EFFF00]",
          border: "border-[#EFFF00]/30"
        };
      case "shipped":
      case "transit":
        return {
          bg: "bg-indigo-950/40",
          text: "text-indigo-400",
          border: "border-indigo-500/20"
        };
      case "pending":
      case "processing":
        return {
          bg: "bg-amber-950/30",
          text: "text-amber-400",
          border: "border-amber-500/20"
        };
      case "cancelled":
        return {
          bg: "bg-rose-950/40",
          text: "text-rose-400",
          border: "border-rose-500/20"
        };
      default:
        return {
          bg: "bg-zinc-950",
          text: "text-zinc-400",
          border: "border-zinc-900"
        };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Ambient Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 z-50 pointer-events-auto backdrop-blur-sm"
          />

          {/* Centered Order History Cabinet */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="fixed inset-x-4 top-10 bottom-10 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[680px] bg-[#070708] border border-zinc-900 z-50 text-white flex flex-col pointer-events-auto overflow-hidden shadow-2xl rounded-none"
          >
            {/* Header branding strip */}
            <div className="p-5 border-b border-zinc-900 bg-black flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#EFFF00] animate-pulse" />
                  <span className="font-mono text-[9px] text-[#EFFF00] tracking-[0.2em] uppercase font-bold">
                    SECURED ATELIER LEDGER • PATRON EXCLUSIVE
                  </span>
                </div>
                <h3 className="text-lg font-sans font-black uppercase tracking-tight mt-1 flex items-center gap-2">
                  <ShoppingBag size={15} className="text-zinc-400" />
                  ORDER HISTORY
                </h3>
              </div>
              
              <button
                onClick={onClose}
                className="w-8 h-8 border border-zinc-900 hover:border-red-500 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Exit Cabinet"
              >
                <X size={14} />
              </button>
            </div>

            {/* Main content viewport */}
            <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
              {/* User Identity Banner */}
              <div className="bg-zinc-950 border border-zinc-900 p-3.5 flex items-center gap-3">
                <img
                  src={currentUser?.photoURL}
                  alt={currentUser?.displayName}
                  className="w-8 h-8 rounded-full border border-[#EFFF00]/40"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="block font-mono text-[8px] text-zinc-550 tracking-widest leading-none uppercase">
                    AUTHENTICATED PATRON
                  </span>
                  <span className="block text-xs font-bold text-white uppercase mt-0.5">
                    {currentUser?.displayName} • <span className="text-zinc-400 font-mono font-normal text-[10px] lowercase">{currentUser?.email}</span>
                  </span>
                </div>
              </div>

              {loading ? (
                /* Loading State Skeletons */
                <div className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="border border-zinc-900 bg-zinc-950/20 p-4 space-y-3 animate-pulse">
                      <div className="flex justify-between">
                        <div className="h-3.5 bg-zinc-900 w-1/3 rounded" />
                        <div className="h-4 bg-zinc-900 w-16 rounded" />
                      </div>
                      <div className="h-2 bg-zinc-900 w-full rounded" />
                      <div className="h-2 bg-zinc-900 w-2/3 rounded" />
                    </div>
                  ))}
                </div>
              ) : errorMsg ? (
                /* Error Alert */
                <div className="border border-red-900/45 bg-red-950/20 p-4 text-center">
                  <AlertTriangle size={24} className="text-red-500 mx-auto mb-2" />
                  <p className="font-mono text-xs text-red-200 uppercase tracking-wider">{errorMsg}</p>
                  <button
                    onClick={loadUserOrders}
                    className="mt-3 bg-red-950 border border-red-800 text-red-400 hover:text-white text-[9px] font-mono px-4 py-1.5 uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    RETRY SYNC
                  </button>
                </div>
              ) : orders.length === 0 ? (
                /* No Orders logged yet */
                <div className="border border-dashed border-zinc-900 bg-black/40 p-12 text-center flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-zinc-900 flex items-center justify-center text-zinc-500">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <h5 className="font-sans font-bold text-sm tracking-tight text-white uppercase">
                      NO ORDER LOGS FOUND
                    </h5>
                    <p className="text-zinc-550 text-xs mt-1 max-w-sm mx-auto">
                      Any streetwear pre-orders or custom reserve list transactions placed under this account will be logged here automatically.
                    </p>
                  </div>
                </div>
              ) : selectedOrder ? (
                /* Detail View of single chosen order */
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5"
                >
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="flex items-center gap-1 font-mono text-[9px] text-[#EFFF00] hover:underline uppercase tracking-widest cursor-pointer"
                  >
                    ← BACK TO LEDGER
                  </button>

                  {/* Complete details table */}
                  <div className="border border-zinc-900 bg-zinc-950 p-5 space-y-5">
                    
                    {/* Core Order Metadata */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-zinc-900">
                      <div>
                        <span className="block font-sans font-black text-sm tracking-widest text-[#EFFF00]">
                          {selectedOrder.id}
                        </span>
                        <span className="block font-mono text-[9px] text-zinc-400 mt-0.5">
                          SECURED TRANSACTION ID
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider ${getStatusColor(selectedOrder.status).bg} ${getStatusColor(selectedOrder.status).text} border ${getStatusColor(selectedOrder.status).border}`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                    </div>

                    {/* Timeline Log */}
                    <div className="grid grid-cols-2 gap-4 font-mono text-[10px]">
                      <div className="bg-black/40 border border-zinc-900/60 p-3 flex items-center gap-2.5">
                        <Calendar size={13} className="text-zinc-500" />
                        <div>
                          <span className="block text-zinc-550 text-[8px] tracking-wider uppercase">DATE LOGGED</span>
                          <span className="text-zinc-200">
                            {new Date(selectedOrder.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="bg-black/40 border border-zinc-900/60 p-3 flex items-center gap-2.5">
                        <Clock size={13} className="text-zinc-500" />
                        <div>
                          <span className="block text-zinc-550 text-[8px] tracking-wider uppercase">FULFILLMENT</span>
                          <span className="text-zinc-200 uppercase">
                            {selectedOrder.status === "Pending" ? "Awaiting Drop" : "Dispatched"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bought items list */}
                    <div className="space-y-3">
                      <span className="block font-mono text-[9px] text-zinc-400 uppercase tracking-widest">
                        ITEMS SECURED ({selectedOrder.items.length})
                      </span>
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 scrollbar-none">
                        {selectedOrder.items.map((it: any, index: number) => (
                          <div 
                            key={`ord-item-${index}`} 
                            className="bg-black border border-zinc-900 p-3 flex justify-between items-center text-xs"
                          >
                            <div>
                              <span className="font-sans font-extrabold text-white block uppercase">
                                {it.product?.name || "Premium Item"}
                              </span>
                              <div className="flex gap-2.5 items-center mt-1 font-mono text-[9px] text-zinc-400">
                                <span className="uppercase">SIZE: <strong className="text-white">{it.selectedSize || "N/A"}</strong></span>
                                {it.selectedColor && (
                                  <div className="flex items-center gap-1 uppercase">
                                    <span>COLOR:</span>
                                    <span 
                                      className="w-2.5 h-2.5 border border-zinc-800" 
                                      style={{ backgroundColor: it.selectedColor.hex }}
                                    />
                                    <span className="text-white">{it.selectedColor.name}</span>
                                  </div>
                                )}
                                {it.customPrintScale && (
                                  <span className="text-[#EFFF00]">✦ CUSTOM LOGO • STITCH DESIGNED</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-mono text-zinc-350 block">QTY: 1</span>
                              <span className="font-sans font-extrabold text-[#EFFF00] block mt-0.5">
                                {formatNgn(it.product?.price || 0)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address Profile */}
                    <div className="space-y-2.5 pt-1.5">
                      <span className="block font-mono text-[9px] text-zinc-400 uppercase tracking-widest">
                        SHIPPING PROFILE
                      </span>
                      <div className="bg-black border border-zinc-900 p-3.5 space-y-2.5 font-mono text-[10px] text-zinc-350">
                        <div className="flex justify-between items-start">
                          <span className="text-zinc-500 uppercase">CONTACT EMAIL:</span>
                          <span className="text-white">{selectedOrder.email}</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-zinc-500 uppercase">RECIPIENT:</span>
                          <span className="text-white uppercase">
                            {selectedOrder.shippingAddress?.fullName || currentUser?.displayName || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-zinc-500 uppercase">CONTACT MOBILE:</span>
                          <span className="text-white">{selectedOrder.shippingAddress?.phone || "N/A"}</span>
                        </div>
                        <div className="flex flex-col gap-1.5 pt-1.5 border-t border-zinc-900/65">
                          <span className="text-zinc-500 uppercase">DELIVERY ADDRESS:</span>
                          <span className="text-zinc-200 uppercase leading-relaxed">
                            {selectedOrder.shippingAddress?.addressLine || "N/A"}, {selectedOrder.shippingAddress?.city || "N/A"}, {selectedOrder.shippingAddress?.state || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ledger Pricing summary block */}
                    <div className="pt-2 flex justify-between items-center text-sm font-sans">
                      <span className="font-mono text-[10px] text-zinc-500 uppercase">LEDGER VALUE</span>
                      <div className="text-right">
                        <span className="text-white block font-black text-lg">
                          {formatNgn(selectedOrder.totalPrice)}
                        </span>
                        <span className="text-zinc-550 font-mono text-[8px] block uppercase">
                          TRANSACTION VALUE • REGISTERED NGN
                        </span>
                      </div>
                    </div>

                  </div>
                </motion.div>
              ) : (
                /* Primary Ledger List */
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase border-b border-zinc-900 pb-2">
                    <span>TRANSACTION ID / STATUS</span>
                    <span>LEDGER VALUE</span>
                  </div>

                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {orders.map((or) => (
                      <div
                        key={or.id}
                        onClick={() => setSelectedOrder(or)}
                        className="bg-zinc-950 hover:bg-zinc-900/70 border border-zinc-900 hover:border-[#EFFF00]/40 p-4 flex justify-between items-center cursor-pointer transition-all"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2.5">
                            <span className="font-sans font-black text-xs uppercase text-zinc-100 tracking-wider">
                              {or.id}
                            </span>
                            <span className={`px-2 py-0.5 text-[8px] font-mono uppercase tracking-wider ${getStatusColor(or.status).bg} ${getStatusColor(or.status).text} border ${getStatusColor(or.status).border}`}>
                              {or.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3 font-mono text-[9px] text-zinc-550">
                            <span>{new Date(or.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="uppercase text-[#EFFF00]">
                              {or.items.length} {or.items.length === 1 ? "ARTICLE" : "ARTICLES"}
                            </span>
                          </div>
                        </div>

                        <div className="text-right flex items-center gap-3">
                          <div>
                            <span className="font-sans font-black text-xs text-[#EFFF00] block">
                              {formatNgn(or.totalPrice)}
                            </span>
                            <span className="font-mono text-[8px] text-zinc-550 uppercase">
                              ${or.totalPrice}
                            </span>
                          </div>
                          <ArrowRight size={12} className="text-zinc-650" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Safety Assurance Note */}
                  <div className="border border-zinc-900 bg-black/40 p-3 flex gap-2.5 items-start font-mono text-[9px] text-zinc-500 leading-relaxed uppercase">
                    <ShieldCheck size={14} className="text-[#EFFF00] shrink-0 mt-0.5" />
                    <p>
                      Transactions listed above are secured in our zero-trust ledger. For shipping updates, please track using the TRACKER panel in the head-menu.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer security badge */}
            <div className="p-4 bg-black border-t border-zinc-900 text-center font-mono text-[9px] text-zinc-600 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <span>✦ CRYPTOGRAPHIC ATELIER FULFILLMENT NETWORK • ACTIVE ✦</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
