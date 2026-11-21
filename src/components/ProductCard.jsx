import Link from "next/link";

export default function ProductCard({ product }) {
  const isImputed = product.isPriceImputed || product.attributes?.price_imputed;
  const source = product.source || product.sources?.[0]?.name || product.attributes?.source_domain;
  const segment = product.segment || product.attributes?.segment;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative border border-gray-200 rounded-2xl p-3 hover:shadow-lg transition duration-300 flex flex-col justify-between bg-white"
    >
      {/* Product Image Container */}
      <div className="relative bg-gray-50 rounded-xl h-52 flex items-center justify-center overflow-hidden">
        {/* Source Site Badge */}
        {source && (
          <span className="absolute top-2 left-2 z-10 bg-black/75 text-white text-[10px] px-2 py-0.5 rounded-full font-medium tracking-tight">
            {source}
          </span>
        )}

        {/* ML Imputed Price Badge */}
        {isImputed && (
          <span className="absolute top-2 right-2 z-10 bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold shadow-sm">
            ML Imputed
          </span>
        )}

        <img
          src={product.thumbnail || "https://placehold.co/400x400/f3f4f6/94a3b8?text=No+Image"}
          alt={product.title}
          className="w-full h-full object-contain p-3 group-hover:scale-105 transition duration-300"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/400x400/f3f4f6/94a3b8?text=Product";
          }}
        />
      </div>

      {/* Product Information */}
      <div className="mt-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-sm line-clamp-2 text-slate-900 group-hover:text-blue-600 transition">
            {product.title}
          </h3>

          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-slate-900 font-bold text-base">
              ৳{Number(product.price || 0).toLocaleString()}
            </p>
            {isImputed && (
              <span className="text-[11px] text-purple-600 font-medium">
                (Est. by ML)
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500">
          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px]">
            {segment || "Cluster 0"}
          </span>
          <span className="flex items-center gap-1 font-medium">
            Rating: {Number(product.rating || 0).toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
}
