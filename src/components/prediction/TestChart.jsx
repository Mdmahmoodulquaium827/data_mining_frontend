
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

const data = [
  { model: "Random Forest", accuracy: 96.5 },
  { model: "Decision Tree", accuracy: 92.3 },
  { model: "Logistic Regression", accuracy: 94.2 },
];

export default function TestChart() {
  return (
    <div className="w-full bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm">

      {/* Chart Header */}
      <div className="mb-7">
        <h2 className="text-xl font-semibold text-slate-800">
          Model Performance
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Accuracy comparison of machine learning models
        </p>
      </div>

      {/* Chart */}
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 15, left: 0, bottom: 5 }}
            barCategoryGap="35%"
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
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
            />

            <Tooltip
              cursor={{ fill: "#F1F5F9" }}
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              }}
              formatter={(value) => [`${value}%`, "Accuracy"]}
            />

            <Bar
              dataKey="accuracy"
              fill="#4169A1"
              radius={[5, 5, 0, 0]}
              maxBarSize={65}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
        <p className="text-xs text-gray-500">
          Evaluation metric: Accuracy
        </p>

        <p className="text-xs font-medium text-slate-600">
          3 Models Compared
        </p>
      </div>

    </div>
  );
}
