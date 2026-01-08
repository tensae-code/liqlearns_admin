import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import LoginPage from './pages/login';
import { useGoogleAnalytics } from './hooks/useGoogleAnalytics';

import LandingPage from './pages/landing-page';
import LoadingScreen from './pages/loading-screen';
import RoleBasedDashboardHub from './pages/role-based-dashboard-hub';
import ResetPasswordPage from './pages/reset-password';
import CheckoutPage from './pages/checkout';
import CheckoutSuccessPage from './pages/checkout/success';
import SearchPage from './pages/search-results-discovery-hub';


const RoutesContent: React.FC = () => {
  useGoogleAnalytics();

  return (
    <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing-page" element={<LandingPage />} />
        <Route path="/loading-screen" element={<LoadingScreen />} />
        <Route path="/role-based-dashboard-hub" element={<RoleBasedDashboardHub />} />
        <Route path="/search-results-discovery-hub" element={<SearchPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
    </ErrorBoundary>
  );
};

const Routes: React.FC = () => {
  return (
    <BrowserRouter>
      <RoutesContent />
    </BrowserRouter>
  );
};

export default Routes;