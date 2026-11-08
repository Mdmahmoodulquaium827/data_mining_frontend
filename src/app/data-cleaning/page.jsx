
"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Illustrative dataset summary
const summary = {
  totalRecords: 60,
  totalColumns: 12,
  missingValues: 18,
  duplicateRecords: 3,
  completeness: 97.5,
};

// Demo missing value data
const missingData = [
  { column: "Price", missing: 5 },
  { column: "Rating", missing: 4 },
  { column: "Brand", missing: 3 },
  { column: "Stock", missing: 2 },
  { column: "Category", missing: 4 },
];

// Demo column information
const columns = [
  { name: "product_id", type: "Integer", missing: 0 },
  { name: "title", type: "String", missing: 0 },
  { name: "category", type: "String", missing: 4 },
  { name: "brand", type: "String", missing: 3 },
  { name: "price", type: "Float", missing: 5 },
  { name: "rating", type: "Float", missing: 4 },
  { name: "rating_count", type: "Integer", missing: 0 },
  { name: "stock", type: "Integer", missing: 2 },
  { name: "discount", type: "Float", missing: 0 },
  { name: "description", type: "String", missing: 0 },
  { name: "availability", type: "String", missing: 0 },
  { name: "source", type: "String", missing: 0 },
];

// Demo product preview
const initialProducts = [
  { id: 1, title: "Samsung Galaxy A15", category: "Mobile", price: 18500, rating: 4.5, brand: "Samsung" },
  { id: 2, title: "LG Refrigerator", category: "Appliance", price: 63000, rating: 4.3, brand: "LG" },
  { id: 3, title: "HP Laptop", category: "Laptop", price: 0, rating: 4.2, brand: "HP" },
  { id: 4, title: "Smart LED TV", category: "Television", price: 45000, rating: null, brand: "Samsung" },
  { id: 5, title: "Air Conditioner", category: "Appliance", price: 52000, rating: 4.6, brand: "Gree" },
];

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
  const [activeTab, setActiveTab] = useState("all");

  const filteredProducts = initialProducts.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesSearch;
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
            Inspect, analyze and manage your scraped product dataset.
          </p>
        </div>

        {/* Dataset Information */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-800">
                Dataset Information
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                E-commerce product dataset
              </p>
            </div>

            <span className="text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
              Demo Dataset
            </span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <MetricCard
            title="Total Records"
            value={summary.totalRecords}
            description="Products collected"
            color="text-slate-800"
          />

          <MetricCard
            title="Total Columns"
            value={summary.totalColumns}
            description="Dataset features"
            color="text-slate-800"
          />

          <MetricCard
            title="Missing Values"
            value={summary.missingValues}
            description="Empty or unavailable values"
            color="text-amber-600"
          />

          <MetricCard
            title="Duplicate Records"
            value={summary.duplicateRecords}
            description="Potential duplicate rows"
            color="text-red-600"
          />
        </div>

        {/* Data Quality */}
        <SectionCard
          title="Data Quality"
          description="Overall completeness of the dataset"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">
              Data completeness
            </span>
            <span className="font-semibold text-slate-800">
              {summary.completeness}%
            </span>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-blue-700 h-3 rounded-full"
              style={{ width: `${summary.completeness}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Percentage of available values in the dataset.
          </p>
        </SectionCard>

        {/* Missing Values Chart */}
        <SectionCard
          title="Missing Values Analysis"
          description="Number of missing values in each dataset column"
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
                  name="Missing Values"
                  fill="#D69E36"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={55}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Column Details */}
        <SectionCard
          title="Column Information"
          description="Data types and missing values for each feature"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3">Column Name</th>
                  <th className="p-3">Data Type</th>
                  <th className="p-3">Missing Values</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {columns.map((column) => (
                  <tr key={column.name} className="border-b border-gray-100">
                    <td className="p-3 font-medium text-slate-700">
                      {column.name}
                    </td>
                    <td className="p-3 text-gray-500">
                      {column.type}
                    </td>
                    <td className="p-3 text-gray-600">
                      {column.missing}
                    </td>
                    <td className="p-3">
                      {column.missing === 0 ? (
                        <span className="text-green-700 bg-green-50 px-2 py-1 rounded-md text-xs">
                          Complete
                        </span>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-2 py-1 rounded-md text-xs">
                          Missing Data
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
          description="Search and inspect sample product records"
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
                  <th className="p-3">ID</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Brand</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100">
                    <td className="p-3">{product.id}</td>
                    <td className="p-3 font-medium text-slate-700">
                      {product.title}
                    </td>
                    <td className="p-3">{product.category}</td>
                    <td className="p-3">
                      {product.price === 0
                        ? "Missing"
                        : `৳${product.price.toLocaleString()}`}
                    </td>
                    <td className="p-3">
                      {product.rating ?? "Missing"}
                    </td>
                    <td className="p-3">{product.brand}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No products found.
              </p>
            )}
          </div>
        </SectionCard>

        {/* Cleaning Operations */}
        <SectionCard
          title="Data Cleaning Operations"
          description="Available operations for preparing the dataset"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-800">
                Handle Missing Values
              </h3>
              <p className="text-sm text-gray-500 mt-2 mb-4">
                Fill or remove unavailable values.
              </p>
              <button
                disabled
                className="w-full bg-gray-100 text-gray-400 rounded-lg py-2 text-sm cursor-not-allowed"
              >
                Backend Required
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-800">
                Remove Duplicates
              </h3>
              <p className="text-sm text-gray-500 mt-2 mb-4">
                Identify and remove repeated records.
              </p>
              <button
                disabled
                className="w-full bg-gray-100 text-gray-400 rounded-lg py-2 text-sm cursor-not-allowed"
              >
                Backend Required
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-800">
                Export Clean Dataset
              </h3>
              <p className="text-sm text-gray-500 mt-2 mb-4">
                Download the processed dataset as CSV.
              </p>
              <button
                disabled
                className="w-full bg-gray-100 text-gray-400 rounded-lg py-2 text-sm cursor-not-allowed"
              >
                Backend Required
              </button>
            </div>

          </div>
        </SectionCard>

      </div>
    </main>
  );
}
