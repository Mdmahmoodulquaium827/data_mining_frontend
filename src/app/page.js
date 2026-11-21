"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import predictionService from "@/services/predictionService";

export default function Home() {
  const router = useRouter();
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [maxProducts, setMaxProducts] = useState(30);
  const [error, setError] = useState("");
  const [isMining, setIsMining] = useState(false);
  const [miningStatus, setMiningStatus] = useState(null);
  const pollIntervalRef = useRef(null);

  // Clean up poll interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const startPolling = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const status = await predictionService.getMiningStatus();
        setMiningStatus(status);

        if (status.status === "completed") {
          clearInterval(pollIntervalRef.current);
          setIsMining(false);
          // Redirect to products catalog
          setTimeout(() => {
            router.push("/products");
          }, 1500);
        } else if (status.status === "failed") {
          clearInterval(pollIntervalRef.current);
          setIsMining(false);
          setError(status.error || "Mining process failed. Please check the target URL.");
        }
      } catch (err) {
        console.error("Status poll error:", err);
      }
    }, 1500);
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError("");

    if (!websiteUrl.trim()) {
      setError("Please enter a website URL.");
      return;
    }

    try {
      const parsedUrl = new URL(websiteUrl.trim());
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        setError("Please enter a valid HTTP or HTTPS URL.");
        return;
      }

      setIsMining(true);
      setMiningStatus({
        status: "processing",
        progress: 10,
        stage: "Connecting to Universal Mining Engine...",
      });

      const count = Math.max(1, parseInt(maxProducts, 10) || 30);
      await predictionService.startMining(parsedUrl.href, count);
      startPolling();
    } catch (err) {
      setError(err.message || "Failed to initiate mining job. Please ensure backend is running.");
      setIsMining(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-white flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-2xl mx-auto text-center">

        {/* DATA MINING Logo */}
        <div className="flex items-center justify-center mb-8">
          <span className="text-4xl md:text-5xl font-bold tracking-tight text-black">
            DATA
          </span>
          <span className="bg-black text-white text-3xl md:text-4xl font-bold px-2 py-1 ml-1">
            MINING
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
          Discover. Collect. Analyze.
        </h1>

        {/* URL Form */}
        <form onSubmit={handleConfirm} className="mt-8 text-left space-y-4">
          <div>
            <label
              htmlFor="websiteUrl"
              className="block text-sm font-semibold text-slate-800 mb-2"
            >
              Enter Target Website or Category URL
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="websiteUrl"
                type="url"
                disabled={isMining}
                placeholder="https://pcbstore.com.bd/laptop/all-laptop"
                value={websiteUrl}
                onChange={(e) => {
                  setWebsiteUrl(e.target.value);
                  setError("");
                }}
                className="flex-1 px-5 py-4 border border-gray-300 rounded-xl text-gray-800 outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-500 transition disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={isMining}
                className="bg-black text-white font-semibold px-8 py-4 rounded-xl hover:bg-gray-800 transition duration-200 disabled:opacity-50 whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
              >
                {isMining ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Mining...</span>
                  </>
                ) : (
                  "Start Mining"
                )}
              </button>
            </div>
          </div>

          {/* Product Limit Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
            <div>
              <label htmlFor="maxProducts" className="block text-xs font-semibold text-slate-800">
                Number of Products to Mine
              </label>
              <p className="text-[11px] text-gray-500">
                Limit how many product listings to scrape and enrich from this target
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="maxProducts"
                type="number"
                min="1"
                max="200"
                disabled={isMining}
                value={maxProducts}
                onChange={(e) => setMaxProducts(e.target.value)}
                className="w-20 px-3 py-1.5 text-center text-sm font-semibold border border-gray-300 rounded-lg text-slate-800 bg-white outline-none focus:ring-2 focus:ring-slate-400"
              />

              <div className="flex items-center gap-1">
                {[10, 25, 50, 100].map((num) => (
                  <button
                    key={num}
                    type="button"
                    disabled={isMining}
                    onClick={() => setMaxProducts(num)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
                      Number(maxProducts) === num
                        ? "bg-black text-white border-black font-semibold"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 mt-2 font-medium">
              {error}
            </p>
          )}
        </form>

        {/* Live Mining Progress Stepper Overlay */}
        {isMining && miningStatus && (
          <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl text-left shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                </span>
                {miningStatus.stage || "Processing..."}
              </span>
              <span className="text-xs font-semibold text-slate-600">
                {miningStatus.progress || 10}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-500 ease-out"
                style={{ width: `${Math.max(10, miningStatus.progress || 10)}%` }}
              ></div>
            </div>

            {/* Recent logs */}
            {miningStatus.logs && miningStatus.logs.length > 0 && (
              <div className="mt-4 bg-slate-900 text-slate-200 text-xs p-3 rounded-lg font-mono max-h-24 overflow-y-auto">
                <p className="text-green-400">
                  {miningStatus.logs[miningStatus.logs.length - 1]}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
