import React from "react";
import { Product, ApparelColor } from "../types";
import GlowCrown from "./GlowCrown";

interface ProductThumbnailProps {
  product: Product;
  selectedColor?: ApparelColor;
}

export default function ProductThumbnail({ product, selectedColor }: ProductThumbnailProps) {
  // Safe fallback for color if not defined
  const activeColor: ApparelColor = selectedColor || product.colors?.[0] || { name: "Bleach White", hex: "#FFFFFF", bgHex: "#1c1c1e" };
  const hasImage = !!(activeColor.imageUrl || product.imageUrl);

  return (
    <div className="w-full h-full flex items-center justify-center relative bg-black/30 overflow-hidden">
      {hasImage ? (
        <img
          src={activeColor.imageUrl || product.imageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      ) : (
        <div className="relative w-12 h-12 flex items-center justify-center">
          {product.id === "cb-jersey-01" && (
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
              <defs>
                <pattern id="camo-pattern-polo-thumb" width="20" height="20" patternUnits="userSpaceOnUse">
                  <rect width="20" height="20" fill="#444a30" />
                  <path d="M0,5 C3,7 5,5 8,8 Q12,12 15,6 T20,10 L20,20 L0,20 Z" fill="#1c2211" opacity="0.8" />
                </pattern>
              </defs>
              <path d="M 32,30 L 12,34 L 5,47 L 1,44 L 8,26 L 27,18 Z" fill="url(#camo-pattern-polo-thumb)" />
              <path d="M 68,30 L 88,34 L 95,47 L 99,44 L 92,26 L 73,18 Z" fill="url(#camo-pattern-polo-thumb)" />
              <path
                d="M 32,90 L 32,30 L 36,19 C 36,19 40,14 50,14 C 60,14 64,19 64,19 L 68,30 L 68,90 Z"
                fill={activeColor.hex}
              />
              <path d="M 36,19 L 45,26 L 50,22 L 55,26 L 64,19 Z" fill="#141416" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            </svg>
          )}

          {product.id === "cb-buttonup-02" && (
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
              <path
                d="M 30,90 L 30,26 L 10,31 L 3,45 L 0,41 L 8,22 L 26,16 C 30,16 35,18 35,18 C 35,18 40,12 50,12 C 60,12 65,18 65,18 C 65,18 70,16 74,16 L 92,22 L 100,41 L 97,45 L 90,31 L 70,26 L 70,90 Z"
                fill={activeColor.hex}
              />
              <path d="M 35,18 L 44,24 L 50,20 L 56,24 L 65,18 L 61,26 L 50,22 L 39,26 Z" fill="#18181b" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
            </svg>
          )}

          {product.id === "cb-crop-03" && (
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
              <path
                d="M 28,66 L 28,26 L 6,31 L 0,44 L 4,46 L 9,33 L 26,20 C 26,20 30,21 35,21 C 35,21 40,15 50,15 C 60,15 65,21 65,21 C 65,21 70,20 74,20 L 91,33 L 96,44 L 100,41 L 94,31 L 72,26 L 72,66 Z"
                fill={activeColor.hex}
              />
              <path d="M 35,21 C 35,28 65,28 65,21" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="3" />
            </svg>
          )}

          {product.id === "cb-sweatshirt-04" && (
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
              <path
                d="M 28,86 L 24,34 L 12,38 L 4,48 L 1,60 L 8,64 L 14,54 L 23,40 L 24,33 C 24,33 28,34 32,34 C 32,34 37,21 50,21 C 63,21 68,34 68,34 C 68,34 72,33 76,33 L 77,40 L 86,54 L 92,64 L 99,60 L 96,48 L 88,38 L 76,34 L 72,86 Z"
                fill={activeColor.hex}
              />
              <path d="M 32,34 C 35,41 65,41 68,34" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="3" />
            </svg>
          )}

          {product.id === "cb-trucker-05" && (
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
              <path
                d="M 25,65 C 25,35 38,25 50,25 C 62,25 75,35 75,65 Z"
                fill="#111"
              />
              <path
                d="M 33,65 C 33,35 40,27 50,27 C 60,27 67,35 67,65 Z"
                fill={activeColor.hex}
              />
              <path
                d="M 18,63 C 28,63 72,63 82,71 C 77,77 40,78 18,63 Z"
                fill={activeColor.hex}
                opacity="0.95"
                stroke="rgba(0,0,0,0.4)"
                strokeWidth="1.5"
              />
            </svg>
          )}

          {/* Fallback mockups if no custom match */}
          {!["cb-jersey-01", "cb-buttonup-02", "cb-crop-03", "cb-sweatshirt-04", "cb-trucker-05"].includes(product.id) && (
            <>
              {product.mockupType === "hoodie" ? (
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path
                    d="M 30,90 L 25,38 L 15,44 L 5,53 L 2,49 L 10,40 L 24,19 L 36,20 L 36,10 L 50,7 L 64,10 L 64,20 L 76,19 L 90,40 L 98,49 L 95,53 L 85,44 L 75,38 L 70,90 Z"
                    fill={activeColor.hex}
                  />
                </svg>
              ) : product.mockupType === "puffer" ? (
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path
                    d="M 28,90 L 25,28 L 12,32 L 4,43 L 1,58 L 8,62 L 15,53 L 25,43 L 25,28 L 36,20 C 36,20 40,12 50,12 C 60,12 64,20 64,20 L 75,28 L 75,43 L 85,53 L 92,62 L 99,58 L 96,43 L 88,32 L 75,28 L 72,90 Z"
                    fill={activeColor.hex}
                  />
                </svg>
              ) : product.mockupType === "cap" ? (
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path
                    d="M 25,65 C 25,35 38,25 50,25 C 62,25 75,35 75,65 Z"
                    fill={activeColor.hex}
                  />
                  <path
                    d="M 22,62 C 32,62 68,62 82,71 C 77,76 38,76 22,62 Z"
                    fill={activeColor.hex}
                    opacity="0.9"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path
                    d="M 32,90 L 32,30 L 12,34 L 5,47 L 1,44 L 8,26 L 27,18 L 36,19 C 36,19 40,14 50,14 C 60,14 64,19 64,19 L 73,18 L 92,26 L 99,44 L 95,47 L 88,34 L 88,30 L 68,90 Z"
                    fill={activeColor.hex}
                  />
                </svg>
              )}
            </>
          )}

          {/* Micro crown insignia layer */}
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-85"
            style={{
              width: product.id === "cb-trucker-05" ? "10px" : "14px",
              height: product.id === "cb-trucker-05" ? "6px" : "9px",
              transform: `translate(
                calc(-50% + ${product.id === "cb-buttonup-02" ? "4px" : "0px"}), 
                calc(-50% + ${
                  product.id === "cb-jersey-01" ? "-1px" :
                  product.id === "cb-buttonup-02" ? "-2px" :
                  product.id === "cb-sweatshirt-04" ? "-5px" :
                  product.id === "cb-trucker-05" ? "-3px" : "-1px"
                })
              )`
            }}
          >
            <GlowCrown
              size="100%"
              color={activeColor.name === "Bleach White" ? "#000000" : "#EFFF00"}
              glow={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
