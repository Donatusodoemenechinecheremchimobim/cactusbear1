export interface ApparelColor {
  name: string;
  hex: string;
  bgHex: string;
  isYellowTint?: boolean;
  imageUrl?: string;
}

export type ProductCat = "Outerwear" | "Tees" | "Headwear" | "Accessories";

export interface Product {
  id: string;
  name: string;
  category: ProductCat;
  price: number;
  description: string;
  details: string[];
  sizes: string[];
  colors: ApparelColor[];
  sku: string;
  hasBackPrint?: boolean;
  mockupType: "hoodie" | "puffer" | "tee" | "cap";
  imageUrl?: string;
  stock?: number;
}

export interface CartItem {
  id: string; // Unique ID composed of product_id + color + size
  product: Product;
  selectedColor: ApparelColor;
  selectedSize: string;
  quantity: number;
  customPrintScale?: number; // 0.8 to 1.5
  customPrintPosition?: "front" | "back";
}

export interface DropEvent {
  id: string;
  title: string;
  tagline: string;
  date: string;
  status: "locked" | "impending" | "live";
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string; // ISO string
}

