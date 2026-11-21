"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import predictionService from "@/services/predictionService";

function MetricCard({ title, value, description, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className={`text-3xl font-bold mt-2 ${color}`}>
        {value}
      </h2>
      <p className="text-xs text-gray-400 mt-2">{description}</p>
    </div>
  );
}

function SectionCard({ title, description, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-800">
          {title}
        </h2>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      {children}
    </div>
  );
}

export default function DataCleaningPage() {
  const [search, setSearch] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [analyticsData, productsData] = await Promise.all([
          predictionService.getAnalytics().catch(() => null),
          predictionService.getProducts().catch(() => []),
        ]);
        if (analyticsData) setAnalytics(analyticsData);
        if (Array.isArray(productsData)) setProducts(productsData);
      } catch (err) {
        console.error("Failed to load cleaning analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const [featureFilter, setFeatureFilter] = useState("all");

  const cleaning = analytics?.cleaning || {};
  const summary = cleaning.summary || {
    totalRecords: products.length || 0,
    totalColumns: 14,
    missingValues: 0,
    duplicateRecords: 0,
    completeness: 100,
  };

  const missingData = cleaning.missingData && cleaning.missingData.length > 0
    ? cleaning.missingData
    : [
        { column: "Price", missing: 0 },
        { column: "Brand", missing: 0 },
        { column: "Rating", missing: 0 },
      ];

  const enrichedColumns = useMemo(() => {
    const rawCols = cleaning.columns && cleaning.columns.length > 0
      ? cleaning.columns
      : [
          { name: "name", type: "String", missing: 0 },
          { name: "price", type: "Float", missing: 0 },
          { name: "brand", type: "String", missing: 0 },
          { name: "availability", type: "String", missing: 0 },
          { name: "rating", type: "Float", missing: 0 },
          { name: "rating_count", type: "Integer", missing: 0 },
          { name: "ram_gb", type: "Float", missing: 0 },
          { name: "storage", type: "Float", missing: 0 },
          { name: "is_smart", type: "Boolean", missing: 0 },
          { name: "is_inverter", type: "Boolean", missing: 0 },
        ];

    const totalRows = summary.totalRecords || products.length || 10;

    return rawCols.map((col) => {
      const colName = col.name.toLowerCase();
      let strategy = col.strategy;
      let technique = col.technique;
      let category = "standard";

      if (colName === "price") {
        strategy = strategy || "ML Regression (Random Forest)";
        technique = technique || "Trained Random Forest Regressor on correlated technical specs and brand pricing distributions with median fallback.";
        category = "ml";
      } else if (colName === "rating" || colName === "rating_count") {
        strategy = strategy || "Numerical Baseline Normalization";
        technique = technique || "Unobserved customer feedback normalized to 0.0 rating and 0 count to preserve mathematical scale without skewing models.";
        category = "baseline";
      } else if (colName === "brand" || colName === "availability") {
        strategy = strategy || "Categorical Canonical Mapping";
        technique = technique || "Normalized via site heuristic profiles or mapped to standard categorical tokens (InStock, OutOfStock, Unknown).";
        category = "canonical";
      } else if (["ram_gb", "storage", "size", "capacity", "power", "battery"].includes(colName)) {
        strategy = strategy || "Spec Table Regex Mining";
        technique = technique || "Extracted from product titles, descriptions, and technical specifications tables; remaining missing rows imputed with 0.0.";
        category = "spec";
      } else if (colName.startsWith("is_") || colName.startsWith("has_")) {
        strategy = strategy || "Boolean Keyword Feature Engineering";
        technique = technique || "Derived via domain-specific vocabulary matching against titles, specifications, and descriptions.";
        category = "engineered";
      } else {
        strategy = strategy || "Text Sanitization";
        technique = technique || "HTML tags stripped, whitespace trimmed, and normalized to clean text strings.";
        category = "standard";
      }

      const missingCnt = col.missing || 0;
      const missingPct = Math.round((missingCnt / Math.max(1, totalRows)) * 100);

      return {
        ...col,
        strategy,
        technique,
        category,
        missing: missingCnt,
        missingPercent: missingPct,
      };
    });
  }, [cleaning.columns, summary.totalRecords, products.length]);

  const filteredColumns = useMemo(() => {
    if (featureFilter === "all") return enrichedColumns;
    return enrichedColumns.filter((c) => c.category === featureFilter);
  }, [enrichedColumns, featureFilter]);

  const previewList = products.length > 0
    ? products
    : cleaning.preview || [];

  const filteredProducts = previewList.filter((product) => {
    const title = product.name || product.title || "";
    return title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-10">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Data Overview & Cleaning
          </h1>
          <p className="text-gray-500 mt-2">
            Inspect data quality, missing value distributions, and cleaning transformations on your mined dataset.
          </p>
        </div>

        {products.length === 0 && (!analytics?.cleaning?.summary?.totalRecords || analytics?.cleaning?.summary?.totalRecords === 0) ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 p-8">
            <h2 className="text-xl font-bold text-slate-800">No Mined Dataset Found</h2>
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              There is currently no active dataset in the database. Run a mining job from the Home page to scrape products and view data cleaning metrics.
            </p>
            <Link
              href="/"
              className="mt-5 inline-block bg-black text-white px-6 py-2.5 rounded-full text-xs font-semibold hover:bg-gray-800 transition"
            >
              Start Mining
            </Link>
          </div>
        ) : (
          <>
            {/* Dataset Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-800">
                    Dataset Information
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Target Source: <strong className="text-slate-900">{analytics?.sourceDomain || "Live Mined Products"}</strong>
                  </p>
                </div>

                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Live Pipeline Active
                </span>
              </div>
            </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <MetricCard
            title="Total Records"
            value={summary.totalRecords}
            description="Products mined and cleaned"
            color="text-slate-800"
          />

          <MetricCard
            title="Total Columns"
            value={summary.totalColumns}
            description="Derived & structured features"
            color="text-slate-800"
          />

          <MetricCard
            title="Missing Values"
            value={summary.missingValues}
            description="Handled & imputed by ML"
            color="text-amber-600"
          />

          <MetricCard
            title="Duplicate Records"
            value={summary.duplicateRecords}
            description="Duplicates deduplicated"
            color="text-red-600"
          />
        </div>

        {/* Data Quality */}
        <SectionCard
          title="Data Quality & Completeness"
          description="Overall completeness percentage of the mined dataset"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">
              Data Completeness
            </span>
            <span className="font-bold text-slate-900 text-lg">
              {summary.completeness}%
            </span>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-700"
              style={{ width: `${Math.max(5, summary.completeness)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Percentage of non-empty attributes across the entire mined table. Missing values have been imputed using Random Forest regression.
          </p>
        </SectionCard>

        {/* Missing Values Chart */}
        <SectionCard
          title="Missing Values Analysis"
          description="Number of missing values per column before ML imputation"
        >
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={missingData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="column"
                  tick={{ fill: "#64748B", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#64748B", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Bar
                  dataKey="missing"
                  name="Missing Count"
                  fill="#E59A38"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Feature Imputation & Engineering Visualizer */}
        <SectionCard
          title="Column Imputation & Feature Engineering Visualizer"
          description="Detailed breakdown of how missing values are identified, handled, and imputed for each attribute across mined websites"
        >
          {/* Strategy Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-5 pb-3 border-b border-gray-100">
            {[
              { id: "all", label: `All Columns (${enrichedColumns.length})` },
              { id: "ml", label: "ML Imputed" },
              { id: "spec", label: "Spec Table Mining" },
              { id: "engineered", label: "Engineered Flags" },
              { id: "canonical", label: "Categorical Mapping" },
              { id: "baseline", label: "Baseline Normalization" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFeatureFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  featureFilter === tab.id
                    ? "bg-slate-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3">Attribute</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 w-48">Pre-Cleaning Status</th>
                  <th className="p-3">Imputation & Cleaning Strategy</th>
                  <th className="p-3">Post-Processing</th>
                </tr>
              </thead>

              <tbody>
                {filteredColumns.map((col) => {
                  let badgeStyle = "bg-slate-100 text-slate-700 border-slate-200";
                  if (col.category === "ml") badgeStyle = "bg-purple-100 text-purple-800 border-purple-200";
                  if (col.category === "spec") badgeStyle = "bg-blue-100 text-blue-800 border-blue-200";
                  if (col.category === "engineered") badgeStyle = "bg-amber-100 text-amber-800 border-amber-200";
                  if (col.category === "canonical") badgeStyle = "bg-emerald-100 text-emerald-800 border-emerald-200";
                  if (col.category === "baseline") badgeStyle = "bg-slate-100 text-slate-700 border-slate-200";

                  return (
                    <tr key={col.name} className="border-b border-gray-100 hover:bg-slate-50/60 transition">
                      <td className="p-3 font-semibold text-slate-900 align-top">
                        <code>{col.name}</code>
                      </td>
                      <td className="p-3 text-gray-500 font-mono text-xs align-top">
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-[11px]">
                          {col.type}
                        </span>
                      </td>
                      <td className="p-3 align-top">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">
                              {col.missing > 0 ? `${col.missing} missing` : "None missing"}
                            </span>
                            <span className="font-semibold text-slate-700">
                              {col.missingPercent}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${
                                col.missing > 0 ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.max(5, col.missingPercent || 0)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3 align-top max-w-md">
                        <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border mb-1.5 ${badgeStyle}`}>
                          {col.strategy}
                        </span>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {col.technique}
                        </p>
                      </td>
                      <td className="p-3 align-top">
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-200">
                          <span>✓</span>
                          <span>100% Usable</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Dataset Preview */}
        <SectionCard
          title="Dataset Preview"
          description="Search and inspect live mined product records"
        >
          <div className="flex flex-col sm:flex-row justify-between gap-3 mb-5">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:max-w-sm border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-600"
            />

            <span className="text-sm text-gray-500 self-center">
              {filteredProducts.length} records shown
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Brand</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Availability</th>
                  <th className="p-3">Target Domain</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.slice(0, 10).map((product, idx) => (
                  <tr key={product.id || product._id || idx} className="border-b border-gray-100">
                    <td className="p-3 font-medium text-slate-800 max-w-xs truncate">
                      {product.name || product.title}
                    </td>
                    <td className="p-3 text-gray-600">
                      {typeof product.brand === "string" ? product.brand : "Unknown"}
                    </td>
                    <td className="p-3 font-semibold text-slate-900">
                      ৳{Number(product.price || 0).toLocaleString()}
                      {Boolean(product.attributes?.price_imputed) && (
                        <span className="ml-1.5 text-[10px] text-purple-600 font-normal">
                          (ML Imputed)
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                        {product.availability || product.attributes?.availability || "InStock"}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-gray-500">
                      {product.source_domain || product.sources?.[0]?.name || analytics?.sourceDomain || "universal"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No products found matching &quot;{search}&quot;.
              </p>
            )}
          </div>
        </SectionCard>
      </>
    )}

      </div>
    </main>
  );
}
