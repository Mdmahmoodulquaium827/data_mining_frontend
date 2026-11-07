export default function Footer() {
  return (
    <footer className="w-full bg-[#fafafa] border-t border-gray-200">

      <div className="max-w-7xl mx-auto px-5 py-10">

        {/* Logo */}
        <div className="flex justify-center items-center">
          <div className="flex items-center">

            <span className="text-4xl font-extrabold tracking-tight text-black">
              DATA
            </span>

            <span className="bg-black text-white text-3xl font-bold px-2 py-1 ml-1">
              MINING
            </span>

          </div>
        </div>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-center text-sm sm:text-base text-gray-600 leading-7 mt-5">
          We collect and analyze product information from various
          online sources using web scraping technology, bringing
          product details together in one convenient platform for
          easy browsing and comparison.
        </p>

        {/* Copyright */}
        <div className="border-t border-gray-200 mt-8 pt-5 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Data Mining. All rights reserved.
          </p>
        </div>

      </div>

    </footer>
  );
}