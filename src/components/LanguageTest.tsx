import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export function LanguageTest() {
  const { language, setLanguage, t, getFontConfig, getLanguageName } = useLanguage();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'മലയാളം' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'mr', name: 'मराठी' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ' },
    { code: 'or', name: 'ଓଡ଼ିଆ' },
    { code: 'ur', name: 'اردو' },
    { code: 'as', name: 'অসমীয়া' },
  ];

  const fontConfig = getFontConfig();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t('dashboard.admin.title')}</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Language Test</h2>
        <p className="mb-4">Current Language: <strong>{getLanguageName(language)}</strong></p>
        <p className="mb-4">Font Scale: <strong>{fontConfig.fontScale}</strong></p>
        <p className="mb-4">Font Family: <strong>{fontConfig.fontFamily}</strong></p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Sample Translations:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded">
            <p><strong>Dashboard:</strong> {t('navigation.dashboard')}</p>
            <p><strong>Reports:</strong> {t('navigation.reports')}</p>
            <p><strong>Analytics:</strong> {t('navigation.analytics')}</p>
            <p><strong>Settings:</strong> {t('navigation.settings')}</p>
          </div>
          <div className="p-4 border rounded">
            <p><strong>Loading:</strong> {t('common.loading')}</p>
            <p><strong>Save:</strong> {t('common.save')}</p>
            <p><strong>Cancel:</strong> {t('common.cancel')}</p>
            <p><strong>Success:</strong> {t('common.success')}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Language Selector:</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {languages.map(({ code, name }) => (
            <button
              key={code}
              onClick={() => setLanguage(code as any)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                language === code
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-300 hover:border-blue-300 text-gray-700'
              }`}
            >
              <div className="text-center">
                <div className="text-lg mb-1">{name}</div>
                <div className="text-xs text-gray-500">{code.toUpperCase()}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Footer Translations:</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 border rounded text-center">
            <div className="text-sm font-medium">{t('footer.home')}</div>
          </div>
          <div className="p-3 border rounded text-center">
            <div className="text-sm font-medium">{t('footer.reports')}</div>
          </div>
          <div className="p-3 border rounded text-center">
            <div className="text-sm font-medium">{t('footer.ai_analytics')}</div>
          </div>
          <div className="p-3 border rounded text-center">
            <div className="text-sm font-medium">{t('footer.settings')}</div>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <p><strong>Test Instructions:</strong></p>
        <ol className="list-decimal list-inside mt-2 space-y-1">
          <li>Click on different language buttons above</li>
          <li>Observe how all text changes instantly</li>
          <li>Notice font scaling for Indian scripts (Tamil, Telugu, etc.)</li>
          <li>Check that fonts are appropriate for each script</li>
          <li>Verify that the language preference is saved</li>
        </ol>
      </div>
    </div>
  );
}
