import { motion } from "motion/react";

interface GlowCrownProps {
  className?: string;
  size?: number | string;
  color?: string;
  glow?: boolean;
}

export default function GlowCrown({
  className = "",
  size = 200,
  color = "#FFFFFF",
  glow = false,
}: GlowCrownProps) {
  // If size is a percentage, let's treat the container dimension dynamically
  const isPercent = typeof size === "string" && size.endsWith("%");
  const containerStyle = isPercent
    ? { width: size }
    : { width: size, height: typeof size === "number" ? Math.round(size * 240 / 400) : size };

  return (
    <div
      className={`relative flex items-center justify-center transition-all ${
        isPercent ? "w-full aspect-[400/240]" : ""
      } ${className}`}
      style={containerStyle}
      id="glow-crown-container"
    >
      <motion.svg
        viewBox="0 0 400 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full cursor-pointer overflow-visible"
        id="glow-crown-svg"
        animate={{
          rotate: [0, 0.5, -0.5, 0.3, -0.3, 0],
          y: [0, -2, 2, -1, 1, 0]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{ scale: 1.03 }}
      >
        <defs>
          <filter id="bone-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <g filter={glow ? "url(#bone-glow-filter)" : undefined}>
          
          {/* Main Ring - Interlocking Vine Strand A */}
          <path
            d="M 60,120 C 60,70 140,55 200,55 C 260,55 340,70 340,120 C 340,170 260,185 200,185 C 140,185 60,170 60,120 Z"
            stroke={color}
            strokeWidth="3.5"
            strokeLinejoin="round"
            opacity="0.95"
          />

          {/* Interlocking Vine Strand B (Intricate weaves) */}
          <path
            d="M 64,115 C 68,75 130,62 198,60 C 264,58 332,70 338,110 C 344,152 278,175 204,178 C 130,181 60,152 64,115 Z"
            stroke={color}
            strokeWidth="2.5"
            strokeLinejoin="round"
            opacity="0.85"
          />

          {/* Interlocking Vine Strand C (Gnarly knots crossing over) */}
          <path
            d="M 54,125 C 50,85 120,70 205,67 C 290,64 344,75 346,118 C 348,161 275,182 210,188 C 145,194 58,162 54,125 Z"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
            opacity="0.75"
          />

          {/* Interlocking Vine Strand D (Tight wrap wires) */}
          <path
            d="M 75,108 C 88,85 152,78 200,78 C 248,78 308,82 318,108 C 328,134 258,168 200,168 C 142,168 85,134 75,108 Z"
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
            opacity="0.65"
          />

          {/* S-curves wrapping individually to give 3D depth */}
          <path d="M 68,90 Q 75,85 85,92" stroke={color} strokeWidth="1.5" opacity="0.8" />
          <path d="M 120,60 Q 130,52 145,58" stroke={color} strokeWidth="2" opacity="0.8" />
          <path d="M 180,52 Q 192,48 205,53" stroke={color} strokeWidth="1.8" opacity="0.8" />
          <path d="M 255,54 Q 268,48 280,56" stroke={color} strokeWidth="2" opacity="0.8" />
          <path d="M 312,82 Q 320,88 325,78" stroke={color} strokeWidth="1.5" opacity="0.8" />
          <path d="M 334,136 Q 324,142 328,150" stroke={color} strokeWidth="1.5" opacity="0.8" />
          <path d="M 285,178 Q 275,188 260,182" stroke={color} strokeWidth="2.1" opacity="0.8" />
          <path d="M 210,188 Q 200,195 188,189" stroke={color} strokeWidth="2" opacity="0.8" />
          <path d="M 140,184 Q 130,178 120,182" stroke={color} strokeWidth="1.5" opacity="0.8" />
          <path d="M 72,154 Q 65,148 58,154" stroke={color} strokeWidth="1.8" opacity="0.8" />

          {/* HEAVY SCREENPRINT-STYLE REALISTIC BEZIER CURVED THORNS (EXACT MATCH FOR CACTUS BEAR IMAGE - LESS THORNS) */}
          {/* Top Edge Thorns pointing Outward */}
          <path d="M 85,78 Q 80,58 60,45 Q 86,64 93,74 Z" fill={color} />
          <path d="M 142,56 Q 140,30 132,10 Q 146,35 152,53 Z" fill={color} />
          <path d="M 210,50 Q 210,25 208,5 Q 216,25 218,49 Z" fill={color} />
          <path d="M 282,61 Q 292,40 305,20 Q 294,44 290,64 Z" fill={color} />
          <path d="M 312,74 Q 328,58 348,42 Q 326,64 318,80 Z" fill={color} />

          {/* Right Edge Thorns pointing Outward */}
          <path d="M 338,122 Q 365,120 384,120 Q 354,124 338,132 Z" fill={color} />

          {/* Bottom Edge Thorns pointing Outward */}
          <path d="M 285,175 Q 298,205 312,228 Q 284,188 273,178 Z" fill={color} />
          <path d="M 200,188 Q 200,215 198,238 Q 206,215 208,189 Z" fill={color} />
          <path d="M 115,175 Q 100,205 85,228 Q 108,188 105,178 Z" fill={color} />

          {/* Left Edge Thorns pointing Outward */}
          <path d="M 62,122 Q 35,120 16,120 Q 42,116 58,112 Z" fill={color} />

          {/* Inner Thorns pointing Inward */}
          <path d="M 105,94 Q 120,105 138,118 Q 115,100 111,90 Z" fill={color} />
          <path d="M 200,68 Q 200,85 200,105 Q 206,85 206,68 Z" fill={color} />
          <path d="M 295,94 Q 280,105 262,118 Q 285,100 289,90 Z" fill={color} />
          
          <path d="M 270,162 Q 255,145 238,125 Q 262,150 258,164 Z" fill={color} />
          <path d="M 130,162 Q 145,145 162,125 Q 138,150 142,164 Z" fill={color} />

          {/* Organic intersecting seed nodules */}
          <circle cx="95" cy="85" r="2.5" fill={color} />
          <circle cx="150" cy="62" r="2" fill={color} />
          <circle cx="205" cy="56" r="2.5" fill={color} />
          <circle cx="280" cy="65" r="2" fill={color} />
          <circle cx="320" cy="115" r="3" fill={color} />
          <circle cx="305" cy="155" r="2" fill={color} />
          <circle cx="165" cy="180" r="2" fill={color} />
          <circle cx="115" cy="170" r="2.5" fill={color} />
        </g>
      </motion.svg>
    </div>
  );
}
