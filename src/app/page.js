
"use client";

import { useState } from "react";

export default function Home() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = (e) => {
    e.preventDefault();

    setError("");

    // Check empty input
    if (!websiteUrl.trim()) {
      setError("Please enter a website URL.");
      return;
    }

    // Validate URL
    try {
      const parsedUrl = new URL(websiteUrl.trim());

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        setError("Please enter a valid HTTP or HTTPS URL.");
        return;
      }

      // Store URL in a variable
      const targetUrl = parsedUrl.href;

      console.log("Target Website URL:", targetUrl);

      // Demo only: backend connection will be added later
      alert("URL submitted successfully!\n" + targetUrl);

    } catch {
      setError("Please enter a valid website URL.");
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-white flex items-center justify-center px-5 py-16">

      <div className="w-full max-w-2xl mx-auto text-center">

        {/* DATA MINING Logo */}
        <div className="flex items-center justify-center mb-12">
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

        <p className="text-gray-500 mt-4 text-base md:text-lg">
          Enter your target website URL to start collecting
          and analyzing product data.
        </p>

        {/* URL Form */}
        <form onSubmit={handleConfirm} className="mt-10 text-left">

          <label
            htmlFor="websiteUrl"
            className="block text-sm font-semibold text-slate-800 mb-3"
          >
            Please enter your target website URL
          </label>

          <input
            id="websiteUrl"
            type="url"
            placeholder="https://www.example.com"
            value={websiteUrl}
            onChange={(e) => {
              setWebsiteUrl(e.target.value);
              setError("");
            }}
            className="w-full px-5 py-4 border border-gray-300 rounded-xl text-gray-800 outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-500 transition"
          />

          {error && (
            <p className="text-sm text-red-600 mt-2">
              {error}
            </p>
          )}

          {/* Confirm Button */}
          <button
            type="submit"
            className="w-full mt-5 bg-black text-white font-semibold py-4 rounded-xl hover:bg-gray-800 transition duration-200"
          >
            Confirm URL
          </button>

        </form>

        {/* Footer Text */}
        <p className="text-xs text-gray-400 mt-8">
          DATA MINING — Automated Web Data Collection Platform
        </p>

      </div>
    </main>
  );
}
