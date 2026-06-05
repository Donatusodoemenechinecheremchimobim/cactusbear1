import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, VolumeX, Flame, Zap, Compass, Cpu, Music, RefreshCw, Camera } from "lucide-react";
import { ProductCardSkeleton } from "./ProductCard";

const LOOKBOOK_SHOTS = [
  {
    id: "look-01",
    tag: "CAMPAIGN // SERIE 01",
    label: "OBSIDIAN SILHOUETTE",
    desc: "Prestige organic fleece styled with double needle structural shoulder lines and thick rib retention.",
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop",
    dimensions: "500GSM BOX FIT"
  },
  {
    id: "look-02",
    tag: "CAMPAIGN // SERIE 02",
    label: "TOBACCO EARTH BLUEPRINT",
    desc: "Structured linen-cotton yarn woven and buttoned under rigorous atelier guidelines.",
    imageUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop",
    dimensions: "OVERSIZED SEED SHIRT"
  }
];

export default function Lookbook() {
  const [isPlayingHum, setIsPlayingHum] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Auto load lookbook captures on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFetching(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const triggerRefresh = () => {
    setIsFetching(true);
    setTimeout(() => {
      setIsFetching(false);
    }, 1500);
  };

  // Modular audio synthesizer node using Web Audio API
  const handleSoundNode = (toneType: string) => {
    try {
      if (isPlayingHum === toneType) {
        // Stop current
        if (oscRef.current) {
          oscRef.current.stop();
          oscRef.current.disconnect();
          oscRef.current = null;
        }
        setIsPlayingHum(null);
        return;
      }

      // Stop any other running synth first
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }

      // Initialize ctx lazily
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (toneType === "drone") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(55, ctx.currentTime); // Low A hum
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
      } else if (toneType === "pulse") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(110, ctx.currentTime); // Low pulse
        // Create LFO-like pulsation on gain
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 1.0);
        // Repeated
        setInterval(() => {
          if (oscRef.current && toneType === "pulse") {
            gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 1.0);
          }
        }, 1000);
      } else if (toneType === "hiss") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
      }

      osc.start();
      oscRef.current = osc;
      gainRef.current = gain;
      setIsPlayingHum(toneType);
    } catch (e) {
      console.error("Audio block failed", e);
    }
  };

  return (
    <section id="brand-lookbook" className="w-full bg-black text-white py-24 px-4 md:px-8 relative overflow-hidden">
      {/* Absolute grid and glowing yellow ambient background lights */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full bg-[#EFFF00]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-[#EFFF00]/4 blur-[160px] pointer-events-none" />

      {/* Decorative Ticker Tape scroller 1 */}
      <div className="w-full overflow-hidden border-y border-zinc-900 py-3 bg-[#050505] absolute top-0 left-0">
        <div className="flex whitespace-nowrap animate-[marquee_25s_linear_infinite] font-mono text-[9px] text-[#EFFF00]/60 tracking-[0.25em]">
          <span>CACTUS BEAR // HEAVYWEIGHT PREMIUM STREETWEAR // 100% SUPIMA COTTON // LAGOS YABA EXP-STUDIO // </span>
          <span>CACTUS BEAR // HEAVYWEIGHT PREMIUM STREETWEAR // 100% SUPIMA COTTON // LAGOS YABA EXP-STUDIO // </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT COLUMN: Editorial Bento Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Bento Card 1: Brand Concept story */}
            <div className="bg-[#0b0b0c] border border-zinc-900 p-8 flex flex-col justify-between min-h-[250px] relative group hover:border-zinc-850">
              <span className="font-mono text-[#EFFF00] text-[9px] tracking-widest block font-bold mb-4">
                01 // OUR MISSION
              </span>
              <div>
                <h3 className="font-sans font-black text-2xl uppercase tracking-tight mb-2">
                  BUILT TO <span className="text-[#EFFF00]">LAST</span>
                </h3>
                <p className="text-zinc-550 text-xs font-sans leading-relaxed">
                  We design streetwear that is made to last. Our heavy organic cotton is durable and comfortable, featuring double-stitch details for long wear.
                </p>
              </div>
              <div className="mt-6 flex justify-between items-center text-zinc-650 font-mono text-[9px]">
                <span>FIT: BOXY</span>
                <span>ORIGIN: NIGERIA</span>
              </div>
            </div>

            {/* Bento Card 2: Fabric Blueprint */}
            <div className="bg-[#0b0b0c] border border-zinc-900 p-8 flex flex-col justify-between min-h-[250px] relative group hover:border-zinc-850">
              <span className="font-mono text-[#EFFF00] text-[9px] tracking-widest block font-bold mb-4">
                02 // PRESTIGE FABRICS
              </span>
              <div>
                <h3 className="font-sans font-black text-2xl uppercase tracking-tight mb-2">
                  PREMIUM COTTON
                </h3>
                <p className="text-zinc-550 text-xs font-sans leading-relaxed">
                  We use 100% natural organic cotton fabrics. No polyester or synthetic blends. Our garments keep their shape and offer premium thickness and breathability.
                </p>
              </div>
              <div className="mt-6 flex justify-between items-center text-zinc-650 font-mono text-[9px]">
                <span>FABRIC: PREMIUM COTTON</span>
                <span>WASH: VINTAGE BLACK</span>
              </div>
            </div>

            {/* Bento Card 3: Cinematic Look card with visual asset fallback */}
            <div className="md:col-span-2 bg-gradient-to-r from-zinc-950 to-[#0c0c0d] border border-zinc-900 p-8 flex flex-col md:flex-row justify-between items-stretch gap-6 min-h-[280px]">
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-[#EFFF00] text-[9px] tracking-widest block font-bold mb-4">
                    03 // COMFORT & CRAFT
                  </span>
                  <h3 className="font-sans font-black text-3xl uppercase tracking-tight mb-3">
                    HAND-FINISHED DESIGNS
                  </h3>
                  <p className="text-zinc-550 text-xs font-sans leading-relaxed max-w-md">
                    To maintain our high quality standards, we avoid mass production. Each streetwear item is custom designed, hand-inspected, and shipped from our studio in Lagos. That's our promise of simple, elegant everyday luxury.
                  </p>
                </div>
                <div className="flex gap-4 mt-6">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400">
                    <Flame size={12} className="text-[#EFFF00]" />
                    LIMITED EDITIONS
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400">
                    <Cpu size={12} className="text-[#EFFF00]" />
                    VERIFICATION LABEL
                  </div>
                </div>
              </div>

              {/* Graphical blueprint line box */}
              <div className="w-full md:w-56 bg-black/60 border border-zinc-850 p-4 flex flex-col justify-between font-mono text-[9px] text-zinc-500 relative shrink-0">
                <div className="absolute inset-0 bg-[#EFFF00]/5 opacity-35" />
                <div className="flex justify-between border-b border-zinc-900 pb-2">
                  <span>PRODUCT INFO</span>
                  <span className="text-white">CB_SPECS</span>
                </div>
                <div className="flex flex-col gap-1 my-3 text-[10px]">
                  <div className="flex justify-between"><span>[01] COTTON YARN:</span> <span className="text-white">100% ORGANIC</span></div>
                  <div className="flex justify-between"><span>[02] HEM STITCH:</span> <span className="text-white">DOUBLE</span></div>
                  <div className="flex justify-between"><span>[03] DYE QUALITY:</span> <span className="text-white">CERTIFIED</span></div>
                  <div className="flex justify-between"><span>[04] MATERIAL SLT:</span> <span className="text-white">HEAVY</span></div>
                </div>
                <div className="text-center bg-[#EFFF00]/10 text-[#EFFF00] py-1 border border-[#EFFF00]/20">
                  IN STOCK
                </div>
              </div>
            </div>

            {/* Bento Card 4: Editorial Campaign Captures with high-end skeleton loading */}
            <div className="md:col-span-2 bg-[#020202] border border-zinc-900 p-6 md:p-8 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-950 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-none border border-zinc-900 flex items-center justify-center text-[#EFFF00] bg-black/40">
                    <Camera size={14} />
                  </div>
                  <div>
                    <span className="font-mono text-[#EFFF00] text-[9px] tracking-widest block font-bold uppercase">
                      05 // EDITORIAL LOOKBOOK CAMPAIGN
                    </span>
                    <h3 className="font-sans font-black text-xl md:text-2xl uppercase tracking-tight text-white mt-0.5">
                      EDITORIAL <span className="text-[#EFFF00]">CAPTURES</span>
                    </h3>
                  </div>
                </div>
                
                {/* Loader control indicator */}
                <button
                  onClick={triggerRefresh}
                  disabled={isFetching}
                  className="font-mono text-[8px] tracking-[0.25em] bg-zinc-950 border border-zinc-900 hover:border-[#EFFF00] text-zinc-400 hover:text-[#EFFF00] transition-all px-4 py-2 uppercase flex items-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  <RefreshCw size={11} className={`${isFetching ? 'animate-spin text-[#EFFF00]' : 'text-zinc-550'}`} />
                  <span>REFRESH CAPTURES FEED</span>
                </button>
              </div>

              {/* Lookbook captures grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[380px]">
                {isFetching ? (
                  <>
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                  </>
                ) : (
                  LOOKBOOK_SHOTS.map((shot) => (
                    <motion.div
                      key={shot.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="bg-[#050505] border border-zinc-900 group/look overflow-hidden flex flex-col justify-between relative"
                    >
                      {/* Header block with brand tag and release metadata */}
                      <div className="flex justify-between items-center px-4 py-2.5 bg-black/40 border-b border-zinc-900 font-mono text-[9px] text-zinc-550">
                        <span>{shot.tag}</span>
                        <span className="text-[#EFFF00] font-bold">{shot.dimensions}</span>
                      </div>

                      {/* Main campaign snapshot box */}
                      <div className="relative h-[220px] sm:h-[300px] w-full overflow-hidden bg-zinc-950 flex items-center justify-center">
                        <img
                          src={shot.imageUrl}
                          alt={shot.label}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover grayscale opacity-75 group-hover/look:scale-105 group-hover/look:grayscale-0 group-hover/look:opacity-100 transition-all duration-700 ease-out"
                        />
                        {/* Interactive watermark overlay */}
                        <div className="absolute bottom-3 left-3 bg-black/90 border border-zinc-900 px-3 py-1 text-[8px] font-mono text-zinc-400 tracking-wider">
                          ✦ CAM_REFID: {shot.id.toUpperCase()}
                        </div>
                      </div>

                      {/* Bottom Info Blocks */}
                      <div className="p-4 border-t border-zinc-900 bg-black/60">
                        <h4 className="font-sans font-black text-xs sm:text-sm text-white tracking-tight uppercase group-hover/look:text-[#EFFF00] transition-colors">
                          {shot.label}
                        </h4>
                        <p className="text-zinc-550 text-[11px] font-sans mt-1 leading-relaxed">
                          {shot.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: The Sound Node Synthesizer console */}
          <div className="lg:col-span-4 bg-[#0a0a0b] border border-zinc-900 p-8 flex flex-col justify-between min-h-[526px] relative overflow-hidden">
            {/* Ambient radar graphic */}
            <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full border border-zinc-900/40 pointer-events-none flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border border-zinc-900/30 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border border-zinc-900/20" />
              </div>
            </div>

            <div>
              <span className="font-mono text-[#EFFF00] text-[9px] tracking-widest block font-bold mb-4">
                04 // AMBIENT STUDIO HUMS
              </span>
              <h3 className="font-sans font-black text-2xl uppercase tracking-tight">
                AMBIENT <span className="text-[#EFFF00]">SOUNDS</span>
              </h3>
              <p className="text-zinc-550 text-xs font-sans mt-2 leading-relaxed">
                Play soft, relaxing workshop background tones inspired by our print shop. Replicate the gentle hum of design machines and static background airwaves.
              </p>

              {/* Synthesizer switches */}
              <div className="flex flex-col gap-3 mt-8">
                
                {/* Tone 1: Industrial Drone */}
                <button
                  onClick={() => handleSoundNode("drone")}
                  className={`w-full p-4 border text-left flex justify-between items-center transition-all rounded-none ${
                    isPlayingHum === "drone"
                      ? "border-[#EFFF00] bg-[#121207] text-white"
                      : "border-zinc-900 bg-black hover:border-zinc-800 text-zinc-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-none flex items-center justify-center border ${
                      isPlayingHum === "drone" ? "border-[#EFFF00] text-[#EFFF00]" : "border-zinc-900 text-zinc-600"
                    }`}>
                      <Volume2 size={14} className={isPlayingHum === "drone" ? "animate-pulse" : ""} />
                    </div>
                    <div>
                      <span className="font-mono text-[9px] text-zinc-650 block">[ WORKSHOP HUM ]</span>
                      <span className="font-sans font-extrabold text-xs uppercase tracking-tight">LOW MACHINE MOTOR DRONE</span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-[#EFFF00]">
                    {isPlayingHum === "drone" ? "ON" : "OFF"}
                  </span>
                </button>

                {/* Tone 2: Acid Pulse */}
                <button
                  onClick={() => handleSoundNode("pulse")}
                  className={`w-full p-4 border text-left flex justify-between items-center transition-all rounded-none ${
                    isPlayingHum === "pulse"
                      ? "border-[#EFFF00] bg-[#121207] text-white"
                      : "border-zinc-900 bg-black hover:border-zinc-800 text-zinc-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-none flex items-center justify-center border ${
                      isPlayingHum === "pulse" ? "border-[#EFFF00] text-[#EFFF00]" : "border-zinc-900 text-zinc-600"
                    }`}>
                      <Zap size={14} className={isPlayingHum === "pulse" ? "animate-bounce" : ""} />
                    </div>
                    <div>
                      <span className="font-mono text-[9px] text-zinc-650 block">[ STEADY BEAT ]</span>
                      <span className="font-sans font-extrabold text-xs uppercase tracking-tight">RHYTHMIC WORKSHOP PULSE</span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-[#EFFF00]">
                    {isPlayingHum === "pulse" ? "ON" : "OFF"}
                  </span>
                </button>

                {/* Tone 3: Thorn hiss */}
                <button
                  onClick={() => handleSoundNode("hiss")}
                  className={`w-full p-4 border text-left flex justify-between items-center transition-all rounded-none ${
                    isPlayingHum === "hiss"
                      ? "border-[#EFFF00] bg-[#121207] text-white"
                      : "border-zinc-900 bg-black hover:border-zinc-800 text-zinc-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-none flex items-center justify-center border ${
                      isPlayingHum === "hiss" ? "border-[#EFFF00] text-[#EFFF00]" : "border-zinc-900 text-zinc-600"
                    }`}>
                      <Music size={14} className={isPlayingHum === "hiss" ? "animate-pulse" : ""} />
                    </div>
                    <div>
                      <span className="font-mono text-[9px] text-zinc-650 block">[ WHITE NOISE ]</span>
                      <span className="font-sans font-extrabold text-xs uppercase tracking-tight">SOFT STEADY STATIC HUM</span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-[#EFFF00]">
                    {isPlayingHum === "hiss" ? "ON" : "OFF"}
                  </span>
                </button>

              </div>
            </div>

            {/* Synthesizer Footer block */}
            <div className="mt-8 border-t border-zinc-950 pt-4 flex justify-between items-center font-mono text-[9px] text-zinc-500">
              <span className="flex items-center gap-1">
                <Compass size={11} className="text-[#EFFF00]" />
                STUDIO AUDIO: PLAYING
              </span>
              <span>AUDIO DRIVER // LND</span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
