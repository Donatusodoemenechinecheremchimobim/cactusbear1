import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Trash2, ShieldCheck, Truck, ShoppingCart, KeyRound, MapPin, Smartphone, Mail } from "lucide-react";
import { CartItem } from "../types";
import GlowCrown from "./GlowCrown";
import { dbService } from "../services/firebase";
import { NIGERIAN_STATES_AND_AREAS } from "../data/nigerianStates";

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
  
  // State-area selectors for Nigeria
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [customArea, setCustomArea] = useState<string>("");
  const [streetDetail, setStreetDetail] = useState<string>("");

  const [shippingForm, setShippingForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Nigeria",
    cryptKey: ""
  });

  // Synchronize dynamic selections to shippingForm values
  React.useEffect(() => {
    const finalArea = selectedArea === "Other" ? customArea : selectedArea;
    const combinedAddress = [streetDetail, finalArea].filter(Boolean).join(", ");
    setShippingForm(prev => ({
      ...prev,
      city: selectedState,
      address: combinedAddress
    }));
  }, [selectedState, selectedArea, customArea, streetDetail]);
  const [orderHash, setOrderHash] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [adminWhatsapp, setAdminWhatsapp] = useState<string>("2348123456789");
  const [adminEmail, setAdminEmail] = useState<string>("chibundusadiq@gmail.com");

  React.useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const config = await dbService.getTimerConfig();
        if (config.adminWhatsapp) setAdminWhatsapp(config.adminWhatsapp.trim());
        if (config.adminEmail) setAdminEmail(config.adminEmail.trim());
      } catch (err) {
        console.error("Failed to load store alert configurations:", err);
      }
    };
    if (isOpen) {
      fetchConfigs();
    }
  }, [isOpen]);

  // Math equations
  const cartSubtotal = cart.reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0);
  const coreShippingFee = cartSubtotal > 300 ? 0 : cart.length > 0 ? 15 : 0;
  const vaultTotal = cartSubtotal + coreShippingFee;

  const triggerSecureCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const savedOrder = await dbService.addOrder({
        name: shippingForm.name,
        email: shippingForm.email,
        phone: shippingForm.phone,
        address: shippingForm.address,
        city: shippingForm.city,
        country: shippingForm.country,
        items: cart,
        totalPrice: vaultTotal
      });
      setOrderHash(savedOrder.id);

      // Save order info to local tracking lists for seamless reference-free list tracking
      try {
        const localTrackIds = JSON.parse(localStorage.getItem("cactus_bear_my_order_ids") || "[]");
        if (!localTrackIds.includes(savedOrder.id)) {
          localTrackIds.push(savedOrder.id);
          localStorage.setItem("cactus_bear_my_order_ids", JSON.stringify(localTrackIds));
        }
        localStorage.setItem("cactus_bear_last_checkout_email", shippingForm.email);
      } catch (storageErr) {
        console.warn("Could not save to local device registers:", storageErr);
      }

      setCheckoutStep("confirm");

      // Auto-trigger WhatsApp dispatch message directly to the administrator
      const cleanPhoneForWhatsapp = adminWhatsapp.replace(/[^0-9]/g, "");
      const whatsappText = `*CACTUS BEAR DESIGN LABS - NEW PRE-ORDER DESIGNATED*\n` +
        `---------------------------------------------\n` +
        `*Order Reference:* ${savedOrder.id}\n` +
        `*Patron Name:* ${shippingForm.name}\n` +
        `*Patron Email:* ${shippingForm.email}\n` +
        `*Contact Number:* ${shippingForm.phone}\n` +
        `*Delivery Location Area:* ${shippingForm.address}, ${shippingForm.city}, ${shippingForm.country}\n` +
        `---------------------------------------------\n` +
        `*ITEMS:* \n` +
        cart.map(item => `• ${item.quantity}x ${item.product.name} (Size: ${item.selectedSize}, Color: ${item.selectedColor.name})`).join("\n") +
        `\n---------------------------------------------\n` +
        `*TOTAL VALUE:* $${vaultTotal}.00 (approx. ₦${(vaultTotal * 1500).toLocaleString()})\n` +
        `*CACTUS BEAR SECURE PLATFORM TRACKER - LAGOS, NIGERIA*`;

      const whatsappUrl = `https://wa.me/${cleanPhoneForWhatsapp}?text=${encodeURIComponent(whatsappText)}`;
      
      // Execute non-blocking browser redirect window open
      setTimeout(() => {
        window.open(whatsappUrl, "_blank");
      }, 500);

    } catch (err) {
      console.error("Order creation failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteFlow = () => {
    onClearCart();
    setCheckoutStep("cart");
    setShippingForm({ name: "", email: "", phone: "", address: "", city: "", country: "", cryptKey: "" });
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
                                    className="px-2 py-0.5 text-xs text-zinc-500 hover:text-white"
                                  >
                                    -
                                  </button>
                                  <span className="px-2 font-mono text-xs font-bold text-[#EFFF00]">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => onUpdateQty(item.id, 1)}
                                    className="px-2 py-0.5 text-xs text-zinc-500 hover:text-white"
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

                  {/* Step TWO: Shipping details */}
                  {checkoutStep === "shipping" && (
                    <form onSubmit={triggerSecureCheckout} className="flex flex-col gap-4">
                      <span className="font-mono text-[10px] text-[#EFFF00] tracking-wider block mb-2">
                        [ SHIPPING DETAILS ]
                      </span>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[9px] text-zinc-500 uppercase">FULL NAME</label>
                        <input
                          required
                          type="text"
                          value={shippingForm.name}
                          onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                          className="w-full bg-black border border-zinc-900 rounded-none py-1.5 px-3 font-mono text-xs focus:border-[#EFFF00] outline-none transition-colors"
                          placeholder="Your full name..."
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[9px] text-zinc-500 uppercase">EMAIL ADDRESS</label>
                        <input
                          required
                          type="email"
                          value={shippingForm.email}
                          onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                          className="w-full bg-black border border-zinc-900 rounded-none py-1.5 px-3 font-mono text-xs focus:border-[#EFFF00] outline-none transition-colors"
                          placeholder="you@example.com"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[9px] text-zinc-500 uppercase">CONTACT PHONE / WHATSAPP NUMBER</label>
                        <input
                          required
                          type="tel"
                          value={shippingForm.phone}
                          onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                          className="w-full bg-black border border-zinc-900 rounded-none py-1.5 px-3 font-mono text-xs focus:border-[#EFFF00] outline-none transition-colors"
                          placeholder="e.g. +234 812 345 6789"
                        />
                      </div>

                      {/* Two-tier structured State & Zone location selectors for Nigeria */}
                      <div className="flex flex-col gap-4 border border-zinc-900 bg-black/40 p-4">
                        <span className="font-mono text-[9px] text-[#EFFF00] uppercase tracking-widest block font-black">
                          🇳🇬 NIGERIAN DELIVERY HUB DESIGNATION
                        </span>

                        {/* State selector */}
                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-[9px] text-zinc-500 uppercase">STATE / HUB</label>
                          <select
                            required
                            value={selectedState}
                            onChange={(e) => {
                              setSelectedState(e.target.value);
                              setSelectedArea("");
                              setCustomArea("");
                            }}
                            className="w-full bg-black border border-zinc-900 rounded-none py-2 px-3 font-mono text-xs focus:border-[#EFFF00] outline-none transition-colors text-white cursor-pointer"
                          >
                            <option value="">Select State...</option>
                            {Object.keys(NIGERIAN_STATES_AND_AREAS).sort().map((stateName) => (
                              <option key={stateName} value={stateName}>
                                {stateName}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Zone/Area selector (active when state selected) */}
                        {selectedState && (
                          <div className="flex flex-col gap-1.5">
                            <label className="font-mono text-[9px] text-zinc-500 uppercase">ZONE / AREA / LGA</label>
                            <select
                              required
                              value={selectedArea}
                              onChange={(e) => {
                                setSelectedArea(e.target.value);
                                if (e.target.value !== "Other") {
                                  setCustomArea("");
                                }
                              }}
                              className="w-full bg-black border border-zinc-900 rounded-none py-2 px-3 font-mono text-xs focus:border-[#EFFF00] outline-none transition-colors text-white cursor-pointer"
                            >
                              <option value="">Select Delivery Area / City...</option>
                              {NIGERIAN_STATES_AND_AREAS[selectedState]?.map((area) => (
                                <option key={area} value={area}>
                                  {area}
                                </option>
                              ))}
                              <option value="Other">[ OTHER SPECIFIC REGION NOT LISTED ]</option>
                            </select>
                          </div>
                        )}

                        {/* Manual entry text for Other zone */}
                        {selectedState && selectedArea === "Other" && (
                          <div className="flex flex-col gap-1.5">
                            <label className="font-mono text-[9px] text-[#EFFF00] uppercase font-bold">MANUOUS REGION DESC</label>
                            <input
                              required
                              type="text"
                              value={customArea}
                              onChange={(e) => setCustomArea(e.target.value)}
                              className="w-full bg-black border border-[#EFFF00]/30 rounded-none py-1.5 px-3 font-mono text-xs focus:border-[#EFFF00] outline-none transition-colors text-[#EFFF00]"
                              placeholder="e.g. Omu-Aran Main Town"
                            />
                          </div>
                        )}

                        {/* Detailed street entry */}
                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-[9px] text-zinc-500 uppercase">STREET ADDRESS DETAIL</label>
                          <input
                            required
                            type="text"
                            value={streetDetail}
                            onChange={(e) => setStreetDetail(e.target.value)}
                            className="w-full bg-black border border-zinc-900 rounded-none py-1.5 px-3 font-mono text-xs focus:border-[#EFFF00] outline-none transition-colors"
                            placeholder="House number, Street name, Estate / Apartment..."
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 mt-2">
                        <label className="font-mono text-[9px] text-[#EFFF00] uppercase flex items-center gap-1">
                          <KeyRound size={10} />
                          ACCESS OR DISCOUNT CODE (OPTIONAL)
                        </label>
                        <input
                          type="text"
                          value={shippingForm.cryptKey}
                          onChange={(e) => setShippingForm({ ...shippingForm, cryptKey: e.target.value })}
                          className="w-full bg-black border border-[#EFFF00]/15 rounded-none py-1.5 px-3 font-mono text-xs focus:border-[#EFFF00] outline-none transition-colors text-[#EFFF00]"
                          placeholder="Enter coupon or team code..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-[#EFFF00] hover:bg-[#EFFF22] disabled:bg-[#EFFF00]/40 text-black font-mono font-bold text-xs py-3 tracking-widest uppercase transition-colors rounded-none mt-6 flex items-center justify-center gap-2"
                      >
                        {submitting ? "PROCESSING PRE-ORDER..." : "PLACE FREE PRE-ORDER RESERVATION"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setCheckoutStep("cart")}
                        className="w-full bg-transparent border border-zinc-900 hover:border-zinc-700 font-mono text-[9px] py-2 uppercase tracking-wide transition-colors"
                      >
                        [ BACK TO CART ]
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
                          THANK YOU
                        </span>
                        <h3 className="text-xl font-sans font-black uppercase tracking-tight text-white">
                          PRE-ORDER SAVED
                        </h3>
                        <p className="text-zinc-400 text-xs mt-3 leading-relaxed font-sans px-2">
                          We have received your pre-order reservation! Since this is a preview collection, actual payment checkout will open once the items officially drop. We will email you with early access instructions the second they become available.
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
                          <span className="text-zinc-600 uppercase font-black">CONTACT PHONE:</span> {shippingForm.phone}
                        </div>
                        <div>
                          <span className="text-zinc-600 uppercase font-black">DELIVERY AREA:</span> {shippingForm.address}, {shippingForm.city}, {shippingForm.country}
                        </div>
                        <div className="border-t border-zinc-900 pt-2 mt-2 flex justify-between">
                          <span className="text-[#EFFF00]">RESERVATION CODE:</span>
                          <strong className="text-white select-all">{orderHash}</strong>
                        </div>
                      </div>

                      {/* WhatsApp / Email alerts dispatcher block */}
                      <div className="bg-[#121207]/40 border border-[#EFFF00]/20 p-4 text-left flex flex-col gap-2.5">
                        <span className="font-mono text-[9px] text-[#EFFF00] uppercase tracking-widest font-black block">
                          ⚡ IMMEDIATE NOTIFICATION PING
                        </span>
                        <p className="text-zinc-400 text-[10.5px] leading-relaxed font-sans">
                          Alert our atelier directly to expedite customized assembly and prompt shipping preparations:
                        </p>
                        <div className="grid grid-cols-2 gap-2 mt-1 font-mono text-[10px]">
                          <a
                            href={`https://wa.me/${adminWhatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                              `*CACTUS BEAR DESIGN LABS - NEW PRE-ORDER DESIGNATED*\n` +
                              `---------------------------------------------\n` +
                              `*Order Reference:* ${orderHash}\n` +
                              `*Patron Name:* ${shippingForm.name}\n` +
                              `*Patron Email:* ${shippingForm.email}\n` +
                              `*Contact Number:* ${shippingForm.phone}\n` +
                              `*Delivery Location Area:* ${shippingForm.address}, ${shippingForm.city}, ${shippingForm.country}\n` +
                              `---------------------------------------------\n` +
                              `*ITEMS:* \n` +
                              cart.map(item => `• ${item.quantity}x ${item.product.name} (Size: ${item.selectedSize}, Color: ${item.selectedColor.name})`).join("\n") +
                              `\n---------------------------------------------\n` +
                              `*TOTAL VALUE:* $${vaultTotal}.00 (approx. ₦${(vaultTotal * 1500).toLocaleString()})\n` +
                              `*CACTUS BEAR SECURE PLATFORM TRACKER - LAGOS, NIGERIA*`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#25D366] hover:bg-[#20ba5a] text-black font-extrabold py-3.5 tracking-wider uppercase text-center flex items-center justify-center gap-1.5 transition-all text-[11px]"
                            title="Forward pre-order details on WhatsApp"
                          >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.154-.173.206-.297.307-.497.102-.198.05-.371-.026-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.706 1.458h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
                            </svg>
                            WHATSAPP
                          </a>
                          
                          <a
                            href={`mailto:${adminEmail.trim()}?subject=${encodeURIComponent(`Cactus Bear Pre-Order ${orderHash}`)}&body=${encodeURIComponent(
                              `CACTUS BEAR DESIGN LABS - NEW PRE-ORDER DESIGNATED\n` +
                              `---------------------------------------------\n` +
                              `Order Reference: ${orderHash}\n` +
                              `Patron Name: ${shippingForm.name}\n` +
                              `Patron Email: ${shippingForm.email}\n` +
                              `Contact Number: ${shippingForm.phone}\n` +
                              `Delivery Location Area: ${shippingForm.address}, ${shippingForm.city}, ${shippingForm.country}\n` +
                              `---------------------------------------------\n` +
                              `ITEMS: \n` +
                              cart.map(item => `• ${item.quantity}x ${item.product.name} (Size: ${item.selectedSize}, Color: ${item.selectedColor.name})`).join("\n") +
                              `\n---------------------------------------------\n` +
                              `TOTAL VALUE: $${vaultTotal}.00 (approx. ₦${(vaultTotal * 1500).toLocaleString()})\n` +
                              `CACTUS BEAR SECURE PLATFORM TRACKER - LAGOS, NIGERIA`
                            )}`}
                            className="bg-white hover:bg-[#EFFF00] text-black font-extrabold py-3.5 tracking-wider uppercase text-center flex items-center justify-center gap-1.5 transition-all text-[11px]"
                            title="Forward pre-order details on Email"
                          >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                            </svg>
                            EMAIL PING
                          </a>
                        </div>
                      </div>

                      <div className="border border-zinc-900 bg-zinc-950 p-3 mt-1">
                        <span className="font-mono text-[9px] text-[#EFFF00] tracking-wide block uppercase">
                          No payment needed now
                        </span>
                        <p className="text-zinc-500 text-[9px] uppercase font-mono mt-1">
                          No charges have been made. You will receive a link to checkout once the collection officially launches.
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
                    <span className="text-white">
                      ${cartSubtotal}.00 <span className="text-[10px] text-zinc-500 font-normal">(₦{(cartSubtotal * 1500).toLocaleString()})</span>
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>STANDARD SHIPPING:</span>
                    <span className="text-[#EFFF00] font-bold">
                      {coreShippingFee === 0 ? "FREE" : `$${coreShippingFee}.00`}
                      {coreShippingFee > 0 && <span className="text-[10px] text-zinc-500 font-normal ml-1">(₦{(coreShippingFee * 1500).toLocaleString()})</span>}
                    </span>
                  </div>
                  <div className="border-t border-zinc-950 pt-3 flex justify-between items-center text-sm font-semibold">
                    <span className="font-sans font-black tracking-wide text-white">TOTAL VALUE:</span>
                    <span className="text-xl font-extrabold text-[#EFFF00] select-all">
                      ${vaultTotal}.00 <span className="text-xs text-zinc-400 font-normal block md:inline md:ml-1.5 mt-0.5">(₦{(vaultTotal * 1500).toLocaleString()})</span>
                    </span>
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
