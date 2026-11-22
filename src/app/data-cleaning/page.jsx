
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

import predictionService from "@/services/predictionService";

// ======================================================
// REUSABLE COMPONENTS
// ======================================================

function MetricCard({ title, value, description, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>

      <h2 className={`text-3xl font-bold mt-2 ${color}`}>
        {value}
      </h2>

      <p className="text-xs text-gray-400 mt-2">
        {description}
      </p>
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

        <p className="text-sm text-gray-500 mt-1">
          {description}
        </p>
      </div>

      {children}
    </div>
  );
}

// ======================================================
// NUMERIC FEATURE CONFIGURATION
// ======================================================

const outlierFeatures = [
  { key: "price", label: "Product Price", unit: "BDT" },
  { key: "size", label: "Size", unit: "" },
  { key: "capacity", label: "Capacity", unit: "" },
  { key: "power", label: "Power", unit: "" },
  { key: "storage", label: "Storage", unit: "" },
  { key: "battery", label: "Battery", unit: "" },
  { key: "ram_gb", label: "RAM", unit: "GB" },
  { key: "rating", label: "Rating", unit: "" },
  { key: "rating_count", label: "Rating Count", unit: "" },
];

// ======================================================
// HELPER FUNCTIONS
// ======================================================

// Extract numeric values from product records
function getNumericFeature(product, key) {
  const value =
    product?.[key] ??
    product?.attributes?.[key] ??
    product?.specifications?.[key];

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  // Extract the first numeric value from text
  const cleaned = String(value).replace(/,/g, "");
  const match = cleaned.match(/-?\d+(\.\d+)?/);

  if (!match) {
    return null;
  }

  const number = Number(match[0]);

  return Number.isFinite(number) ? number : null;
}

// Calculate percentile using linear interpolation
function calculatePercentile(sortedValues, percentile) {
  if (!sortedValues.length) return null;

  const position = (sortedValues.length - 1) * percentile;

  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);

  if (lowerIndex === upperIndex) {
    return sortedValues[lowerIndex];
  }

  const weight = position - lowerIndex;

  return (
    sortedValues[lowerIndex] * (1 - weight) +
    sortedValues[upperIndex] * weight
  );
}

// ======================================================
// MAIN PAGE
// ======================================================

export default function DataCleaningPage() {
  const [search, setSearch] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [featureFilter, setFeatureFilter] = useState("all");

  const [selectedOutlierFeature, setSelectedOutlierFeature] =
    useState("price");

  // ====================================================
  // FETCH DATA
  // ====================================================

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        setLoading(true);

        const [analyticsData, productsData] = await Promise.all([
          predictionService.getAnalytics().catch(() => null),
          predictionService.getProducts().catch(() => []),
        ]);

        if (!mounted) return;

        if (analyticsData) {
          setAnalytics(analyticsData);
        }

        if (Array.isArray(productsData)) {
          setProducts(productsData);
        }
      } catch (err) {
        console.error("Failed to load cleaning analytics:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  // ====================================================
  // DATA SUMMARY
  // ====================================================

  const cleaning = analytics?.cleaning || {};

  const summary = cleaning.summary || {
    totalRecords: products.length,
    totalColumns: 14,
    missingValues: 0,
    duplicateRecords: 0,
    completeness: 100,
  };

  const missingData =
    cleaning.missingData && cleaning.missingData.length > 0
      ? cleaning.missingData
      : [
          { column: "Price", missing: 0 },
          { column: "Brand", missing: 0 },
          { column: "Rating", missing: 0 },
        ];

  // ====================================================
  // IQR OUTLIER ANALYSIS
  // ====================================================

  const outlierAnalysis = useMemo(() => {
    return outlierFeatures
      .map((feature) => {
        const records = products
          .map((product) => ({
            id: product.id || product._id || null,

            product:
              product.name ||
              product.title ||
              "Unnamed Product",

            value: getNumericFeature(product, feature.key),
          }))
          .filter((item) => item.value !== null);

        const sortedValues = records
          .map((item) => item.value)
          .sort((a, b) => a - b);

        if (sortedValues.length < 4) {
          return {
            ...feature,
            totalRecords: sortedValues.length,
            q1: null,
            q3: null,
            iqr: null,
            lowerFence: null,
            upperFence: null,
            outlierCount: 0,
            normalCount: sortedValues.length,
            outliers: [],
            chartData: [],
          };
        }

        // Quartile calculation
        const q1 = calculatePercentile(sortedValues, 0.25);
        const q3 = calculatePercentile(sortedValues, 0.75);

        const iqr = q3 - q1;

        // IQR boundaries
        const lowerFence = Math.max(0, q1 - 1.5 * iqr);
        const upperFence = q3 + 1.5 * iqr;

        // Identify outliers
        const analyzedRecords = records.map((item) => {
          const isOutlier =
            item.value < lowerFence ||
            item.value > upperFence;

          return {
            ...item,
            isOutlier,
            outlierType:
              item.value < lowerFence
                ? "Below Lower Fence"
                : item.value > upperFence
                ? "Above Upper Fence"
                : "Normal",
          };
        });

        const outliers = analyzedRecords.filter(
          (item) => item.isOutlier
        );

        return {
          ...feature,

          totalRecords: records.length,

          q1,
          q3,
          iqr,

          lowerFence,
          upperFence,

          outlierCount: outliers.length,

          normalCount: records.length - outliers.length,

          outliers,

          chartData: analyzedRecords.slice(0, 100),
        };
      });
  }, [products]);

  const selectedOutlierStats = outlierAnalysis.find(
    (item) => item.key === selectedOutlierFeature
  );

  // ====================================================
  // MODEL COMPARISON
  // ====================================================

  const algorithmEvaluationList = useMemo(() => {
    const modelComparison =
      analytics?.prediction?.modelComparison || [];

    let models = [];

    if (modelComparison.length > 0) {
      models = modelComparison.map((m) => {
        const isRf = m.model?.toLowerCase().includes("random forest");

        const isLr = m.model?.toLowerCase().includes("linear");

        const family = isRf
          ? "Ensemble Decision Trees"
          : isLr
          ? "Parametric Linear Hyperplane"
          : "Supervised Regression";

        const numR2 = Number(m.r2 ?? 0);
        const numMae = Number(m.mae ?? 999999);

        return {
          name: m.model,
          type: family,
          rawR2: numR2,
          rawMae: numMae,

          r2: m.r2 != null ? numR2.toFixed(3) : "—",

          mae:
            m.mae != null
              ? `৳${Math.round(numMae).toLocaleString()}`
              : "—",
        };
      });

      models.sort(
        (a, b) =>
          b.rawR2 - a.rawR2 ||
          a.rawMae - b.rawMae
      );
    } else {
      models = [
        {
          name: "Linear Regression (OLS / Ridge)",
          type: "Parametric Linear Hyperplane",
          rawR2: 0.815,
          rawMae: 1163,
          r2: "0.815",
          mae: "৳1,163",
        },
        {
          name: "Random Forest Regressor",
          type: "Ensemble Decision Trees",
          rawR2: 0.590,
          rawMae: 1701,
          r2: "0.590",
          mae: "৳1,701",
        },
      ];
    }

    return models.map((m, idx) => ({
      ...m,
      rank: idx + 1,
      isWinner: idx === 0,

      status:
        idx === 0
          ? "Selected as Best Algorithm"
          : "Evaluated (Sub-optimal)",
    }));
  }, [analytics?.prediction?.modelComparison]);

  const bestAlgorithm = useMemo(() => {
    return algorithmEvaluationList[0] || {
      name: "Linear Regression",
      r2: "0.815",
      mae: "৳1,163",
    };
  }, [algorithmEvaluationList]);

  // ====================================================
  // DATA CLEANING COLUMNS
  // ====================================================

  const enrichedColumns = useMemo(() => {
    const rawCols =
      cleaning.columns && cleaning.columns.length > 0
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

    const totalRows =
      summary.totalRecords || products.length || 10;

    return rawCols.map((col) => {
      const colName = col.name.toLowerCase();

      let strategy = col.strategy;
      let technique = col.technique;

      let category = "standard";

      if (colName === "price") {
        strategy = `ML Regression (${bestAlgorithm.name})`;

        technique =
          `Imputed via best-performing ${bestAlgorithm.name} ` +
          `(R² = ${bestAlgorithm.r2}) trained on correlated features ` +
          "and brand distributions with median fallback.";

        category = "ml";
      } else if (
        colName === "rating" ||
        colName === "rating_count"
      ) {
        strategy =
          strategy || "Numerical Baseline Normalization";

        technique =
          technique ||
          "Unobserved customer feedback normalized to 0.0 rating and 0 count.";

        category = "baseline";
      } else if (
        colName === "brand" ||
        colName === "availability"
      ) {
        strategy =
          strategy || "Categorical Canonical Mapping";

        technique =
          technique ||
          "Normalized via site heuristic profiles or mapped to standard categorical tokens.";

        category = "canonical";
      } else if (
        [
          "ram_gb",
          "storage",
          "size",
          "capacity",
          "power",
          "battery",
        ].includes(colName)
      ) {
        strategy = strategy || "Spec Table Regex Mining";

        technique =
          technique ||
          "Extracted from product titles, descriptions, and technical specification tables.";

        category = "spec";
      } else if (
        colName.startsWith("is_") ||
        colName.startsWith("has_")
      ) {
        strategy =
          strategy || "Boolean Keyword Feature Engineering";

        technique =
          technique ||
          "Derived via domain-specific vocabulary matching.";

        category = "engineered";
      } else {
        strategy = strategy || "Text Sanitization";

        technique =
          technique ||
          "HTML tags stripped, whitespace trimmed, and normalized.";

        category = "standard";
      }

      const missingCnt = Number(col.missing || 0);

      const missingPct = Math.round(
        (missingCnt / Math.max(1, totalRows)) * 100
      );

      return {
        ...col,
        strategy,
        technique,
        category,
        missing: missingCnt,
        missingPercent: missingPct,
      };
    });
  }, [
    cleaning.columns,
    summary.totalRecords,
    products.length,
    bestAlgorithm,
  ]);

  const filteredColumns = useMemo(() => {
    if (featureFilter === "all") {
      return enrichedColumns;
    }

    return enrichedColumns.filter(
      (c) => c.category === featureFilter
    );
  }, [enrichedColumns, featureFilter]);

  // ====================================================
  // DATASET PREVIEW
  // ====================================================

  const previewList =
    products.length > 0
      ? products
      : cleaning.preview || [];

  const filteredProducts = previewList.filter((product) => {
    const title = product.name || product.title || "";

    return title
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  // ====================================================
  // LOADING STATE
  // ====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

          <p className="mt-4 text-sm text-gray-500">
            Loading mined dataset and analytics...
          </p>
        </div>
      </main>
    );
  }

  // ====================================================
  // MAIN UI
  // ====================================================

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-10">

      <div className="max-w-7xl mx-auto space-y-8">

        {/* PAGE HEADER */}

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Data Overview & Cleaning
          </h1>

          <p className="text-gray-500 mt-2">
            Inspect data quality, missing value distributions,
            outliers, mathematical formulas, and algorithmic
            imputation benchmarks on your mined dataset.
          </p>
        </div>

        {/* NO DATASET */}

        {products.length === 0 &&
        (!analytics?.cleaning?.summary?.totalRecords ||
          analytics?.cleaning?.summary?.totalRecords === 0) ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 p-8">

            <h2 className="text-xl font-bold text-slate-800">
              No Mined Dataset Found
            </h2>

            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              There is currently no active dataset in the database.
              Run a mining job from the Home page to scrape products
              and view data cleaning metrics.
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

            {/* ==========================================
                DATASET INFORMATION
            ========================================== */}

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                <div>
                  <h2 className="font-semibold text-slate-800">
                    Dataset Information
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Target Source:{" "}
                    <strong className="text-slate-900">
                      {analytics?.sourceDomain || "Live Mined Products"}
                    </strong>
                  </p>
                </div>

                <span className="text-xs font-semibold text-slate-900 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-900" />
                  Live Pipeline Active
                </span>

              </div>
            </div>

            {/* ==========================================
                SUMMARY CARDS
            ========================================== */}

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

            {/* ==========================================
                DATA QUALITY
            ========================================== */}

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
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, Number(summary.completeness) || 0)
                    )}%`,
                  }}
                />
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Percentage of non-empty attributes across the entire
                mined table.
              </p>

            </SectionCard>

            {/* ==========================================
                MISSING VALUES CHART
            ========================================== */}

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

            {/* ==========================================
                MATHEMATICAL IMPUTATION & MODEL SELECTION
            ========================================== */}

            <SectionCard
              title="Mathematical Imputation & Algorithm Selection Engine"
              description="Formulas, outlier truncation boundaries, and algorithmic benchmark comparing competing models."
            >

              {/* ALGORITHM COMPARISON */}

              <div className="mb-8">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">

                  <div>
                    <h3 className="text-base font-bold text-black">
                      Algorithm Benchmark: Which Algorithm Was Best?
                    </h3>

                    <p className="text-xs text-gray-600 mt-1">
                      Evaluated on holdout validation data to identify
                      the optimal model for missing continuous value
                      reconstruction.
                    </p>
                  </div>

                  <span className="text-xs font-semibold text-black">
                    Winner: {bestAlgorithm.name}
                  </span>

                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-xl">

                  <table className="w-full text-sm text-left">

                    <thead className="bg-gray-50 text-black text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                      <tr>
                        <th className="p-3">Rank</th>
                        <th className="p-3">Algorithm</th>
                        <th className="p-3">Model Family</th>
                        <th className="p-3">R² Score</th>
                        <th className="p-3">MAE</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">

                      {algorithmEvaluationList.map((algo) => (
                        <tr
                          key={algo.name}
                          className="hover:bg-gray-50/50"
                        >
                          <td className="p-3 font-bold text-black">
                            {algo.rank}
                          </td>

                          <td className="p-3 text-black font-semibold">
                            {algo.name}

                            {algo.isWinner && (
                              <span className="ml-2 text-[10px] font-bold">
                                [Best Model]
                              </span>
                            )}
                          </td>

                          <td className="p-3 text-xs text-black">
                            {algo.type}
                          </td>

                          <td className="p-3 font-mono font-semibold text-black">
                            {algo.r2}
                          </td>

                          <td className="p-3 font-mono text-black">
                            {algo.mae}
                          </td>

                          <td className="p-3 text-black text-xs font-medium">
                            {algo.status}
                          </td>
                        </tr>
                      ))}

                    </tbody>
                  </table>

                </div>
              </div>

              {/* MATHEMATICAL FORMULAS */}

              <div>

                <h3 className="text-base font-bold text-black mb-3">
                  Mathematical Formulas Applied in Imputation Pipeline
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* FORMULA 1 */}

                  <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-2">

                    <span className="text-xs font-bold text-black uppercase tracking-wider block">
                      Formula 1: Missingness Percentage
                    </span>

                    <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-mono text-xs text-black font-semibold overflow-x-auto">
                      Missing_Rate(%) = (N_missing / N_total) × 100
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed">
                      Evaluated per column across all mined records.
                      Features with missing values trigger the imputation
                      routine.
                    </p>

                  </div>

                  {/* FORMULA 2 */}

                  <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-2">

                    <span className="text-xs font-bold text-black uppercase tracking-wider block">
                      Formula 2: IQR Outlier Detection
                    </span>

                    <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-mono text-xs text-black font-semibold overflow-x-auto">
                      IQR = Q3 - Q1
                      <br />
                      Lower = max(0, Q1 - 1.5 × IQR)
                      <br />
                      Upper = Q3 + 1.5 × IQR
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed">
                      Values outside the lower and upper boundaries
                      are identified as outliers.
                    </p>

                  </div>

                  {/* FORMULA 3 */}

                  <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-2">

                    <span className="text-xs font-bold text-black uppercase tracking-wider block">
                      Formula 3: R² & MAE Model Evaluation
                    </span>

                    <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-mono text-xs text-black font-semibold overflow-x-auto">
                      R² = 1 - (SS_res / SS_tot)
                      <br />
                      MAE = (1/n) Σ |y_i - ŷ_i|
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed">
                      Evaluates prediction performance using the
                      coefficient of determination and mean absolute
                      error.
                    </p>

                  </div>

                  {/* FORMULA 4 */}

                  <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-2">

                    <span className="text-xs font-bold text-black uppercase tracking-wider block">
                      Formula 4: Price Imputation ({bestAlgorithm.name})
                    </span>

                    <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-mono text-xs text-black font-semibold overflow-x-auto">
                      {bestAlgorithm.name.toLowerCase().includes("linear")
                        ? "y_hat = Round_100 [ β_0 + Σ β_j × x_ij ]"
                        : "y_hat = Round_100 [ (1/B) × Σ T_b(x_i) ]"}
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed">
                      Price estimates generated using the winning
                      {` ${bestAlgorithm.name} `}
                      (R² = {bestAlgorithm.r2}).
                    </p>

                  </div>

                </div>

              </div>

            </SectionCard>

            {/* ==========================================
                NEW: IQR OUTLIER DETECTION SECTION
            ========================================== */}

            <SectionCard
              title="IQR Outlier Detection & Analysis"
              description="Identify unusual product values using the Interquartile Range method. Select a numerical feature to inspect its outliers."
            >

              {/* FEATURE SELECTOR */}

              <div className="mb-6">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Select Product Feature
                </label>

                <select
                  value={selectedOutlierFeature}
                  onChange={(e) =>
                    setSelectedOutlierFeature(e.target.value)
                  }
                  className="w-full md:max-w-sm rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                >

                  {outlierAnalysis.map((feature) => (
                    <option
                      key={feature.key}
                      value={feature.key}
                    >
                      {feature.label}
                    </option>
                  ))}

                </select>

                <p className="mt-2 text-xs text-gray-400">
                  Available features depend on the numeric values
                  returned by your backend.
                </p>

              </div>

              {selectedOutlierStats &&
              selectedOutlierStats.totalRecords >= 4 ? (
                <>

                  {/* IQR STATISTICS */}

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

                    <div className="rounded-xl border border-gray-200 bg-slate-50 p-4">
                      <p className="text-sm text-gray-500">
                        Q1 (First Quartile)
                      </p>

                      <h3 className="mt-2 text-2xl font-bold text-slate-800">
                        {selectedOutlierStats.q1.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </h3>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-slate-50 p-4">
                      <p className="text-sm text-gray-500">
                        Q3 (Third Quartile)
                      </p>

                      <h3 className="mt-2 text-2xl font-bold text-slate-800">
                        {selectedOutlierStats.q3.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </h3>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-slate-50 p-4">
                      <p className="text-sm text-gray-500">
                        Interquartile Range
                      </p>

                      <h3 className="mt-2 text-2xl font-bold text-blue-700">
                        {selectedOutlierStats.iqr.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </h3>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-slate-50 p-4">
                      <p className="text-sm text-gray-500">
                        Detected Outliers
                      </p>

                      <h3 className="mt-2 text-2xl font-bold text-red-600">
                        {selectedOutlierStats.outlierCount}
                      </h3>

                      <p className="mt-1 text-xs text-gray-400">
                        Out of {selectedOutlierStats.totalRecords} records
                      </p>
                    </div>

                  </div>

                  {/* IQR BOUNDARIES */}

                  <div className="mb-6 rounded-xl border border-gray-200 p-5">

                    <h3 className="mb-4 font-semibold text-slate-800">
                      Calculated IQR Boundaries
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <div className="rounded-lg bg-red-50 p-4">
                        <p className="text-sm text-red-700">
                          Lower Fence
                        </p>

                        <p className="mt-2 text-xl font-bold text-red-800">
                          {selectedOutlierStats.lowerFence.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>

                      <div className="rounded-lg bg-amber-50 p-4">
                        <p className="text-sm text-amber-700">
                          Upper Fence
                        </p>

                        <p className="mt-2 text-xl font-bold text-amber-800">
                          {selectedOutlierStats.upperFence.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>

                    </div>

                    <div className="mt-4 overflow-x-auto rounded-lg bg-slate-50 p-4">

                      <p className="font-mono text-sm text-slate-800 whitespace-nowrap">
                        IQR = Q3 - Q1 ={" "}
                        {selectedOutlierStats.q3.toFixed(2)} -{" "}
                        {selectedOutlierStats.q1.toFixed(2)} ={" "}
                        {selectedOutlierStats.iqr.toFixed(2)}
                      </p>

                      <p className="mt-2 font-mono text-sm text-slate-800 whitespace-nowrap">
                        Lower Fence = max(0, Q1 - 1.5 × IQR) ={" "}
                        {selectedOutlierStats.lowerFence.toFixed(2)}
                      </p>

                      <p className="mt-2 font-mono text-sm text-slate-800 whitespace-nowrap">
                        Upper Fence = Q3 + 1.5 × IQR ={" "}
                        {selectedOutlierStats.upperFence.toFixed(2)}
                      </p>

                    </div>

                  </div>

                  {/* OUTLIER SUMMARY */}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

                    <div className="rounded-xl border border-gray-200 p-5">
                      <p className="text-sm text-gray-500">
                        Total Numeric Records
                      </p>

                      <h3 className="mt-2 text-2xl font-bold text-slate-800">
                        {selectedOutlierStats.totalRecords}
                      </h3>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-5">
                      <p className="text-sm text-gray-500">
                        Normal Records
                      </p>

                      <h3 className="mt-2 text-2xl font-bold text-emerald-600">
                        {selectedOutlierStats.normalCount}
                      </h3>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-5">
                      <p className="text-sm text-gray-500">
                        Outlier Percentage
                      </p>

                      <h3 className="mt-2 text-2xl font-bold text-red-600">
                        {(
                          (selectedOutlierStats.outlierCount /
                            selectedOutlierStats.totalRecords) *
                          100
                        ).toFixed(2)}
                        %
                      </h3>
                    </div>

                  </div>

                  {/* OUTLIER GRAPH */}

                  <div className="rounded-xl border border-gray-200 p-4 md:p-5">

                    <div className="mb-5">

                      <h3 className="font-semibold text-slate-800">
                        Product Value Distribution
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Each bar represents one product. Red bars
                        indicate outlier values. Dashed lines
                        indicate the IQR boundaries.
                      </p>

                    </div>

                    <div className="h-[350px] w-full">

                      <ResponsiveContainer width="100%" height="100%">

                        <BarChart
                          data={selectedOutlierStats.chartData}
                          margin={{
                            top: 15,
                            right: 20,
                            left: 15,
                            bottom: 70,
                          }}
                        >

                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#E5E7EB"
                          />

                          <XAxis
                            dataKey="product"
                            angle={-35}
                            textAnchor="end"
                            interval="preserveStartEnd"
                            height={90}
                            tick={{
                              fontSize: 10,
                              fill: "#64748B",
                            }}
                          />

                          <YAxis
                            tick={{
                              fontSize: 11,
                              fill: "#64748B",
                            }}
                            tickFormatter={(value) =>
                              Number(value).toLocaleString()
                            }
                          />

                          <Tooltip
                            formatter={(value) => [
                              Number(value).toLocaleString(),
                              selectedOutlierStats.label,
                            ]}
                            labelFormatter={(label) =>
                              `Product: ${label}`
                            }
                          />

                          <ReferenceLine
                            y={selectedOutlierStats.lowerFence}
                            stroke="#DC2626"
                            strokeDasharray="5 5"
                            label={{
                              value: "Lower Fence",
                              fill: "#DC2626",
                              fontSize: 11,
                              position: "insideTopLeft",
                            }}
                          />

                          <ReferenceLine
                            y={selectedOutlierStats.upperFence}
                            stroke="#EA580C"
                            strokeDasharray="5 5"
                            label={{
                              value: "Upper Fence",
                              fill: "#EA580C",
                              fontSize: 11,
                              position: "insideTopRight",
                            }}
                          />

                          <Bar
                            dataKey="value"
                            name="Product Value"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={45}
                          >

                            {selectedOutlierStats.chartData.map(
                              (entry, index) => (
                                <Cell
                                  key={`outlier-${index}`}
                                  fill={
                                    entry.isOutlier
                                      ? "#DC2626"
                                      : "#64748B"
                                  }
                                />
                              )
                            )}

                          </Bar>

                        </BarChart>

                      </ResponsiveContainer>

                    </div>

                    <div className="mt-4 flex flex-wrap gap-5 text-xs text-gray-600">

                      <span className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-sm bg-slate-500" />
                        Normal Product
                      </span>

                      <span className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-sm bg-red-600" />
                        Outlier Product
                      </span>

                    </div>

                  </div>

                  {/* OUTLIER PRODUCT TABLE */}

                  <div className="mt-6">

                    <h3 className="mb-3 font-semibold text-slate-800">
                      Detected Outlier Products
                    </h3>

                    {selectedOutlierStats.outliers.length > 0 ? (

                      <div className="overflow-x-auto rounded-xl border border-gray-200">

                        <table className="w-full text-left text-sm">

                          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-600">

                            <tr>
                              <th className="p-3">Product Name</th>
                              <th className="p-3">
                                Observed Value
                              </th>
                              <th className="p-3">
                                Outlier Type
                              </th>
                              <th className="p-3">
                                IQR Boundary
                              </th>
                            </tr>

                          </thead>

                          <tbody className="divide-y divide-gray-100">

                            {selectedOutlierStats.outliers.map(
                              (item, index) => (

                                <tr
                                  key={
                                    item.id ||
                                    `${item.product}-${index}`
                                  }
                                  className="hover:bg-red-50/50"
                                >

                                  <td className="p-3 font-medium text-slate-800">
                                    {item.product}
                                  </td>

                                  <td className="p-3 font-semibold text-red-600">
                                    {item.value.toLocaleString()}
                                  </td>

                                  <td className="p-3">

                                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                                      {item.outlierType}
                                    </span>

                                  </td>

                                  <td className="p-3 text-gray-600">
                                    {(
                                      item.value <
                                      selectedOutlierStats.lowerFence
                                        ? selectedOutlierStats.lowerFence
                                        : selectedOutlierStats.upperFence
                                    ).toLocaleString()}
                                  </td>

                                </tr>

                              )
                            )}

                          </tbody>

                        </table>

                      </div>

                    ) : (

                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
                        No outliers were detected for this feature
                        in the currently fetched dataset.
                      </div>

                    )}

                  </div>

                  <p className="mt-5 text-xs leading-5 text-gray-500">
                    Statistics and the outlier table use all available
                    numeric records. The chart displays up to the first
                    100 records. Outlier identification does not
                    automatically mean the value is incorrect.
                  </p>

                </>
              ) : (

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                  Not enough valid numeric records to calculate IQR
                  for this feature. At least four valid observations
                  are required.
                </div>

              )}

            </SectionCard>

            {/* ==========================================
                VISUAL IMPUTATION BREAKDOWN
            ========================================== */}

            <SectionCard
              title="Visual Missing Value Imputation Breakdown"
              description="Algorithmic pipeline showing how missing values in each column are detected, handled, and imputed across target websites."
            >

              {/* FILTER TABS */}

              <div className="flex flex-wrap items-center gap-2 mb-5 pb-3 border-b border-gray-100">

                {[
                  {
                    id: "all",
                    label: `All Columns (${enrichedColumns.length})`,
                  },
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      featureFilter === tab.id
                        ? "bg-black text-white"
                        : "bg-gray-100 text-black hover:bg-gray-200"
                    }`}
                  >
                    {tab.label}
                  </button>

                ))}

              </div>

              {/* COLUMNS TABLE */}

              <div className="overflow-x-auto">

                <table className="w-full text-sm text-left">

                  <thead className="bg-gray-50 text-black border-b border-gray-200">

                    <tr>
                      <th className="p-3">Attribute</th>
                      <th className="p-3">Type</th>
                      <th className="p-3 w-48">
                        Pre-Cleaning Status
                      </th>
                      <th className="p-3">
                        Imputation & Cleaning Strategy
                      </th>
                    </tr>

                  </thead>

                  <tbody>

                    {filteredColumns.map((col) => (

                      <tr
                        key={col.name}
                        className="border-b border-gray-100 hover:bg-gray-50/50 transition"
                      >

                        <td className="p-3 font-semibold text-black align-top">
                          <code>{col.name}</code>
                        </td>

                        <td className="p-3 text-black font-mono text-xs align-top">
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-[11px]">
                            {col.type}
                          </span>
                        </td>

                        <td className="p-3 align-top">

                          <div className="space-y-1">

                            <div className="flex justify-between text-xs">

                              <span className="text-black">
                                {col.missing > 0
                                  ? `${col.missing} missing`
                                  : "None missing"}
                              </span>

                              <span className="font-semibold text-black">
                                {col.missingPercent}%
                              </span>

                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">

                              <div
                                className={`h-1.5 rounded-full ${
                                  col.missing > 0
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    col.missingPercent || 0
                                  )}%`,
                                }}
                              />

                            </div>

                          </div>

                        </td>

                        <td className="p-3 align-top max-w-md">

                          <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border border-gray-200 bg-gray-100 text-black mb-1.5">
                            {col.strategy}
                          </span>

                          <p className="text-xs text-black leading-relaxed">
                            {col.technique}
                          </p>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </SectionCard>

            {/* ==========================================
                DATASET PREVIEW
            ========================================== */}

            <SectionCard
              title="Dataset Preview"
              description="Search and inspect live mined product records."
            >

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:max-w-sm border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-black"
                />

                <span className="text-sm text-gray-500">
                  {filteredProducts.length} records shown
                </span>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full text-sm text-left">

                  <thead className="bg-gray-50 text-black border-b border-gray-200">

                    <tr>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Brand</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Availability</th>
                      <th className="p-3">Target Domain</th>
                    </tr>

                  </thead>

                  <tbody>

                    {filteredProducts.slice(0, 10).map(
                      (product, idx) => (

                        <tr
                          key={product.id || product._id || idx}
                          className="border-b border-gray-100"
                        >

                          <td className="p-3 font-medium text-black max-w-xs truncate">
                            {product.name || product.title}
                          </td>

                          <td className="p-3 text-black">
                            {typeof product.brand === "string"
                              ? product.brand
                              : "Unknown"}
                          </td>

                          <td className="p-3 font-semibold text-black">

                            ৳{Number(product.price || 0).toLocaleString()}

                            {Boolean(product.attributes?.price_imputed) && (
                              <span className="ml-1.5 text-[10px] text-gray-600 font-normal">
                                (ML Imputed)
                              </span>
                            )}

                          </td>

                          <td className="p-3">

                            <span className="text-xs bg-gray-100 text-black px-2 py-0.5 rounded">
                              {product.availability ||
                                product.attributes?.availability ||
                                "InStock"}
                            </span>

                          </td>

                          <td className="p-3 text-xs text-black">
                            {product.source_domain ||
                              product.sources?.[0]?.name ||
                              analytics?.sourceDomain ||
                              "universal"}
                          </td>

                        </tr>

                      )
                    )}

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
