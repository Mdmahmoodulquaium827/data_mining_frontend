import ProductBrowser from "./ProductBrowser";
import { PREDICTION_CONFIG } from "@/config/predictionConfig";

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
      thumbnail: item.images?.[0]?.url || item.images?.[0] || "",
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
