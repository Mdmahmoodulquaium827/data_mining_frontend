import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer";
import StoreProvider from "../StoreProvider";

export default function AboutLayout({ children }) {
  return (
      
   
       <div>
         <Navbar />
            <main>{children}</main>
            <Footer />
       </div>
            
     
    )
  }