import Link from "next/link";
import { notFound } from "next/navigation";
import { PREDICTION_CONFIG } from "@/config/predictionConfig";

async function getProduct(id) {
  try {
    // Try by ID first
    let response = await fetch(`${PREDICTION_CONFIG.API_BASE_URL}/api/v1/product/${id}`, {
      cache: "no-store",
    });

    // Fallback: try by slug
    if (!response.ok) {
      response = await fetch(`${PREDICTION_CONFIG.API_BASE_URL}/api/v1/product/slug/${id}`, {
        cache: "no-store",
      });
    }

    if (!response.ok) return null;
    const json = await response.json();
    return json.data || json;
  } catch (err) {
    console.error("getProduct error:", err.message);
    return null;
  }
}

export default async function ProductDetails({ id }) {
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const isImputed = Boolean(product.attributes?.price_imputed);
  const sourceName = product.sources?.[0]?.name || product.attributes?.source_domain || "Mined Website";
  const sourceUrl = product.sources?.[0]?.url || "";
  const segment = product.attributes?.segment || "Cluster 0";
  const rawImages = product.images && product.images.length > 0
    ? product.images.map((img) => (typeof img === "string" ? img : img.url)).filter(Boolean)
    : [product.thumbnail || "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80"];

  const images = rawImages.filter((url) => {
    const u = url.toLowerCase();
    return !u.endsWith(".svg") && !u.includes("photos.svg") && !u.includes("customer.svg") && !u.includes("logo");
  });
  if (images.length === 0) {
    images.push("https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80");
  }

  const specs = product.specifications || {};
  const attrs = product.attributes || {};

  // Exclude unwanted or internal attributes from display
  const excludedAttrKeys = new Set([
    "segment",
    "is_smart",
    "is_wireless",
    "is_inverter",
    "is_hd",
    "source_domain",
    "price_imputed",
    "imputed_price",
    "original_price",
  ]);

  const displayAttrs = Object.entries(attrs).filter(
    ([key]) => !excludedAttrKeys.has(key.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-white w-full">
      <div className="max-w-7xl mx-auto px-5 md:px-12 py-8">
        {/* Breadcrumb */}
      <div className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-black">Home</Link>
        {" / "}
        <Link href="/products" className="hover:text-black">Products</Link>
        {" / "}
        <span className="text-gray-900 font-medium truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex items-center justify-center min-h-[380px] max-h-[500px]">
            <img
              src={images[0]}
              alt={product.name}
              className="max-h-[420px] w-full object-contain"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((imgUrl, i) => (
                <div key={i} className="w-20 h-20 bg-gray-50 border rounded-xl p-1 shrink-0 flex items-center justify-center">
                  <img src={imgUrl} alt="" className="w-full h-full object-contain" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {/* Target site & status pills */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="bg-slate-900 text-white text-xs px-3 py-1 rounded-full font-medium">
              {sourceName}
            </span>
            {isImputed && (
              <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-bold border border-purple-200">
                ML Learned Price
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-snug">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
            <span>Brand: <strong className="text-black">{typeof product.brand === "string" ? product.brand : "Unknown"}</strong></span>
            <span>•</span>
            <span className="text-slate-700 font-medium">Rating: {Number(product.rating?.average || 0).toFixed(1)} / 5</span>
          </div>

          {/* Price Section */}
          <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-200">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-slate-900">
                ৳{Number(product.price || 0).toLocaleString()}
              </span>
              <span className="text-sm text-gray-500">BDT</span>
            </div>

            {/* ML Imputation Callout */}
            {isImputed && (
              <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 leading-relaxed">
                <p className="font-bold mb-1 text-purple-950">
                  Price Estimated by Machine Learning Regression
                </p>
                <p>
                  This product had no price listed on the source website. Our Random Forest Regressor estimated this value by analyzing correlated technical specifications and brand pricing distributions.
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-6">
              <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
              <p className="text-gray-700 text-sm leading-relaxed max-h-48 overflow-y-auto">
                {product.description}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex gap-4">
            {sourceUrl ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-black text-white text-center rounded-xl py-3.5 font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-2 text-sm"
              >
                <span>View on {sourceName}</span>
                <span>↗</span>
              </a>
            ) : null}
            <Link
              href="/products"
              className="border border-gray-300 text-gray-800 px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
            >
              Back to Catalog
            </Link>
          </div>
        </div>
      </div>

      {/* Specifications Table */}
      {Object.keys(specs).length > 0 && (
        <section className="mt-14 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-bold text-slate-900 mb-5">
            Technical Specifications
          </h2>
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <tbody>
                {Object.entries(specs).map(([key, val], idx) => (
                  <tr key={key} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-3.5 font-medium text-slate-700 w-1/3 border-b border-gray-100">
                      {key}
                    </td>
                    <td className="px-6 py-3.5 text-slate-900 border-b border-gray-100">
                      {String(val)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Derived Academic Data Mining Attributes */}
      {displayAttrs.length > 0 && (
        <section className="mt-10 border-t border-gray-200 pt-8 mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-5">
            Data Mining & Extracted Attributes
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {displayAttrs.map(([key, val]) => (
              <div key={key} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-mono capitalize">
                  {key.replace(/_/g, " ")}
                </p>
                <p className="text-sm font-bold text-slate-800 mt-1">
                  {typeof val === "boolean" ? (val ? "Yes" : "No") : String(val)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
      </div>
    </main>
  );
}
