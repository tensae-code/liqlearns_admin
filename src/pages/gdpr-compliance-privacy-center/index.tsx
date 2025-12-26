import React, { useState, useEffect } from 'react';
import { Shield, Cookie, Download, Trash2, Eye, Check, X, FileText, Lock, Globe, Settings, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface ConsentSettings {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

interface UserDataExport {
  profile: any;
  activities: any[];
  enrollments: any[];
  preferences: any;
}

export default function GDPRCompliancePrivacyCenter() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showConsentBanner, setShowConsentBanner] = useState(false);
  const [consentSettings, setConsentSettings] = useState<ConsentSettings>({
    essential: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
    functional: false
  });
  const [dataExportLoading, setDataExportLoading] = useState(false);
  const [deleteRequestLoading, setDeleteRequestLoading] = useState(false);
  const [consentSaved, setConsentSaved] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showProgress: true,
    allowMessages: true
  });

  useEffect(() => {
    loadConsentSettings();
    checkConsentBanner();
  }, [user?.id]);

  const loadConsentSettings = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_consent_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setConsentSettings({
          essential: true,
          analytics: data.analytics_consent || false,
          marketing: data.marketing_consent || false,
          functional: data.functional_consent || false
        });
      }
    } catch (err) {
      console.error('Error loading consent settings:', err);
    }
  };

  const checkConsentBanner = () => {
    const consent = localStorage.getItem('gdpr_consent');
    if (!consent) {
      setShowConsentBanner(true);
    }
  };

  const handleAcceptAll = async () => {
    const allConsent = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    
    await saveConsentSettings(allConsent);
    setShowConsentBanner(false);
  };

  const handleRejectAll = async () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    
    await saveConsentSettings(essentialOnly);
    setShowConsentBanner(false);
  };

  const saveConsentSettings = async (settings: ConsentSettings) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_consent_settings')
        .upsert({
          user_id: user.id,
          essential_consent: true,
          analytics_consent: settings.analytics,
          marketing_consent: settings.marketing,
          functional_consent: settings.functional,
          consent_date: new Date().toISOString()
        });

      if (error) throw error;

      localStorage.setItem('gdpr_consent', JSON.stringify(settings));
      setConsentSettings(settings);
      setConsentSaved(true);
      
      setTimeout(() => setConsentSaved(false), 3000);
    } catch (err: any) {
      console.error('Error saving consent:', err);
      alert('Failed to save consent settings: ' + err.message);
    }
  };

  const handleDataExport = async () => {
    if (!user?.id) return;

    setDataExportLoading(true);
    try {
      // Fetch all user data
      const [profile, activities, enrollments] = await Promise.all([
        supabase.from('student_profiles').select('*').eq('id', user.id).single(),
        supabase.from('user_activity_logs').select('*').eq('user_id', user.id),
        supabase.from('course_enrollments').select('*').eq('student_id', user.id)
      ]);

      const exportData: UserDataExport = {
        profile: profile.data,
        activities: activities.data || [],
        enrollments: enrollments.data || [],
        preferences: consentSettings
      };

      // Create downloadable JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `liqlearns-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('✅ Your data has been exported successfully!');
    } catch (err: any) {
      console.error('Error exporting data:', err);
      alert('Failed to export data: ' + err.message);
    } finally {
      setDataExportLoading(false);
    }
  };

  const handleDeleteRequest = async () => {
    const confirmed = window.confirm(
      'Are you absolutely sure you want to request account deletion? This action cannot be undone and all your data will be permanently deleted within 30 days.'
    );
    
    if (!confirmed) return;

    setDeleteRequestLoading(true);
    try {
      const { error } = await supabase
        .from('account_deletion_requests')
        .insert({
          user_id: user?.id,
          request_date: new Date().toISOString(),
          status: 'pending',
          deletion_scheduled_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      alert('✅ Account deletion request submitted. You will receive a confirmation email. Your account will be deleted in 30 days unless you cancel the request.');
    } catch (err: any) {
      console.error('Error requesting deletion:', err);
      alert('Failed to submit deletion request: ' + err.message);
    } finally {
      setDeleteRequestLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Privacy Status */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-green-600" />
          <div>
            <h3 className="text-xl font-bold text-gray-900">Privacy Protected</h3>
            <p className="text-sm text-green-700">Your data is secure and compliant with GDPR</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">Encrypted</span>
            </div>
            <p className="text-sm text-gray-600">All data encrypted at rest and in transit</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">EU Compliant</span>
            </div>
            <p className="text-sm text-gray-600">Full GDPR compliance guaranteed</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900">Your Control</span>
            </div>
            <p className="text-sm text-gray-600">You control your data and privacy</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={handleDataExport}
          disabled={dataExportLoading}
          className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all text-left disabled:opacity-50"
        >
          <Download className="w-8 h-8 text-blue-600 mb-3" />
          <h4 className="font-bold text-gray-900 mb-2">Export Your Data</h4>
          <p className="text-sm text-gray-600">Download a complete copy of all your data in JSON format</p>
        </button>

        <button
          onClick={handleDeleteRequest}
          disabled={deleteRequestLoading}
          className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-red-500 hover:shadow-lg transition-all text-left disabled:opacity-50"
        >
          <Trash2 className="w-8 h-8 text-red-600 mb-3" />
          <h4 className="font-bold text-gray-900 mb-2">Delete Account</h4>
          <p className="text-sm text-gray-600">Request permanent deletion of your account and data</p>
        </button>
      </div>
    </div>
  );

  const renderCookieSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Cookie className="w-6 h-6 text-orange-500" />
          Cookie Preferences
        </h3>
        
        <div className="space-y-4">
          {/* Essential Cookies */}
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">Essential Cookies</span>
              </div>
              <span className="text-sm text-gray-500">Always Active</span>
            </div>
            <p className="text-sm text-gray-600">Required for the website to function properly. Cannot be disabled.</p>
          </div>

          {/* Analytics Cookies */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {consentSettings.analytics ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <X className="w-5 h-5 text-gray-400" />
                )}
                <span className="font-medium text-gray-900">Analytics Cookies</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentSettings.analytics}
                  onChange={(e) => setConsentSettings({...consentSettings, analytics: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
            <p className="text-sm text-gray-600">Help us understand how you use the site to improve your experience.</p>
          </div>

          {/* Marketing Cookies */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {consentSettings.marketing ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <X className="w-5 h-5 text-gray-400" />
                )}
                <span className="font-medium text-gray-900">Marketing Cookies</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentSettings.marketing}
                  onChange={(e) => setConsentSettings({...consentSettings, marketing: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
            <p className="text-sm text-gray-600">Used to deliver personalized advertisements and content.</p>
          </div>

          {/* Functional Cookies */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {consentSettings.functional ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <X className="w-5 h-5 text-gray-400" />
                )}
                <span className="font-medium text-gray-900">Functional Cookies</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentSettings.functional}
                  onChange={(e) => setConsentSettings({...consentSettings, functional: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
            <p className="text-sm text-gray-600">Enable enhanced features and personalization.</p>
          </div>
        </div>

        <button
          onClick={() => saveConsentSettings(consentSettings)}
          className="mt-6 w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
        >
          Save Cookie Preferences
        </button>

        {consentSaved && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Preferences saved successfully!</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Privacy Controls</h3>
        
        <div className="space-y-4">
          {/* Profile Visibility */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Visibility
            </label>
            <select
              value={privacySettings.profileVisibility}
              onChange={(e) => setPrivacySettings({...privacySettings, profileVisibility: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
            >
              <option value="public">Public - Everyone can see</option>
              <option value="students">Students Only</option>
              <option value="teachers">Teachers Only</option>
              <option value="private">Private - Only me</option>
            </select>
          </div>

          {/* Show Email */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Show Email Address</p>
              <p className="text-sm text-gray-600">Allow others to see your email</p>
            </div>
            <input
              type="checkbox"
              checked={privacySettings.showEmail}
              onChange={(e) => setPrivacySettings({...privacySettings, showEmail: e.target.checked})}
              className="w-5 h-5 text-orange-500 rounded"
            />
          </div>

          {/* Show Progress */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Show Learning Progress</p>
              <p className="text-sm text-gray-600">Display your progress on leaderboards</p>
            </div>
            <input
              type="checkbox"
              checked={privacySettings.showProgress}
              onChange={(e) => setPrivacySettings({...privacySettings, showProgress: e.target.checked})}
              className="w-5 h-5 text-orange-500 rounded"
            />
          </div>

          {/* Allow Messages */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Allow Direct Messages</p>
              <p className="text-sm text-gray-600">Let other students send you messages</p>
            </div>
            <input
              type="checkbox"
              checked={privacySettings.allowMessages}
              onChange={(e) => setPrivacySettings({...privacySettings, allowMessages: e.target.checked})}
              className="w-5 h-5 text-orange-500 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white p-6">
      {/* GDPR Consent Banner */}
      {showConsentBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-orange-500 shadow-2xl z-50 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-start gap-4">
              <Cookie className="w-8 h-8 text-orange-500 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  We Value Your Privacy
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  We use cookies and similar technologies to enhance your experience, analyze site traffic, and personalize content. 
                  By clicking "Accept All", you consent to our use of cookies. You can customize your preferences or learn more in our Privacy Policy.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleAcceptAll}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={() => {
                      setShowConsentBanner(false);
                      setActiveTab('cookies');
                    }}
                    className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Manage Preferences
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowConsentBanner(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-10 h-10 text-orange-500" />
          <h1 className="text-3xl font-bold text-gray-900">GDPR Compliance & Privacy Center</h1>
        </div>
        <p className="text-gray-600">
          Manage your data, privacy, and cookie preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-wrap gap-2 border-b border-gray-200">
          {[
            { id: 'overview', label: 'Overview', icon: Shield },
            { id: 'cookies', label: 'Cookie Settings', icon: Cookie },
            { id: 'privacy', label: 'Privacy Controls', icon: Eye },
            { id: 'rights', label: 'Your Rights', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600' :'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'cookies' && renderCookieSettings()}
        {activeTab === 'privacy' && renderPrivacySettings()}
        {activeTab === 'rights' && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your GDPR Rights</h3>
            <div className="space-y-4 text-gray-700">
              <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                <h4 className="font-bold mb-2">Right to Access</h4>
                <p className="text-sm">You have the right to request a copy of your personal data.</p>
              </div>
              <div className="p-4 border-l-4 border-green-500 bg-green-50">
                <h4 className="font-bold mb-2">Right to Rectification</h4>
                <p className="text-sm">You can request correction of inaccurate personal data.</p>
              </div>
              <div className="p-4 border-l-4 border-red-500 bg-red-50">
                <h4 className="font-bold mb-2">Right to Erasure</h4>
                <p className="text-sm">You can request deletion of your personal data under certain conditions.</p>
              </div>
              <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
                <h4 className="font-bold mb-2">Right to Data Portability</h4>
                <p className="text-sm">You can request your data in a machine-readable format.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}