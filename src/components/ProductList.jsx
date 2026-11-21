import ProductBrowser from "./ProductBrowser";
import { PREDICTION_CONFIG } from "@/config/predictionConfig";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80";

function resolveProductThumbnail(images) {
  if (!images || !Array.isArray(images) || images.length === 0) return FALLBACK_IMAGE;
  for (const img of images) {
    const u = (typeof img === "string" ? img : img?.url || "").toLowerCase();
    if (!u) continue;
    if (u.endsWith(".svg") || u.includes("photos.svg") || u.includes("customer.svg") || u.includes("logo") || u.includes("icon")) {
      continue;
    }
    return typeof img === "string" ? img : img.url;
  }
  return typeof images[0] === "string" ? images[0] : images[0]?.url || FALLBACK_IMAGE;
}

async function getProducts() {
  try {
    const response = await fetch(`${PREDICTION_CONFIG.API_BASE_URL}/api/v1/product`, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn("Failed to fetch from backend, returning empty list.");
      return [];
    }

    const json = await response.json();
    const rawProducts = json.data || (Array.isArray(json) ? json : []);

    // Normalize MongoDB product schema for Frontend
    return rawProducts.map((item) => ({
      id: item._id || item.productSlug,
      productSlug: item.productSlug,
      title: item.name,
      price: item.price,
      currency: item.currency || "BDT",
      thumbnail: resolveProductThumbnail(item.images),
      images: item.images || [],
      brand: typeof item.brand === "string" ? item.brand : item.brand?.name || "Unknown",
      rating: item.rating?.average || 0,
      stock: item.stock || 50,
      category: item.categories?.[0] || item.tags?.[0] || "General",
      source: item.sources?.[0]?.name || item.attributes?.source_domain || "Mined",
      sourceUrl: item.sources?.[0]?.url || "",
      attributes: item.attributes || {},
      specifications: item.specifications || {},
      isPriceImputed: Boolean(item.attributes?.price_imputed),
      segment: item.attributes?.segment || "Cluster 0",
    }));
  } catch (err) {
    console.error("ProductList fetch error:", err.message);
    return [];
  }
}

export default async function ProductList() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-white">
      <ProductBrowser products={products} />
    </main>
  );
}
