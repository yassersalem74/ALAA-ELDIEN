import "./App.css";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicePage";
import MarketplacePage from "./pages/MarketplacePage";
import StorePage from "./pages/StorePage";
import ContactUsPage from "./pages/ContactUsPage";
import AboutPage from "./pages/AboutUsPage";
import OverviewPage from "./pages/OverviewPage";
import Footer from "./components/Footer";

export default function App() {
  return (
    <>
  
      <Navbar />

      <main role="main" className="min-h-screen bg-[#ffffff]">
        <ScrollToTop />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/overview" element={<OverviewPage />} />
        </Routes>

        <Footer></Footer>
      </main>
    </>
  );
}

