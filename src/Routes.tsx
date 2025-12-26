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
import EmployeeApplicationForm from './pages/employee-application-form';
import ResetPasswordPage from './pages/reset-password';
import SettingsProfileManagement from './pages/settings-profile-management';
import MarketplaceHub from './pages/marketplace-hub';

const RoutesContent: React.FC = () => {
  // Initialize Google Analytics tracking
  useGoogleAnalytics();

  return (
    <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your routes here */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing-page" element={<LandingPage />} />
        <Route path="/loading-screen" element={<LoadingScreen />} />
        <Route path="/role-based-dashboard-hub" element={<RoleBasedDashboardHub />} />
        <Route path="/marketplace-hub" element={<MarketplaceHub />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/settings-profile-management" element={<SettingsProfileManagement />} />
        <Route path="/employee-application-form" element={<EmployeeApplicationForm />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
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