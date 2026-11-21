"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toggleMobileMenu, closeNavbar } from "@/redux/navbarSlice";
import predictionService from "@/services/predictionService";
import { exportProductsToCSV } from "@/utils/csvExport";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const isMobileMenuOpen = useSelector((state) => state.navbar.isMobileMenuOpen);

  const [isSitesMenuOpen, setIsSitesMenuOpen] = useState(false);
  const [minedSites, setMinedSites] = useState([]);
  const [loadingSites, setLoadingSites] = useState(false);
  const [deletingDomain, setDeletingDomain] = useState(null);
  const [confirmDeleteDomain, setConfirmDeleteDomain] = useState(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [exportingDomain, setExportingDomain] = useState(null);
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const dropdownRef = useRef(null);

  const navLinks = [
    { name: "Products", href: "/products" },
    { name: "Prediction", href: "/prediction" },
    { name: "Data Overview", href: "/data-cleaning" },
    { name: "Classification", href: "/classification" },
    { name: "About", href: "/about" },
  ];

  // Fetch unique mined sites list
  const fetchSites = async () => {
    try {
      setLoadingSites(true);
      const data = await predictionService.getMinedSites();
      setMinedSites(data || []);
    } catch (err) {
      console.warn("Could not fetch mined sites list:", err);
    } finally {
      setLoadingSites(false);
    }
  };

  useEffect(() => {
    fetchSites();

    // Listen for custom event when new sites are mined or deleted
    const handleUpdate = () => fetchSites();
    window.addEventListener("minedSitesUpdated", handleUpdate);
    return () => window.removeEventListener("minedSitesUpdated", handleUpdate);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSitesMenuOpen(false);
        setConfirmDeleteDomain(null);
        setConfirmClearAll(false);
      }
    }
    if (isSitesMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSitesMenuOpen]);

  // Handle single site deletion
  const handleDeleteSite = async (domain) => {
    try {
      setDeletingDomain(domain);
      const res = await predictionService.deleteSiteProducts(domain);
      setActionMessage(`Deleted ${res.deletedCount || "all"} products from ${domain}`);
      setConfirmDeleteDomain(null);
      await fetchSites();
      window.dispatchEvent(new Event("minedSitesUpdated"));
      router.refresh();
      setTimeout(() => setActionMessage(""), 3500);
    } catch (err) {
      setActionMessage(`Failed: ${err.message}`);
    } finally {
      setDeletingDomain(null);
    }
  };

  // Handle clear all mined products
  const handleClearAll = async () => {
    try {
      setDeletingDomain("all");
      const res = await predictionService.clearAllProducts();
      setActionMessage(`Cleared all ${res.deletedCount} products from database`);
      setConfirmClearAll(false);
      await fetchSites();
      window.dispatchEvent(new Event("minedSitesUpdated"));
      router.refresh();
      setTimeout(() => setActionMessage(""), 3500);
    } catch (err) {
      setActionMessage(`Failed: ${err.message}`);
    } finally {
      setDeletingDomain(null);
    }
  };

  // Handle exporting a single site's products as CSV
  const handleExportSiteCSV = async (domain) => {
    try {
      setExportingDomain(domain);
      setActionMessage(`Preparing CSV export for ${domain}...`);
      const res = await predictionService.getProducts({ source: domain });
      const products = Array.isArray(res) ? res : res?.data || res?.products || [];

      if (products.length === 0) {
        setActionMessage(`No products found for ${domain}`);
        setTimeout(() => setActionMessage(""), 3000);
        return;
      }

      const cleanDomain = domain.replace(/[^a-zA-Z0-9_-]/g, "_");
      const dateStr = new Date().toISOString().slice(0, 10);
      exportProductsToCSV(products, `${cleanDomain}_products_${dateStr}.csv`);
      setActionMessage(`Exported ${products.length} products from ${domain} (.CSV)`);
      setTimeout(() => setActionMessage(""), 3500);
    } catch (err) {
      console.error("CSV Export error:", err);
      setActionMessage(`Export failed: ${err.message}`);
    } finally {
      setExportingDomain(null);
    }
  };

  // Handle exporting all mined products across all sites as CSV
  const handleExportAllCSV = async () => {
    try {
      setIsExportingAll(true);
      setActionMessage("Generating complete CSV export for all sites...");
      const res = await predictionService.getProducts();
      const products = Array.isArray(res) ? res : res?.data || res?.products || [];

      if (products.length === 0) {
        setActionMessage("No products in database to export.");
        setTimeout(() => setActionMessage(""), 3000);
        return;
      }

      const dateStr = new Date().toISOString().slice(0, 10);
      exportProductsToCSV(products, `all_mined_products_${dateStr}.csv`);
      setActionMessage(`Exported all ${products.length} products to CSV!`);
      setTimeout(() => setActionMessage(""), 3500);
    } catch (err) {
      console.error("CSV Export error:", err);
      setActionMessage(`Export failed: ${err.message}`);
    } finally {
      setIsExportingAll(false);
    }
  };

  const totalProductsCount = minedSites.reduce((sum, s) => sum + (s.productCount || 0), 0);

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#fafafa] border-b border-gray-100">
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-16">
        {/* Main Navbar */}
        <div className="h-[72px] flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            onClick={() => dispatch(closeNavbar())}
            className="flex items-center shrink-0"
          >
            <span className="text-[29px] font-bold tracking-tight text-black">
              DATA
            </span>
            <span className="bg-black text-white text-[22px] font-bold px-1.5 py-0.5 ml-0.5">
              MINING
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-7 ml-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[13px] font-medium transition-colors ${
                    isActive ? "text-black font-bold" : "text-gray-700 hover:text-black"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Action Controls - Desktop */}
          <div className="hidden lg:flex items-center gap-3 relative" ref={dropdownRef}>
            {/* Delete / Mined Sites Info Menu Trigger Button */}
            <button
              type="button"
              onClick={() => {
                setIsSitesMenuOpen(!isSitesMenuOpen);
                fetchSites();
              }}
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-full border transition cursor-pointer ${
                isSitesMenuOpen
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-800 border-gray-300 hover:bg-gray-100 hover:border-gray-400"
              }`}
            >
              <span>Mined Sites</span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isSitesMenuOpen ? "bg-white text-slate-900" : "bg-slate-100 text-slate-700"
                }`}
              >
                {minedSites.length}
              </span>
            </button>

            {/* New Mining Button */}
            <Link
              href="/"
              className="bg-black text-white text-[13px] font-semibold px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors"
            >
              New Mining
            </Link>

            {/* Mined Sites & Delete Info Dropdown Menu */}
            {isSitesMenuOpen && (
              <div className="absolute right-0 top-14 w-96 rounded-2xl border border-gray-200 bg-white shadow-2xl p-5 z-50 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Mined Sites Manager
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {totalProductsCount} products across {minedSites.length} target sites
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSitesMenuOpen(false)}
                    className="text-gray-400 hover:text-gray-600 text-sm p-1 cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                {/* Export All Data Button */}
                {minedSites.length > 0 && (
                  <div className="mt-3">
                    <button
                      type="button"
                      disabled={isExportingAll}
                      onClick={handleExportAllCSV}
                      className="w-full flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold py-2 px-3 rounded-xl transition cursor-pointer disabled:opacity-50 shadow-sm"
                      title="Export full product database across all sites to .CSV"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      <span>
                        {isExportingAll ? "Exporting Full CSV..." : "Export All Products (.CSV)"}
                      </span>
                    </button>
                  </div>
                )}

                {/* Status or Alert Notification */}
                {actionMessage && (
                  <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800">
                    {actionMessage}
                  </div>
                )}

                {/* Sites List */}
                <div className="mt-4 max-h-72 overflow-y-auto space-y-2.5 pr-1">
                  {loadingSites ? (
                    <div className="py-6 text-center text-xs text-gray-500">
                      Loading mined target sites...
                    </div>
                  ) : minedSites.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-500">
                      <p className="font-semibold text-gray-700">No websites mined yet.</p>
                      <p className="mt-1 text-[11px]">Start a mining job from the Home page.</p>
                    </div>
                  ) : (
                    minedSites.map((site) => {
                      const isConfirming = confirmDeleteDomain === site.domain;
                      const isDeleting = deletingDomain === site.domain;

                      return (
                        <div
                          key={site.domain}
                          className="p-3 rounded-xl border border-gray-100 bg-slate-50/70 hover:bg-slate-50 transition"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-xs text-slate-900 truncate">
                                {site.domain}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[11px] bg-slate-200 text-slate-800 font-semibold px-2 py-0.5 rounded-full">
                                  {site.productCount} products
                                </span>
                                {site.lastMinedAt && (
                                  <span className="text-[10px] text-gray-400">
                                    {new Date(site.lastMinedAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>

                            {!isConfirming ? (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  disabled={exportingDomain === site.domain}
                                  onClick={() => handleExportSiteCSV(site.domain)}
                                  title={`Export all products from ${site.domain} to CSV`}
                                  className="text-slate-700 hover:text-black hover:bg-slate-200/70 px-2 py-1.5 rounded-lg transition cursor-pointer text-xs flex items-center gap-1 disabled:opacity-50 border border-gray-200 bg-white"
                                >
                                  <svg
                                    className="w-3.5 h-3.5 text-slate-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                    />
                                  </svg>
                                  <span className="font-semibold text-[11px]">
                                    {exportingDomain === site.domain ? "..." : "CSV"}
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  disabled={isDeleting}
                                  onClick={() => setConfirmDeleteDomain(site.domain)}
                                  title={`Delete all ${site.productCount} products from ${site.domain}`}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1.5 rounded-lg transition cursor-pointer text-xs flex items-center gap-1 shrink-0"
                                >
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                  <span>Delete</span>
                                </button>
                              </div>
                            ) : null}
                          </div>

                          {/* Confirmation Prompt */}
                          {isConfirming && (
                            <div className="mt-2.5 pt-2 border-t border-red-100 text-xs">
                              <p className="text-red-700 font-semibold text-[11px] mb-2">
                                Delete all {site.productCount} products from this site?
                              </p>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={isDeleting}
                                  onClick={() => handleDeleteSite(site.domain)}
                                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 rounded-md text-[11px] transition cursor-pointer disabled:opacity-50"
                                >
                                  {isDeleting ? "Deleting..." : "Confirm Delete"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteDomain(null)}
                                  className="border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium px-2.5 py-1 rounded-md text-[11px] transition cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Clear All Footer */}
                {minedSites.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    {!confirmClearAll ? (
                      <button
                        type="button"
                        onClick={() => setConfirmClearAll(true)}
                        className="text-red-600 hover:text-red-800 font-semibold text-[11px] hover:underline cursor-pointer"
                      >
                        Clear All Mined Data
                      </button>
                    ) : (
                      <div className="w-full flex items-center justify-between gap-2">
                        <span className="text-[11px] text-red-700 font-bold">Wipe entire DB?</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={handleClearAll}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold px-2.5 py-0.5 rounded text-[10px] cursor-pointer"
                          >
                            Yes, Clear All
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmClearAll(false)}
                            className="border border-gray-300 px-2 py-0.5 rounded text-[10px] text-gray-600 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <span className="text-[11px] text-gray-400">
                      Total: {totalProductsCount} items
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile / Tablet Menu Button */}
          <button
            onClick={() => dispatch(toggleMobileMenu())}
            className="lg:hidden p-2 text-black"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile / Tablet Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-5 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => dispatch(closeNavbar())}
                className="block py-2.5 text-sm font-medium text-gray-900 hover:text-gray-500"
              >
                {link.name}
              </Link>
            ))}

            {/* Mobile Mined Sites Section */}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Mined Sites ({minedSites.length})
                </p>
                {minedSites.length > 0 && (
                  <button
                    type="button"
                    disabled={isExportingAll}
                    onClick={handleExportAllCSV}
                    className="text-[11px] font-bold text-white bg-slate-900 hover:bg-black px-2.5 py-1 rounded-md transition cursor-pointer"
                  >
                    {isExportingAll ? "Exporting..." : "Export All CSV"}
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {minedSites.map((site) => (
                  <div
                    key={site.domain}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-200 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{site.domain}</span>
                      <span className="ml-2 text-gray-500">({site.productCount})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={exportingDomain === site.domain}
                        onClick={() => handleExportSiteCSV(site.domain)}
                        className="text-slate-800 font-semibold px-2 py-0.5 rounded bg-white border border-gray-300 hover:bg-gray-100 text-[11px]"
                      >
                        {exportingDomain === site.domain ? "..." : "CSV"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSite(site.domain)}
                        className="text-red-600 font-semibold px-2 py-0.5 rounded hover:bg-red-50 text-[11px]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* New Mining Button - Mobile */}
            <div className="pt-3">
              <Link
                href="/"
                onClick={() => dispatch(closeNavbar())}
                className="inline-flex bg-black text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-gray-800 transition-colors"
              >
                New Mining
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
