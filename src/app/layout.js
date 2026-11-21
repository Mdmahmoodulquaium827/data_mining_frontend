import "./globals.css";
import StoreProvider from "./StoreProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
export const metadata = {
  title: "DATA MINING",
  description: "Online shopping platform",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-white">
      <body className="bg-white text-slate-900 min-h-screen">
        <StoreProvider>
          {/*<Navbar />*/}

          {children}
          {/*<Footer />} */}
        </StoreProvider>
      </body>
    </html>
  );
}