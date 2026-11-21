"use client";

import { useMemo, useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import predictionService from "@/services/predictionService";

export default function ProductBrowser({ products = [] }) {
  const [items, setItems] = useState(products);
  const [selectedSite, setSelectedSite] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [onlyImputed, setOnlyImputed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 12;

  useEffect(() => {
    setItems(products);
  }, [products]);

  // Listen to minedSitesUpdated to refresh catalog instantly when sites are deleted
  useEffect(() => {
    const handleUpdate = () => {
      predictionService.getProducts()
        .then((raw) => {
          if (Array.isArray(raw)) {
            const mapped = raw.map((item) => ({
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
            setItems(mapped);
          }
        })
        .catch((err) => console.error("Error refreshing catalog:", err));
    };

    window.addEventListener("minedSitesUpdated", handleUpdate);
    return () => window.removeEventListener("minedSitesUpdated", handleUpdate);
  }, []);

  // Extract unique target sites/domains dynamically
  const sites = useMemo(() => {
    const uniqueSites = [
      ...new Set(items.map((p) => p.source).filter(Boolean)),
    ];
    return ["all", ...uniqueSites];
  }, [items]);

  // Extract categories dynamically
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(items.map((product) => product.category).filter(Boolean)),
    ];
    return ["all", ...uniqueCategories];
  }, [items]);

  // Comprehensive multi-filter
  const filteredProducts = useMemo(() => {
    return items.filter((product) => {
      const matchesSite =
        selectedSite === "all" || product.source === selectedSite;

      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;

      const matchesImputed =
        !onlyImputed || Boolean(product.isPriceImputed || product.attributes?.price_imputed);

      const matchesSearch =
        product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSite && matchesCategory && matchesImputed && matchesSearch;
    });
  }, [items, selectedSite, selectedCategory, onlyImputed, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Mined Products Catalog
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real products mined from target websites with ML-enriched features
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by title, brand, spec..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-gray-100 rounded-full text-gray-900 py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-gray-300"
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

      {/* Target Site / Source Filter */}
      {sites.length > 1 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
              Target Site:
            </span>
            {sites.map((site) => (
              <button
                key={site}
                onClick={() => {
                  setSelectedSite(site);
                  setCurrentPage(1);
                }}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition cursor-pointer ${
                  selectedSite === site
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {site === "all" ? "All Sites" : site}
              </button>
            ))}

            {/* ML Imputed Price Toggle */}
            <button
              onClick={() => {
                setOnlyImputed(!onlyImputed);
                setCurrentPage(1);
              }}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition cursor-pointer border ${
                onlyImputed
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
              }`}
            >
              {onlyImputed ? "Showing ML Imputed Only" : "Filter: ML Imputed Prices"}
            </button>
          </div>
        </div>
      )}

      {/* Category Filter */}
      {categories.length > 2 && (
        <div className="py-2 border-b border-gray-100 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide pb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
              Category:
            </span>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-medium capitalize transition cursor-pointer ${
                  selectedCategory === category
                    ? "bg-slate-800 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {category === "all" ? "All Categories" : category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Product Count & Active Filters */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm font-medium text-gray-600">
          Showing <span className="font-bold text-black">{filteredProducts.length}</span> of {products.length} products
        </p>

        {(searchTerm || selectedSite !== "all" || selectedCategory !== "all" || onlyImputed) && (
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedSite("all");
              setSelectedCategory("all");
              setOnlyImputed(false);
              setCurrentPage(1);
            }}
            className="text-xs text-blue-600 hover:underline cursor-pointer font-medium"
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* Product Grid */}
      {currentProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {currentProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-800 mt-3">
            No products match the selected filters
          </h2>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Try choosing another target website, category, or clear your search term.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-2 mt-12">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 rounded-lg text-sm font-semibold cursor-pointer ${
                currentPage === page
                  ? "bg-black text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
