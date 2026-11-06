import ProductCard from "./ProductCard";

async function getProducts() {
  const response = await fetch(
    "https://dummyjson.com/products?limit=30"
  );

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}

export default async function ProductList() {
  const data = await getProducts();

  return (
    <main className="min-h-screen bg-white px-5 md:px-10 py-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">
          Products
        </h1>

        <p className="text-gray-500 text-sm">
          {data.total} Products Available
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

        {data.products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}

      </div>

    </main>
  );
}