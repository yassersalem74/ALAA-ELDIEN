import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";

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
import SocialSidebar from "./components/SocialLinks";
import LoginForm from "./components/auth/forms/login/LoginForm";
import SignupForm from "./components/auth/forms/signup-individual/SignupForm";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";
import { useLockAuthHistory } from "./hooks/auth/useLockAuthHistory";

export default function App() {
  const location = useLocation();
  useLockAuthHistory();

  const isAuthPage = ["/login" , "/signup"].includes(location.pathname);

  return (
    <>
      <Navbar />
      <SocialSidebar />

      <main role="main" className="min-h-screen bg-[#ffffff]">
        <ScrollToTop />

        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/store" element={<StorePage />} />
            <Route path="/contact" element={<ContactUsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/overview" element={<OverviewPage />} />
          </Route>
        </Routes>

        {!isAuthPage && <Footer />}
      </main>
    </>
  );
}
