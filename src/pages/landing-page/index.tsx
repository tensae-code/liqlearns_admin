import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Facebook, Instagram, Youtube, Target, Headphones, Monitor } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import BadgeCheckModal from './components/BadgeCheckModal';

// Components
import HeroSection from './components/HeroSection';
import FeatureCards from './components/FeatureCards';
import StatisticsSection from './components/StatisticsSection';
import CTASection from './components/CTASection';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading } = useAuth();
  
  // CRITICAL FIX: Clear any automatic redirect behavior on landing page
  // This ensures users can stay on landing page after logout without being redirected
  useEffect(() => {
    // Don't auto-redirect to dashboard even if user session exists
    // User must explicitly click login/dashboard button
    console.log('Landing page loaded, user session:', user ? 'exists' : 'none');
  }, [user]);

  // VISIBILITY FIX: Remove delayed visibility animation that causes initial fading
  const [demoVideoUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/loading-screen');
  };

  const handleCheckBadges = () => {
    setIsBadgeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white">
      {/* Navigation Header - Glassy see-through effect */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo with Learn Play Thrive - Darker styling */}
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">LiqLearns</h1>
                <p className="text-xs text-orange-600 font-medium">Learn · Play · Thrive</p>
              </div>
            </div>

            {/* Navigation Buttons - Darker styling */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogin}
                className="px-7 py-2.5 border border-orange-500 text-orange-700 rounded-full hover:bg-orange-50 transition-all duration-300 font-medium shadow-sm hover:shadow-md"
              >
                Login
              </button>
              <button
                onClick={handleCheckBadges}
                className="px-7 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
              >
                Check Badges
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        <HeroSection onGetStarted={handleCheckBadges} demoVideoUrl={demoVideoUrl} />
        <FeatureCards />
        <StatisticsSection />
        <CTASection onGetStarted={handleCheckBadges} />
      </main>

      {/* Badge Check Modal */}
      <BadgeCheckModal 
        isOpen={isBadgeModalOpen} 
        onClose={() => setIsBadgeModalOpen(false)} 
      />

      {/* Footer with 4 Social Media Icons */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">LiqLearns</span>
              </div>
              <p className="text-gray-400 text-sm">
                Empowering Ethiopian language learning through innovative education and community building.
              </p>
              {/* 4 Social Media Icons */}
              <div className="flex space-x-4">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-orange-700 transition-colors duration-300 cursor-pointer group"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-orange-700 transition-colors duration-300 cursor-pointer group"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
                <a 
                  href="https://tiktok.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-orange-700 transition-colors duration-300 cursor-pointer group"
                  aria-label="TikTok"
                >
                  <FaTiktok className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-orange-700 transition-colors duration-300 cursor-pointer group"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center">
                <Target className="w-4 h-4 mr-2 text-orange-600" />
                Platform
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link className="hover:text-orange-500 transition-colors" to="/courses">
                    Courses
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-orange-500 transition-colors" to="/community">
                    Community
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-orange-500 transition-colors" to="/marketplace">
                    Marketplace
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-orange-500 transition-colors" to="/business-hub">
                    Business Hub
                  </Link>
                </li>
               </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center">
                <Headphones className="w-4 h-4 mr-2 text-orange-600" />
                Support
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link className="hover:text-orange-500 transition-colors" to="/help-center">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-orange-500 transition-colors" to="/contact-us">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-orange-500 transition-colors" to="/documentation">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-orange-500 transition-colors" to="/faq">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center">
                <Monitor className="w-4 h-4 mr-2 text-orange-600" />
                Connect
              </h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>hello@liqlearns.com</p>
                <p>+251 911 123 456</p>
                <p>Addis Ababa, Ethiopia</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2026 LiqLearns LLC. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link className="text-gray-400 text-sm hover:text-orange-500 transition-colors" to="/privacy">
                Privacy
              </Link>
              <Link className="text-gray-400 text-sm hover:text-orange-500 transition-colors" to="/terms">
                Terms
              </Link>
              <Link className="text-gray-400 text-sm hover:text-orange-500 transition-colors" to="/cookies">
                Cookies
              </Link>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;