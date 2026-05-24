import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Lock, ShieldCheck, Mail, ArrowRight } from "lucide-react";
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
  const [emailInput, setEmailInput] = useState<string>("");
  const [authenticating, setAuthenticating] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>("");

  const handleSimulateGoogleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorText("Please enter a valid Google account email.");
      return;
    }
    
    setAuthenticating(true);
    setErrorText("");

    // Simulate safe Google oauth secure channel lookup
    setTimeout(() => {
      try {
        const session = authService.signInWithGoogleSimulate(emailInput);
        onLoginSuccess(session);
        setAuthenticating(false);
        onClose();
      } catch (err) {
        setAuthenticating(false);
        setErrorText("OAuth connection interrupted. Please try again.");
      }
    }, 1200);
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
            className="fixed inset-0 bg-black z-50 backdrop-blur-md"
          />

          {/* Core modal chassis */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="fixed inset-0 m-auto max-w-md h-max bg-[#0c0c0d] border border-zinc-900 z-50 p-8 text-white flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b border-zinc-900 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center p-0.5 text-black text-xs font-black">
                    G
                  </div>
                  <span className="font-mono text-xs tracking-widest text-[#EFFF00] uppercase font-bold">
                    STUDIO ACCESS GATEWAY
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:text-[#EFFF00] text-zinc-500 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Title */}
              <div className="mb-6">
                <h3 className="font-sans font-black text-2xl uppercase tracking-tight text-white mb-2">
                  SIGN IN WITH <span className="text-[#EFFF00]">GOOGLE</span>
                </h3>
                <p className="text-zinc-500 text-xs leading-relaxed font-sans">
                  Connect your Google identity to access exclusive Cactus Bear collections. Setting up your profile saves custom configurations and tracks pre-order deliveries.
                </p>
              </div>

               {/* Input for credentials */}
              <form onSubmit={handleSimulateGoogleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[9px] text-zinc-500 uppercase">
                    GOOGLE CORRESPONDING EMAIL
                  </span>
                  <div className="relative">
                    <Mail size={12} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-650" />
                    <input
                      required
                      type="email"
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        setErrorText("");
                      }}
                      className="w-full bg-black border border-zinc-900 focus:border-[#EFFF00] pl-10 pr-4 py-3 font-mono text-xs text-[#EFFF00] outline-none transition-colors"
                      placeholder="e.g. chibundusadiq@gmail.com"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-550 font-mono italic">
                    💡 Creative Director tip: Enter <strong className="text-white">chibundusadiq@gmail.com</strong> to access the Studio Management Panel.
                  </span>
                </div>

                {errorText && (
                  <span className="text-red-405 font-mono text-[10px] uppercase">
                    ⚠ {errorText}
                  </span>
                )}

                {/* Submit simulated auth */}
                <button
                  type="submit"
                  disabled={authenticating}
                  className="w-full bg-white hover:bg-[#EFFF00] disabled:bg-[#EFFF00]/40 text-black font-mono font-black text-xs py-4 tracking-widest uppercase transition-colors rounded-none mt-2 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {authenticating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      SECURELY LOGGING IN TO ATELIER...
                    </>
                  ) : (
                    <>
                      ENTER THE ATELIER
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Shield bottom signature */}
            <div className="mt-8 pt-4 border-t border-zinc-900 flex items-center gap-2 font-mono text-[9px] text-zinc-650">
              <Lock size={10} className="text-[#EFFF00]" />
              <span>CACTUS BEAR DESIGN LABS • VERIFIED ENCRYPTION</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
