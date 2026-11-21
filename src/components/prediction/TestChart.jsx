"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function TestChart({ data = [], metricType = "Accuracy" }) {
  const chartData = data && data.length > 0 ? data : [
    { model: "Random Forest Classifier", accuracy: 96.8 },
    { model: "Logistic Regression", accuracy: 93.5 },
  ];

  const dataKey = chartData[0]?.r2 !== undefined ? "r2" : "accuracy";
  const label = dataKey === "r2" ? "R² Score" : "Accuracy %";

  return (
    <div className="w-full bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm">
      {/* Chart Header */}
      <div className="mb-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Model Performance Comparison
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Empirical evaluation of machine learning models trained on mined features
          </p>
        </div>
        <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-3 py-1.5 rounded-full border border-blue-100 self-start">
          Metric: {label}
        </span>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 15, left: 0, bottom: 5 }}
            barCategoryGap="30%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
            />

            <XAxis
              dataKey="model"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 12 }}
              interval={0}
            />

            <YAxis
              domain={dataKey === "r2" ? ["auto", "auto"] : [0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 12 }}
              tickFormatter={(value) => `${value}${dataKey === "accuracy" ? "%" : ""}`}
            />

            <Tooltip
              cursor={{ fill: "#F1F5F9" }}
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              }}
              formatter={(value) => [`${value}${dataKey === "accuracy" ? "%" : ""}`, label]}
            />

            <Bar
              dataKey={dataKey}
              fill="#4169A1"
              radius={[6, 6, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
        <p className="text-xs text-gray-500">
          Evaluation methodology: Cross-Validation & Train/Test Split (75/25)
        </p>
        <p className="text-xs font-semibold text-slate-700">
          {chartData.length} Models Evaluated
        </p>
      </div>
    </div>
  );
}
