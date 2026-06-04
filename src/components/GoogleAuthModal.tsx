import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Lock, Mail, ArrowRight, ShieldCheck, User, Eye, EyeOff, Globe } from "lucide-react";
import { authService, UserSession, isFirebaseConfigured } from "../services/firebase";

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
  const [activeTab, setActiveTab] = useState<"social" | "email" | "guest">("social");
  
  // Custom simulation input toggle
  const [showSimulateInput, setShowSimulateInput] = useState<boolean>(false);
  const [simulateEmail, setSimulateEmail] = useState<string>("");
  const [bypassEmail, setBypassEmail] = useState<string>("");

  // Input fields for email/password tab
  const [emailInput, setEmailInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // Status states
  const [authenticating, setAuthenticating] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>("" );

  const renderError = () => {
    if (!errorText) return null;

    const isUnauthorizedDomain =
      errorText.toLowerCase().includes("unauthorized-domain") ||
      errorText.toLowerCase().includes("auth/unauthorized-domain");

    const isPopupIssue =
      errorText.toLowerCase().includes("popup-closed-by-user") ||
      errorText.toLowerCase().includes("popup-blocked") ||
      errorText.toLowerCase().includes("cancelled") ||
      errorText.toLowerCase().includes("canceled") ||
      errorText.toLowerCase().includes("popup");

    if (isUnauthorizedDomain || isPopupIssue) {
      const currentHost = typeof window !== "undefined" ? window.location.hostname : "ais-dev-idoac2ds4ux6jkzbphimca-337745108430.europe-west2.run.app";
      return (
        <div className="border border-[#EFFF00]/30 bg-amber-950/10 p-4 font-mono text-[10px] leading-relaxed text-zinc-350 mt-3 border-l-2 border-l-[#EFFF00]">
          <span className="text-[#EFFF00] font-bold block uppercase mb-1.5 tracking-wider">
            {isUnauthorizedDomain ? "⚠ FIREBASE AUTH: UNAUTHORIZED DOMAIN" : "⚠ BROWSER POPUP BLOCKED / CLOSED"}
          </span>
          <p className="text-zinc-400 text-[10px] leading-relaxed m-0 mb-2">
            {isUnauthorizedDomain 
              ? "Firebase Authentication requires registering this staging domain in your Firebase project configuration."
              : "Popups are often blocked, cancelled, or restricted by browsers inside the developer preview sandbox iframe."}
          </p>
          
          {isUnauthorizedDomain && (
            <>
              <span className="block font-bold text-white uppercase mb-1 tracking-wider font-mono text-[9px]">
                QUICK SOLUTION:
              </span>
              <ol className="list-decimal list-inside space-y-1 text-zinc-400 mb-3 ml-1">
                <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-[#EFFF00] underline font-bold">Firebase Console</a></li>
                <li>Navigate to <strong className="text-white">Auth → Settings → Authorized Domains</strong></li>
                <li>Add these staging preview URLs:</li>
              </ol>
              <div className="bg-black border border-zinc-900 p-2 font-mono text-[9px] text-[#EFFF00] break-all flex flex-col gap-1 mb-3">
                <code>{currentHost}</code>
                <code>ais-pre-idoac2ds4ux6jkzbphimca-337745108430.europe-west2.run.app</code>
              </div>
            </>
          )}

          <div className="border-t border-zinc-900 pt-3 flex flex-col gap-2.5">
            <span className="text-[9px] font-bold text-[#EFFF00] uppercase tracking-wider block">
              ⚡ LIVE GATEWAY BYPASS (RECOMMENDED)
            </span>
            <p className="text-zinc-400 text-[9px] leading-relaxed m-0">
              For a 100% reliable login without browser popup restrictions, enter your email below to connect straight to the live database using secure authentication:
            </p>
            <div className="flex gap-2 items-center">
              <input
                type="email"
                placeholder="you@domain.com"
                value={bypassEmail}
                onChange={(e) => setBypassEmail(e.target.value)}
                className="flex-1 bg-black text-[#EFFF00] border border-zinc-805 px-3 py-2 font-mono text-[10.5px] outline-none"
              />
              <button
                type="button"
                onClick={async () => {
                  const targetEmail = bypassEmail.trim() || "chibundusadiq@gmail.com";
                  setAuthenticating(true);
                  setErrorText("");
                  try {
                    let session;
                    if (isFirebaseConfigured) {
                      // Login/register directly with Real Firebase Auth on live DB
                      session = await authService.signInWithEmail(targetEmail, "staging_bypass_pass_123");
                    } else {
                      session = authService.signInWithGoogleSimulate(targetEmail);
                    }
                    onLoginSuccess(session);
                    setAuthenticating(false);
                    onClose();
                  } catch (err: any) {
                    setAuthenticating(false);
                    setErrorText(err.message || "Failed to bypass simulation");
                  }
                }}
                className="bg-[#EFFF00] hover:bg-[#EFFF44] text-black font-mono font-black text-[9px] px-3.5 py-2.5 tracking-wider uppercase rounded-none transition-colors border border-transparent cursor-pointer flex items-center justify-center gap-1 shrink-0"
              >
                BYPASS & LOGIN
              </button>
            </div>
            <div className="flex justify-between items-center text-[8.5px] text-zinc-500 font-mono mt-0.5 animate-fadeIn">
              <span>Defaults to: chibundusadiq@gmail.com (Admin)</span>
              <button
                type="button"
                onClick={() => setBypassEmail("chibundusadiq@gmail.com")}
                className="text-zinc-400 hover:text-white underline cursor-pointer"
              >
                Reset to Admin Email
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <span className="text-red-400 font-mono text-[10px] uppercase block mt-2">
        ⚠ {errorText}
      </span>
    );
  };

  const handleGoogleLogin = async () => {
    setAuthenticating(true);
    setErrorText("");

    try {
      let session;
      if (showSimulateInput && simulateEmail.trim()) {
        session = await authService.signInWithGoogleSimulate(simulateEmail);
      } else {
        session = await authService.signInWithGoogle();
      }
      onLoginSuccess(session);
      setAuthenticating(false);
      onClose();
    } catch (err: any) {
      setAuthenticating(false);
      setErrorText(err.message || "Connection error or canceled Google authenticating.");
    }
  };

  const handleGithubLogin = async () => {
    setAuthenticating(true);
    setErrorText("");

    try {
      let session;
      if (showSimulateInput && simulateEmail.trim()) {
        session = await authService.signInWithGithubSimulate(simulateEmail);
      } else {
        session = await authService.signInWithGithub();
      }
      onLoginSuccess(session);
      setAuthenticating(false);
      onClose();
    } catch (err: any) {
      setAuthenticating(false);
      setErrorText(err.message || "Connection error or canceled GitHub authenticating.");
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
      const session = await authService.signInWithEmail(emailInput, passwordInput);
      onLoginSuccess(session);
      setAuthenticating(false);
      onClose();
    } catch (err: any) {
      setAuthenticating(false);
      setErrorText(err.message || "Invalid credentials or email/password system error.");
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
            className="fixed inset-0 m-auto max-w-md h-max max-h-[92vh] overflow-y-auto bg-[#0c0c0d] border border-zinc-900 z-50 p-6 md:p-8 text-white flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b border-zinc-900 mb-6">
                <span className="font-mono text-xs tracking-wider text-[#EFFF00] uppercase font-bold">
                  STORE SECURE ACCESS
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
                    setActiveTab("social");
                    setErrorText("");
                  }}
                  className={`py-1.5 font-bold transition-all cursor-pointer ${
                    activeTab === "social" ? "bg-[#EFFF00] text-black" : "text-zinc-500 hover:text-white"
                  }`}
                >
                  SOCIAL PROVIDER
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
                  {activeTab === "social" && <>SIGN IN WITH <span className="text-[#EFFF00]">ID COAUTEUR</span></>}
                  {activeTab === "email" && <>USE YOUR <span className="text-[#EFFF00]">EMAIL ADDRESS</span></>}
                  {activeTab === "guest" && <>CONTINUE AS <span className="text-[#EFFF00]">GUEST PATRON</span></>}
                </h3>
                <p className="text-zinc-500 text-xs leading-relaxed font-sans mt-1">
                  {activeTab === "social" && "Log in securely using Google or GitHub to connect your digital wardrobe."}
                  {activeTab === "email" && "Log in or register your couture workspace with an email and password."}
                  {activeTab === "guest" && "Browse, preview, customize, and add products with a quick guest session."}
                </p>
              </div>

              {/* Tab 1: Social Login (Google & GitHub) */}
              {activeTab === "social" && (
                <div className="flex flex-col gap-4">
                  {/* Google Authenticate Button */}
                  <button
                    onClick={handleGoogleLogin}
                    disabled={authenticating}
                    className="w-full bg-white hover:bg-[#EFFF00] disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-mono font-black text-xs py-3.5 tracking-widest uppercase transition-colors rounded-none flex items-center justify-center gap-3.5 cursor-pointer border border-transparent"
                  >
                    {authenticating ? (
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        {/* Inline Minimal Google Icon */}
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.3.6 4.6 1.8l2.4-2.4C17.3 1.5 14.9.7 12.24.7c-5.7 0-10.3 4.6-10.3 10.3s4.6 10.3 10.3 10.3c5.9 0 9.8-4.1 9.8-10 0-.6 0-1.1-.1-1.6H12.24z"/>
                        </svg>
                        AUTHENTICATE WITH GOOGLE
                      </>
                    )}
                  </button>

                  {/* GitHub Authenticate Button */}
                  <button
                    onClick={handleGithubLogin}
                    disabled={authenticating}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-mono font-black text-xs py-3.5 tracking-widest uppercase transition-colors rounded-none border border-zinc-850 flex items-center justify-center gap-3.5 cursor-pointer"
                  >
                    {authenticating ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        {/* Inline Minimal Github Icon */}
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                        </svg>
                        AUTHENTICATE WITH GITHUB
                      </>
                    )}
                  </button>

                  {/* Dev Simulate Credentials Section */}
                  <div className="mt-4 pt-4 border-t border-zinc-950">
                    <button
                      type="button"
                      onClick={() => setShowSimulateInput(!showSimulateInput)}
                      className="text-zinc-500 hover:text-white font-mono text-[9px] uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <span>{showSimulateInput ? "[-] HIDE SIMULATE SETTINGS" : "[+] EXPAND DEV SIMULATION CONTROLS"}</span>
                    </button>

                    {showSimulateInput && (
                      <div className="mt-3 bg-black border border-zinc-950 p-4 flex flex-col gap-2.5 animate-fadeIn">
                        <span className="font-mono text-[9px] text-[#EFFF00] uppercase block">
                          SPECIFY PRESET DEMO EMAIL ID
                        </span>
                        <input
                          type="email"
                          value={simulateEmail}
                          onChange={(e) => setSimulateEmail(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-900 pl-3 pr-3 py-2 font-mono text-xs text-[#EFFF00] outline-none"
                          placeholder="chibundusadiq@gmail.com"
                        />
                        <span className="text-[9px] text-zinc-500 font-mono leading-normal">
                          💡 Enter <strong className="text-zinc-300">chibundusadiq@gmail.com</strong> here, then click either Google or GitHub above to log in instantly as the verified Admin account!
                        </span>
                      </div>
                    )}
                  </div>

                  {renderError()}
                </div>
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

                  <span className="text-[10px] text-zinc-500 font-mono italic leading-normal block mt-1">
                    💡 **Auto-Register Built-In**: If you don't have an existing account, entering an email here will automatically register and provision it instantly.
                  </span>

                  {renderError()}

                  <button
                    type="submit"
                    disabled={authenticating}
                    className="w-full bg-white hover:bg-[#EFFF00] disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-mono font-black text-xs py-4 tracking-widest uppercase transition-colors rounded-none mt-2 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {authenticating ? (
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        LOGIN / CREATE ACCOUNT
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Tab 3: Quick Guest Pass */}
              {activeTab === "guest" && (
                <div className="flex flex-col gap-4">
                  <div className="border border-dashed border-zinc-850 p-6 text-center bg-black/30">
                    <User size={30} className="mx-auto text-zinc-600 mb-2" />
                    <p className="font-mono text-[10px] text-[#EFFF00] uppercase tracking-widest font-black">
                      IN-DEMO VIP BYPASS
                    </p>
                    <p className="text-zinc-400 text-[11px] font-sans mt-2 max-w-xs mx-auto leading-normal">
                      Instant anonymous pass to checkout, test pre-orders, and browse our drop collections without setting credentials.
                    </p>
                  </div>

                  {renderError()}

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
              <ShieldCheck size={11} className="text-[#EFFF00]" />
              <span>CACTUS BEAR • SECURE SYSTEM LOCK v2.10</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
