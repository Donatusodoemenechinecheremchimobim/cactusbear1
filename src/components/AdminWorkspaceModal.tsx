import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Trash2, ShieldAlert, BadgeCheck, ClipboardList, Package, Truck, Calendar, Cpu, Terminal, Activity, Link2, RefreshCw, Upload } from "lucide-react";
import { Product, ProductCat, ApparelColor } from "../types";
import { dbService, DbOrder, uploadProductImage } from "../services/firebase";

interface AdminWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshProducts: () => void; // Trigger catalog update in parent
}

export default function AdminWorkspaceModal({
  isOpen,
  onClose,
  onRefreshProducts
}: AdminWorkspaceModalProps) {
  const [activeTab, setActiveTab] = useState<"products" | "deliveries" | "timer" | "automation">("products");

  // State cache
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<DbOrder[]>([]);

  // Upcoming Drop Timer States
  const [tHeading, setTHeading] = useState<string>("SÉRIE INCOMING // JULY SPECIALIST");
  const [tSubheading, setTSubheading] = useState<string>("THE SAGE THORN DOUBLE-PLEAT PARACHUTE CARGOS");
  const [tTargetDate, setTTargetDate] = useState<string>("");
  const [tDescription, setTDescription] = useState<string>("");
  const [tIsActivated, setTIsActivated] = useState<boolean>(true);
  const [tNotifyEmails, setTNotifyEmails] = useState<string[]>([]);
  const [tAdminWhatsapp, setTAdminWhatsapp] = useState<string>("2348123456789");
  const [tAdminEmail, setTAdminEmail] = useState<string>("chibundusadiq@gmail.com");
  const [saveConfirmed, setSaveConfirmed] = useState<boolean>(false);

  // Async Loading States for Action Buttons
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [isSavingTimer, setIsSavingTimer] = useState<boolean>(false);
  const [isSavingAutomation, setIsSavingAutomation] = useState<boolean>(false);
  const [isTriggeringTest, setIsTriggeringTest] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [imageUploadError, setImageUploadError] = useState<string>("");
  const [productPublishError, setProductPublishError] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Direct Autolink (Make Alternates) Configurations
  const [webEnabled, setWebEnabled] = useState<boolean>(() => localStorage.getItem("cactus_bear_autom_webhook_enabled") === "true");
  const [webUrl, setWebUrl] = useState<string>(() => localStorage.getItem("cactus_bear_autom_webhook_url") || "");

  const [slEnabled, setSlEnabled] = useState<boolean>(() => localStorage.getItem("cactus_bear_autom_slack_enabled") === "true");
  const [slUrl, setSlUrl] = useState<string>(() => localStorage.getItem("cactus_bear_autom_slack_url") || "");

  const [dcEnabled, setDcEnabled] = useState<boolean>(() => localStorage.getItem("cactus_bear_autom_discord_enabled") === "true");
  const [dcUrl, setDcUrl] = useState<string>(() => localStorage.getItem("cactus_bear_autom_discord_url") || "");

  // Email Notification States
  const [emailEnabled, setEmailEnabled] = useState<boolean>(() => localStorage.getItem("cactus_bear_autom_email_enabled") !== "false");
  const [emailTarget, setEmailTarget] = useState<string>(() => localStorage.getItem("cactus_bear_autom_email_target") || "chibundusadiq@gmail.com");
  const [emailKey, setEmailKey] = useState<string>(() => localStorage.getItem("cactus_bear_autom_email_key") || "xojzazgo");

  // WhatsApp Notification States
  const [whatsappEnabled, setWhatsappEnabled] = useState<boolean>(() => localStorage.getItem("cactus_bear_autom_whatsapp_enabled") === "true");
  const [whatsappPhone, setWhatsappPhone] = useState<string>(() => localStorage.getItem("cactus_bear_autom_whatsapp_phone") || "2348123456789");
  const [whatsappApiKey, setWhatsappApiKey] = useState<string>(() => localStorage.getItem("cactus_bear_autom_whatsapp_apikey") || "");
  const [whatsappWebhook, setWhatsappWebhook] = useState<string>(() => localStorage.getItem("cactus_bear_autom_whatsapp_webhook") || "");

  const [automLogs, setAutomLogs] = useState<any[]>([]);

  // Trigger loading logs whenever the layout is opened / tab changes
  useEffect(() => {
    if (isOpen || activeTab === "automation") {
      try {
        const loaded = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
        setAutomLogs(loaded);
      } catch {}
    }
  }, [isOpen, activeTab]);

  // File Upload Handlers for Product Image
  const [dragActive, setDragActive] = useState<boolean>(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFileUpload(file);
  };

  const processFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setImageUploadError("Invalid file type. Please select an image.");
      return;
    }
    setIsUploadingImage(true);
    setImageUploadError("");
    try {
      const uploadedUrl = await uploadProductImage(file);
      setPImage(uploadedUrl);
    } catch (err: any) {
      console.error(err);
      setImageUploadError(err?.message || "File upload failed.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSaveAutomationConfigs = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAutomation(true);
    try {
      localStorage.setItem("cactus_bear_autom_webhook_enabled", String(webEnabled));
      localStorage.setItem("cactus_bear_autom_webhook_url", webUrl.trim());
      localStorage.setItem("cactus_bear_autom_slack_enabled", String(slEnabled));
      localStorage.setItem("cactus_bear_autom_slack_url", slUrl.trim());
      localStorage.setItem("cactus_bear_autom_discord_enabled", String(dcEnabled));
      localStorage.setItem("cactus_bear_autom_discord_url", dcUrl.trim());

      // Save Email configurations
      localStorage.setItem("cactus_bear_autom_email_enabled", String(emailEnabled));
      localStorage.setItem("cactus_bear_autom_email_target", emailTarget.trim());
      localStorage.setItem("cactus_bear_autom_email_key", emailKey.trim());

      // Save WhatsApp configurations
      localStorage.setItem("cactus_bear_autom_whatsapp_enabled", String(whatsappEnabled));
      localStorage.setItem("cactus_bear_autom_whatsapp_phone", whatsappPhone.trim());
      localStorage.setItem("cactus_bear_autom_whatsapp_apikey", whatsappApiKey.trim());
      localStorage.setItem("cactus_bear_autom_whatsapp_webhook", whatsappWebhook.trim());

      // Simulate network save latency
      await new Promise(resolve => setTimeout(resolve, 600));

      setSaveConfirmed(true);
      setTimeout(() => setSaveConfirmed(false), 3000);
    } finally {
      setIsSavingAutomation(false);
    }
  };

  const handleClearAutomationLogs = () => {
    localStorage.removeItem("cactus_bear_autom_logs");
    setAutomLogs([]);
  };

  const handleTriggerManualTestRun = async () => {
    setIsTriggeringTest(true);
    const promises: Promise<any>[] = [];

    // Generate mock pre-order payload with streetwear vibes
    const testOrder = {
      id: "CB-OR-MOCK-" + Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase(),
      email: "chibundusadiq@theatelier.com",
      createdAt: new Date().toISOString(),
      status: "Processing",
      totalPrice: 420,
      items: [
        { product: { name: "01 // OVERSIZED HOODIE", price: 210, sku: "CB-HD-01" }, selectedSize: "XL", selectedColor: { name: "Obsidian Black", hex: "#0c0c0d" }, quantity: 1 },
        { product: { name: "02 // BOXY JERSEY TEE", price: 90, sku: "CB-TE-01" }, selectedSize: "L", selectedColor: { name: "Alabaster White", hex: "#FFFFFF" }, quantity: 2 }
      ],
      shippingAddress: {
        fullName: "Sadiq Chibundu",
        city: "Lagos",
        state: "Lagos State",
        phone: "+2348123456789",
        addressLine: "Heir Apparent Studio, 12 Victoria Island"
      }
    };

    try {
      // Save current states first to verify
      localStorage.setItem("cactus_bear_autom_webhook_enabled", String(webEnabled));
      localStorage.setItem("cactus_bear_autom_webhook_url", webUrl.trim());
      localStorage.setItem("cactus_bear_autom_slack_enabled", String(slEnabled));
      localStorage.setItem("cactus_bear_autom_slack_url", slUrl.trim());
      localStorage.setItem("cactus_bear_autom_discord_enabled", String(dcEnabled));
      localStorage.setItem("cactus_bear_autom_discord_url", dcUrl.trim());
      localStorage.setItem("cactus_bear_autom_email_enabled", String(emailEnabled));
      localStorage.setItem("cactus_bear_autom_email_target", emailTarget.trim());
      localStorage.setItem("cactus_bear_autom_email_key", emailKey.trim());
      localStorage.setItem("cactus_bear_autom_whatsapp_enabled", String(whatsappEnabled));
      localStorage.setItem("cactus_bear_autom_whatsapp_phone", whatsappPhone.trim());
      localStorage.setItem("cactus_bear_autom_whatsapp_apikey", whatsappApiKey.trim());
      localStorage.setItem("cactus_bear_autom_whatsapp_webhook", whatsappWebhook.trim());

      const detailedItemsList = testOrder.items.map((it, i) => {
        const pName = it.product.name;
        const sku = it.product.sku || "N/A";
        const size = it.selectedSize;
        const color = it.selectedColor.name;
        const qty = it.quantity || 1;
        const price = it.product.price;
        const total = price * qty;
        return `[Item ${i + 1}] ${pName}\n` +
               `   • SKU/ID: ${sku}\n` +
               `   • Size: ${size}\n` +
               `   • Color: ${color}\n` +
               `   • Quantity: ${qty}\n` +
               `   • Unit Price: $${price} USD\n` +
               `   • Total for Item: $${total} USD`;
      }).join("\n\n");

      const formattedMessage = 
        `✦ MANUAL TEST CACTUS BEAR ORDER: ${testOrder.id} ✦\n\n` +
        `• Customer Email: ${testOrder.email}\n` +
        `• Customer Name: ${testOrder.shippingAddress.fullName}\n` +
        `• Contact Phone: ${testOrder.shippingAddress.phone}\n\n` +
        `• Shipping Address:\n` +
        `  ${testOrder.shippingAddress.addressLine}\n` +
        `  City: ${testOrder.shippingAddress.city}\n` +
        `  Country: Nigeria\n\n` +
        `• Total Value NGN (₦1,500/$1 Conversion): ₦${(testOrder.totalPrice * 1500).toLocaleString()}\n` +
        `• Total Value USD: $${testOrder.totalPrice} USD\n\n` +
        `• Items Breakdown:\n\n${detailedItemsList}\n\n` +
        `✦ END OF TEST DISPATCH ✦`;

      const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
      const localTestLog = {
        id: "log-" + Math.floor(Math.random() * 100000),
        timestamp: new Date().toISOString(),
        type: "MANUAL TRIGGER TEST",
        payload: { orderId: testOrder.id, value: 420 },
        status: 200,
        statusText: "Initiating multi-channel test dispatch..."
      };

      const updated = [localTestLog, ...currentLogs].slice(0, 50);
      localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updated));
      setAutomLogs(updated);

      // Now dispatch Email if enabled
      if (emailEnabled && emailTarget) {
        const emailEndpoint = `https://formspree.io/f/${emailKey || "xojzazgo"}`;
        
        const emProm = fetch(emailEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            _subject: `✦ MANUAL TEST: CACTUS BEAR ORDER [ID: ${testOrder.id}] - ${testOrder.shippingAddress.fullName} ✦`,
            recipient: emailTarget,
            message: formattedMessage,
            name: testOrder.shippingAddress.fullName,
            email: testOrder.email,
            phone: testOrder.shippingAddress.phone,
            shippingAddress: testOrder.shippingAddress.addressLine,
            city: testOrder.shippingAddress.city,
            country: "Nigeria",
            orderId: testOrder.id,
            totalNgn: `₦${(testOrder.totalPrice * 1500).toLocaleString()}`,
            totalUsd: `$${testOrder.totalPrice}`,
            itemsOrdered: testOrder.items.map((it) => `${it.product.name} (Size: ${it.selectedSize || "N/A"}, Color: ${it.selectedColor?.name || "N/A"}, Qty: ${it.quantity || 1})`).join("; "),
            itemsOrderedDetailed: detailedItemsList,
            creationDate: new Date().toISOString(),
            isManualTest: true
          })
        }).catch(() => {});
        promises.push(emProm);
      }

      // Dispatch WhatsApp if enabled
      if (whatsappEnabled && whatsappPhone) {
        const logEntry = {
          id: "log-" + Math.floor(Math.random() * 100000),
          timestamp: new Date().toISOString(),
          type: "WHATSAPP DISPATCH",
          payload: { phone: whatsappPhone, orderId: testOrder.id },
          status: 102,
          statusText: "Sending WhatsApp Alert..."
        };

        if (whatsappWebhook) {
          const waProm = fetch(whatsappWebhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ to: whatsappPhone, message: formattedMessage, orderId: testOrder.id })
          })
          .then(res => {
            logEntry.status = res.status;
            logEntry.statusText = res.ok ? "Custom Hook Posted Successfully" : "Webhook Connection Failed";
            const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
            const updatedLogs = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
            localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updatedLogs));
            setAutomLogs(updatedLogs);
          })
          .catch(err => {
            logEntry.status = 503;
            logEntry.statusText = err?.message || "WhatsApp Webhook Error";
            const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
            const updatedLogs = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
            localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updatedLogs));
            setAutomLogs(updatedLogs);
          });
          promises.push(waProm);
        } else if (whatsappApiKey) {
          const cleanPhone = whatsappPhone.replace(/\D/g, "");
          const encoded = encodeURIComponent(formattedMessage);
          const cbProm = fetch(`https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encoded}&apikey=${whatsappApiKey.trim()}`, { mode: "no-cors" })
          .then(() => {
            logEntry.status = 200;
            logEntry.statusText = "Dispatched via CallMeBot Bot Channel";
            const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
            const updatedLogs = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
            localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updatedLogs));
            setAutomLogs(updatedLogs);
          })
          .catch(err => {
            logEntry.status = 502;
            logEntry.statusText = err?.message || "WhatsApp API Request Timeout";
            const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
            const updatedLogs = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
            localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updatedLogs));
            setAutomLogs(updatedLogs);
          });
          promises.push(cbProm);
        }
      }

      // Now dispatch the webhooks
      if (webEnabled && webUrl) {
        const webProm = fetch(webUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(testOrder)
        }).catch(() => {});
        promises.push(webProm);
      }
      if (slEnabled && slUrl) {
        const slackMessage = `✦ *MANUAL AUTOMATION HUB TEST RUN SUCCESSFUL:* ${testOrder.id} ✦`;
        const slProm = fetch(slUrl, {
          method: "POST",
          mode: "no-cors",
          body: JSON.stringify({ text: slackMessage })
        }).catch(() => {});
        promises.push(slProm);
      }
      if (dcEnabled && dcUrl) {
        const dcProm = fetch(dcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: `✦ MANUAL AUTOMATION HUB TEST RUN SUCCESSFUL: ${testOrder.id} ✦` })
        }).catch(() => {});
        promises.push(dcProm);
      }

      await Promise.allSettled(promises);
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (e) {
      console.error(e);
    } finally {
      setIsTriggeringTest(false);
    }
  };

  // Form states for creating a new product
  const [pName, setPName] = useState<string>("");
  const [pPrice, setPPrice] = useState<number>(120);
  const [pCategory, setPCategory] = useState<ProductCat>("Tees");
  const [pSku, setPSku] = useState<string>("");
  const [pDescription, setPDescription] = useState<string>("");
  const [pMockupType, setPMockupType] = useState<Product["mockupType"]>("tee");
  const [pImage, setPImage] = useState<string>("");
  
  // Custom details list
  const [detailInput, setDetailInput] = useState<string>("");
  const [pDetails, setPDetails] = useState<string[]>(["Heavy organic fabric run", "Pre-washed vintage style"]);
  
  // Custom colors list
  const [colorName, setColorName] = useState<string>("");
  const [colorHex, setColorHex] = useState<string>("#FFFFFF");
  const [pColors, setPColors] = useState<ApparelColor[]>([
    { name: "Obsidian Black", hex: "#0c0c0d", bgHex: "#0c0c0d" },
    { name: "Alabaster White", hex: "#FFFFFF", bgHex: "#FFFFFF" }
  ]);

  // Sizes checklist
  const [pSizes, setPSizes] = useState<string[]>(["S", "M", "L", "XL"]);

  useEffect(() => {
    const loadInitData = async () => {
      try {
        const prodData = await dbService.getProducts();
        setProducts(prodData);
        
        const ordData = await dbService.getOrders();
        setOrders(ordData);
        
        const timerData = await dbService.getTimerConfig();
        setTHeading(timerData.heading);
        setTSubheading(timerData.subheading);
        setTTargetDate(timerData.targetDate);
        setTDescription(timerData.description);
        setTIsActivated(timerData.isActivated);
        setTNotifyEmails(timerData.notifyEmails || []);
        if (timerData.adminWhatsapp) setTAdminWhatsapp(timerData.adminWhatsapp);
        if (timerData.adminEmail) setTAdminEmail(timerData.adminEmail);
      } catch (err) {
        console.error("Failed to load admin db configurations:", err);
      }
    };
    if (isOpen) {
      loadInitData();
    }
  }, [isOpen]);

  const refreshLocalState = async () => {
    try {
      const p = await dbService.getProducts();
      setProducts(p);
      const o = await dbService.getOrders();
      setOrders(o);
      onRefreshProducts();
    } catch (err) {
      console.error("Failed to refresh admin local state:", err);
    }
  };

  // Add detail bullet
  const handleAddDetail = () => {
    if (detailInput.trim()) {
      setPDetails([...pDetails, detailInput.trim()]);
      setDetailInput("");
    }
  };

  // Remove detail bullet
  const handleRemoveDetail = (index: number) => {
    setPDetails(pDetails.filter((_, idx) => idx !== index));
  };

  // Add color swatch
  const handleAddColor = () => {
    if (colorName.trim() && colorHex) {
      setPColors([...pColors, {
        name: colorName.trim(),
        hex: colorHex,
        bgHex: colorHex,
        isYellowTint: colorHex.toLowerCase() === "#efff00"
      }]);
      setColorName("");
    }
  };

  // Remove color swatch
  const handleRemoveColor = (index: number) => {
    setPColors(pColors.filter((_, idx) => idx !== index));
  };

  // Toggle size
  const handleToggleSize = (size: string) => {
    if (pSizes.includes(size)) {
      setPSizes(pSizes.filter(s => s !== size));
    } else {
      setPSizes([...pSizes, size]);
    }
  };

  // Submit Product creation
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pSku) return;

    setIsPublishing(true);
    setProductPublishError("");
    try {
      const newProduct: Product = {
        id: "prod-" + pSku.toLowerCase().trim() + "-" + Math.floor(Math.random() * 1000),
        name: pName.toUpperCase().trim(),
        category: pCategory,
        price: pPrice,
        sku: pSku.toUpperCase().trim(),
        description: pDescription.trim(),
        details: pDetails,
        sizes: pSizes,
        colors: pColors,
        mockupType: pMockupType,
        imageUrl: pImage.trim() || undefined
      };

      await dbService.addProduct(newProduct);
      await refreshLocalState();

      // Reset Form
      setPName("");
      setPPrice(120);
      setPCategory("Tees");
      setPSku("");
      setPDescription("");
      setPMockupType("tee");
      setPImage("");
      setPDetails(["Heavy organic fabric run", "Pre-washed vintage style"]);
      setPColors([
        { name: "Obsidian Black", hex: "#0c0c0d", bgHex: "#0c0c0d" },
        { name: "Alabaster White", hex: "#FFFFFF", bgHex: "#FFFFFF" }
      ]);
      setPSizes(["S", "M", "L", "XL"]);
    } catch (err: any) {
      console.error(err);
      let msg = err?.message || String(err);
      if (msg.includes("permission-denied") || msg.includes("insufficient permissions")) {
        setProductPublishError("Permission Denied: To publish a product, please log in with your admin account (chibundusadiq@gmail.com). Guest sessions are not authorized to edit products.");
      } else {
        setProductPublishError("Fail to publish: " + msg);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  // Delete product action
  const handleDeleteProduct = async (id: string) => {
    await dbService.deleteProduct(id);
    await refreshLocalState();
  };

  // Change delivery status dropdown
  const handleStatusChange = async (orderId: string, status: DbOrder["status"]) => {
    await dbService.updateOrderStatus(orderId, status);
    await refreshLocalState();
  };

  // Save countdown timer configuration
  const handleSaveTimerConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTimer(true);
    try {
      await dbService.saveTimerConfig({
        id: "active-drop-config",
        heading: tHeading.trim(),
        subheading: tSubheading.trim(),
        targetDate: tTargetDate,
        description: tDescription.trim(),
        isActivated: tIsActivated,
        notifyEmails: tNotifyEmails,
        adminWhatsapp: tAdminWhatsapp.trim(),
        adminEmail: tAdminEmail.trim()
      });
      setSaveConfirmed(true);
      setTimeout(() => setSaveConfirmed(false), 3000);
      onRefreshProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingTimer(false);
    }
  };

  // Remove email subscriber from countdown notification list
  const handleRemoveSubscriber = async (emailToRemove: string) => {
    const updatedEmails = tNotifyEmails.filter(e => e !== emailToRemove);
    setTNotifyEmails(updatedEmails);
    await dbService.saveTimerConfig({
      id: "active-drop-config",
      heading: tHeading.trim(),
      subheading: tSubheading.trim(),
      targetDate: tTargetDate,
      description: tDescription.trim(),
      isActivated: tIsActivated,
      notifyEmails: updatedEmails,
      adminWhatsapp: tAdminWhatsapp.trim(),
      adminEmail: tAdminEmail.trim()
    });
    onRefreshProducts();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay mask */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 pointer-events-auto"
          />

          {/* Large Dashboard container */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 top-12 bg-[#080809] border-t border-zinc-900 z-50 text-white flex flex-col pointer-events-auto overflow-hidden rounded-t-2xl"
          >
            {/* Header section admin */}
            <div className="p-6 border-b border-zinc-900 bg-black/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <BadgeCheck size={18} className="text-[#EFFF00]" />
                  <span className="font-mono text-xs tracking-[0.2em] text-[#EFFF00] uppercase font-bold">
                    STUDIO WORKSPACE • ATELIER CONFIGURATION
                  </span>
                </div>
                <h2 className="text-3xl font-sans font-black tracking-tight mt-1 uppercase">
                  CHIBUNDUSADIQ <span className="text-[#EFFF00]">CREATIVE STUDIO</span>
                </h2>
              </div>
              {/* Toggles and Close button */}
              <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-start w-full md:w-auto">
                <div className="flex flex-1 md:flex-initial overflow-x-auto scrollbar-none bg-black border border-zinc-900 p-1 rounded-none font-mono text-[9px] sm:text-[10px] tracking-wider">
                  <button
                    onClick={() => setActiveTab("products")}
                    className={`px-3 sm:px-4 py-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === "products"
                        ? "bg-[#EFFF00] text-black font-extrabold"
                        : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    COLLECTION CATALOG
                  </button>
                  <button
                    onClick={() => setActiveTab("deliveries")}
                    className={`px-3 sm:px-4 py-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === "deliveries"
                        ? "bg-[#EFFF00] text-black font-extrabold"
                        : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    CLIENT PRE-ORDERS ({orders.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("timer")}
                    className={`px-3 sm:px-4 py-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === "timer"
                        ? "bg-[#EFFF00] text-black font-extrabold"
                        : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    UPCOMING DROP
                  </button>
                  <button
                    onClick={() => setActiveTab("automation")}
                    className={`px-3 sm:px-4 py-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === "automation"
                        ? "bg-[#EFFF00] text-black font-extrabold"
                        : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    AUTOMATION HUB
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="w-10 h-10 border border-zinc-900 hover:border-red-500 bg-black flex items-center justify-center text-zinc-400 hover:text-white transition-all rounded-none cursor-pointer shrink-0"
                  title="Close Platform Admin"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Dashboard main core workspace */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#09090a]">
              
              {/* TAB 1: PRODUCT CREATION AND CATALOG MODIFIER */}
              {activeTab === "products" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left panel: builder form */}
                  <form onSubmit={handleCreateProduct} className="lg:col-span-5 bg-black border border-zinc-900 p-6 flex flex-col gap-5">
                    <span className="text-xs font-mono text-[#EFFF00] tracking-widest block uppercase border-b border-zinc-900 pb-2">
                      ✦ DESIGN NEW COLLECTION PIECE
                    </span>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="font-mono text-[9px] text-zinc-500 uppercase">PIECE DESIGN NAME</label>
                        <input
                          required
                          type="text"
                          value={pName}
                          onChange={(e) => setPName(e.target.value)}
                          className="bg-zinc-950 border border-zinc-900 py-1.5 px-3 font-mono text-xs focus:border-[#EFFF00]"
                          placeholder="Woodland Camo Jersey..."
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-mono text-[9px] text-zinc-500 uppercase">SKU REFERENCE CODE</label>
                        <input
                          required
                          type="text"
                          value={pSku}
                          onChange={(e) => setPSku(e.target.value)}
                          className="bg-zinc-950 border border-zinc-900 py-1.5 px-3 font-mono text-xs focus:border-[#EFFF00]"
                          placeholder="CB-CAMO-POLO"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="font-mono text-[9px] text-zinc-500 uppercase">RETAIL PRICE ($ USD)</label>
                        <input
                          required
                          type="number"
                          value={pPrice}
                          onChange={(e) => setPPrice(parseInt(e.target.value) || 0)}
                          className="bg-zinc-950 border border-zinc-900 py-1.5 px-3 font-mono text-xs focus:border-[#EFFF00]"
                          min="1"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-mono text-[9px] text-zinc-500 uppercase">COLLECTION CATEGORY</label>
                        <select
                          value={pCategory}
                          onChange={(e) => setPCategory(e.target.value as ProductCat)}
                          className="bg-zinc-950 border border-zinc-900 py-1.5 px-3 font-mono text-xs focus:border-[#EFFF00] text-white"
                        >
                          <option value="Tees">TEES</option>
                          <option value="Outerwear">OUTERWEAR</option>
                          <option value="Headwear">HEADWEAR</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="font-mono text-[9px] text-zinc-500 uppercase">GARMENT SILHOUETTE</label>
                        <select
                          value={pMockupType}
                          onChange={(e) => setPMockupType(e.target.value as Product["mockupType"])}
                          className="bg-zinc-950 border border-zinc-900 py-1.5 px-3 font-mono text-xs focus:border-[#EFFF00] text-white animate-pulse"
                        >
                          <option value="tee">BOXY TEE SHAPE</option>
                          <option value="hoodie">OVERSIZED HOODIE</option>
                          <option value="puffer">QUILTED PUFFER</option>
                          <option value="cap">TRUCKER / BEANIE</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-mono text-[9px] text-zinc-500 uppercase">AVAILABLE SIZES</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {["S", "M", "L", "XL", "XXL"].map(size => {
                            const isSelected = pSizes.includes(size);
                            return (
                              <button
                                key={size}
                                type="button"
                                onClick={() => handleToggleSize(size)}
                                className={`px-2 py-0.5 border font-mono text-[9px] tracking-tighter ${
                                  isSelected ? "bg-white text-black border-white" : "border-zinc-900 text-zinc-500 hover:border-zinc-750"
                                }`}
                              >
                                {size}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-[9px] text-zinc-500 uppercase flex justify-between items-center">
                        <span>PIECE DESIGN IMAGE (FIREBASE STORAGE & FALLBACK)</span>
                        {pImage && (
                          <button
                            type="button"
                            onClick={() => setPImage("")}
                            className="text-[8px] text-red-400 hover:text-red-300 font-bold tracking-widest uppercase cursor-pointer"
                          >
                            ✕ CLEAR IMAGE
                          </button>
                        )}
                      </label>
                      
                      {/* Hidden Input File Element */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />

                      {/* Drag & Drop Visual Area */}
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border border-dashed rounded-none p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[110px] relative overflow-hidden group ${
                          dragActive
                            ? "border-[#EFFF00] bg-[#EFFF00]/5"
                            : pImage
                            ? "border-zinc-800 bg-zinc-950/20"
                            : "border-zinc-900 bg-zinc-950 hover:border-[#EFFF00]/40"
                        }`}
                      >
                        {isUploadingImage ? (
                          <div className="flex flex-col items-center gap-2">
                            <RefreshCw className="animate-spin text-[#EFFF00]" size={20} />
                            <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
                              Uploading design to Cloud Storage...
                            </span>
                          </div>
                        ) : pImage ? (
                          <div className="flex items-center gap-3 w-full">
                            <div className="w-14 h-14 bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 relative overflow-hidden">
                              <img
                                src={pImage}
                                alt="Uploaded preview"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <span className="font-mono text-[9px] text-zinc-500 block uppercase tracking-wider">Active Product Image</span>
                              <span className="font-mono text-[10.5px] text-[#EFFF00] block truncate pr-4">
                                {pImage.startsWith("data:") ? "✦ SECURE CLIENT-SIDE DATA STORE (BASE64)" : pImage}
                              </span>
                              <span className="font-mono text-[8.5px] text-zinc-500 block">Click or Drop another file to replace</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5 py-1">
                            <Upload className="text-zinc-600 group-hover:text-[#EFFF00] transition-colors" size={18} />
                            <div className="font-mono text-[10px] text-zinc-400">
                              DRAG & DROP DESIGN PICTURE OR <strong className="text-white group-hover:text-[#EFFF00] transition-all">BROWSE FILE</strong>
                            </div>
                            <span className="font-mono text-[8px] text-zinc-600 uppercase tracking-widest block">
                              Supports JPG, PNG, WEBP (Auto-Compressed client-side)
                            </span>
                          </div>
                        )}
                      </div>

                      {imageUploadError && (
                        <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider mt-1 block">
                          ⚠ {imageUploadError}
                        </span>
                      )}

                      {/* Manual Image URL Field */}
                      <input
                        type="text"
                        value={pImage}
                        onChange={(e) => setPImage(e.target.value)}
                        className="bg-zinc-950 border border-zinc-900 py-1 px-3.5 font-mono text-[10px] focus:border-[#EFFF00] text-[#EFFF00] tracking-tight placeholder:text-zinc-700"
                        placeholder="Or customize manually (e.g. Unsplash URL)"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[9px] text-zinc-500 uppercase">EDITORIAL DESCRIPTION</label>
                      <textarea
                        value={pDescription}
                        onChange={(e) => setPDescription(e.target.value)}
                        className="bg-zinc-950 border border-zinc-900 py-1.5 px-3 font-mono text-xs focus:border-[#EFFF00] h-16 resize-none"
                        placeholder="Premium grade heavy mesh details..."
                      />
                    </div>

                    {/* Specifications List Editor */}
                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[9px] text-zinc-500 uppercase block">MATERIAL SPECS & BULLETS ({pDetails.length})</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={detailInput}
                          onChange={(e) => setDetailInput(e.target.value)}
                          className="bg-zinc-950 border border-zinc-900 py-1 px-3 font-mono text-xs focus:border-[#EFFF00] flex-1"
                          placeholder="e.g. 380GSM Ring-spun cotton"
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddDetail())}
                        />
                        <button
                          type="button"
                          onClick={handleAddDetail}
                          className="bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-[10px] px-3 border border-zinc-800"
                        >
                          ADD
                        </button>
                      </div>
                      <ul className="flex flex-col gap-1 max-h-24 overflow-y-auto bg-zinc-950 p-2 border border-zinc-900">
                        {pDetails.map((det, i) => (
                          <li key={i} className="flex justify-between items-center font-mono text-[9px] text-zinc-400">
                            <span className="truncate">❯ {det}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDetail(i)}
                              className="text-red-400 hover:text-red-200"
                            >
                              DELETE
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Colors Options Swatch builder */}
                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[9px] text-zinc-500 uppercase block">GARMENT COLORWAYS ({pColors.length})</label>
                      <div className="grid grid-cols-12 gap-2">
                        <input
                          type="text"
                          value={colorName}
                          onChange={(e) => setColorName(e.target.value)}
                          className="col-span-6 bg-zinc-950 border border-zinc-900 py-1 px-2 font-mono text-xs focus:border-[#EFFF00]"
                          placeholder="e.g. Army Camo"
                        />
                        <input
                          type="color"
                          value={colorHex}
                          onChange={(e) => setColorHex(e.target.value)}
                          className="col-span-3 bg-transparent h-7 w-full border border-zinc-900 cursor-pointer p-0"
                        />
                        <button
                          type="button"
                          onClick={handleAddColor}
                          className="col-span-3 bg-zinc-900 hover:bg-zinc-850 text-white font-mono text-[9px] tracking-tighter"
                        >
                          ADD CLR
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1 max-h-20 overflow-y-auto bg-zinc-950 p-2 border border-zinc-900">
                        {pColors.map((color, i) => (
                          <div
                              key={i}
                              className="bg-black border border-zinc-900 px-2 py-1 flex items-center gap-1.5 font-mono text-[9px]"
                            >
                              <span className="w-2.5 h-2.5 inline-block border border-zinc-850" style={{ backgroundColor: color.hex }} />
                              <span className="truncate max-w-[80px]">{color.name}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveColor(i)}
                                className="text-red-400 hover:text-red-200 ml-1 font-black"
                              >
                                ✕
                              </button>
                            </div>
                        ))}
                      </div>
                    </div>

                    {productPublishError && (
                      <div className="border border-red-950/40 bg-red-950/10 p-3.5 font-mono text-[10px] leading-relaxed text-red-400 mt-1 border-l-2 border-l-red-500">
                        <span className="font-bold block uppercase mb-1 tracking-wider">⚠ PUBLISH FAILED</span>
                        {productPublishError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isPublishing}
                      className="w-full bg-[#EFFF00] hover:bg-[#EFFF22] disabled:bg-zinc-800 disabled:text-zinc-550 text-black font-mono font-black text-xs py-4 tracking-widest uppercase rounded-none mt-2 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isPublishing ? (
                        <>
                          <RefreshCw className="animate-spin text-black" size={14} />
                          PUBLISHING TO ARCHIVE...
                        </>
                      ) : (
                        "PUBLISH DESIGN TO COLLECTION CATALOG"
                      )}
                    </button>
                  </form>

                  {/* Right panel: current catalog inspector view */}
                  <div className="lg:col-span-7 flex flex-col gap-4">
                    <span className="text-xs font-mono text-zinc-500 tracking-widest uppercase">
                      📦 ACTIVE DESIGNS CATALOG ARCHIVE ({products.length})
                    </span>

                    <div className="flex flex-col gap-3 max-h-[750px] overflow-y-auto pr-2">
                      {products.map((prod) => (
                        <div
                          key={prod.id}
                          className="bg-black border border-zinc-900 p-4 flex justify-between gap-4 items-center"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-zinc-950 border border-zinc-900 flex items-center justify-center font-mono font-black text-[#EFFF00] text-xs">
                              {prod.mockupType.toUpperCase()}
                            </div>
                            <div>
                              <code className="text-zinc-600 font-mono text-[9px] tracking-wider block">{prod.sku} // ID: {prod.id}</code>
                              <h4 className="font-sans font-extrabold text-sm uppercase tracking-tight text-white mt-0.5">{prod.name}</h4>
                              <div className="flex flex-wrap gap-3 mt-1.5 text-[9px] font-mono text-zinc-500">
                                <span>PRICE: <strong className="text-[#EFFF00]">${prod.price}</strong></span>
                                <span>CATEGORY: <strong className="text-white">{prod.category}</strong></span>
                                <span>SIZES: <strong className="text-white">{prod.sizes.join(", ")}</strong></span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Color preview rings */}
                            <div className="flex gap-1">
                              {prod.colors.map((color, idx) => (
                                <span
                                  key={idx}
                                  className="w-2.5 h-2.5 rounded-full inline-block border border-zinc-800"
                                  style={{ backgroundColor: color.hex }}
                                  title={color.name}
                                />
                              ))}
                            </div>
                            
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="w-8 h-8 rounded-none border border-zinc-900 hover:border-red-500 text-zinc-500 hover:text-red-400 flex items-center justify-center transition-all bg-zinc-950 cursor-pointer ml-3"
                              title="Delete Product"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: PRE-ORDERS AND FULFILLMENT OPERATIONS */}
              {activeTab === "deliveries" && (
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center bg-black border border-zinc-900 p-4">
                    <div className="flex items-center gap-3">
                      <ClipboardList size={18} className="text-[#EFFF00]" />
                      <div>
                        <span className="font-mono text-[10px] text-zinc-500 block">STUDIO ORDERS STACK</span>
                        <h3 className="text-base font-sans font-black uppercase text-white tracking-widest">
                          PRE-ORDER INTAKE REGISTRY
                        </h3>
                      </div>
                    </div>
                    
                    <span className="font-mono text-xs text-[#EFFF00] tracking-widest bg-zinc-950 border border-zinc-900 p-2 font-bold select-all">
                      [ ATELIER SECURE REGISTRY ]
                    </span>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-24 border border-dashed border-zinc-900">
                      <ShieldAlert size={36} className="text-zinc-650 mx-auto mb-3" />
                      <span className="font-mono text-xs text-zinc-500 block uppercase">
                        NO ACTIVE PRE-ORDERS BOOKED
                      </span>
                      <p className="text-zinc-500 text-[11px] font-sans max-w-xs mx-auto mt-1">
                        Client pre-orders placed at the checkout will dynamically synchronize in this secure studio log.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {orders.map((or) => (
                        <div
                          key={or.id}
                          className="bg-black border border-zinc-900 p-6 flex flex-col md:flex-row justify-between gap-6 items-stretch"
                        >
                          {/* Client & Address Info */}
                          <div className="flex-1 flex flex-col justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-mono text-[#EFFF00] text-xs font-black select-all">
                                  #{or.id}
                                </span>
                                <span className="text-zinc-550 font-mono text-[9px] flex items-center gap-1 leading-none">
                                  <Calendar size={10} />
                                  SUBMITTED: {new Date(or.createdAt).toLocaleString()}
                                </span>
                              </div>

                              <h4 className="font-sans font-extrabold text-base text-white uppercase">{or.name}</h4>
                              <p className="text-zinc-500 font-mono text-[10px] select-all tracking-wide mt-0.5">{or.email}</p>
                              
                              <div className="mt-3 text-zinc-400 font-sans text-xs bg-zinc-950 border border-zinc-900 p-3 rounded-none">
                                <span className="text-[9px] font-mono text-zinc-600 block uppercase font-black mb-1">CLIENT SHIPPING ADDRESS</span>
                                <p className="leading-snug select-all">{or.address}</p>
                                <p className="leading-snug select-all mt-0.5">{or.city}, {or.country}</p>
                              </div>
                            </div>
                          </div>

                          {/* Preordered Items Details */}
                          <div className="flex-1 bg-zinc-950 p-4 border border-zinc-900 flex flex-col justify-between gap-3">
                            <div>
                              <span className="text-[9px] font-mono text-zinc-600 block uppercase font-black mb-2">SELECTED ITEMS & CONFIGURATIONS</span>
                              <div className="flex flex-col gap-3">
                                {or.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-start font-mono text-xs border-b border-zinc-900 pb-2 last:border-b-0 last:pb-0">
                                    <div>
                                      <span className="text-white uppercase font-black">{item.product.name}</span>
                                      <div className="flex gap-3 text-[9px] text-[#EFFF00] mt-0.5">
                                        <span>SIZE: <strong className="text-white">{item.selectedSize}</strong></span>
                                        <span>COLOR: <strong className="text-white">{item.selectedColor.name}</strong></span>
                                        {item.customPrintPosition && (
                                          <span>PLACEMENT: <strong className="text-white">{item.customPrintPosition.toUpperCase()}</strong></span>
                                        )}
                                      </div>
                                    </div>
                                    <span className="text-zinc-500 flex-shrink-0">qty: {item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="border-t border-zinc-900 pt-2 flex justify-between items-center">
                              <span className="font-mono text-[9px] text-zinc-500">TOTAL TRANSACTION AMOUNT:</span>
                              <span className="text-lg font-bold text-[#EFFF00] select-all">${or.totalPrice}.00</span>
                            </div>
                          </div>

                          {/* Fulfill Status dropdown */}
                          <div className="border-l border-zinc-900 pl-0 md:pl-6 flex flex-row md:flex-col justify-between items-start md:items-stretch gap-4 md:w-48 flex-shrink-0">
                            <div className="flex flex-col gap-1.5 w-full">
                              <span className="font-mono text-[9px] text-zinc-500 uppercase">FULFILLMENT STATUS</span>
                              
                              <select
                                value={or.status}
                                onChange={(e) => handleStatusChange(or.id, e.target.value as DbOrder["status"])}
                                className={`w-full font-mono text-[10px] tracking-wider uppercase font-bold text-center border p-2 rounded-none transition-all ${
                                  or.status === "Pending" ? "bg-[#121207] border-yellow-500 text-yellow-500" :
                                  or.status === "Shipped" ? "bg-[#0b1008] border-green-500 text-green-500" :
                                  or.status === "Delivered" ? "bg-zinc-950 border-zinc-750 text-white" :
                                  "bg-zinc-950 border-red-500 text-red-500"
                                }`}
                              >
                                <option value="Pending">PENDING DISPATCH</option>
                                <option value="Shipped">DISPATCHED / SHIPPED</option>
                                <option value="Delivered">CONFIRMED DELIVERED</option>
                                <option value="Canceled">CANCELED SELECTION</option>
                              </select>
                            </div>

                            <div className="flex flex-col gap-1 font-mono text-[9px] text-zinc-500 text-[10px] text-right">
                              <span>STUDIO AUTHENTICITY</span>
                              <span className="text-white font-black">VERIFIED ORDER ID</span>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* TAB 3: UPCOMING DROP TIMER CONFIGURATION */}
              {activeTab === "timer" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Editor controls */}
                  <form onSubmit={handleSaveTimerConfig} className="lg:col-span-6 bg-black border border-zinc-900 p-6 flex flex-col gap-5">
                    <span className="text-xs font-mono text-[#EFFF00] tracking-widest block uppercase border-b border-zinc-900 pb-2">
                      ✦ CONFIGURE UPCOMING DROP & COUNTDOWN TIMER
                    </span>

                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[9px] text-zinc-500 uppercase">DROP HEADER HEADING</label>
                      <input
                        required
                        type="text"
                        value={tHeading}
                        onChange={(e) => setTHeading(e.target.value)}
                        className="bg-zinc-950 border border-zinc-900 py-2 px-3 font-mono text-xs focus:border-[#EFFF00] text-white"
                        placeholder="e.g. SÉRIE INCOMING // JULY SPECIALIST"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[9px] text-zinc-500 uppercase">SUBHEADING / ITEM NAME</label>
                      <input
                        required
                        type="text"
                        value={tSubheading}
                        onChange={(e) => setTSubheading(e.target.value)}
                        className="bg-zinc-950 border border-zinc-900 py-2 px-3 font-mono text-xs focus:border-[#EFFF00] text-white"
                        placeholder="e.g. THE SAGE THORN PARACHUTE CARGOS"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="font-mono text-[9px] text-zinc-500 uppercase">TARGET DATE & TIME</label>
                        <input
                          required
                          type="datetime-local"
                          value={tTargetDate ? tTargetDate.substring(0, 16) : ""}
                          onChange={(e) => {
                            const dateVal = e.target.value ? new Date(e.target.value).toISOString() : tTargetDate;
                            setTTargetDate(dateVal);
                          }}
                          className="bg-zinc-950 border border-zinc-900 py-2 px-3 font-mono text-xs focus:border-[#EFFF00] text-white"
                        />
                        <span className="font-mono text-[8px] text-zinc-500 mt-0.5">DB UTC: {tTargetDate}</span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-mono text-[9px] text-zinc-500 uppercase">ACTIVATION STATUS</label>
                        <select
                          value={tIsActivated ? "true" : "false"}
                          onChange={(e) => setTIsActivated(e.target.value === "true")}
                          className="bg-zinc-950 border border-zinc-900 py-2 px-3 font-mono text-xs focus:border-[#EFFF00] text-white"
                        >
                          <option value="true">ACTIVE ON STOREFRONT (COUNTDOWN RUNNING)</option>
                          <option value="false">PAUSED / DEACTIVATED</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[9px] text-zinc-500 uppercase">RELEASE DESCRIPTION</label>
                      <textarea
                        required
                        value={tDescription}
                        onChange={(e) => setTDescription(e.target.value)}
                        className="bg-zinc-950 border border-zinc-900 py-2 px-3 font-mono text-xs focus:border-[#EFFF00] text-white h-24 resize-none"
                        placeholder="Detail materials, special stitching patterns or release rules..."
                      />
                    </div>

                    {/* IMMEDIATE ORDER NOTIFICATIONS CHANNELS */}
                    <div className="border-t border-zinc-900 pt-4 mt-2 flex flex-col gap-4">
                      <span className="text-xs font-mono text-[#EFFF00] tracking-widest block uppercase">
                        ✦ ORDER NOTIFICATION ROUTING CONFIG
                      </span>
                      <p className="font-sans text-zinc-500 text-[11px] leading-relaxed">
                        Specify the exact WhatsApp telephone number and email inbox address designated to dynamically receive customer pre-order sheets immediately when booking events occur:
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="font-mono text-[9px] text-zinc-500 uppercase">ADMIN INSTANT WHATSAPP NUMBER</label>
                          <input
                            required
                            type="text"
                            value={tAdminWhatsapp}
                            onChange={(e) => setTAdminWhatsapp(e.target.value)}
                            className="bg-zinc-950 border border-zinc-900 py-2 px-3 font-mono text-xs focus:border-[#EFFF00] text-[#EFFF00]"
                            placeholder="e.g. 2348123456789"
                          />
                          <span className="font-mono text-[8px] text-zinc-600 mt-0.5">Numeric integers only, including country code (no + or spaces)</span>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="font-mono text-[9px] text-zinc-500 uppercase">ADMIN NOTIFICATIONS EMAIL</label>
                          <input
                            required
                            type="email"
                            value={tAdminEmail}
                            onChange={(e) => setTAdminEmail(e.target.value)}
                            className="bg-zinc-950 border border-zinc-900 py-2 px-3 font-mono text-xs focus:border-[#EFFF00] text-white"
                            placeholder="you@email.com"
                          />
                          <span className="font-mono text-[8px] text-zinc-600 mt-0.5">Receives pre-population templates upon customer booking matches</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2 border-t border-zinc-900">
                      <button
                        type="submit"
                        disabled={isSavingTimer}
                        className="w-full bg-[#EFFF00] hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-550 text-black font-mono font-black text-xs py-3 tracking-widest transition-colors rounded-none uppercase flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isSavingTimer ? (
                          <>
                            <RefreshCw className="animate-spin text-black" size={13} />
                            SAVING TO FIRESTORE...
                          </>
                        ) : (
                          <>
                            <Calendar size={13} />
                            SAVE COUNTDOWN CONFIG TO FIREBASE DB
                          </>
                        )}
                      </button>

                      <AnimatePresence>
                        {saveConfirmed && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-center text-green-400 font-mono text-[10px] uppercase font-bold py-1 bg-[#0a1008] border border-green-950"
                          >
                            ✦ PERSISTED SUCCESSFULLY IN CLOUD FIRESTORE DB
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </form>

                  {/* Right Column: Subscriber log / Notification Sign-ups */}
                  <div className="lg:col-span-6 bg-[#0b0b0c] border border-zinc-900 p-6 flex flex-col justify-between min-h-[460px]">
                    <div>
                      <span className="font-mono text-[#EFFF00] text-[9px] tracking-widest block uppercase mb-1">
                        ✦ CLIENT REGISTRY
                      </span>
                      <h3 className="text-xl font-sans font-black text-white uppercase tracking-tight">
                        NOTIFICATION SIGN-UPS ({tNotifyEmails.length})
                      </h3>
                      <p className="text-zinc-500 text-xs font-sans mt-1">
                        These clients have requested email alerts the exact second this upcoming drop countdown hits zero.
                      </p>

                      <div className="mt-6 flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
                        {tNotifyEmails.length === 0 ? (
                          <div className="text-center py-12 border border-zinc-900 text-zinc-550 font-mono text-[10px] uppercase">
                            NO CLIENTS REGISTERED YET
                          </div>
                        ) : (
                          tNotifyEmails.map((email, i) => (
                            <div key={i} className="flex justify-between items-center bg-black border border-zinc-900 px-4 py-2.5 font-mono text-xs text-zinc-300">
                              <span className="select-all truncate max-w-[160px] md:max-w-xs">{email}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] text-[#EFFF00] border border-[#EFFF00]/20 bg-zinc-950 px-1.5 py-0.5 font-bold uppercase hidden sm:inline-block">
                                  VERIFIED PATRON
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSubscriber(email)}
                                  className="w-6 h-6 rounded-none border border-zinc-900 hover:border-red-500 text-zinc-500 hover:text-red-400 flex items-center justify-center bg-zinc-950 cursor-pointer transition-colors"
                                  title="Remove Subscriber"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-900 text-zinc-500 font-mono text-[9px] flex justify-between">
                      <span>DB_PATH: /drops/active-drop-config</span>
                      <span>STATUS: RECORDING PRE-ENTRIES</span>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 4: DIRECT AUTOMATIONS HUB (MAKE ALTERNATIVES) */}
              {activeTab === "automation" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Direct Connection Endpoints */}
                  <form onSubmit={handleSaveAutomationConfigs} className="lg:col-span-6 bg-black border border-zinc-900 p-6 flex flex-col gap-5">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                      <div className="flex items-center gap-2">
                        <Cpu size={14} className="text-[#EFFF00]" />
                        <span className="text-xs font-mono text-[#EFFF00] tracking-widest block uppercase font-bold">
                          DIRECT INTEGRATION SETTINGS
                        </span>
                      </div>
                      {saveConfirmed && (
                        <span className="text-[9px] font-mono font-black text-black bg-[#EFFF00] px-2 py-0.5 uppercase tracking-wider">
                          SAVED LEDGER
                        </span>
                      )}
                    </div>

                    <p className="text-zinc-550 text-xs font-sans leading-relaxed">
                      Deploy direct micro-dispatchers to bypass Make.com completely. When new pre-orders are logged in Firestore, the system will fire direct HTTP packets asynchronously.
                    </p>

                    {/* Webhook Connection */}
                    <div className="bg-[#080809] border border-zinc-900 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="font-mono text-[10px] text-zinc-300 uppercase font-black tracking-wider flex items-center gap-1.5 cursor-pointer">
                          <Link2 size={12} className="text-[#EFFF00]" />
                          1. CUSTOM WEBHOOK URL
                        </label>
                        <input
                          type="checkbox"
                          checked={webEnabled}
                          onChange={(e) => setWebEnabled(e.target.checked)}
                          className="accent-[#EFFF00] cursor-pointer"
                        />
                      </div>
                      <input
                        type="url"
                        value={webUrl}
                        onChange={(e) => setWebUrl(e.target.value)}
                        placeholder="https://api.yourdomain.com/v1/preorders"
                        className="w-full bg-black border border-zinc-900 focus:border-[#EFFF00] px-3.5 py-2 font-mono text-xs text-white uppercase tracking-wider outline-none"
                      />
                    </div>

                    {/* Slack Channel Connection */}
                    <div className="bg-[#080809] border border-zinc-900 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="font-mono text-[10px] text-zinc-300 uppercase font-black tracking-wider flex items-center gap-1.5 cursor-pointer">
                          <Activity size={12} className="text-[#EFFF00]" />
                          2. SLACK INCOMING WEBHOOK
                        </label>
                        <input
                          type="checkbox"
                          checked={slEnabled}
                          onChange={(e) => setSlEnabled(e.target.checked)}
                          className="accent-[#EFFF00] cursor-pointer"
                        />
                      </div>
                      <input
                        type="url"
                        value={slUrl}
                        onChange={(e) => setSlUrl(e.target.value)}
                        placeholder="https://hooks.slack.com/services/T00/B00/X00"
                        className="w-full bg-black border border-zinc-900 focus:border-[#EFFF00] px-3.5 py-2 font-mono text-xs text-white uppercase tracking-wider outline-none"
                      />
                    </div>

                    {/* Discord Dispatch Link */}
                    <div className="bg-[#080809] border border-zinc-900 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="font-mono text-[10px] text-zinc-300 uppercase font-black tracking-wider flex items-center gap-1.5 cursor-pointer">
                          <Terminal size={12} className="text-[#EFFF00]" />
                          3. DISCORD SERVER WEBHOOK
                        </label>
                        <input
                          type="checkbox"
                          checked={dcEnabled}
                          onChange={(e) => setDcEnabled(e.target.checked)}
                          className="accent-[#EFFF00] cursor-pointer"
                        />
                      </div>
                      <input
                        type="url"
                        value={dcUrl}
                        onChange={(e) => setDcUrl(e.target.value)}
                        placeholder="https://discord.com/api/webhooks/xxxxxx"
                        className="w-full bg-black border border-zinc-900 focus:border-[#EFFF00] px-3.5 py-2 font-mono text-xs text-white uppercase tracking-wider outline-none"
                      />
                    </div>

                    {/* Email Alerts Setup */}
                    <div className="bg-[#080809] border border-zinc-900 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="font-mono text-[10px] text-zinc-300 uppercase font-black tracking-wider flex items-center gap-1.5 cursor-pointer">
                          <Cpu size={12} className="text-[#EFFF00]" />
                          4. EMAIL ORDERS DISPATCHER
                        </label>
                        <input
                          type="checkbox"
                          checked={emailEnabled}
                          onChange={(e) => setEmailEnabled(e.target.checked)}
                          className="accent-[#EFFF00] cursor-pointer"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <span className="block font-mono text-[8px] text-zinc-550 uppercase">TARGET DESTINATION EMAIL</span>
                        <input
                          type="email"
                          value={emailTarget}
                          onChange={(e) => setEmailTarget(e.target.value)}
                          placeholder="chibundusadiq@gmail.com"
                          className="w-full bg-black border border-zinc-900 focus:border-[#EFFF00] px-3.5 py-2 font-mono text-xs text-white uppercase tracking-wider outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="block font-mono text-[8px] text-zinc-550 uppercase">FORMSPREE TEMPLATE FORM ID (OPTIONAL)</span>
                        <input
                          type="text"
                          value={emailKey}
                          onChange={(e) => setEmailKey(e.target.value)}
                          placeholder="mqaeorze"
                          className="w-full bg-black border border-zinc-900 focus:border-[#EFFF00] px-3.5 py-2 font-mono text-xs text-white uppercase tracking-wider outline-none"
                        />
                      </div>
                    </div>

                    {/* WhatsApp Alerts Setup */}
                    <div className="bg-[#080809] border border-zinc-900 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="font-mono text-[10px] text-zinc-300 uppercase font-black tracking-wider flex items-center gap-1.5 cursor-pointer">
                          <Plus size={12} className="text-[#EFFF00]" />
                          5. WHATSAPP ALERTS DISPATCHER
                        </label>
                        <input
                          type="checkbox"
                          checked={whatsappEnabled}
                          onChange={(e) => setWhatsappEnabled(e.target.checked)}
                          className="accent-[#EFFF00] cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="block font-mono text-[8px] text-zinc-550 uppercase">SADIQ'S WHATSAPP NUMBER (WITH COUNTRY CODE - NO "+" E.G. 2348123456789)</span>
                        <input
                          type="text"
                          value={whatsappPhone}
                          onChange={(e) => setWhatsappPhone(e.target.value)}
                          placeholder="2348123456789"
                          className="w-full bg-black border border-zinc-900 focus:border-[#EFFF00] px-3.5 py-2 font-mono text-xs text-white uppercase tracking-wider outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="block font-mono text-[8px] text-zinc-550 uppercase">CALLMEBOT API KEY</span>
                          <input
                            type="text"
                            value={whatsappApiKey}
                            onChange={(e) => setWhatsappApiKey(e.target.value)}
                            placeholder="e.g. 783267"
                            className="w-full bg-black border border-zinc-900 focus:border-[#EFFF00] px-3.5 py-2 font-mono text-xs text-white uppercase tracking-wider outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="block font-mono text-[8px] text-zinc-550 uppercase">OR CUSTOM WHATSAPP WEBHOOK</span>
                          <input
                            type="url"
                            value={whatsappWebhook}
                            onChange={(e) => setWhatsappWebhook(e.target.value)}
                            placeholder="https://yourtwilio.com"
                            className="w-full bg-black border border-zinc-900 focus:border-[#EFFF00] px-3.5 py-2 font-mono text-xs text-white uppercase tracking-wider outline-none"
                          />
                        </div>
                      </div>

                      <div className="text-[9.5px] font-mono text-zinc-400 bg-black/60 border border-zinc-900 p-3 leading-relaxed uppercase space-y-2.5">
                        <span className="text-[#EFFF00] font-black block tracking-wider">💡 DYNAMIC WHATSAPP ACTIVATION INSTRUCTIONS:</span>
                        <p className="text-zinc-500 normal-case">
                          If CallMeBot didn't respond, one of their server channels may be offline or heavily loaded. Click any active link below to instantly open WhatsApp pre-filled with the activation message:
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <a
                            href="https://wa.me/34644202086?text=I%20allow%20callmebot%20to%20send%20me%20messages"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-zinc-900 hover:bg-[#EFFF00] hover:text-black text-white px-2 py-1 text-[8px] font-bold border border-zinc-800 transition-all uppercase"
                          >
                            ⚡ Server 1 (+34 644 202 086)
                          </a>
                          <a
                            href="https://wa.me/34644105511?text=I%20allow%20callmebot%20to%20send%20me%20messages"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-zinc-900 hover:bg-[#EFFF00] hover:text-black text-white px-2 py-1 text-[8px] font-bold border border-zinc-800 transition-all uppercase"
                          >
                            ⚡ Server 2 (+34 644 105 511)
                          </a>
                          <a
                            href="https://wa.me/34621073433?text=I%20allow%20callmebot%20to%20send%20me%20messages"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-zinc-900 hover:bg-[#EFFF00] hover:text-black text-white px-2 py-1 text-[8px] font-bold border border-zinc-800 transition-all uppercase"
                          >
                            ⚡ Server 3 (+34 621 073 433)
                          </a>
                        </div>
                        <div className="text-zinc-500 space-y-1 pt-1 border-t border-zinc-900/40">
                          <p>1. Click one of the servers above & send the pre-filled text.</p>
                          <p>2. Keep WhatsApp open — Wait up to 120 seconds to receive your API key.</p>
                          <p>3. Copy the numeric key received, paste it into the "CallMeBot API Key" field above and click "COMMIT AUTOMATION ENDPOINTS"!</p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingAutomation}
                      className="w-full bg-[#EFFF00] hover:bg-yellow-400 disabled:bg-zinc-800 disabled:text-zinc-550 text-black font-mono font-black text-xs py-3.5 uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSavingAutomation ? (
                        <>
                          <RefreshCw className="animate-spin text-black" size={13} />
                          COMMITTING ENDPOINTS...
                        </>
                      ) : (
                        "COMMIT AUTOMATION ENDPOINTS"
                      )}
                    </button>
                  </form>

                  {/* Right Column: Console terminal */}
                  <div className="lg:col-span-6 bg-[#0b0b0c] border border-zinc-900 p-6 flex flex-col justify-between min-h-[500px]">
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                        <div>
                          <span className="font-mono text-[#EFFF00] text-[9px] tracking-widest block uppercase mb-1">
                            ✦ DISPATCH RUNTIME SYSTEM
                          </span>
                          <h3 className="text-xl font-sans font-black text-white uppercase tracking-tight">
                            INTEGRATION CONSOLE
                          </h3>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleClearAutomationLogs}
                            className="bg-black border border-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-white font-mono text-[9px] px-3 py-1.5 uppercase transition-colors"
                          >
                            CLEAR LOGS
                          </button>
                          <button
                            type="button"
                            disabled={isTriggeringTest}
                            onClick={handleTriggerManualTestRun}
                            className="bg-zinc-900 border border-[#EFFF00]/30 hover:border-[#EFFF00] disabled:border-zinc-800 disabled:text-zinc-650 text-[#EFFF00] font-mono text-[9px] px-3.5 py-1.5 uppercase tracking-wider transition-all cursor-pointer font-bold flex items-center gap-1.5"
                          >
                            {isTriggeringTest ? (
                              <>
                                <RefreshCw className="animate-spin" size={10} />
                                TESTING...
                              </>
                            ) : (
                              "TEST DISPATCH TICK"
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="mt-6 space-y-3">
                        <span className="block font-mono text-[9px] text-zinc-455 uppercase tracking-widest">
                          RECENT TRIGGERED LOOPS ({automLogs.length})
                        </span>

                        <div className="flex flex-col gap-2 max-h-[290px] overflow-y-auto pr-1">
                          {automLogs.length === 0 ? (
                            <div className="text-center py-16 border border-dashed border-zinc-900 text-zinc-550 font-mono text-[10px] uppercase">
                              NO AUTOMATED EVENTS RECORDED
                            </div>
                          ) : (
                            automLogs.map((lg: any) => (
                              <div key={lg.id} className="bg-black border border-zinc-900/80 p-3.5 font-mono text-[11px] space-y-1.5">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#EFFF00] animate-pulse" />
                                    <span className="text-zinc-200 font-bold uppercase">{lg.type}</span>
                                  </div>
                                  <span className={`text-[9.5px] border px-1.5 py-0.5 rounded-none font-bold ${
                                    lg.status >= 200 && lg.status < 300
                                      ? "text-[#EFFF00] border-[#EFFF00]/20 bg-[#EFFF00]/5"
                                      : "text-rose-450 border-rose-500/20 bg-rose-950/20"
                                  }`}>
                                    {lg.status} • {lg.statusText}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 text-[9px] text-[#A0A0A5]">
                                  <span>TIME: {new Date(lg.timestamp).toLocaleTimeString()}</span>
                                  <span className="text-right truncate select-all">{lg.id}</span>
                                </div>
                                {lg.payload && (
                                  <div className="bg-[#060607] border border-zinc-950 p-2 text-[9px] text-[#A0A0A5] max-h-[60px] overflow-hidden select-all font-mono">
                                    {JSON.stringify(lg.payload)}
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-900 text-zinc-500 font-mono text-[9px] flex justify-between items-center uppercase font-bold">
                      <span>AUTOMATION SYSTEM STATE: LISTENING</span>
                      <span className="text-[#EFFF00] animate-pulse">● DIRECT LEVERAGE</span>
                    </div>

                  </div>

                </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
