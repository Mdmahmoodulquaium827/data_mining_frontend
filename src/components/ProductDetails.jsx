import Link from "next/link";
import { notFound } from "next/navigation";

async function getProduct(id) {
  const response = await fetch(
    `https://dummyjson.com/products/${id}`
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export default async function ProductDetails({ id }) {
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white px-5 md:px-10 py-8">

      {/* Breadcrumb */}
      <div className="mb-7 text-sm text-gray-500">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        {" / "}
        <Link href="/products" className="hover:text-black">
          Products
        </Link>
        {" / "}
        {product.title}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* Product Image */}
        <div className="bg-gray-100 rounded-2xl p-6 flex items-center justify-center">
          <img
            src={product.images?.[0] || product.thumbnail}
            alt={product.title}
            className="w-full h-[350px] md:h-[480px] object-contain"
          />
        </div>

        {/* Product Information */}
        <div className="py-3">

          <h1 className="text-3xl font-bold">
            {product.title}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            <span className="text-yellow-500">
              ⭐ {product.rating}
            </span>

            <span className="text-gray-500 text-sm">
              {product.reviews?.length || 0} Reviews
            </span>
          </div>

          <h2 className="text-2xl font-bold mt-5">
            ${product.price}
          </h2>

          {/* Description */}
          <div className="border rounded-xl p-4 mt-6">
            <h3 className="font-semibold mb-2">
              Description
            </h3>

            <p className="text-gray-600 text-sm leading-6">
              {product.description}
            </p>
          </div>

          {/* Product Details */}
          <div className="mt-6 space-y-3 text-sm">

            <p>
              <strong>Category:</strong>{" "}
              {product.category}
            </p>

            <p>
              <strong>Brand:</strong>{" "}
              {product.brand || "N/A"}
            </p>

            <p>
              <strong>Stock:</strong>{" "}
              {product.stock}
            </p>

            <p>
              <strong>Availability:</strong>{" "}
              {product.availabilityStatus}
            </p>

            <p>
              <strong>Shipping:</strong>{" "}
              {product.shippingInformation}
            </p>

          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">

            <button
              disabled={product.stock === 0}
              className="flex-1 border border-black rounded-full py-3 font-medium hover:bg-gray-100 disabled:opacity-50"
            >
              Add to Cart
            </button>

            <button
              disabled={product.stock === 0}
              className="flex-1 bg-black text-white rounded-full py-3 font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              Buy Now
            </button>

          </div>

        </div>

      </div>

      {/* Reviews */}
      <section className="mt-14">
        <h2 className="text-2xl font-bold mb-6">
          Ratings & Reviews
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {product.reviews?.length > 0 ? (
            product.reviews.map((review, index) => (
              <div
                key={index}
                className="border rounded-xl p-5"
              >
                <h3 className="font-semibold">
                  {review.reviewerName}
                </h3>

                <p className="text-yellow-500 mt-2">
                  ⭐ {review.rating}/5
                </p>

                <p className="text-gray-600 text-sm mt-3">
                  {review.comment}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">
              No reviews available.
            </p>
          )}

        </div>
      </section>

    </main>
  );
}