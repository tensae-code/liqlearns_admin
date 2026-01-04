import React, { useState, useEffect } from 'react';
import { User, Camera, Lock, Bell, Shield, Mail, Phone, MapPin, Calendar, Languages, Save, Globe, Target } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import GDPRPrivacySection from '../../components/GDPRPrivacySection';
import Button from '../../components/ui/Button';

interface SettingsProfileManagementProps {
  userRole?: string;
}

const SettingsProfileManagement: React.FC<SettingsProfileManagementProps> = ({ userRole }) => {
  const { user, userProfile, updateProfile } = useAuth();
  
  const [profileFormData, setProfileFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    dateOfBirth: '',
    learningGoals: ''
  });

  const [profileSettings, setProfileSettings] = useState({
    primaryLanguage: 'amharic',
    interfaceLanguage: 'english',
    emailNotifications: true,
    pushNotifications: true,
    progressSharing: true,
    profileVisibility: 'public',
    twoFactorEnabled: false
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeSection, setActiveSection] = useState('profile');

  useEffect(() => {
    if (userProfile) {
      setProfileFormData({
        fullName: userProfile.full_name || '',
        username: userProfile.email.split('@')[0] || '',
        email: userProfile.email || '',
        phone: userProfile.phone_number || '',
        bio: '',
        location: '',
        dateOfBirth: '',
        learningGoals: ''
      });
    }
  }, [userProfile]);

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSettingToggle = (setting: string) => {
    setProfileSettings(prev => ({ ...prev, [setting]: !prev[setting as keyof typeof prev] }));
  };

  const handleProfileSettingChange = (setting: string, value: string) => {
    setProfileSettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setProfileLoading(true);
      setProfileMessage(null);

      await updateProfile({
        full_name: profileFormData.fullName,
        phone_number: profileFormData.phone
      });

      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setProfileMessage(null), 3000);
    } catch (error: any) {
      setProfileMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfilePictureChange = () => {
    setProfileMessage({ type: 'success', text: 'Profile picture upload coming soon!' });
    setTimeout(() => setProfileMessage(null), 3000);
  };

  // Determine if Learning Goals should be shown (only for students)
  const showLearningGoals = userRole?.toLowerCase() === 'student' || userRole?.toLowerCase() === 'learner';

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-orange-600" />
          <h2 className="text-xl font-bold text-gray-900">Profile & Settings Management</h2>
        </div>
      </div>

      {/* Profile Message Display */}
      {profileMessage && (
        <div className={`mb-6 p-4 rounded-lg ${
          profileMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {profileMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <nav className="space-y-2">
              {[
                { icon: User, label: 'Profile Information', id: 'profile' },
                { icon: Lock, label: 'Account Security', id: 'security' },
                { icon: Bell, label: 'Notifications', id: 'notifications' },
                { icon: Languages, label: 'Language & Region', id: 'language' },
                { icon: Shield, label: 'Privacy Settings', id: 'privacy' },
                { icon: Shield, label: 'GDPR & Privacy', id: 'gdpr' },
                ...(showLearningGoals ? [{ icon: Target, label: 'Learning Goals', id: 'goals' }] : [])
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all text-left ${
                    activeSection === item.id
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-white hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Profile Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          {activeSection === 'profile' && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <User className="w-5 h-5 mr-2 text-orange-600" />
                Profile Information
              </h3>

              {/* Profile Picture */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-3 block">Profile Picture</label>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profileFormData.fullName?.charAt(0) || profileFormData.username?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <button
                      onClick={handleProfilePictureChange}
                      className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Change Picture</span>
                    </button>
                    <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max size 2MB</p>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={profileFormData.fullName}
                    onChange={handleProfileInputChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={profileFormData.username}
                    onChange={handleProfileInputChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Choose a username"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={profileFormData.email}
                      disabled
                      className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={profileFormData.phone}
                      onChange={handleProfileInputChange}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="+251 900 000 000"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      value={profileFormData.location}
                      onChange={handleProfileInputChange}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="Addis Ababa, Ethiopia"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={profileFormData.dateOfBirth}
                      onChange={handleProfileInputChange}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Bio</label>
                <textarea
                  name="bio"
                  value={profileFormData.bio}
                  onChange={handleProfileInputChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          )}

          {/* Language Preferences */}
          {activeSection === 'language' && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <Languages className="w-5 h-5 mr-2 text-orange-600" />
                Language & Cultural Preferences
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Primary Learning Language</label>
                  <select
                    value={profileSettings.primaryLanguage}
                    onChange={(e) => handleProfileSettingChange('primaryLanguage', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  >
                    <option value="amharic">Amharic (አማርኛ)</option>
                    <option value="oromo">Oromo (Afaan Oromoo)</option>
                    <option value="tigrinya">Tigrinya (ትግርኛ)</option>
                    <option value="somali">Somali (Af-Soomaali)</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Interface Language</label>
                  <select
                    value={profileSettings.interfaceLanguage}
                    onChange={(e) => handleProfileSettingChange('interfaceLanguage', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  >
                    <option value="english">English</option>
                    <option value="amharic">አማርኛ</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Ethiopian Calendar Integration</p>
                    <p className="text-xs text-blue-700 mt-1">Dates will be displayed in Ethiopian traditional format alongside Gregorian calendar</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeSection === 'notifications' && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-orange-600" />
                Notification Preferences
              </h3>

              <div className="space-y-3">
                {[
                  { id: 'emailNotifications', label: 'Email Notifications', description: 'Receive updates and announcements via email' },
                  { id: 'pushNotifications', label: 'Push Notifications', description: 'Get real-time alerts on your device' },
                  { id: 'progressSharing', label: 'Progress Sharing', description: 'Allow relevant parties to view your progress' }
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                    </div>
                    <button
                      onClick={() => handleProfileSettingToggle(item.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        profileSettings[item.id as keyof typeof profileSettings] ? 'bg-orange-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          profileSettings[item.id as keyof typeof profileSettings] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          {activeSection === 'privacy' && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-orange-600" />
                Privacy & Security
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Profile Visibility</label>
                  <select
                    value={profileSettings.profileVisibility}
                    onChange={(e) => handleProfileSettingChange('profileVisibility', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  >
                    <option value="public">Public - Anyone can view</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private - Only me</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-600 mt-1">Add an extra layer of security to your account</p>
                  </div>
                  <button
                    onClick={() => handleProfileSettingToggle('twoFactorEnabled')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      profileSettings.twoFactorEnabled ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        profileSettings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* GDPR Privacy Section */}
          {activeSection === 'gdpr' && <GDPRPrivacySection />}

          {/* Account Security */}
          {activeSection === 'security' && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-orange-600" />
                Account Security
              </h3>

              <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg transition-colors">
                <Lock className="w-4 h-4" />
                <span>Change Password</span>
              </button>
            </div>
          )}

          {/* Learning Goals (Student Only) */}
          {activeSection === 'goals' && showLearningGoals && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <Target className="w-5 h-5 mr-2 text-orange-600" />
                Learning Goals & Preferences
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Daily Learning Target</label>
                  <select className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all">
                    <option value="15">15 minutes per day</option>
                    <option value="30">30 minutes per day</option>
                    <option value="60">1 hour per day</option>
                    <option value="120">2 hours per day</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Skill Focus Areas</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Reading', 'Writing', 'Speaking', 'Listening'].map((skill) => (
                      <label key={skill} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-orange-500 bg-white border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Learning Goals</label>
                  <textarea
                    name="learningGoals"
                    value={profileFormData.learningGoals}
                    onChange={handleProfileInputChange}
                    rows={3}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                    placeholder="What do you want to achieve with learning?"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Profile Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveProfile}
              disabled={profileLoading}
              loading={profileLoading}
              iconName="Save"
              iconPosition="left"
              variant="default"
              size="default"
              className="px-6 py-3"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsProfileManagement;