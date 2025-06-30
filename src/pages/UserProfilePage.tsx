import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAutoSave } from '../hooks/useAutoSave';
import FormSection from '../components/profile/FormSection';
import FormField from '../components/profile/FormField';
import ProfileImageUpload from '../components/profile/ProfileImageUpload';
import ToggleSwitch from '../components/profile/ToggleSwitch';
import ConfirmationDialog from '../components/profile/ConfirmationDialog';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Globe, 
  Shield, 
  Bell, 
  Eye, 
  Palette, 
  Type, 
  Monitor,
  Smartphone,
  Key,
  Link as LinkIcon,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  country: string;
  city: string;
  bio: string;
  username: string;
  profileImage?: string;
}

interface AccountSettings {
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  marketingEmails: boolean;
  profileVisibility: 'public' | 'private' | 'friends';
  dataSharing: boolean;
  language: string;
  timezone: string;
}

interface DisplayPreferences {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  colorScheme: 'default' | 'blue' | 'green' | 'purple';
  layout: 'comfortable' | 'compact';
}

interface IntegrationSettings {
  connectedAccounts: {
    facebook: boolean;
    twitter: boolean;
    google: boolean;
    linkedin: boolean;
  };
  apiKeyVisible: boolean;
}

const UserProfilePage: React.FC = () => {
  const { user } = useAuth();
  
  // State management
  const [profile, setProfile] = useState<UserProfile>({
    firstName: user?.user_metadata?.full_name?.split(' ')[0] || '',
    lastName: user?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
    country: '',
    city: '',
    bio: '',
    username: user?.email?.split('@')[0] || '',
    profileImage: user?.user_metadata?.avatar_url
  });

  const [accountSettings, setAccountSettings] = useState<AccountSettings>({
    twoFactorEnabled: false,
    emailNotifications: true,
    marketingEmails: false,
    profileVisibility: 'public',
    dataSharing: false,
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const [displayPreferences, setDisplayPreferences] = useState<DisplayPreferences>({
    theme: 'light',
    fontSize: 'medium',
    colorScheme: 'default',
    layout: 'comfortable'
  });

  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>({
    connectedAccounts: {
      facebook: false,
      twitter: false,
      google: false,
      linkedin: false
    },
    apiKeyVisible: false
  });

  // UI state
  const [activeTab, setActiveTab] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<Record<string, string>>({});
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Auto-save functionality
  useAutoSave({
    data: { profile, accountSettings, displayPreferences, integrationSettings },
    onSave: async (data) => {
      console.log('Auto-saving data:', data);
      // Implement actual save logic here
    },
    delay: 3000,
    enabled: hasChanges
  });

  // Validation
  const validateProfile = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!profile.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!profile.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!profile.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (profile.phone && !/^\+?[\d\s\-\(\)]+$/.test(profile.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (profile.bio.length > 150) {
      newErrors.bio = 'Bio must be 150 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save handlers
  const handleSaveProfile = async () => {
    if (!validateProfile()) return;

    setIsSaving(true);
    try {
      // Implement actual save logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSuccess({ ...success, profile: 'Profile updated successfully!' });
      setHasChanges(false);
      setTimeout(() => setSuccess({}), 3000);
    } catch (error) {
      setErrors({ ...errors, profile: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAccountSettings = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess({ ...success, account: 'Account settings updated successfully!' });
      setHasChanges(false);
      setTimeout(() => setSuccess({}), 3000);
    } catch (error) {
      setErrors({ ...errors, account: 'Failed to update account settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDisplayPreferences = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess({ ...success, display: 'Display preferences updated successfully!' });
      setHasChanges(false);
      setTimeout(() => setSuccess({}), 3000);
    } catch (error) {
      setErrors({ ...errors, display: 'Failed to update display preferences.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Change Password',
      message: 'You will be redirected to the password change form. Continue?',
      onConfirm: () => {
        // Implement password change logic
        console.log('Redirecting to password change...');
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      },
      type: 'info'
    });
  };

  const handleDisconnectAccount = (platform: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Disconnect Account',
      message: `Are you sure you want to disconnect your ${platform} account? This action cannot be undone.`,
      onConfirm: () => {
        setIntegrationSettings({
          ...integrationSettings,
          connectedAccounts: {
            ...integrationSettings.connectedAccounts,
            [platform]: false
          }
        });
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        setHasChanges(true);
      },
      type: 'warning'
    });
  };

  // Track changes
  useEffect(() => {
    setHasChanges(true);
  }, [profile, accountSettings, displayPreferences, integrationSettings]);

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'account', label: 'Account Settings', icon: Shield },
    { id: 'display', label: 'Display', icon: Palette },
    { id: 'integrations', label: 'Integrations', icon: LinkIcon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Home</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center">
                <User className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
                <p className="text-gray-600">Manage your account preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-red-50 text-red-700 border-l-4 border-red-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon size={20} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Personal Information */}
            {activeTab === 'personal' && (
              <div className="space-y-8">
                <FormSection
                  title="Personal Information"
                  description="Update your personal details and profile information"
                  onSave={handleSaveProfile}
                  isSaving={isSaving}
                  hasChanges={hasChanges}
                  error={errors.profile}
                  success={success.profile}
                >
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-1/3">
                      <ProfileImageUpload
                        currentImage={profile.profileImage}
                        onImageChange={(file) => {
                          // Handle image upload
                          console.log('Image selected:', file);
                          setHasChanges(true);
                        }}
                        isLoading={isSaving}
                      />
                    </div>
                    
                    <div className="lg:w-2/3 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="First Name" required error={errors.firstName}>
                          <input
                            type="text"
                            value={profile.firstName}
                            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                            placeholder="Enter your first name"
                          />
                        </FormField>

                        <FormField label="Last Name" required error={errors.lastName}>
                          <input
                            type="text"
                            value={profile.lastName}
                            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                            placeholder="Enter your last name"
                          />
                        </FormField>
                      </div>

                      <FormField label="Username" required>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="text"
                            value={profile.username}
                            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                            placeholder="Choose a username"
                          />
                        </div>
                      </FormField>

                      <FormField label="Email Address" required error={errors.email}>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                            placeholder="Enter your email"
                          />
                        </div>
                      </FormField>

                      <FormField label="Phone Number" error={errors.phone}>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </FormField>

                      <FormField label="Date of Birth">
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="date"
                            value={profile.dateOfBirth}
                            onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                          />
                        </div>
                      </FormField>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Country">
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <select
                              value={profile.country}
                              onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                            >
                              <option value="">Select Country</option>
                              <option value="US">United States</option>
                              <option value="CA">Canada</option>
                              <option value="UK">United Kingdom</option>
                              <option value="NG">Nigeria</option>
                              <option value="AU">Australia</option>
                            </select>
                          </div>
                        </FormField>

                        <FormField label="City">
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                              type="text"
                              value={profile.city}
                              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                              placeholder="Enter your city"
                            />
                          </div>
                        </FormField>
                      </div>

                      <FormField 
                        label="Bio" 
                        description={`${profile.bio.length}/150 characters`}
                        error={errors.bio}
                      >
                        <textarea
                          value={profile.bio}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
                          rows={3}
                          maxLength={150}
                          placeholder="Tell us a bit about yourself..."
                        />
                      </FormField>
                    </div>
                  </div>
                </FormSection>
              </div>
            )}

            {/* Account Settings */}
            {activeTab === 'account' && (
              <div className="space-y-8">
                <FormSection
                  title="Security Settings"
                  description="Manage your account security and authentication"
                  onSave={handleSaveAccountSettings}
                  isSaving={isSaving}
                  hasChanges={hasChanges}
                  error={errors.account}
                  success={success.account}
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Key className="text-gray-600" size={20} />
                        <div>
                          <h4 className="font-medium text-gray-900">Password</h4>
                          <p className="text-sm text-gray-600">Change your account password</p>
                        </div>
                      </div>
                      <button
                        onClick={handlePasswordChange}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Change Password
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <ToggleSwitch
                        enabled={accountSettings.twoFactorEnabled}
                        onChange={(enabled) => setAccountSettings({ ...accountSettings, twoFactorEnabled: enabled })}
                      />
                    </div>
                  </div>
                </FormSection>

                <FormSection
                  title="Notification Preferences"
                  description="Choose what notifications you'd like to receive"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Bell className="text-gray-600" size={20} />
                        <div>
                          <h4 className="font-medium text-gray-900">Email Notifications</h4>
                          <p className="text-sm text-gray-600">Receive notifications about your account activity</p>
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={accountSettings.emailNotifications}
                        onChange={(enabled) => setAccountSettings({ ...accountSettings, emailNotifications: enabled })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Mail className="text-gray-600" size={20} />
                        <div>
                          <h4 className="font-medium text-gray-900">Marketing Emails</h4>
                          <p className="text-sm text-gray-600">Receive updates about new features and content</p>
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={accountSettings.marketingEmails}
                        onChange={(enabled) => setAccountSettings({ ...accountSettings, marketingEmails: enabled })}
                      />
                    </div>
                  </div>
                </FormSection>

                <FormSection
                  title="Privacy Settings"
                  description="Control your privacy and data sharing preferences"
                >
                  <div className="space-y-4">
                    <FormField label="Profile Visibility">
                      <select
                        value={accountSettings.profileVisibility}
                        onChange={(e) => setAccountSettings({ ...accountSettings, profileVisibility: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      >
                        <option value="public">Public - Anyone can see your profile</option>
                        <option value="friends">Friends Only - Only your connections can see your profile</option>
                        <option value="private">Private - Only you can see your profile</option>
                      </select>
                    </FormField>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Eye className="text-gray-600" size={20} />
                        <div>
                          <h4 className="font-medium text-gray-900">Data Sharing</h4>
                          <p className="text-sm text-gray-600">Allow us to share anonymized data for analytics</p>
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={accountSettings.dataSharing}
                        onChange={(enabled) => setAccountSettings({ ...accountSettings, dataSharing: enabled })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField label="Language">
                        <select
                          value={accountSettings.language}
                          onChange={(e) => setAccountSettings({ ...accountSettings, language: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        >
                          <option value="en">English</option>
                          <option value="yo">Yoruba</option>
                          <option value="ig">Igbo</option>
                          <option value="ha">Hausa</option>
                        </select>
                      </FormField>

                      <FormField label="Time Zone">
                        <select
                          value={accountSettings.timezone}
                          onChange={(e) => setAccountSettings({ ...accountSettings, timezone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        >
                          <option value="America/New_York">Eastern Time (ET)</option>
                          <option value="America/Chicago">Central Time (CT)</option>
                          <option value="America/Denver">Mountain Time (MT)</option>
                          <option value="America/Los_Angeles">Pacific Time (PT)</option>
                          <option value="Africa/Lagos">West Africa Time (WAT)</option>
                          <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                        </select>
                      </FormField>
                    </div>
                  </div>
                </FormSection>
              </div>
            )}

            {/* Display Preferences */}
            {activeTab === 'display' && (
              <div className="space-y-8">
                <FormSection
                  title="Display Preferences"
                  description="Customize how the interface looks and feels"
                  onSave={handleSaveDisplayPreferences}
                  isSaving={isSaving}
                  hasChanges={hasChanges}
                  error={errors.display}
                  success={success.display}
                >
                  <div className="space-y-6">
                    <FormField label="Theme">
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { value: 'light', label: 'Light', icon: '☀️' },
                          { value: 'dark', label: 'Dark', icon: '🌙' },
                          { value: 'auto', label: 'Auto', icon: '🔄' }
                        ].map((theme) => (
                          <button
                            key={theme.value}
                            onClick={() => setDisplayPreferences({ ...displayPreferences, theme: theme.value as any })}
                            className={`p-4 border-2 rounded-lg text-center transition-all duration-200 ${
                              displayPreferences.theme === theme.value
                                ? 'border-red-500 bg-red-50 text-red-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-2xl mb-2">{theme.icon}</div>
                            <div className="font-medium">{theme.label}</div>
                          </button>
                        ))}
                      </div>
                    </FormField>

                    <FormField label="Font Size">
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { value: 'small', label: 'Small', size: 'text-sm' },
                          { value: 'medium', label: 'Medium', size: 'text-base' },
                          { value: 'large', label: 'Large', size: 'text-lg' }
                        ].map((size) => (
                          <button
                            key={size.value}
                            onClick={() => setDisplayPreferences({ ...displayPreferences, fontSize: size.value as any })}
                            className={`p-4 border-2 rounded-lg text-center transition-all duration-200 ${
                              displayPreferences.fontSize === size.value
                                ? 'border-red-500 bg-red-50 text-red-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Type className="mx-auto mb-2" size={20} />
                            <div className={`font-medium ${size.size}`}>{size.label}</div>
                          </button>
                        ))}
                      </div>
                    </FormField>

                    <FormField label="Color Scheme">
                      <div className="grid grid-cols-4 gap-4">
                        {[
                          { value: 'default', label: 'Default', color: 'bg-red-500' },
                          { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
                          { value: 'green', label: 'Green', color: 'bg-green-500' },
                          { value: 'purple', label: 'Purple', color: 'bg-purple-500' }
                        ].map((scheme) => (
                          <button
                            key={scheme.value}
                            onClick={() => setDisplayPreferences({ ...displayPreferences, colorScheme: scheme.value as any })}
                            className={`p-4 border-2 rounded-lg text-center transition-all duration-200 ${
                              displayPreferences.colorScheme === scheme.value
                                ? 'border-gray-800 bg-gray-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className={`w-8 h-8 ${scheme.color} rounded-full mx-auto mb-2`}></div>
                            <div className="font-medium text-sm">{scheme.label}</div>
                          </button>
                        ))}
                      </div>
                    </FormField>

                    <FormField label="Layout">
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { value: 'comfortable', label: 'Comfortable', icon: Monitor },
                          { value: 'compact', label: 'Compact', icon: Smartphone }
                        ].map((layout) => (
                          <button
                            key={layout.value}
                            onClick={() => setDisplayPreferences({ ...displayPreferences, layout: layout.value as any })}
                            className={`p-4 border-2 rounded-lg text-center transition-all duration-200 ${
                              displayPreferences.layout === layout.value
                                ? 'border-red-500 bg-red-50 text-red-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <layout.icon className="mx-auto mb-2" size={24} />
                            <div className="font-medium">{layout.label}</div>
                          </button>
                        ))}
                      </div>
                    </FormField>
                  </div>
                </FormSection>
              </div>
            )}

            {/* Integration Settings */}
            {activeTab === 'integrations' && (
              <div className="space-y-8">
                <FormSection
                  title="Connected Accounts"
                  description="Manage your social media and third-party integrations"
                >
                  <div className="space-y-4">
                    {Object.entries(integrationSettings.connectedAccounts).map(([platform, connected]) => (
                      <div key={platform} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            platform === 'facebook' ? 'bg-blue-600' :
                            platform === 'twitter' ? 'bg-sky-500' :
                            platform === 'google' ? 'bg-red-500' :
                            'bg-blue-700'
                          }`}>
                            <span className="text-white font-bold text-sm">
                              {platform.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 capitalize">{platform}</h4>
                            <p className="text-sm text-gray-600">
                              {connected ? 'Connected' : 'Not connected'}
                            </p>
                          </div>
                        </div>
                        {connected ? (
                          <button
                            onClick={() => handleDisconnectAccount(platform)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Disconnect
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setIntegrationSettings({
                                ...integrationSettings,
                                connectedAccounts: {
                                  ...integrationSettings.connectedAccounts,
                                  [platform]: true
                                }
                              });
                              setHasChanges(true);
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </FormSection>

                <FormSection
                  title="API Access"
                  description="Manage your API keys and third-party app permissions"
                >
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">API Key</h4>
                        <button
                          onClick={() => setIntegrationSettings({ ...integrationSettings, apiKeyVisible: !integrationSettings.apiKeyVisible })}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          {integrationSettings.apiKeyVisible ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <div className="font-mono text-sm bg-white p-3 rounded border">
                        {integrationSettings.apiKeyVisible 
                          ? 'gwp_live_sk_1234567890abcdef1234567890abcdef'
                          : '••••••••••••••••••••••••••••••••••••••••'
                        }
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Keep your API key secure. Don't share it publicly.
                      </p>
                    </div>

                    <div className="flex space-x-3">
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Regenerate Key
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Copy to Clipboard
                      </button>
                    </div>
                  </div>
                </FormSection>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        isLoading={isSaving}
      />
    </div>
  );
};

export default UserProfilePage;