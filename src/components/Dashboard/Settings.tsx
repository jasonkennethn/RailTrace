import { useState, useEffect } from 'react';
import { 
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface SystemSettings {
  notifications: {
    emailAlerts: boolean;
    pushNotifications: boolean;
    criticalAlerts: boolean;
    weeklyReports: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
    auditLogging: boolean;
  };
  blockchain: {
    autoSync: boolean;
    syncInterval: number;
    retryAttempts: number;
    gasLimit: number;
  };
  ai: {
    enablePredictions: boolean;
    confidenceThreshold: number;
    autoAnalysis: boolean;
    dataRetention: number;
  };
}


export function Settings() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  
  const [settings, setSettings] = useState<SystemSettings>({
    notifications: {
      emailAlerts: true,
      pushNotifications: true,
      criticalAlerts: true,
      weeklyReports: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      auditLogging: true
    },
    blockchain: {
      autoSync: true,
      syncInterval: 5,
      retryAttempts: 3,
      gasLimit: 50000
    },
    ai: {
      enablePredictions: true,
      confidenceThreshold: 75,
      autoAnalysis: true,
      dataRetention: 365
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('systemSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage (in real app, save to backend)
      localStorage.setItem('systemSettings', JSON.stringify(settings));
      setSaveStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    setIsSaving(true);
    try {
      // Simulate password change
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (category: keyof SystemSettings, key: string, value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };


  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'success':
        return 'Settings saved successfully';
      case 'error':
        return 'Failed to save settings';
      default:
        return 'Save Settings';
    }
  };

  const languages = [
    { code: 'en', nameKey: 'languages.english', flag: '🇮🇳' },
    { code: 'hi', nameKey: 'languages.hindi', flag: '🇮🇳' },
    { code: 'te', nameKey: 'languages.telugu', flag: '🇮🇳' },
    { code: 'ta', nameKey: 'languages.tamil', flag: '🇮🇳' },
    { code: 'kn', nameKey: 'languages.kannada', flag: '🇮🇳' },
    { code: 'bn', nameKey: 'languages.bengali', flag: '🇮🇳' },
    { code: 'gu', nameKey: 'languages.gujarati', flag: '🇮🇳' },
    { code: 'mr', nameKey: 'languages.marathi', flag: '🇮🇳' },
    { code: 'ml', nameKey: 'languages.malayalam', flag: '🇮🇳' },
    { code: 'pa', nameKey: 'languages.punjabi', flag: '🇮🇳' },
    { code: 'or', nameKey: 'languages.odia', flag: '🇮🇳' },
    { code: 'as', nameKey: 'languages.assamese', flag: '🇮🇳' },
    { code: 'ur', nameKey: 'languages.urdu', flag: '🇮🇳' },
  ];

  return (
    <div className="bg-[#f0f2f5] dark:bg-[#0d1117] font-display text-[#0d1117] dark:text-[#c9d1d9] min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-[#ffffff] dark:bg-[#0d1117] border-b border-[#d0d7de] dark:border-[#30363d]">
        <button 
          className="p-2 text-[#0d1117] dark:text-[#c9d1d9] hover:bg-[#f0f2f5] dark:hover:bg-[#21262d] rounded-lg transition-colors"
          onClick={() => {
            // Try to go back in history, fallback to dashboard
            if (window.history.length > 1) {
              window.history.back();
            } else {
              // Fallback: navigate to dashboard or home
              window.location.href = '/';
            }
          }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-[#0d1117] dark:text-[#c9d1d9]">{t('Title')}</h1>
        <div></div>
      </header>

      <div className="p-4 bg-[#f0f2f5] dark:bg-[#0d1117]">
          <div className="space-y-6">
            {/* Theme */}
            <div className="p-4 bg-[#ffffff] dark:bg-[#161b22] rounded-lg border border-[#d0d7de] dark:border-[#30363d]">
              <h2 className="mb-4 text-lg font-semibold text-[#0d1117] dark:text-[#c9d1d9]">{t('Theme')}</h2>
              <div className="flex gap-2 p-1 rounded-lg bg-[#f0f2f5] dark:bg-[#0d1117]">
                <button 
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    theme === 'light'
                      ? 'text-[#1773cf] bg-[#1773cf]/10 dark:bg-[#1773cf]/20'
                      : 'text-[#57606a] dark:text-[#8b949e] hover:bg-[#e1e4e8] dark:hover:bg-[#21262d]'
                  }`}
                  onClick={() => setTheme('light')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Sun className="h-4 w-4" />
{t('Light')}
                  </div>
                </button>
                <button 
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    theme === 'dark'
                      ? 'text-[#1773cf] bg-[#1773cf]/10 dark:bg-[#1773cf]/20'
                      : 'text-[#57606a] dark:text-[#8b949e] hover:bg-[#e1e4e8] dark:hover:bg-[#21262d]'
                  }`}
                  onClick={() => setTheme('dark')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Moon className="h-4 w-4" />
{t('Dark')}
                  </div>
                </button>
              </div>
            </div>

            {/* Language */}
            <div className="p-4 bg-[#ffffff] dark:bg-[#161b22] rounded-lg border border-[#d0d7de] dark:border-[#30363d]">
              <h2 className="mb-4 text-lg font-semibold text-[#0d1117] dark:text-[#c9d1d9]">{t('settings.language')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {languages.map(({ code, nameKey, flag }) => (
                  <button
                    key={code}
                    onClick={() => setLanguage(code as any)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-between gap-2 ${
                      language === code
                        ? 'border-[#1773cf] bg-[#1773cf]/10 dark:bg-[#1773cf]/20 text-[#1773cf] dark:text-[#1773cf]'
                        : 'border-[#d0d7de] dark:border-[#30363d] hover:border-[#1773cf]/50 dark:hover:border-[#1773cf]/50 text-[#57606a] dark:text-[#8b949e]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{flag}</span>
                      <span className="text-sm font-medium">{t(nameKey)}</span>
                    </div>
                    {language === code && (
                      <span className="material-symbols-outlined text-sm">check</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile */}
            <div className="relative p-4 overflow-hidden bg-[#ffffff] dark:bg-[#161b22] rounded-lg h-32 border border-[#d0d7de] dark:border-[#30363d]">
              <div className="absolute inset-0 bg-center bg-no-repeat bg-cover" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBP6De4Qh6SlvMBCz3uLBO7XRJ6fDD07ecl97h5Vl2PQMvy7bw_V2elv23zkjTZwuNx6_-Gc3TS0pjetnTD1N2GRkGgfGi29BfBaqA0lGE325Q0gQCXBDZ-AWtIk6H0Tba0o1Lyl_fMbraNilj2rsgUgs3l-h-uqRLCI4RSwsBQKclXkegZmZM-0zHj6m0O8l0X9jGfdfxrifwc0ISGQ2f0w7PTFFi7a9lueAJvYhFCxWxyJWIM2MWSRMfL11_w2ULnKH88RjIqC6WQ")'}}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#161b22]/70 to-transparent"></div>
              <div className="relative">
                <p className="text-sm font-medium text-white/80">Profile</p>
                <h2 className="text-xl font-bold text-white">Edit Profile</h2>
              </div>
            </div>

            {/* System Settings */}
            <div className="p-4 bg-[#ffffff] dark:bg-[#161b22] rounded-lg border border-[#d0d7de] dark:border-[#30363d]">
              <h2 className="mb-4 text-lg font-semibold text-[#0d1117] dark:text-[#c9d1d9]">{t('SystemSettings')}</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#0d1117] dark:text-[#c9d1d9]">Notifications</p>
                    <p className="text-sm text-[#57606a] dark:text-[#8b949e]">Receive push notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.notifications.pushNotifications}
                      onChange={(e) => updateSetting('notifications', 'pushNotifications', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#0d1117] dark:text-[#c9d1d9]">Security</p>
                    <p className="text-sm text-[#57606a] dark:text-[#8b949e]">Enable two-factor authentication</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#0d1117] dark:text-[#c9d1d9]">Blockchain/AI</p>
                    <p className="text-sm text-[#57606a] dark:text-[#8b949e]">Enable AI-powered insights</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.ai.enablePredictions}
                      onChange={(e) => updateSetting('ai', 'enablePredictions', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="p-4 bg-[#ffffff] dark:bg-[#161b22] rounded-lg border border-[#d0d7de] dark:border-[#30363d]">
              <h2 className="mb-4 text-lg font-semibold text-[#0d1117] dark:text-[#c9d1d9]">{t('settings.changePassword')}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-[#0d1117] dark:text-[#c9d1d9]">Current Password</label>
                  <input 
                    type="password" 
                    className="w-full px-3 py-2 border border-[#d0d7de] dark:border-[#30363d] rounded-lg bg-[#f6f8fa] dark:bg-[#0d1117] text-[#0d1117] dark:text-[#c9d1d9] focus:ring-2 focus:ring-[#1773cf] focus:border-transparent" 
                    placeholder="Enter current password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-[#0d1117] dark:text-[#c9d1d9]">New Password</label>
                  <input 
                    type="password" 
                    className="w-full px-3 py-2 border border-[#d0d7de] dark:border-[#30363d] rounded-lg bg-[#f6f8fa] dark:bg-[#0d1117] text-[#0d1117] dark:text-[#c9d1d9] focus:ring-2 focus:ring-[#1773cf] focus:border-transparent" 
                    placeholder="Enter new password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-[#0d1117] dark:text-[#c9d1d9]">Confirm New Password</label>
                  <input 
                    type="password" 
                    className="w-full px-3 py-2 border border-[#d0d7de] dark:border-[#30363d] rounded-lg bg-[#f6f8fa] dark:bg-[#0d1117] text-[#0d1117] dark:text-[#c9d1d9] focus:ring-2 focus:ring-[#1773cf] focus:border-transparent" 
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

        {/* Action Buttons - Moved to main content */}
        <div className="p-4 bg-[#ffffff] dark:bg-[#0d1117] border-t border-[#d0d7de] dark:border-[#30363d]">
          <div className="flex gap-3">
            <button 
              className="flex-1 px-4 py-3 font-semibold text-white rounded-lg bg-[#1773cf] hover:bg-[#1773cf]/90 transition-colors duration-200"
              onClick={handleSaveSettings}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : getSaveStatusText()}
            </button>
            <button 
              className="px-4 py-3 font-semibold text-[#1773cf] rounded-lg bg-[#1773cf]/10 dark:bg-[#1773cf]/20 hover:bg-[#1773cf]/20 dark:hover:bg-[#1773cf]/30 transition-colors duration-200"
              onClick={handlePasswordChange}
              disabled={isSaving}
            >
              {isSaving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}