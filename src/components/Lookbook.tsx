import { useState, useRef } from "react";
import { motion } from "motion/react";
import { Volume2, VolumeX, Flame, Zap, Compass, Cpu, Music } from "lucide-react";

export default function Lookbook() {
  const [isPlayingHum, setIsPlayingHum] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

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
                CONCEPT_01 // OUR PHILOSOPHY
              </span>
              <div>
                <h3 className="font-sans font-black text-2xl uppercase tracking-tight mb-2">
                  BUILT TO <span className="text-[#EFFF00]">LAST</span>
                </h3>
                <p className="text-zinc-500 text-xs font-sans leading-relaxed">
                  We believe in apparel that stands the test of time. Our heavyweight cotton fabrics are woven at high-density (up to 520GSM) with tight double-stitch detailing. They feel incredibly solid on the outside yet remain soft and comfortable for daily wear.
                </p>
              </div>
              <div className="mt-6 flex justify-between items-center text-zinc-650 font-mono text-[9px]">
                <span>FIT: GENEROUS BOXY</span>
                <span>ORIGIN: LONDON STUDIO</span>
              </div>
            </div>

            {/* Bento Card 2: Fabric Blueprint */}
            <div className="bg-[#0b0b0c] border border-zinc-900 p-8 flex flex-col justify-between min-h-[250px] relative group hover:border-zinc-850">
              <span className="font-mono text-[#EFFF00] text-[9px] tracking-widest block font-bold mb-4">
                CONCEPT_02 // MATERIALS
              </span>
              <div>
                <h3 className="font-sans font-black text-2xl uppercase tracking-tight mb-2">
                  PREMIUM FABRIC
                </h3>
                <p className="text-zinc-500 text-xs font-sans leading-relaxed">
                  We formulate custom yarn specifications for exact silhouettes. Zero synthetic fibers. We use 100% long-staple combed cotton spun at high tension to retain its shape, custom dyed to deliver unmatched rich textures that do not fade easily.
                </p>
              </div>
              <div className="mt-6 flex justify-between items-center text-zinc-650 font-mono text-[9px]">
                <span>DENSITY: 280-520GSM</span>
                <span>WASH: VINTAGE BLACK</span>
              </div>
            </div>

            {/* Bento Card 3: Cinematic Look card with visual asset fallback */}
            <div className="md:col-span-2 bg-gradient-to-r from-zinc-950 to-[#0c0c0d] border border-zinc-900 p-8 flex flex-col md:flex-row justify-between items-stretch gap-6 min-h-[280px]">
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-[#EFFF00] text-[9px] tracking-widest block font-bold mb-4">
                    STUDIO WORK // INDIVIDUAL CARE
                  </span>
                  <h3 className="font-sans font-black text-3xl uppercase tracking-tight mb-3">
                    FINELY PRINTED & FINISHED
                  </h3>
                  <p className="text-zinc-500 text-xs font-sans leading-relaxed max-w-md">
                    To maintain complete control over our quality standards, Cactus Bear avoids fast-fashion mass production. Every garment is designed, printed, hand-inspected, and individually wrapped by our team in Lagos before dispatch. This is our promise of authentic premium streetwear.
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
                  <span>PRODUCT SPEC</span>
                  <span className="text-white">CB_SPEC_V1</span>
                </div>
                <div className="flex flex-col gap-1 my-3 text-[10px]">
                  <div className="flex justify-between"><span>[01] COMBED YARN:</span> <span className="text-white">100% OK</span></div>
                  <div className="flex justify-between"><span>[02] CROWN STITCH:</span> <span className="text-white">DOUBLE</span></div>
                  <div className="flex justify-between"><span>[03] ECO DYEING:</span> <span className="text-white">CERTIFIED</span></div>
                  <div className="flex justify-between"><span>[04] WEIGHT TYPE:</span> <span className="text-white">HEAVY</span></div>
                </div>
                <div className="text-center bg-[#EFFF00]/10 text-[#EFFF00] py-1 border border-[#EFFF00]/20">
                  READY TO SHIP
                </div>
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
                CONCEPT_04 // AMBIENT STUDIO SOUNDS
              </span>
              <h3 className="font-sans font-black text-2xl uppercase tracking-tight">
                STUDIO SOUND <span className="text-[#EFFF00]">HUMS</span>
              </h3>
              <p className="text-zinc-550 text-xs font-sans mt-2 leading-relaxed">
                Play and mix ambient low-synthesized hums inspired by our printing workshop. These replicate the gentle sounds of design printing machines, sewing looms, and static background airwaves.
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
                      <span className="font-mono text-[9px] text-zinc-650 block">[ LOW MACHINE HUM ]</span>
                      <span className="font-sans font-extrabold text-xs uppercase tracking-tight">INDUSTRIAL WORKSHOP HEAVY HUM</span>
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
                      <span className="font-mono text-[9px] text-zinc-650 block">[ PULSE RATE ]</span>
                      <span className="font-sans font-extrabold text-xs uppercase tracking-tight">LOOM METRONOME STATIC</span>
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
                      <span className="font-mono text-[9px] text-zinc-650 block">[ SOFT AIR ]</span>
                      <span className="font-sans font-extrabold text-xs uppercase tracking-tight">VINTAGE BROADCAST STATIC</span>
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
