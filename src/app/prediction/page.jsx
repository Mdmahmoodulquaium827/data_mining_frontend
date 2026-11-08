
import TestChart from "@/components/prediction/TestChart";
import PredictionCharts from "@/components/prediction/PredictionCharts";

export default function PredictionPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-10">

      <div className="max-w-7xl mx-auto">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Prediction Dashboard
          </h1>

          <p className="text-gray-500 mt-2">
            Machine Learning Analytics and Predictions
          </p>
        </div>

        {/* Model Performance */}
        <div className="mb-8">
          <TestChart />
        </div>

        {/* Other Analytics Charts */}
        <PredictionCharts />

      </div>

    </main>
  );
}
