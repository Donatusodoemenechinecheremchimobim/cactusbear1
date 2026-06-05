import { Product, DropEvent } from "./types";

export const CACTUS_BEAR_PRODUCTS: Product[] = [
  {
    id: "cb-jersey-01",
    name: "CAMO MULTI-SPECS FIELD POLO",
    category: "Tees",
    price: 142500,
    sku: "CB-POLO-01",
    description: "Athletic polo jersey engineered with high-strength performance knit body. Features vintage woodland camouflage paneling along the sleeves and shoulders, structured collared neck detail, front 'Cactus Bear' handwritten script, a highly-detailed white realistic crown of thorns chest logo, and custom numeric '00' camouflage prints on the main body.",
    details: [
      "Heavyweight dry-wick performance double-knit cotton blend",
      "Traditional woodland/forest camouflage sleeves & drop accent shoulders",
      "Structured soft ribbed knit collared neck with reinforced placket",
      "White realist crown of thorns front chest design & text block logo",
      "Bold camo-printed numeric '00' display core graphics"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Woodland Green Camo", hex: "#3f4 e27", bgHex: "linear-gradient(135deg, #444a30 0%, #1c2211 100%)" },
      { name: "Olive Sagewood Camo", hex: "#4a5a41", bgHex: "linear-gradient(135deg, #586f52 0%, #2b3a1a 100%)" },
      { name: "Shadow Obsidian Camo", hex: "#1c1c1e", bgHex: "linear-gradient(135deg, #2c2c2e 0%, #0c0c0d 100%)" }
    ],
    mockupType: "tee",
    stock: 3
  },
  {
    id: "cb-buttonup-02",
    name: "STITCH WOVEN SEED BOX SHIRT",
    category: "Outerwear",
    price: 165000,
    sku: "CB-SH-02",
    description: "Premium oversized box-fitting short-sleeve button-up shirt tailored from heavyweight structured linen-cotton drape canvas. Fastened with polished natural-grain buttons and flat-set classic notched collar. Detailed with a contrast graphic realistic crown of thorns with 'Cactus Bear' branding screen-printed elegantly on the left chest pocket.",
    details: [
      "Heavyweight natural linen-cotton woven fiber blend",
      "Relaxed boxy silhouette with dropped shoulder joints & wide sleeves",
      "Polished high-durability buttons along clean French front placket",
      "Pristine white realistic handsketched crown of thorns graphic left pocket print",
      "Double needle durable structural stitching along side panel seams"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Obsidian Black", hex: "#0c0c0d", bgHex: "#0c0c0d", imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop" },
      { name: "Tobacco Earth Brown", hex: "#8a5d3b", bgHex: "#8a5d3b", imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&auto=format&fit=crop" }
    ],
    mockupType: "tee",
    stock: 12
  },
  {
    id: "cb-crop-03",
    name: "CRAFT SIGNATURE HIGH-CROP TEE",
    category: "Tees",
    price: 97500,
    sku: "CB-CROP-03",
    description: "Ultra-fine combed cotton short crop top with a signature raw-edge boxy drape. Reinforced flat shoulders, double stitched sleeves, and high-definition central screen-print featuring our realistic white crown of thorns paired with clean signature brand writing.",
    details: [
      "100% fine cotton jersey - premium 240GSM soft-combed yarn",
      "Relaxed structural crop shape with clean raw-edge double hemline",
      "Ribbed thick crew neck band for clean retro shape retention",
      "Centralized white/black high-fidelity realistic crown core print",
      "Extremely comfortable, moisture-absorbing breathable weave"
    ],
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Obsidian Black", hex: "#0c0c0d", bgHex: "#0c0c0d", imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop" },
      { name: "Bleach White", hex: "#f8f9fa", bgHex: "#f8f9fa", imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop" }
    ],
    mockupType: "tee",
    stock: 4
  },
  {
    id: "cb-sweatshirt-04",
    name: "GIBRAN PHYSICIAN HEAVE-FLEECE CREW",
    category: "Outerwear",
    price: 225000,
    sku: "CB-GIBRAN-04",
    description: "Heavyweight French Terry fleece crewneck sweatshirt featuring our highly detailed realistic white crown of thorns artwork accompanied by Kahlil Gibran's timeless poetic wisdom: 'Your pain is the breaking of the shell that encloses your understanding. It is the bitter potion by which the physician within you heals your sick self. Therefore, trust the physician and drink his remedy...'",
    details: [
      "500GSM ultra-dense organic cotton French Terry interior weave",
      "Heavy-rib elastic side expanders, thick sleeve cuffs, and crew neck",
      "Iconic Kahlil Gibran literary healing verse printed meticulously on chest",
      "Intricately detailed large realistic crown of thorns design",
      "Deep pigment washed hue with absolute color lock shield"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Obsidian Black", hex: "#0a0a0b", bgHex: "#0a0a0b", imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop" },
      { name: "Tobacco Earth Brown", hex: "#8a5d3b", bgHex: "#8a5d3b", imageUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop" },
      { name: "Alpine Forest Green", hex: "#1b3524", bgHex: "#1b3524", imageUrl: "https://images.unsplash.com/photo-1609873814058-a8928924184a?q=80&w=600&auto=format&fit=crop" }
    ],
    mockupType: "hoodie",
    stock: 15
  },
  {
    id: "cb-trucker-05",
    name: "TRADITIONAL CROWN FOAM TRUCKER",
    category: "Headwear",
    price: 72000,
    sku: "CB-CP-05",
    description: "Authentic high-profile 5-panel foam trucker cap. High-density breathable mesh back paneling with adjustable snapback strap. Structured padded white foam crown front highlighted by our sharp scribbled crown of thorns logomark and hand-lettered signature script.",
    details: [
      "Premium poly-foam front panels with durable curved visor brim",
      "Authentic breathable color-matched mesh side & back panels",
      "Adjustable snap-lock rear buckle strap for perfect universal fit",
      "Thick sweat-absorbing internal padded forehead band",
      "Fine hand-sketched crown design printed high-definition"
    ],
    sizes: ["OS (Adjustable)"],
    colors: [
      { name: "Forest Green Snapback", hex: "#1b3524", bgHex: "#1b3524" },
      { name: "Charcoal Grey Snapback", hex: "#4d4d54", bgHex: "#4d4d54" },
      { name: "Tobacco Brown Snapback", hex: "#8a5d3b", bgHex: "#8a5d3b" }
    ],
    mockupType: "cap",
    stock: 2
  }
];

export const DROPS_TIMELINE: DropEvent[] = [
  {
    id: "drop-unleash",
    title: "CROWN & CAMO: REAL APPAREL SERIES",
    tagline: "Heavy-knitted French terry sweatshirts, structured field collared polos, boxy crop tees, and traditional cap snapbacks, centered on natural thorn elements.",
    date: "AVAILABLE NOW",
    status: "live"
  },
  {
    id: "drop-collab",
    title: "CB X HEAVY SILENT DIVISION",
    tagline: "Fine leather military drop accessories and functional rugged utility tactical chest bags. Strictly limited series.",
    date: "JULY 22, 2026",
    status: "locked"
  }
];
