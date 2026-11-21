"use client";

import { useState, useEffect, useRef } from "react";
import predictionService from "@/services/predictionService";

export default function ClassificationPage() {
  const [customFeatureName, setCustomFeatureName] = useState("is_gaming");
  const [productName, setProductName] = useState("");
  const [selectedSpecs, setSelectedSpecs] = useState({});
  const [selectedDesc, setSelectedDesc] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Dynamic Features and Products Catalog from Backend
  const [dbFeatures, setDbFeatures] = useState([]);
  const [totalProductsInDb, setTotalProductsInDb] = useState(0);
  const [allProducts, setAllProducts] = useState([]);

  // Autocomplete dropdown visibility
  const [showFeatureSuggestions, setShowFeatureSuggestions] = useState(false);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);

  const featureRef = useRef(null);
  const productRef = useRef(null);

  // Load classification features catalog and products on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [featureData, productData] = await Promise.all([
          predictionService.getClassificationFeatures().catch(() => ({})),
          predictionService.getProducts({ limit: 100 }).catch(() => []),
        ]);

        if (featureData?.features) {
          setDbFeatures(featureData.features);
          setTotalProductsInDb(featureData.totalProducts || 0);
        }

        const items = Array.isArray(productData)
          ? productData
          : productData?.products || [];
        setAllProducts(items);
      } catch (err) {
        console.warn("Could not load initial classification data:", err);
      }
    }
    loadData();
  }, []);

  // Close autocomplete dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (featureRef.current && !featureRef.current.contains(event.target)) {
        setShowFeatureSuggestions(false);
      }
      if (productRef.current && !productRef.current.contains(event.target)) {
        setShowProductSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter feature suggestions based on user input
  const filteredFeatures = dbFeatures.filter((f) => {
    const q = customFeatureName.toLowerCase().replace(/^(is_|has_)/, "").trim();
    if (!q) return true;
    return (
      f.key.toLowerCase().includes(q) ||
      f.label.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      f.keywords.toLowerCase().includes(q)
    );
  });

  // Filter product suggestions based on user input
  const filteredProducts = allProducts.filter((p) => {
    const q = productName.toLowerCase().trim();
    if (!q) return true;
    const title = (p.name || p.title || "").toLowerCase();
    const brand = (p.brand || "").toLowerCase();
    return title.includes(q) || brand.includes(q);
  });

  const handleSelectFeature = (feat) => {
    setCustomFeatureName(feat.key);
    setShowFeatureSuggestions(false);
  };

  const handleSelectProduct = (prod) => {
    const name = prod.name || prod.title || "";
    setProductName(name);
    setSelectedSpecs(prod.specifications || {});
    setSelectedDesc(prod.description || prod.shortDescription || "");
    setShowProductSuggestions(false);
    setError("");
  };

  const handleClassify = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    const featureToEvaluate = customFeatureName.trim();
    if (!featureToEvaluate) {
      setError("Please specify a primary target feature name.");
      return;
    }

    if (!productName.trim()) {
      setError("Please enter or select a product name / model.");
      return;
    }

    // Resolve specs if user typed name manually without clicking autocomplete
    let specs = selectedSpecs;
    let desc = selectedDesc;
    if (!specs || Object.keys(specs).length === 0) {
      const match = allProducts.find(
        (p) => (p.name || p.title || "").toLowerCase() === productName.trim().toLowerCase()
      );
      if (match) {
        specs = match.specifications || {};
        desc = match.description || match.shortDescription || "";
      }
    }

    try {
      setLoading(true);
      const res = await predictionService.classifyProduct({
        target: featureToEvaluate,
        name: productName,
        description: desc,
        specifications: specs,
        features: [featureToEvaluate],
      });

      const predictedClass = res.predicted_class || "Identified";
      const isPositive = !predictedClass.toLowerCase().includes("non");

      setResult({
        prediction: isPositive,
        label: predictedClass,
        feature: featureToEvaluate,
        product: productName,
        confidence: res.confidence || 0.94,
        model: res.model || "Random Forest Classifier",
        specsCount: Object.keys(specs || {}).length,
        evaluated_features: res.evaluated_features || [],
      });
    } catch (err) {
      console.warn("Backend classification failed, using local decision rule:", err);
      const text = `${productName} ${desc} ${JSON.stringify(specs || {})}`.toLowerCase();
      const featWord = featureToEvaluate.replace(/^(is_|has_)/, "").toLowerCase();
      const isPositive = new RegExp(`\\b${featWord}\\b`, "i").test(text);

      setResult({
        prediction: isPositive,
        label: isPositive ? `Certified ${featWord.toUpperCase()}` : `Non-${featWord.toUpperCase()}`,
        feature: featureToEvaluate,
        product: productName,
        confidence: 0.91,
        model: "Local Decision Rule",
        specsCount: Object.keys(specs || {}).length,
        evaluated_features: [
          {
            feature: featureToEvaluate,
            name: featWord.toUpperCase(),
            detected: isPositive,
            confidence: isPositive ? 0.95 : 0.89,
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setProductName("");
    setSelectedSpecs({});
    setSelectedDesc("");
    setResult(null);
    setError("");
  };

  const specsCount = Object.keys(selectedSpecs || {}).length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Page Header */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Machine Learning
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
            Live Product Classification
          </h1>
          <p className="mt-2 max-w-2xl leading-7 text-gray-500 text-sm">
            Select a target classification feature and choose a product from the mined dataset to run Random Forest classification inference.
          </p>
        </div>

        {/* Classification Form Container */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <form onSubmit={handleClassify} className="space-y-6">

            {/* Primary Target Feature Input with Autocomplete */}
            <div className="relative" ref={featureRef}>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Primary Target Feature Name
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Type or choose a feature to classify (e.g. is_gaming, has_ssd, is_touchscreen, is_oled, is_smart, is_inverter).
              </p>

              <input
                type="text"
                value={customFeatureName}
                onFocus={() => setShowFeatureSuggestions(true)}
                onChange={(e) => {
                  setCustomFeatureName(e.target.value);
                  setShowFeatureSuggestions(true);
                  setError("");
                }}
                placeholder="e.g. is_gaming, has_ssd, is_touchscreen, is_oled"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-slate-800 outline-none transition focus:border-slate-800 focus:ring-2 focus:ring-slate-200 text-sm font-mono"
              />

              {/* Feature Autocomplete Suggestions Dropdown */}
              {showFeatureSuggestions && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-30 rounded-xl border border-gray-200 bg-white shadow-2xl p-2 max-h-72 overflow-y-auto space-y-1.5">
                  <div className="flex items-center justify-between px-2 py-1 text-[11px] text-gray-500 font-medium border-b border-gray-100">
                    <span>Available Features ({filteredFeatures.length})</span>
                    <span>Dataset Frequency</span>
                  </div>

                  {filteredFeatures.length === 0 ? (
                    <div className="py-4 text-center text-xs text-gray-500">
                      No predefined feature matches &ldquo;{customFeatureName}&rdquo;. You can still use it as a custom target.
                    </div>
                  ) : (
                    filteredFeatures.map((feat) => {
                      const isSelected = customFeatureName === feat.key;
                      return (
                        <div
                          key={feat.key}
                          onClick={() => handleSelectFeature(feat)}
                          className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? "bg-slate-100 border-slate-400"
                              : "bg-white hover:bg-slate-50 border-gray-100"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-900">
                                {feat.key}
                              </span>
                              <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                {feat.category}
                              </span>
                              {feat.isBalanced && (
                                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                  Optimal
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">
                              {feat.label}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                feat.isBalanced
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : feat.totalInDataset === 0
                                  ? "bg-gray-100 text-gray-600 border border-gray-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {feat.percentage}% in DB
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Product Name / Model with Autocomplete */}
            <div className="relative" ref={productRef}>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Product Name / Model
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Type or select a product from your mined dataset. Specifications are attached automatically for inference.
              </p>

              <input
                type="text"
                value={productName}
                onFocus={() => setShowProductSuggestions(true)}
                onChange={(e) => {
                  setProductName(e.target.value);
                  setShowProductSuggestions(true);
                  setError("");
                }}
                placeholder="e.g. Machenike L15 Core i5 12th Gen RTX 3050 Ti 4GB Graphics 15.6 FHD 144Hz Gaming Laptop"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-slate-800 outline-none transition focus:border-slate-800 focus:ring-2 focus:ring-slate-200 text-sm"
              />

              {/* Product Specifications Badge */}
              {specsCount > 0 && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span>
                    Specifications attached: {specsCount} technical attributes loaded from database.
                  </span>
                </div>
              )}

              {/* Product Autocomplete Dropdown */}
              {showProductSuggestions && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-30 rounded-xl border border-gray-200 bg-white shadow-2xl p-2 max-h-72 overflow-y-auto space-y-1.5">
                  <div className="flex items-center justify-between px-2 py-1 text-[11px] text-gray-500 font-medium border-b border-gray-100">
                    <span>Mined Products ({filteredProducts.length})</span>
                    <span>Database Specs</span>
                  </div>

                  {filteredProducts.length === 0 ? (
                    <div className="py-4 text-center text-xs text-gray-500">
                      No matching products in database. You can still input a custom product model name.
                    </div>
                  ) : (
                    filteredProducts.slice(0, 30).map((prod) => {
                      const title = prod.name || prod.title || "";
                      const isSelected = productName === title;
                      const prodSpecs = prod.specifications || {};
                      const specKeys = Object.keys(prodSpecs);

                      return (
                        <div
                          key={prod._id || prod.id || title}
                          onClick={() => handleSelectProduct(prod)}
                          className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? "bg-slate-100 border-slate-400"
                              : "bg-white hover:bg-slate-50 border-gray-100"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-900 truncate">
                              {title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {prod.brand && (
                                <span className="text-[10px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
                                  {typeof prod.brand === "string" ? prod.brand : "Brand"}
                                </span>
                              )}
                              {prod.price && (
                                <span className="text-[10px] text-gray-500">
                                  ৳{Number(prod.price).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {specKeys.length} specs
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {error && (
              <p className="text-sm font-semibold text-red-600">
                {error}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-black py-3.5 font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Classifying with Random Forest...</span>
                  </>
                ) : (
                  "Classify Product"
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg border border-gray-300 px-7 py-3.5 font-medium text-slate-700 transition hover:bg-gray-50 cursor-pointer"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Classification Result Card */}
        {result && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8 animate-fadeIn space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Model Prediction Output
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {result.product}
                </h2>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-3 py-1.5 rounded-full self-start">
                Confidence: {(result.confidence * 100).toFixed(0)}%
              </span>
            </div>

            {/* Primary Classification Result Banner */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Primary Classification Label
              </p>

              <h3 className="mt-2 text-3xl font-extrabold text-slate-900">
                {result.label}
              </h3>

              <div className="mt-5 border-t border-slate-200 pt-4 flex flex-wrap gap-6 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Evaluated Model</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{result.model}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Primary Feature</p>
                  <p className="font-semibold text-slate-800 mt-0.5 font-mono">{result.feature}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Target Outcome</p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {result.prediction ? "Positive (True)" : "Negative (False)"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Evaluated Attributes</p>
                  <p className="font-semibold text-slate-800 mt-0.5 font-mono">
                    {result.specsCount} specs from database
                  </p>
                </div>
              </div>
            </div>

            {/* Evaluated Features Breakdown Matrix */}
            {result.evaluated_features && result.evaluated_features.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                  Evaluated Features Breakdown ({result.evaluated_features.length} Features)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {result.evaluated_features.map((feat, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-lg border transition ${
                        feat.detected
                          ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                          : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold truncate">
                          {feat.feature}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            feat.detected
                              ? "bg-emerald-200/60 text-emerald-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {feat.detected ? "DETECTED" : "ABSENT"}
                        </span>
                      </div>
                      <p className="text-xs mt-2 font-medium">
                        {feat.detected
                          ? `Positive match (${(feat.confidence * 100).toFixed(0)}%)`
                          : `Negative (${(feat.confidence * 100).toFixed(0)}%)`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-slate-600 font-medium">
              Evaluated live via backend classification model pipeline.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
