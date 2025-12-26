import React, { useState, useEffect } from 'react';
import { Shield, Cookie, Download, Trash2, Eye, Check, X, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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

const GDPRPrivacySection: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [consentSettings, setConsentSettings] = useState<ConsentSettings>({
    essential: true,
    analytics: false,
    marketing: false,
    functional: false
  });
  const [dataExportLoading, setDataExportLoading] = useState(false);
  const [deleteRequestLoading, setDeleteRequestLoading] = useState(false);
  const [consentSaved, setConsentSaved] = useState(false);

  useEffect(() => {
    loadConsentSettings();
  }, [user?.id]);

  const loadConsentSettings = async () => {
    if (!user?.id) return;

    try {
      const { data } = await supabase
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

      alert('✅ Account deletion request submitted. Your account will be deleted in 30 days unless you cancel the request.');
    } catch (err: any) {
      console.error('Error requesting deletion:', err);
      alert('Failed to submit deletion request: ' + err.message);
    } finally {
      setDeleteRequestLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    <div className="space-y-4">
      {[
        { key: 'analytics', label: 'Analytics Cookies', description: 'Help us improve your experience' },
        { key: 'marketing', label: 'Marketing Cookies', description: 'Personalized advertisements' },
        { key: 'functional', label: 'Functional Cookies', description: 'Enhanced features' }
      ].map((setting) => (
        <div key={setting.key} className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {consentSettings[setting.key as keyof ConsentSettings] ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <X className="w-5 h-5 text-gray-400" />
              )}
              <span className="font-medium text-gray-900">{setting.label}</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={consentSettings[setting.key as keyof ConsentSettings]}
                onChange={(e) => setConsentSettings({...consentSettings, [setting.key]: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
          <p className="text-sm text-gray-600">{setting.description}</p>
        </div>
      ))}

      <button
        onClick={() => saveConsentSettings(consentSettings)}
        className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
      >
        Save Cookie Preferences
      </button>

      {consentSaved && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Preferences saved successfully!</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-500" />
          GDPR & Privacy Center
        </h3>
        <p className="text-gray-600">Manage your data privacy and cookie preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview', icon: Eye },
          { id: 'cookies', label: 'Cookies', icon: Cookie },
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

      {/* Content */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'cookies' && renderCookieSettings()}
        {activeTab === 'rights' && (
          <div className="space-y-4">
            {[
              { title: 'Right to Access', description: 'Request a copy of your personal data', color: 'blue' },
              { title: 'Right to Rectification', description: 'Correct inaccurate personal data', color: 'green' },
              { title: 'Right to Erasure', description: 'Request deletion of your personal data', color: 'red' },
              { title: 'Right to Data Portability', description: 'Get your data in machine-readable format', color: 'purple' }
            ].map((right) => (
              <div key={right.title} className={`p-4 border-l-4 border-${right.color}-500 bg-${right.color}-50`}>
                <h4 className="font-bold mb-2">{right.title}</h4>
                <p className="text-sm">{right.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GDPRPrivacySection;