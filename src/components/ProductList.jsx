import ProductBrowser from "./ProductBrowser";

async function getProducts() {
  const response = await fetch(
    "https://dummyjson.com/products?limit=0"
  );

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}

export default async function ProductList() {
  const data = await getProducts();

  return (
    <main className="min-h-screen bg-white">
      <ProductBrowser products={data.products || []} />
    </main>
  );
}