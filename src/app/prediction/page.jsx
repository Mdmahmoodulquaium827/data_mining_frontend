"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TestChart from "@/components/prediction/TestChart";
import PredictionCharts from "@/components/prediction/PredictionCharts";
import predictionService from "@/services/predictionService";

export default function PredictionPage() {
  const [activeModelType, setActiveModelType] = useState("regression");
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [data, prods] = await Promise.all([
          predictionService.getAnalytics().catch(() => null),
          predictionService.getProducts().catch(() => []),
        ]);
        if (data) setAnalytics(data);
        if (Array.isArray(prods)) setProducts(prods);
      } catch (err) {
        console.error("Error loading analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const prediction = analytics?.prediction || {};

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Machine Learning & Prediction Dashboard
              </h1>
              <p className="text-gray-500 mt-1">
                Data mining analytics: regression performance, classification accuracy, elbow method, and K-Means segmentation
              </p>
            </div>

            {analytics?.sourceDomain && (
              <span className="text-xs bg-slate-900 text-white font-medium px-3.5 py-1.5 rounded-full self-start">
                Dataset: {analytics.sourceDomain}
              </span>
            )}
          </div>
        </div>

        {/* Content or Empty State */}
        {!analytics?.sourceDomain && (!prediction.modelComparison || prediction.modelComparison.length === 0) ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 p-8">
            <h2 className="text-xl font-bold text-slate-800">No Mined Dataset Found</h2>
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              There is currently no active dataset in the database. Run a mining job from the Home page to train regression, classification, and K-Means models.
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
            {/* Model Performance Comparison Bar Chart with Tab Switcher */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setActiveModelType("regression")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeModelType === "regression"
                      ? "bg-black text-white"
                      : "bg-white text-slate-700 border border-gray-200 hover:bg-slate-50"
                  }`}
                >
                  Regression Models (R² Score)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModelType("classification")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeModelType === "classification"
                      ? "bg-black text-white"
                      : "bg-white text-slate-700 border border-gray-200 hover:bg-slate-50"
                  }`}
                >
                  Classification Models (Accuracy %)
                </button>
              </div>

              <TestChart
                data={
                  activeModelType === "regression"
                    ? prediction.modelComparison || []
                    : prediction.classificationComparison || []
                }
              />
            </div>

            {/* Analytics Charts Grid */}
            <PredictionCharts
              products={products}
              priceDistribution={prediction.priceDistribution || []}
              confusionMatrix={prediction.confusionMatrix || []}
              elbowCurve={prediction.elbowCurve || []}
              clusters={prediction.clusters || []}
              availableTargets={prediction.availableTargets}
            />
          </>
        )}
      </div>
    </main>
  );
}
