import "./globals.css";
import StoreProvider from "./StoreProvider";
import Navbar from "@/components/Navbar";

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
    <html lang="en">
      <body>
        <StoreProvider>
          <Navbar />

          {children}

        </StoreProvider>
      </body>
    </html>
  );
}