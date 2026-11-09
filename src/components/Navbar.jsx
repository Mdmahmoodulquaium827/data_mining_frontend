
"use client";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";

import {
  toggleMobileMenu,
  closeNavbar,
} from "@/redux/navbarSlice";

export default function Navbar() {
  const dispatch = useDispatch();

  const isMobileMenuOpen = useSelector(
    (state) => state.navbar.isMobileMenuOpen
  );

  const navLinks = [
    { name: "Products", href: "/products" },
    { name: "Prediction", href: "/prediction" },
    { name: "Data Overview", href: "/data-cleaning" },
    { name: "SPV", href: "/spv" },
    { name: "About", href: "/about" },
  ];

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
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[13px] font-medium text-gray-900 hover:text-gray-500 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* New Mining Button - Desktop */}
          <Link
            href="/"
            className="hidden lg:inline-flex bg-black text-white text-[13px] font-semibold px-5 py-3 rounded-full hover:bg-gray-800 transition-colors"
          >
            New Mining
          </Link>

          {/* Mobile / Tablet Menu Button */}
          <button
            onClick={() => dispatch(toggleMobileMenu())}
            className="lg:hidden p-2 text-black"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  d="M6 6l12 12M18 6L6 18"
                />
              </svg>
            ) : (
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  d="M4 7h16M4 12h16M4 17h16"
                />
              </svg>
            )}
          </button>

        </div>

        {/* Mobile / Tablet Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-5 space-y-1">

            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => dispatch(closeNavbar())}
                className="block py-3 text-sm font-medium text-gray-900 hover:text-gray-500"
              >
                {link.name}
              </Link>
            ))}

            {/* New Mining Button - Mobile */}
            <div className="pt-4">
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
