import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Smartphone, 
  Mail, 
  Calendar, 
  MapPin, 
  Clock,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { dbService, DbOrder, UserSession } from "../services/firebase";

interface OrdersLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession | null;
}

export default function OrdersLookupModal({
  isOpen,
  onClose,
  currentUser
}: OrdersLookupModalProps) {
  const [userOrders, setUserOrders] = useState<DbOrder[]>([]);
  const [searchResult, setSearchResult] = useState<DbOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  
  // Custom manual lookup query states
  const [emailQuery, setEmailQuery] = useState<string>("");
  const [orderQuery, setOrderQuery] = useState<string>("");
  const [manualTab, setManualTab] = useState<"none" | "email" | "reference">("none");

  // Automatically fetch orders matching active device or user session when modal starts
  useEffect(() => {
    if (isOpen) {
      loadRegisteredOrders();
    } else {
      // Reset modes on close
      setSearchResult(null);
      setErrorMsg("");
      setManualTab("none");
    }
  }, [isOpen, currentUser]);

  const loadRegisteredOrders = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const allOrders = await dbService.getOrders();
      
      // Pool tracking references
      const localIds: string[] = [];
      try {
        const savedIds = JSON.parse(localStorage.getItem("cactus_bear_my_order_ids") || "[]");
        if (Array.isArray(savedIds)) {
          localIds.push(...savedIds.map(id => id.trim().toUpperCase()));
        }
      } catch (e) {}

      const lastEmail = localStorage.getItem("cactus_bear_last_checkout_email")?.trim().toLowerCase() || "";
      const currentEmail = currentUser?.email?.trim().toLowerCase() || "";

      // Match orders
      const matched = allOrders.filter(o => {
        const orderIdUpper = o.id.trim().toUpperCase();
        const orderEmailLower = o.email.trim().toLowerCase();

        const matchesLocalId = localIds.includes(orderIdUpper);
        const matchesLastEmail = lastEmail && orderEmailLower === lastEmail;
        const matchesCurrentEmail = currentEmail && orderEmailLower === currentEmail;

        return matchesLocalId || matchesLastEmail || matchesCurrentEmail;
      });

      // Sort by newest pre-order logged first
      matched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUserOrders(matched);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to access local registry database.");
    } finally {
      setLoading(false);
    }
  };

  // Searching manual email lookup
  const handleEmailSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailQuery.trim()) return;
    setLoading(true);
    setErrorMsg("");
    setSearchResult(null);

    try {
      const allOrders = await dbService.getOrders();
      const target = emailQuery.trim().toLowerCase();
      const matched = allOrders.filter(
        (o) => o.email.trim().toLowerCase() === target
      );
      
      setUserOrders(matched);
      if (matched.length === 0) {
        setErrorMsg("No pre-orders matched under this email.");
      } else {
        // Save the searched email for convenience next time
        localStorage.setItem("cactus_bear_last_checkout_email", target);
      }
    } catch (err) {
      setErrorMsg("Error querying database cache.");
    } finally {
      setLoading(false);
    }
  };

  // Searching manual order ID reference lookup
  const handleReferenceSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;
    setLoading(true);
    setErrorMsg("");
    setSearchResult(null);

    try {
      const allOrders = await dbService.getOrders();
      const match = allOrders.find(
        (o) => o.id.trim().toUpperCase() === orderQuery.trim().toUpperCase()
      );
      if (match) {
        setSearchResult(match);
        // Also load it under local list so user has it saved on device
        try {
          const savedIds = JSON.parse(localStorage.getItem("cactus_bear_my_order_ids") || "[]");
          if (!savedIds.includes(match.id)) {
            savedIds.push(match.id);
            localStorage.setItem("cactus_bear_my_order_ids", JSON.stringify(savedIds));
          }
        } catch (e) {}
      } else {
        setErrorMsg("Order reference not found (verify e.g. CB-OR-XXXXXX).");
      }
    } catch (err) {
      setErrorMsg("Connection error searching order.");
    } finally {
      setLoading(false);
    }
  };

  const formatNgn = (usdAmount: number) => {
    return `₦${(usdAmount * 1500).toLocaleString()}`;
  };

  // Status visual renderer
  const renderStatusBadge = (status: DbOrder["status"]) => {
    switch (status) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-amber-600 bg-amber-950/40 text-amber-400 font-mono text-[9px] uppercase font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            PENDING
          </span>
        );
      case "Shipped":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-[#EFFF00] bg-yellow-950/20 text-[#EFFF00] font-mono text-[9px] uppercase font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EFFF00] animate-ping" />
            IN TRANSIT
          </span>
        );
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-emerald-500 bg-emerald-950/40 text-emerald-400 font-mono text-[9px] uppercase font-bold">
            <CheckCircle2 size={10} />
            DELIVERED
          </span>
        );
      case "Canceled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-red-500 bg-red-950/40 text-red-400 font-mono text-[9px] uppercase font-bold">
            <XCircle size={10} />
            CANCELED
          </span>
        );
    }
  };

  // Timeline Progress Visual
  const renderTrackerTimeline = (status: DbOrder["status"]) => {
    const steps = [
      { id: "Pending", label: "QUEUED", icon: Clock },
      { id: "Shipped", label: "IN TRANSIT", icon: Truck },
      { id: "Delivered", label: "DELIVERED", icon: CheckCircle2 }
    ];

    if (status === "Canceled") {
      return (
        <div className="border border-red-950 bg-red-950/10 p-4 font-mono text-center mb-4">
          <span className="text-red-400 text-xs font-bold block mb-1">CANCELED / RETRACTED</span>
          <p className="text-zinc-500 text-[10px]">
            This transaction status was marked as canceled. Contact support desk for active queries.
          </p>
        </div>
      );
    }

    const currentIdx = steps.findIndex(s => s.id === status);

    return (
      <div className="bg-[#0e0e0f] border border-zinc-900 p-4 mb-4">
        <span className="font-mono text-[8px] text-zinc-550 block mb-3 uppercase tracking-widest">
          PRE-ORDER PREPARATION STATUS
        </span>
        <div className="grid grid-cols-3 gap-2 relative">
          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            const isCompleted = idx <= currentIdx;
            const isCurrent = step.id === status;
            
            return (
              <div key={step.id} className="text-center flex flex-col items-center">
                <div className={`w-8 h-8 flex items-center justify-center border transition-all ${
                  isCurrent 
                    ? "border-[#EFFF00] bg-[#EFFF00] text-black" 
                    : isCompleted 
                    ? "border-[#EFFF00]/50 bg-transparent text-[#EFFF00]" 
                    : "border-zinc-900 bg-zinc-950 text-zinc-605"
                }`}>
                  <StepIcon size={12} />
                </div>
                <span className={`font-mono text-[8px] mt-2 block font-black tracking-tight ${
                  isCurrent ? "text-[#EFFF00]" : isCompleted ? "text-zinc-350" : "text-zinc-650"
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getSupportUrls = (order: DbOrder) => {
    const adminWhatsappHost = "2348123456789"; 
    const adminEmailAddress = "chibundusadiq@gmail.com";
    
    const whatsappMsgText = `Hello Cactus Bear Team,\n\nI am tracking my pre-order!\n\nOrder Ref: ${order.id}\nStatus: ${order.status}\nPatron Name: ${order.name}\nTotal: $${order.totalPrice}.00`;
    const emailSubjectLine = `Cactus Bear Pre-Order Inquiry: ${order.id}`;
    const emailBodyText = `Hello,\n\nI would like an update on my pre-order ${order.id} under name ${order.name}.\n\nDelivery Address: ${order.address}, ${order.city}\nTotal Price: $${order.totalPrice}.00`;

    return {
      whatsapp: `https://wa.me/${adminWhatsappHost}?text=${encodeURIComponent(whatsappMsgText)}`,
      email: `mailto:${adminEmailAddress}?subject=${encodeURIComponent(emailSubjectLine)}&body=${encodeURIComponent(emailBodyText)}`
    };
  };

  // Full detailed display for a singleton selected order
  const renderSingleOrderDetails = (order: DbOrder) => {
    const links = getSupportUrls(order);
    return (
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 text-white"
      >
        <button
          onClick={() => setSearchResult(null)}
          className="mb-1 text-zinc-500 font-mono text-[9px] uppercase tracking-wider flex items-center gap-1 hover:text-[#EFFF00] transition-colors cursor-pointer"
        >
          [ ← BACK TO ORDERS LIST ]
        </button>

        <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
          <div>
            <span className="font-mono text-[9px] text-zinc-550 uppercase block">ORDER REF</span>
            <span className="font-mono text-sm font-black text-[#EFFF00] tracking-widest">{order.id}</span>
          </div>
          <div>
            {renderStatusBadge(order.status)}
          </div>
        </div>

        {/* Tracker Progress timeline element */}
        {renderTrackerTimeline(order.status)}

        {/* Selected products inside order */}
        <div>
          <span className="font-mono text-[9px] text-zinc-500 uppercase block mb-2 font-black tracking-wider">
            RESERVED GARMENTS
          </span>
          <div className="border border-zinc-900 bg-black/40 font-mono text-xs divide-y divide-zinc-950">
            {order.items && order.items.map((item, idx) => (
              <div key={idx} className="p-3 flex justify-between items-start gap-4">
                <div>
                  <span className="text-white block font-extrabold font-sans text-xs">{item.product.name}</span>
                  <span className="text-[9px] text-zinc-550 tracking-tight block mt-0.5">
                    Color: <b className="capitalize text-zinc-400">{item.selectedColor?.name || "Standard"}</b> | Size: <b className="text-[#EFFF00]">{item.selectedSize}</b>
                  </span>
                </div>
                <div className="text-right whitespace-nowrap">
                  <span className="text-zinc-550 block text-[9.5px]">Qty: {item.quantity}</span>
                  <span className="text-zinc-300 font-bold block mt-0.5">${(item.product.price * item.quantity)}.00</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logistics totals pricing breakdown */}
        <div className="bg-zinc-950 border border-zinc-900 p-4 font-mono text-[10.5px] text-zinc-500 flex flex-col gap-1.5">
          <div className="flex justify-between">
            <span>PRE-ORDER SUB-TOTAL:</span>
            <span className="text-zinc-300">${order.totalPrice > 300 ? order.totalPrice : order.totalPrice - 15}.00</span>
          </div>
          <div className="flex justify-between">
            <span>SHIPPING SERVICE FEE:</span>
            <span className="text-zinc-300">{order.totalPrice > 300 ? "FREE" : "$15.00"}</span>
          </div>
          <div className="border-t border-zinc-900 pt-2 flex justify-between text-xs font-black text-[#EFFF00]">
            <span>TOTAL PRICE TAG:</span>
            <span>
              ${order.totalPrice}.00 
              <span className="text-[9px] text-zinc-550 block text-right font-normal mt-0.5 font-sans">
                ({formatNgn(order.totalPrice)} approx.)
              </span>
            </span>
          </div>
        </div>

        {/* Location target parameters */}
        <div className="bg-[#0b0c0d] border border-zinc-900 p-4 flex flex-col gap-2.5">
          <span className="font-mono text-[9px] text-[#EFFF00] uppercase font-bold tracking-widest block">
            DELIVERY HUB COUPLING INFO
          </span>
          <div className="flex items-start gap-2 text-xs">
            <MapPin size={13} className="text-zinc-650 shrink-0 mt-0.5" />
            <div>
              <span className="text-white font-extrabold block leading-tight">{order.name}</span>
              <span className="text-zinc-400 block mt-1 leading-normal text-[11px]">
                {order.address}, {order.city}, Nigeria
              </span>
            </div>
          </div>
          {order.phone && (
            <div className="border-t border-zinc-900/60 pt-2 mt-1 flex items-center gap-2 text-zinc-400 font-mono text-[10px]">
              <Smartphone size={11} className="text-zinc-600 shrink-0" />
              <span>{order.phone}</span>
            </div>
          )}
          <div className="border-t border-zinc-900/60 pt-2 flex items-center gap-2 text-[9px] text-zinc-550 font-mono">
            <Calendar size={11} className="text-zinc-600 shrink-0" />
            <span>ORDER LOGGED AT: {new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* WhatsApp & Mail Help Desks */}
        <div className="bg-black border border-zinc-900 p-4">
          <span className="font-mono text-[8px] text-zinc-550 block mb-2 tracking-widest uppercase font-bold">
            EXPEDITE PRE-ORDER NOTIFICATIONS
          </span>
          <p className="text-zinc-500 text-[10px] leading-relaxed mb-3.5">
            Pre-orders are processed individually at our Lagos studio. Tap below to notify our handlers natively:
          </p>
          <div className="grid grid-cols-2 gap-2 text-black font-mono font-black text-[10px]">
            <a 
              href={links.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba5a] py-3 rounded-none flex items-center justify-center gap-1.5 transition-colors tracking-wide uppercase text-center"
            >
              <Smartphone size={11} />
              WHATSAPP DESK
            </a>
            <a 
              href={links.email}
              className="bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-none flex items-center justify-center gap-1.5 transition-colors tracking-wide uppercase text-center"
            >
              <Mail size={11} />
              EMAIL PING
            </a>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background backdrop overlay fitting mobile screens */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 z-50 backdrop-blur-sm"
          />

          {/* Secure Drawer panel aligned as fixed position for superb mobile usage */}
          <motion.div
            initial={{ x: "100%", opacity: 0.9 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.9 }}
            transition={{ type: "spring", damping: 26, stiffness: 190 }}
            className="fixed inset-y-0 right-0 w-full sm:max-w-lg h-full bg-[#0c0c0d] border-l border-zinc-900 z-50 p-5 sm:p-7 text-white flex flex-col justify-between overflow-y-auto shadow-2xl"
          >
            <div>
              {/* Header Title bar */}
              <div className="flex justify-between items-center pb-4 border-b border-zinc-900 mb-5">
                <div className="flex items-center gap-2">
                  <Package size={15} className="text-[#EFFF00]" />
                  <span className="font-sans font-black text-sm sm:text-base tracking-tight uppercase">
                    LIVE PRE-ORDER <span className="text-[#EFFF00]">STATUS DIRECT</span>
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:text-[#EFFF00] text-zinc-550 transition-colors border border-zinc-900 bg-black cursor-pointer"
                  title="Close status panel"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Status loader spinner */}
              {loading && (
                <div className="py-24 flex flex-col items-center justify-center gap-3">
                  <div className="w-7 h-7 border-2 border-[#EFFF00] border-t-transparent rounded-full animate-spin" />
                  <span className="font-mono text-[8px] text-[#EFFF00] uppercase tracking-widest animate-pulse">
                    COUPLING LOCAL LIVE DATA...
                  </span>
                </div>
              )}

              {!loading && (
                <div className="flex flex-col gap-4">
                  {/* SINGLE ORDER CONTAINER DETAILED VIEW */}
                  {searchResult ? (
                    renderSingleOrderDetails(searchResult)
                  ) : (
                    // ORDER LIST MAIN SUMMARY VIEW: NO COMPLEX REFERENCE KEYS NEEDED TO BEGIN
                    <div className="flex flex-col gap-5">
                      
                      {/* Interactive orders matching registry */}
                      {userOrders.length > 0 ? (
                        <div className="flex flex-col gap-3">
                          <span className="font-mono text-[8.5px] text-[#EFFF00] tracking-widest block uppercase font-bold">
                            YOUR REGISTERED PRE-ORDERS ({userOrders.length})
                          </span>
                          
                          <div className="flex flex-col gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
                            {userOrders.map((order) => (
                              <div
                                key={order.id}
                                onClick={() => setSearchResult(order)}
                                className="bg-black border border-zinc-900 p-4 hover:border-[#EFFF00] transition-all cursor-pointer flex flex-col gap-2 group relative overflow-hidden"
                              >
                                <div className="absolute top-0 right-0 h-full w-[2px] bg-zinc-800 group-hover:bg-[#EFFF00] transition-colors" />
                                <div className="flex justify-between items-center font-mono text-[11px]">
                                  <span className="text-white font-extrabold group-hover:text-[#EFFF00] transition-colors tracking-wide">
                                    {order.id}
                                  </span>
                                  <span className="text-[10px] text-zinc-550">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-zinc-400 font-mono text-[11px]">
                                    {order.items.length} item(s) • <strong className="text-white">${order.totalPrice}.00</strong>
                                  </span>
                                  {renderStatusBadge(order.status)}
                                </div>
                                <div className="mt-1 flex items-center justify-end text-[9px] font-mono text-zinc-550 group-hover:text-[#EFFF00] font-black tracking-wide transition-colors gap-1 uppercase">
                                  VIEW PREPARATION TRACKER <ChevronRight size={10} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        // If fully empty on browser session, explain clearly
                        <div className="py-8 px-4 border border-zinc-900 bg-black/30 text-center font-mono flex flex-col items-center justify-center gap-3">
                          <Package size={20} className="text-zinc-750" />
                          <div className="text-xs text-zinc-500">
                            <span>No active pre-order registered locally on this browser.</span>
                          </div>
                        </div>
                      )}

                      {/* Manual Lookup expander - super easy without being sophisticated */}
                      <div className="border-t border-zinc-900/60 pt-4 mt-1">
                        <span className="font-mono text-[9px] text-zinc-550 uppercase tracking-wider block mb-3 font-semibold">
                          [ MANUALLY RETRIEVE OTHER ACCOUNTS ]
                        </span>

                        <div className="flex flex-col gap-2">
                          {/* Tab selectors for manual lookup formats if they wish */}
                          <div className="grid grid-cols-2 gap-1 p-0.5 bg-black border border-zinc-950 font-mono text-[9px] tracking-wide text-center">
                            <button
                              onClick={() => setManualTab(manualTab === "email" ? "none" : "email")}
                              className={`py-1.5 font-bold transition-all ${
                                manualTab === "email" ? "bg-zinc-800 text-[#EFFF00]" : "text-zinc-550 hover:text-white"
                              }`}
                            >
                              LOOKUP EMAIL
                            </button>
                            <button
                              onClick={() => setManualTab(manualTab === "reference" ? "none" : "reference")}
                              className={`py-1.5 font-bold transition-all ${
                                manualTab === "reference" ? "bg-zinc-800 text-[#EFFF00]" : "text-zinc-550 hover:text-white"
                              }`}
                            >
                              INPUT ORDER ID
                            </button>
                          </div>

                          {/* Email Form expand */}
                          {manualTab === "email" && (
                            <motion.form 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              onSubmit={handleEmailSearch} 
                              className="flex flex-col gap-2.5 bg-zinc-950/40 p-3.5 border border-zinc-900 mt-1"
                            >
                              <span className="font-mono text-[8px] text-zinc-550 uppercase block">
                                Enter checkout email to list all matched orders:
                              </span>
                              <div className="relative">
                                <Search size={11} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-650" />
                                <input
                                  required
                                  type="email"
                                  value={emailQuery}
                                  onChange={(e) => setEmailQuery(e.target.value)}
                                  className="w-full bg-black border border-zinc-900 focus:border-[#EFFF00] pl-8 pr-3 py-2 font-mono text-xs text-[#EFFF00] outline-none transition-colors"
                                  placeholder="chibundusadiq@gmail.com"
                                />
                              </div>
                              <button
                                type="submit"
                                className="w-full bg-[#EFFF00] hover:bg-yellow-400 text-black font-mono font-black text-[9px] py-2 tracking-widest uppercase transition-all rounded-none cursor-pointer"
                              >
                                EXECUTE SEARCH QUERY
                              </button>
                            </motion.form>
                          )}

                          {/* Order ID Form expand */}
                          {manualTab === "reference" && (
                            <motion.form 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              onSubmit={handleReferenceSearch} 
                              className="flex flex-col gap-2.5 bg-zinc-950/40 p-3.5 border border-zinc-900 mt-1"
                            >
                              <span className="font-mono text-[8px] text-zinc-550 uppercase block">
                                Input unique serial reference ID:
                              </span>
                              <div className="relative">
                                <Search size={11} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-650" />
                                <input
                                  required
                                  type="text"
                                  value={orderQuery}
                                  onChange={(e) => setOrderQuery(e.target.value)}
                                  className="w-full bg-black border border-zinc-900 focus:border-[#EFFF00] pl-8 pr-3 py-2 font-mono text-xs text-[#EFFF00] outline-none transition-colors uppercase"
                                  placeholder="CB-OR-4A8E0D"
                                />
                              </div>
                              <button
                                type="submit"
                                className="w-full bg-white hover:bg-[#EFFF00] text-black font-mono font-black text-[9px] py-2 tracking-widest uppercase transition-all rounded-none cursor-pointer"
                              >
                                RETRIEVE TRACK ID
                              </button>
                            </motion.form>
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Feedback Errors element */}
                  {errorMsg && (
                    <div className="p-3 border border-red-950 bg-red-950/15 font-mono text-[9px] text-red-400 uppercase font-bold tracking-wide">
                      ⚠ {errorMsg}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sticky base Brand Stamp */}
            <div className="border-t border-zinc-900/60 pt-4 mt-6 flex items-center justify-between font-mono text-[8px] sm:text-[9px] text-zinc-600">
              <span>SECURE LOGISTICS LAYER v2.6</span>
              <span>© {new Date().getFullYear()} CACTUS BEAR</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
