
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";

// Demo data: Price Distribution
const priceData = [
  { range: "0-10k", count: 4 },
  { range: "10-15k", count: 8 },
  { range: "15-20k", count: 11 },
  { range: "20-30k", count: 0 },
  { range: "30-40k", count: 1 },
  { range: "40-50k", count: 5 },
  { range: "50-60k", count: 6 },
  { range: "60-70k", count: 4 },
  { range: "70-80k", count: 2 },
];

// Demo data: Confusion Matrix
const confusionData = [
  { actual: "Real", real: 29, fake: 0 },
  { actual: "Fake", real: 1, fake: 0 },
];

// Demo data: Elbow Method
const elbowData = [
  { k: 2, inertia: 342 },
  { k: 3, inertia: 271 },
  { k: 4, inertia: 211 },
  { k: 5, inertia: 152 },
  { k: 6, inertia: 92 },
  { k: 7, inertia: 63 },
  { k: 8, inertia: 46 },
];

// Demo data: K-Means Segmentation
const clusterData = [
  { rating: 0, price: 8000, cluster: "Cluster 0" },
  { rating: 0, price: 10500, cluster: "Cluster 0" },
  { rating: 0, price: 13000, cluster: "Cluster 0" },
  { rating: 0, price: 16000, cluster: "Cluster 0" },
  { rating: 0, price: 18500, cluster: "Cluster 0" },
  { rating: 0, price: 31500, cluster: "Cluster 1" },
  { rating: 0, price: 39000, cluster: "Cluster 1" },
  { rating: 0, price: 44000, cluster: "Cluster 1" },
  { rating: 0, price: 52000, cluster: "Cluster 2" },
  { rating: 0, price: 57000, cluster: "Cluster 2" },
  { rating: 0, price: 63000, cluster: "Cluster 2" },
  { rating: 0, price: 74000, cluster: "Cluster 2" },
];

const colors = {
  blue: "#4169A1",
  green: "#16A085",
  orange: "#E59A38",
};

function ChartCard({ title, description, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800">
          {title}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {description}
        </p>
      </div>

      <div className="h-[300px] w-full">
        {children}
      </div>
    </div>
  );
}

export default function PredictionCharts() {
  return (
    <section className="w-full space-y-6">

      <div>
        <h2 className="text-2xl font-semibold text-slate-800">
          Prediction Analytics
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Explore product price distribution, classification
          results and clustering analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Price Distribution */}
        <ChartCard
          title="Price Distribution"
          description="Distribution of product prices across different ranges"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priceData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="range"
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip />
              <Bar
                dataKey="count"
                fill={colors.blue}
                radius={[5, 5, 0, 0]}
                maxBarSize={45}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Confusion Matrix */}
        <ChartCard
          title="Confusion Matrix"
          description="Actual versus predicted classification results"
        >
          <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div />
                <div className="text-xs font-semibold text-gray-500">
                  Predicted Real
                </div>
                <div className="text-xs font-semibold text-gray-500">
                  Predicted Fake
                </div>

                {confusionData.map((row) => (
                  <div key={row.actual} className="contents">
                    <div className="flex items-center justify-center text-sm font-semibold text-slate-600">
                      Actual {row.actual}
                    </div>

                    <div className="rounded-lg bg-blue-100 p-6">
                      <p className="text-2xl font-bold text-blue-900">
                        {row.real}
                      </p>
                    </div>

                    <div className="rounded-lg bg-slate-100 p-6">
                      <p className="text-2xl font-bold text-slate-700">
                        {row.fake}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                Demo classification values
              </p>
            </div>
          </div>
        </ChartCard>

        {/* Elbow Method */}
        <ChartCard
          title="Elbow Method"
          description="Inertia values used to explore the optimal number of clusters"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={elbowData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="k"
                label={{
                  value: "Number of clusters (K)",
                  position: "insideBottom",
                  offset: -5,
                  fill: "#64748B",
                  fontSize: 12,
                }}
                tick={{ fill: "#64748B", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748B", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="inertia"
                stroke={colors.blue}
                strokeWidth={2.5}
                dot={{ r: 5, fill: colors.blue }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* K-Means Segmentation */}
        <ChartCard
          title="K-Means Segmentation"
          description="Product grouping based on price and rating count"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E5E7EB"
              />
              <XAxis
                type="number"
                dataKey="rating"
                name="Rating Count"
                tick={{ fill: "#64748B", fontSize: 12 }}
                label={{
                  value: "Rating Count",
                  position: "insideBottom",
                  offset: -5,
                  fill: "#64748B",
                  fontSize: 12,
                }}
              />
              <YAxis
                type="number"
                dataKey="price"
                name="Price"
                tick={{ fill: "#64748B", fontSize: 12 }}
              />
              <ZAxis range={[80, 80]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />

              <Scatter
                name="Cluster 0"
                data={clusterData.filter(
                  (item) => item.cluster === "Cluster 0"
                )}
                fill={colors.blue}
              />
              <Scatter
                name="Cluster 1"
                data={clusterData.filter(
                  (item) => item.cluster === "Cluster 1"
                )}
                fill={colors.green}
              />
              <Scatter
                name="Cluster 2"
                data={clusterData.filter(
                  (item) => item.cluster === "Cluster 2"
                )}
                fill={colors.orange}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </section>
  );
}
