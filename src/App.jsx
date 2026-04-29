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
import ProfilePage from "./pages/ProfilePage";
import ServiceCategoryPage from "./pages/ServiceCategoryPage";
import ServiceProviderDetailPage from "./pages/ServiceProviderDetailPage";
import ServiceProvidersPage from "./pages/ServiceProvidersPage";
import Footer from "./components/Footer";
import SocialSidebar from "./components/SocialLinks";
import LoginForm from "./components/auth/forms/login/LoginForm";
import SignupForm from "./components/auth/forms/signup-individual/SignupForm";
import ForgotPasswordForm from "./components/auth/forms/forget-password/ForgotPasswordForm";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";
import { useLockAuthHistory } from "./hooks/auth/useLockAuthHistory";

export default function App() {
  const location = useLocation();
  useLockAuthHistory();

  const isAuthPage = ["/login", "/signup", "/forget-password"].includes(
    location.pathname
  );

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
            <Route path="/forget-password" element={<ForgotPasswordForm />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route
              path="/services/:categorySlug"
              element={<ServiceCategoryPage />}
            />
            <Route
              path="/services/:categorySlug/:serviceSlug/providers"
              element={<ServiceProvidersPage />}
            />
            <Route
              path="/services/:categorySlug/:serviceSlug/providers/:providerSlug"
              element={<ServiceProviderDetailPage />}
            />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/store" element={<StorePage />} />
            <Route path="/contact" element={<ContactUsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/profile/*" element={<ProfilePage />} />
          </Route>
        </Routes>

        {!isAuthPage && <Footer />}
      </main>
    </>
  );
}
