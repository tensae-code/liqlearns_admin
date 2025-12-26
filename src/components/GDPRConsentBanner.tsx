import React, { useState, useEffect } from 'react';
import { X, Cookie, Shield } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const GDPRConsentBanner: React.FC = () => {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always required
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    checkConsentStatus();
  }, [user]);

  const checkConsentStatus = async () => {
    // Check localStorage for anonymous users
    const localConsent = localStorage.getItem('gdpr_consent');
    if (localConsent) {
      setShowBanner(false);
      return;
    }

    // Check database for logged-in users
    if (user?.id) {
      try {
        const { data, error } = await supabase
          .from('user_consents')
          .select('consent_type, consent_given')
          .eq('user_id', user.id)
          .eq('consent_type', 'cookies');

        if (error) throw error;

        if (data && data.length > 0) {
          setShowBanner(false);
          return;
        }
      } catch (error) {
        console.error('Error checking consent:', error);
      }
    }

    // Show banner if no consent found
    setShowBanner(true);
  };

  const saveConsent = async (acceptAll: boolean) => {
    const consentData = {
      essential: true,
      analytics: acceptAll ? true : preferences.analytics,
      marketing: acceptAll ? true : preferences.marketing,
      timestamp: new Date().toISOString(),
    };

    // Save to localStorage for anonymous users
    localStorage.setItem('gdpr_consent', JSON.stringify(consentData));

    // Save to database for logged-in users
    if (user?.id) {
      try {
        // Create a properly formatted insert object
        const insertData = {
          user_id: user.id,
          consent_type: 'cookies',
          consent_given: true,
          consent_date: new Date().toISOString(),
          ip_address: 'client', // Would need server-side for real IP
        };

        // Insert as an array to ensure proper handling
        const { data, error } = await supabase
          .from('user_consents')
          .insert([insertData])
          .select();

        if (error) {
          console.error('Supabase insert error:', error);
          throw error;
        }

        console.log('Consent saved successfully:', data);
      } catch (error) {
        console.error('Error saving consent:', error);
        // Don't block the UI if database save fails - localStorage is already saved
      }
    }

    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () => {
    saveConsent(true);
  };

  const handleAcceptSelected = () => {
    saveConsent(false);
  };

  const handleReject = () => {
    setPreferences({ essential: true, analytics: false, marketing: false });
    saveConsent(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Main Banner */}
      {!showPreferences && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-orange-500 shadow-2xl p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start space-x-4 flex-1">
                <Cookie className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Cookie & Privacy Consent</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    We use cookies and similar technologies to enhance your experience, analyze site traffic, 
                    and collect email information for our services. By accepting, you consent to our data 
                    processing practices as described in our Privacy Policy.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleAcceptAll}
                      className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
                    >
                      Accept All
                    </button>
                    <button
                      onClick={() => setShowPreferences(true)}
                      className="px-6 py-2 border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-all duration-300 font-medium"
                    >
                      Manage Preferences
                    </button>
                    <button
                      onClick={handleReject}
                      className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
                    >
                      Reject Non-Essential
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={handleReject}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close banner"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="w-6 h-6 text-orange-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Privacy Preferences</h2>
                </div>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Essential Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">Essential Cookies</h3>
                  <p className="text-sm text-gray-600">
                    Required for the website to function properly. Cannot be disabled.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked
                  disabled
                  className="mt-1 w-5 h-5 text-orange-500"
                />
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">Analytics Cookies</h3>
                  <p className="text-sm text-gray-600">
                    Help us understand how visitors interact with our website to improve user experience.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="mt-1 w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">Marketing Cookies</h3>
                  <p className="text-sm text-gray-600">
                    Used to track visitors across websites to display relevant advertisements.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                  className="mt-1 w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Your Rights:</strong> You have the right to access, rectify, or delete your personal data. 
                  You can change your preferences at any time through your account settings or by contacting us at 
                  <a href="mailto:privacy@liqlearns.com" className="text-orange-500 hover:underline ml-1">
                    privacy@liqlearns.com
                  </a>
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowPreferences(false)}
                className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptSelected}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GDPRConsentBanner;