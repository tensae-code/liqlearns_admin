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
import InfoPage from './pages/info-page';
import ContentManagementHub from './pages/content-management-hub';
import FinancialDashboard from './pages/financial-dashboard';
import StoreManagementSystem from './pages/store-management-system';
import EventCalendarManager from './pages/event-calendar-manager';
import UserManagementDashboard from './pages/user-management-dashboard';
import ProgressAnalyticsPanel from './pages/progress-analytics-panel';


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
        <Route path="/content-management-hub" element={<ContentManagementHub />} />
        <Route path="/financial-dashboard" element={<FinancialDashboard />} />
        <Route path="/store-management-system" element={<StoreManagementSystem />} />
        <Route path="/event-calendar-manager" element={<EventCalendarManager />} />
        <Route path="/user-management-dashboard" element={<UserManagementDashboard />} />
        <Route path="/progress-analytics-panel" element={<ProgressAnalyticsPanel />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
                <Route
          path="/courses"
          element={
            <InfoPage
              title="Courses"
              description="Explore learning paths, skill tracks, and guided content built for every learner."
            />
          }
        />
        <Route
          path="/community"
          element={
            <InfoPage
              title="Community"
              description="Connect with learners, share progress, and collaborate in study groups."
            />
          }
        />
        <Route
          path="/marketplace"
          element={
            <InfoPage
              title="Marketplace"
              description="Discover tools, resources, and products curated for your learning journey."
            />
          }
        />
        <Route
          path="/business-hub"
          element={
            <InfoPage
              title="Business Hub"
              description="Partner with LiqLearns to reach learners, manage content, and grow your impact."
            />
          }
        />
        <Route
          path="/help-center"
          element={
            <InfoPage
              title="Help Center"
              description="Find answers to common questions and get guidance on using the platform."
            />
          }
        />
        <Route
          path="/contact-us"
          element={
            <InfoPage
              title="Contact Us"
              description="Reach our team for support, partnerships, or general inquiries."
            />
          }
        />
        <Route
          path="/documentation"
          element={
            <InfoPage
              title="Documentation"
              description="Review platform guides, product updates, and implementation resources."
            />
          }
        />
        <Route
          path="/faq"
          element={
            <InfoPage
              title="FAQ"
              description="Browse frequently asked questions about LiqLearns and its services."
            />
          }
        />
        <Route
          path="/privacy"
          element={
            <InfoPage
              title="Privacy Policy"
              description="Learn how we protect your data and respect your privacy."
            />
          }
        />
        <Route
          path="/terms"
          element={
            <InfoPage
              title="Terms of Service"
              description="Review the terms that govern usage of LiqLearns."
            />
          }
        />
        <Route
          path="/cookies"
          element={
            <InfoPage
              title="Cookie Preferences"
              description="Manage how cookies are used to personalize your experience."
            />
          }
        />
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