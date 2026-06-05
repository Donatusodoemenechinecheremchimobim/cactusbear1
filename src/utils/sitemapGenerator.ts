import { Product } from "../types";

/**
 * Generates a standard compliance Google Sitemap (XML format) on the fly
 * based on the active live catalog list.
 * 
 * @param products List of active heavyweight streetwear garments.
 * @param origin Optional site origin fallback. Defaults to current window location.
 * @returns Standard XML sitemap string.
 */
export function generateSitemapXml(products: Product[], origin?: string): string {
  const baseUri = origin || (typeof window !== "undefined" ? window.location.origin : "https://cactusbear-labs.web.app");
  
  // Header declaration
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. Core Landing Portal
  const today = new Date().toISOString().split("T")[0];
  xml += `  <!-- PRIMARY PORTAL ENTRYPOINT -->\n`;
  xml += `  <url>\n`;
  xml += `    <loc>${baseUri}/</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `  </url>\n\n`;

  // 2. Collection Catalog Overview
  xml += `  <!-- LIVE COLLECTION CATALOG -->\n`;
  xml += `  <url>\n`;
  xml += `    <loc>${baseUri}/?page=collection</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>0.9</priority>\n`;
  xml += `  </url>\n\n`;

  // 3. Collectibles & Timer Drops Page
  xml += `  <!-- TIMER DROPS PORTAL -->\n`;
  xml += `  <url>\n`;
  xml += `    <loc>${baseUri}/?page=drop</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `    <changefreq>weekly</changefreq>\n`;
  xml += `    <priority>0.8</priority>\n`;
  xml += `  </url>\n\n`;

  // 4. Atelier Chronicles (Story page)
  xml += `  <!-- ATELIER CHRONICLES -->\n`;
  xml += `  <url>\n`;
  xml += `    <loc>${baseUri}/?page=story</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `    <changefreq>monthly</changefreq>\n`;
  xml += `    <priority>0.7</priority>\n`;
  xml += `  </url>\n\n`;

  // 5. Dynamic Products Section
  if (products && products.length > 0) {
    xml += `  <!-- DYNAMIC INDIVIDUAL STREETWEAR RELEASES -->\n`;
    products.forEach((product) => {
      // Escape XML characters out of safety for URLs / query params
      const cleanUrl = `${baseUri}/?product=${product.id}`.replace(/&/g, "&amp;").replace(/'/g, "&apos;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      
      xml += `  <url>\n`;
      xml += `    <loc>${cleanUrl}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    });
  }

  // Close tags
  xml += `</urlset>`;
  return xml;
}

/**
 * Utility to trigger an in-browser downloading scheme of the newly generated sitemap.xml
 */
export function downloadSitemapFile(xmlContent: string) {
  const blob = new Blob([xmlContent], { type: "application/xml;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "sitemap.xml");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
