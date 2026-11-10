
"use client";

import { useState } from "react";

// Classification configuration
const targets = {
  mobile: {
    title: "Smartphone Classification",
    feature: "is_smart",
    positive: "Smart Mobile",
    negative: "Non-Smart Mobile",
    placeholder: "Enter mobile specifications...",
  },

  ac: {
    title: "AC Classification",
    feature: "is_inverter",
    positive: "Inverter AC",
    negative: "Non-Inverter AC",
    placeholder: "Enter AC specifications...",
  },

  tv: {
    title: "Smart TV Classification",
    feature: "is_smart",
    positive: "Smart TV",
    negative: "Non-Smart TV",
    placeholder: "Enter TV specifications...",
  },

  other: {
    title: "Wireless Classification",
    feature: "is_wireless",
    positive: "Wireless",
    negative: "Non-Wireless",
    placeholder: "Enter product specifications...",
  },
};

// Identify product category from user input
const getCategoryKey = (value) => {
  const normalized = value.trim().toLowerCase();

  if (
    ["mobile", "smartphone", "phone", "smart phone"].includes(normalized)
  ) {
    return "mobile";
  }

  if (
    ["ac", "air conditioner", "air conditioning"].includes(normalized)
  ) {
    return "ac";
  }

  if (
    ["tv", "television", "smart tv"].includes(normalized)
  ) {
    return "tv";
  }

  return "other";
};

export default function ClassificationPage() {
  const [category, setCategory] = useState("Mobile");
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Get selected classification configuration
  const categoryKey = getCategoryKey(category);
  const selectedTarget = targets[categoryKey];

  // Handle category changes
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setResult(null);
    setError("");
  };

  // Classification function
  const handleClassify = (e) => {
    e.preventDefault();

    setError("");
    setResult(null);

    if (!category.trim()) {
      setError("Please enter a product category.");
      return;
    }

    if (!productName.trim()) {
      setError("Please enter the product model or name.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter product specifications.");
      return;
    }

    // Frontend demonstration only.
    // Replace this section with your backend ML API call later.

    const text = `${productName} ${description}`.toLowerCase();

    let prediction = null;

    // Mobile and Television classification
    if (categoryKey === "mobile" || categoryKey === "tv") {
      if (/\b(non[- ]?smart|not smart)\b/.test(text)) {
        prediction = false;
      } else if (/\bsmart\b/.test(text)) {
        prediction = true;
      }
    }

    // Air Conditioner classification
    else if (categoryKey === "ac") {
      if (/\b(non[- ]?inverter|not inverter)\b/.test(text)) {
        prediction = false;
      } else if (/\binverter\b/.test(text)) {
        prediction = true;
      }
    }

    // Other product classification
    else {
      if (/\b(non[- ]?wireless|not wireless)\b/.test(text)) {
        prediction = false;
      } else if (
        /\b(wireless|wi-?fi|bluetooth)\b/.test(text)
      ) {
        prediction = true;
      }
    }

    if (prediction === null) {
      setError(
        `The required feature (${selectedTarget.feature}) was not identified. Please provide clearer product specifications.`
      );
      return;
    }

    // Save result
    setResult({
      prediction,
      label: prediction
        ? selectedTarget.positive
        : selectedTarget.negative,
      feature: selectedTarget.feature,
      product: productName,
      category: category,
    });
  };

  // Reset form
  const handleReset = () => {
    setCategory("Mobile");
    setProductName("");
    setDescription("");
    setResult(null);
    setError("");
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-10">

      <div className="mx-auto max-w-5xl space-y-8">

        {/* Page Header */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Machine Learning
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
            Product Classification
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-gray-500">
            Enter any product category, model name, and
            specifications to identify its features using
            classification.
          </p>
        </div>

        {/* Classification Form */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">

          <div className="mb-7">
            <h2 className="text-xl font-semibold text-slate-800">
              Product Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Provide product details for classification.
            </p>
          </div>

          <form onSubmit={handleClassify} className="space-y-6">

            {/* Product Category */}
            <div>
              <label className="mb-2 block font-semibold text-gray-800">
                Product Category
              </label>

              <input
                type="text"
                value={category}
                onChange={handleCategoryChange}
                placeholder="e.g. Mobile, AC, Television, Laptop, Refrigerator"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-2 text-xs text-gray-400">
                Enter any product category.
              </p>
            </div>

            {/* Classification Target */}
            <div className="rounded-lg border border-gray-200 bg-slate-50 p-4">

              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Classification Target
              </p>

              <p className="mt-2 font-semibold text-slate-800">
                {selectedTarget.title}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Feature: {selectedTarget.feature}
              </p>

              {categoryKey === "other" && (
                <p className="mt-2 text-xs text-amber-700">
                  No dedicated target is configured for this
                  category. The current demonstration checks
                  wireless features only.
                </p>
              )}
            </div>

            {/* Product Model */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Product Model / Name
              </label>

              <input
                type="text"
                value={productName}
                onChange={(e) => {
                  setProductName(e.target.value);
                  setResult(null);
                  setError("");
                }}
                placeholder="e.g. Samsung Galaxy A15"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-slate-700 outline-none transition focus:border-blue-600"
              />
            </div>

            {/* Product Description */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Product Description / Specifications
              </label>

              <textarea
                rows={5}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setResult(null);
                  setError("");
                }}
                placeholder={selectedTarget.placeholder}
                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-slate-700 outline-none transition focus:border-blue-600"
              />

              <p className="mt-2 text-xs text-gray-400">
                Enter relevant specifications, features, or
                product description.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">

              <button
                type="submit"
                className="flex-1 rounded-lg bg-black py-3.5 font-semibold text-white transition hover:bg-gray-800"
              >
                Classify Product
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg border border-gray-300 px-7 py-3.5 font-medium text-slate-700 transition hover:bg-gray-50"
              >
                Reset
              </button>

            </div>

          </form>
        </div>

        {/* Classification Result */}
        {result && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">

            <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
              Classification Result
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-800">
              {result.product}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Category: {result.category}
            </p>

            <div className="mt-6 rounded-lg border border-gray-200 bg-slate-50 p-6">

              <p className="text-sm font-medium text-gray-500">
                Predicted Class
              </p>

              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {result.label}
              </h3>

              <div className="mt-5 border-t border-gray-200 pt-4">

                <p className="text-sm text-gray-500">
                  Classification Feature
                </p>

                <p className="mt-1 font-semibold text-slate-700">
                  {result.feature}
                </p>

                <p className="mt-3 text-sm text-gray-500">
                  Prediction:{" "}
                  <span className="font-semibold text-slate-800">
                    {result.prediction ? "Yes" : "No"}
                  </span>
                </p>

              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-amber-700">
              Demonstration result only. This version uses
              keyword-based matching, not your trained machine
              learning model.
            </p>

          </div>
        )}

      </div>
    </main>
  );
}
