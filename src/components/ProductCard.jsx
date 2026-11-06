import Link from "next/link";

export default function ProductCard({ product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group border border-gray-200 rounded-2xl p-3 hover:shadow-lg transition duration-300"
    >
      {/* Product Image */}
      <div className="bg-gray-100 rounded-xl h-52 flex items-center justify-center overflow-hidden">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="w-full h-full object-contain p-3 group-hover:scale-105 transition duration-300"
        />
      </div>

      {/* Product Information */}
      <div className="mt-3">
        <h3 className="font-semibold text-sm truncate">
          {product.title}
        </h3>

        <p className="text-gray-600 text-sm mt-1">
          ${product.price}
        </p>

        <div className="flex justify-between mt-3 text-xs text-gray-500">
          <span>Stock: {product.stock}</span>
          <span>⭐ {product.rating}</span>
        </div>
      </div>
    </Link>
  );
}