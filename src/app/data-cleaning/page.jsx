"use client";

import { useState, useEffect } from "react";
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

  const columns = cleaning.columns && cleaning.columns.length > 0
    ? cleaning.columns
    : [
        { name: "name", type: "String", missing: 0 },
        { name: "price", type: "Float", missing: 0 },
        { name: "brand", type: "String", missing: 0 },
        { name: "availability", type: "String", missing: 0 },
        { name: "is_smart", type: "Boolean", missing: 0 },
        { name: "is_inverter", type: "Boolean", missing: 0 },
      ];

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

        {/* Column Details */}
        <SectionCard
          title="Column Metadata & Feature Types"
          description="Data types, derived features, and missing status"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3">Feature Name</th>
                  <th className="p-3">Data Type</th>
                  <th className="p-3">Missing Values</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {columns.map((column) => (
                  <tr key={column.name} className="border-b border-gray-100 hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-800">
                      {column.name}
                    </td>
                    <td className="p-3 text-gray-500 font-mono text-xs">
                      {column.type}
                    </td>
                    <td className="p-3 text-gray-700">
                      {column.missing}
                    </td>
                    <td className="p-3">
                      {column.missing === 0 ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-medium border border-emerald-100">
                          Complete
                        </span>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-xs font-medium border border-amber-100">
                          Imputed by ML
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
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
                No products found matching "{search}".
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
