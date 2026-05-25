import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Lock, Mail, ArrowRight, ShieldCheck, User, Eye, EyeOff } from "lucide-react";
import { authService, UserSession } from "../services/firebase";

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
}

export default function GoogleAuthModal({
  isOpen,
  onClose,
  onLoginSuccess
}: GoogleAuthModalProps) {
  const [activeTab, setActiveTab] = useState<"google" | "email" | "guest">("google");
  
  // Input fields
  const [emailInput, setEmailInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // Status states
  const [authenticating, setAuthenticating] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>("");

  const handleGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Support either general Google Login or specific account enter
    setAuthenticating(true);
    setErrorText("");

    try {
      let session;
      if (emailInput.trim()) {
        session = await authService.signInWithGoogleSimulate(emailInput);
      } else {
        session = await authService.signInWithGoogle();
      }
      onLoginSuccess(session);
      setAuthenticating(false);
      onClose();
    } catch (err) {
      setAuthenticating(false);
      setErrorText("Connection error or canceled authentication.");
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorText("Please enter your email address.");
      return;
    }
    if (passwordInput.length < 4) {
      setErrorText("Password must be at least 4 characters.");
      return;
    }

    setAuthenticating(true);
    setErrorText("");

    try {
      const session = await authService.signInWithEmailSimulate(emailInput, passwordInput);
      onLoginSuccess(session);
      setAuthenticating(false);
      onClose();
    } catch (err) {
      setAuthenticating(false);
      setErrorText("Invalid credentials or server error.");
    }
  };

  const handleGuestLogin = async () => {
    setAuthenticating(true);
    setErrorText("");

    try {
      const session = await authService.signInGuestSimulate();
      onLoginSuccess(session);
      setAuthenticating(false);
      onClose();
    } catch (err) {
      setAuthenticating(false);
      setErrorText("Could not start guest session.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop screen */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 backdrop-blur-sm"
          />

          {/* Core modal container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="fixed inset-0 m-auto max-w-md h-max bg-[#0c0c0d] border border-zinc-900 z-50 p-8 text-white flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b border-zinc-900 mb-6">
                <span className="font-mono text-xs tracking-wider text-[#EFFF00] uppercase font-bold">
                  STORE SIGN-IN
                </span>
                <button
                  onClick={onClose}
                  className="p-1 hover:text-[#EFFF00] text-zinc-500 transition-colors cursor-pointer"
                  title="Close login modal"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Selector Tabs built with standard simple look */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-black border border-zinc-900 mb-6 font-mono text-[10px] tracking-wider text-center">
                <button
                  onClick={() => {
                    setActiveTab("google");
                    setErrorText("");
                  }}
                  className={`py-1.5 font-bold transition-all cursor-pointer ${
                    activeTab === "google" ? "bg-[#EFFF00] text-black" : "text-zinc-500 hover:text-white"
                  }`}
                >
                  GOOGLE ID
                </button>
                <button
                  onClick={() => {
                    setActiveTab("email");
                    setErrorText("");
                  }}
                  className={`py-1.5 font-bold transition-all cursor-pointer ${
                    activeTab === "email" ? "bg-[#EFFF00] text-black" : "text-zinc-500 hover:text-white"
                  }`}
                >
                  EMAIL PASS
                </button>
                <button
                  onClick={() => {
                    setActiveTab("guest");
                    setErrorText("");
                  }}
                  className={`py-1.5 font-bold transition-all cursor-pointer ${
                    activeTab === "guest" ? "bg-[#EFFF00] text-black" : "text-zinc-500 hover:text-white"
                  }`}
                >
                  GUEST ACCESS
                </button>
              </div>

              {/* Title Section */}
              <div className="mb-6">
                <h3 className="font-sans font-black text-2xl uppercase tracking-tight text-white mb-1">
                  {activeTab === "google" && <>SIGN IN WITH <span className="text-[#EFFF00]">GOOGLE</span></>}
                  {activeTab === "email" && <>USE YOUR <span className="text-[#EFFF00]">EMAIL ADDRESS</span></>}
                  {activeTab === "guest" && <>CONTINUE AS <span className="text-[#EFFF00]">GUEST PATRON</span></>}
                </h3>
                <p className="text-zinc-500 text-xs leading-relaxed font-sans mt-1">
                  {activeTab === "google" && "Log in with your Google email to save configurations and track orders."}
                  {activeTab === "email" && "Create or sign in to your local account with an email and password."}
                  {activeTab === "guest" && "Browse, test, customize, and add products as an anonymous guest pass."}
                </p>
              </div>

              {/* Tab 1: Google Login */}
              {activeTab === "google" && (
                <form onSubmit={handleGoogleLogin} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-[9px] text-zinc-500 uppercase">
                      Google Email Address
                    </span>
                    <div className="relative">
                      <Mail size={12} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500" />
                      <input
                        required
                        type="email"
                        value={emailInput}
                        onChange={(e) => {
                          setEmailInput(e.target.value);
                          setErrorText("");
                        }}
                        className="w-full bg-black border border-zinc-900 focus:border-[#EFFF00] pl-10 pr-4 py-3 font-mono text-xs text-[#EFFF00] outline-none transition-colors"
                        placeholder="yourname@gmail.com"
                      />
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono italic">
                      💡 Creator account: Enter <strong className="text-white">chibundusadiq@gmail.com</strong> to unlock the Admin Panel.
                    </span>
                  </div>

                  {errorText && (
                    <span className="text-red-400 font-mono text-[10px] uppercase block">
                      ⚠ {errorText}
                    </span>
                  )}

                  <button
                    type="submit"
                    disabled={authenticating}
                    className="w-full bg-white hover:bg-[#EFFF00] disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-mono font-black text-xs py-4 tracking-widest uppercase transition-colors rounded-none mt-2 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {authenticating ? (
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        LOGIN WITH GOOGLE
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Tab 2: Email & Password Login */}
              {activeTab === "email" && (
                <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-[9px] text-zinc-500 uppercase">
                      Email Address
                    </span>
                    <div className="relative">
                      <Mail size={12} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500" />
                      <input
                        required
                        type="email"
                        value={emailInput}
                        onChange={(e) => {
                          setEmailInput(e.target.value);
                          setErrorText("");
                        }}
                        className="w-full bg-black border border-zinc-900 focus:border-[#EFFF00] pl-10 pr-4 py-2.5 font-mono text-xs text-[#EFFF00] outline-none transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-[9px] text-zinc-500 uppercase">
                      Password / Access Key
                    </span>
                    <div className="relative">
                      <Lock size={12} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500" />
                      <input
                        required
                        type={showPassword ? "text" : "password"}
                        value={passwordInput}
                        onChange={(e) => {
                          setPasswordInput(e.target.value);
                          setErrorText("");
                        }}
                        className="w-full bg-black border border-zinc-900 focus:border-[#EFFF00] pl-10 pr-10 py-2.5 font-mono text-xs text-[#EFFF00] outline-none transition-colors"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>

                  <span className="text-[10px] text-zinc-500 font-mono italic">
                    💡 Register notice: If you don't have an account, entering an email here will automatically register it.
                  </span>

                  {errorText && (
                    <span className="text-red-400 font-mono text-[10px] uppercase block">
                      ⚠ {errorText}
                    </span>
                  )}

                  <button
                    type="submit"
                    disabled={authenticating}
                    className="w-full bg-white hover:bg-[#EFFF00] disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-mono font-black text-xs py-4 tracking-widest uppercase transition-colors rounded-none mt-2 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {authenticating ? (
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        LOGIN / REGISTER
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Tab 3: Quick Guest Pass */}
              {activeTab === "guest" && (
                <div className="flex flex-col gap-4">
                  <div className="border border-dashed border-zinc-800 p-6 text-center">
                    <User size={30} className="mx-auto text-zinc-650 mb-2" />
                    <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                      IN-DEMO VIP BYPASS
                    </p>
                    <p className="text-zinc-500 text-[11px] font-sans mt-2 max-w-xs mx-auto leading-normal">
                      Instant pass to test the storefront and use the customizer without entering any emails. Perfect for quick reviews!
                    </p>
                  </div>

                  {errorText && (
                    <span className="text-red-400 font-mono text-[10px] uppercase block">
                      ⚠ {errorText}
                    </span>
                  )}

                  <button
                    onClick={handleGuestLogin}
                    disabled={authenticating}
                    className="w-full bg-white hover:bg-[#EFFF00] disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-mono font-black text-xs py-4 tracking-widest uppercase transition-colors rounded-none flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {authenticating ? (
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        ENTER AS GUEST
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Signature */}
            <div className="mt-8 pt-4 border-t border-zinc-900 flex items-center gap-2 font-mono text-[9px] text-zinc-500">
              <Lock size={10} className="text-[#EFFF00]" />
              <span>CACTUS BEAR • SECURE USER ACCESS</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
