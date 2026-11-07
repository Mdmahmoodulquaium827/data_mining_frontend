"use client";

import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";

export default function ProductBrowser({ products = [] }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 12;

  //  Get categories dynamically
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(products.map((product) => product.category).filter(Boolean)),
    ];

    return ["all", ...uniqueCategories];
  }, [products]);

  //  Search and category filtering
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" ||
        product.category === selectedCategory;

      const matchesSearch =
        product.title?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  //  Pagination
  const totalPages = Math.ceil(
    filteredProducts.length / productsPerPage
  );

  const startIndex = (currentPage - 1) * productsPerPage;

  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  // Category selection
  const handleCategory = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // Search
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Products
        </h1>

        <div className="relative w-full sm:w-80">

          <input
            type="text"
            placeholder="Search product..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-gray-100 rounded-full text-gray-900 py-3 pl-11 pr-4 text-sm outline-none focus:ring-1 focus:ring-gray-400"
          />

          <svg
            className="absolute left-4 top-3.5 w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="7" strokeWidth="2" />
            <path d="m16 16 4 4" strokeWidth="2" />
          </svg>

        </div>

      </div>

{/*Category Navigation */}
<div className=" top-[96px] z-40 bg-white py-3 border-b border-gray-100">

  <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">

    {categories.map((category) => (
      <button
        key={category}
        onClick={() => handleCategory(category)}
        className={`shrink-0 rounded-full px-5 py-3 text-sm font-medium capitalize transition ${
          selectedCategory === category
            ? "bg-gray-100 text-black"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        {category === "all" ? "All Products" : category}
      </button>
    ))}

  </div>
</div>

      {/* Product Count */}
      <div className="flex justify-between items-center mb-5">

        <p className="text-sm text-gray-500">
          {filteredProducts.length} Products Available
        </p>

        {searchTerm && (
          <button
            onClick={() => handleSearch("")}
            className="text-sm text-gray-500 underline"
          >
            Clear Search
          </button>
        )}

      </div>

      {/* Product Grid */}
      {currentProducts.length > 0 ? (

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-5">

          {currentProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}

        </div>

      ) : (

        <div className="text-center py-20">
          <h2 className="text-xl font-semibold text-gray-700">
            No Products Found
          </h2>

          <p className="text-gray-500 mt-2">
            Try another search or category.
          </p>
        </div>

      )}

      {/* Pagination */}
      {totalPages > 1 && (

        <div className="flex flex-wrap justify-center items-center gap-2 mt-10">

          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 text-black"
          >
            Previous
          </button>

          {Array.from(
            { length: totalPages },
            (_, index) => index + 1
          ).map((page) => (

            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 rounded-lg text-sm ${
                currentPage === page
                  ? "bg-black text-white"
                  : "border border-gray-400 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>

          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 text-black"
          >
            Next
          </button>

        </div>

      )}

    </section>
  );
}