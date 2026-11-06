"use client";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";

import {
  toggleMobileMenu,
  toggleCompanyDropdown,
  closeNavbar,
} from "@/redux/navbarSlice";

export default function Navbar() {
  const dispatch = useDispatch();

  const {
    isMobileMenuOpen,
    isCompanyDropdownOpen,
  } = useSelector((state) => state.navbar);

  const navLinks = [
    { name: "Products", href: "/products" },
    { name: "Investor Relations", href: "/investor-relations" },
    { name: "Market place", href: "/market-place" },
    { name: "SPV", href: "/spv" },
  ];

  return (
    <nav className="w-full bg-[#fafafa] border-b border-gray-100">
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-16">

        {/* Main Navbar */}
        <div className="h-[72px] flex items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            onClick={() => dispatch(closeNavbar())}
            className="flex items-center shrink-0"
          >
            <span className="text-[29px] font-extrabold tracking-tight text-black">
              DATA
            </span>

            <span className="bg-black text-white text-[22px] font-bold px-1.5 py-0.5 ml-0.5">
              MINING
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-7 ml-8">

            {navLinks.slice(0, 2).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[13px] font-medium text-gray-900 hover:text-gray-500 transition-colors"
              >
                {link.name}
              </Link>
            ))}

            {/* Company Dropdown */}
            <div className="relative">

              <button
                onClick={() =>
                  dispatch(toggleCompanyDropdown())
                }
                className="flex items-center gap-1 text-[13px] font-medium text-gray-900 hover:text-gray-500"
                aria-expanded={isCompanyDropdownOpen}
              >
                Company

                <svg
                  className={`w-3 h-3 transition-transform ${
                    isCompanyDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m6 9 6 6 6-6"
                  />
                </svg>
              </button>

              {isCompanyDropdownOpen && (
                <div className="absolute top-9 left-0 w-48 bg-white shadow-lg border border-gray-100 rounded-lg py-2 z-50">

                  {[
                    ["About Us", "/about"],
                    ["Our Team", "/team"],
                    ["Contact", "/contact"],
                  ].map(([name, href]) => (
                    <Link
                      key={name}
                      href={href}
                      onClick={() => dispatch(closeNavbar())}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {name}
                    </Link>
                  ))}

                </div>
              )}
            </div>

            {navLinks.slice(2).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[13px] font-medium text-gray-900 hover:text-gray-500 transition-colors"
              >
                {link.name}
              </Link>
            ))}

          </div>

          {/* Get Started Button - Desktop */}
          <Link
            href="/get-started"
            className="hidden lg:inline-flex bg-black text-white text-[13px] font-semibold px-5 py-3 rounded-full hover:bg-gray-800 transition-colors"
          >
            Get started
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

            {navLinks.slice(0, 2).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => dispatch(closeNavbar())}
                className="block py-3 text-sm font-medium text-gray-900 hover:text-gray-500"
              >
                {link.name}
              </Link>
            ))}

            {/* Mobile Company Dropdown */}
            <div>
              <button
                onClick={() =>
                  dispatch(toggleCompanyDropdown())
                }
                className="w-full flex items-center justify-between py-3 text-sm font-medium text-gray-900"
                aria-expanded={isCompanyDropdownOpen}
              >
                Company

                <svg
                  className={`w-4 h-4 transition-transform ${
                    isCompanyDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m6 9 6 6 6-6"
                  />
                </svg>
              </button>

              {isCompanyDropdownOpen && (
                <div className="pl-4 border-l-2 border-gray-200 ml-1">

                  {[
                    ["About Us", "/about"],
                    ["Our Team", "/team"],
                    ["Contact", "/contact"],
                  ].map(([name, href]) => (
                    <Link
                      key={name}
                      href={href}
                      onClick={() => dispatch(closeNavbar())}
                      className="block py-2.5 text-sm text-gray-600 hover:text-black"
                    >
                      {name}
                    </Link>
                  ))}

                </div>
              )}
            </div>

            {navLinks.slice(2).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => dispatch(closeNavbar())}
                className="block py-3 text-sm font-medium text-gray-900 hover:text-gray-500"
              >
                {link.name}
              </Link>
            ))}

            {/* Get Started Button */}
            <div className="pt-4">
              <Link
                href="/get-started"
                onClick={() => dispatch(closeNavbar())}
                className="inline-flex bg-black text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-gray-800 transition-colors"
              >
                Get started
              </Link>
            </div>

          </div>
        )}

      </div>
    </nav>
  );
}