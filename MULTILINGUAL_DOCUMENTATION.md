# RailTrace Multilingual Support Documentation

## Overview
RailTrace Admin Dashboard now supports complete multilingual functionality across all Indian languages with proper font scaling and script support.

## Supported Languages
- **English** (en) - Default language
- **Hindi** (hi) - हिन्दी
- **Telugu** (te) - తెలుగు  
- **Tamil** (ta) - தமிழ்
- **Kannada** (kn) - ಕನ್ನಡ
- **Malayalam** (ml) - മലയാളം
- **Bengali** (bn) - বাংলা
- **Marathi** (mr) - मराठी
- **Gujarati** (gu) - ગુજરાતી
- **Punjabi** (pa) - ਪੰਜਾਬੀ
- **Odia** (or) - ଓଡ଼ିଆ
- **Assamese** (as) - অসমীয়া
- **Urdu** (ur) - اردو

## Implementation Details

### 1. Language Context (`src/contexts/LanguageContext.tsx`)
- **Dynamic Translation Loading**: Translations are loaded on-demand from JSON files
- **Font Scaling**: Automatic font scaling for Indian scripts (Tamil: 1.2x, Telugu: 1.15x, etc.)
- **Font Family Support**: Proper font families for each script (Noto Sans series)
- **Local Storage**: Language preference is saved and restored
- **Fallback System**: Falls back to English if translation key is missing

### 2. Translation Files (`src/locales/`)
All languages follow the same JSON structure:
```json
{
  "common": {
    "loading": "...",
    "error": "...",
    "save": "..."
  },
  "navigation": {
    "dashboard": "...",
    "reports": "..."
  },
  "dashboard": {
    "admin": {
      "title": "...",
      "pending_users": "..."
    }
  },
  "footer": {
    "home": "...",
    "reports": "..."
  }
}
```

### 3. Font Scaling System
- **CSS Variables**: `--font-scale` and `--font-family` are set dynamically
- **Script-Specific Scaling**: 
  - Tamil: 1.2x (larger for readability)
  - Telugu: 1.15x
  - Malayalam: 1.15x
  - Others: 1.1x
- **Font Families**: Noto Sans series for proper script rendering

### 4. Component Integration
All dashboard components now use the `useLanguage` hook:
```typescript
const { t, language, setLanguage } = useLanguage();
```

## Usage Guide

### For Users
1. **Access Settings**: Go to Settings → Language
2. **Select Language**: Choose from the grid of language options
3. **Instant Switch**: Language changes immediately without page reload
4. **Persistent**: Language choice is saved and restored on next visit

### For Developers

#### Adding New Translations
1. **Add to LanguageContext**: Update the `Language` type and `languageConfig`
2. **Create JSON File**: Add `{code}.json` in `src/locales/`
3. **Update CSS**: Add font imports in `src/index.css`
4. **Test**: Use the LanguageTest component

#### Using Translations in Components
```typescript
import { useLanguage } from '../contexts/LanguageContext';

function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('dashboard.admin.title')}</h1>
      <p>{t('common.loading')}</p>
    </div>
  );
}
```

#### Adding New Translation Keys
1. **Add to English**: Update `src/locales/en.json`
2. **Add to All Languages**: Update all other language files
3. **Use in Components**: Use `t('key.path')` syntax

## Testing

### Language Test Component
Access via `language-test` tab in the app to:
- Test all language switches
- Verify font scaling
- Check translation accuracy
- Test persistence

### Test Cases
1. **English → Hindi → Tamil → English**: Verify smooth transitions
2. **Font Scaling**: Check that Tamil/Telugu text is larger
3. **Persistence**: Refresh page and verify language is maintained
4. **Fallback**: Test with missing translation keys

## Technical Features

### Performance
- **Lazy Loading**: Translations loaded only when needed
- **Caching**: Translation cache prevents repeated loading
- **Optimized**: No unnecessary re-renders

### Accessibility
- **Font Scaling**: Proper sizing for different scripts
- **Touch Targets**: Maintained 44px minimum touch areas
- **Screen Readers**: Proper language attributes

### Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Font Loading**: Graceful fallback if fonts fail to load
- **Local Storage**: Works with localStorage support

## Future Enhancements

### Planned Features
1. **RTL Support**: Right-to-left languages (Arabic, Urdu)
2. **Pluralization**: Complex plural forms for Indian languages
3. **Date/Number Formatting**: Locale-specific formatting
4. **Voice Support**: Text-to-speech in local languages

### Adding New Languages
1. Create `{code}.json` file in `src/locales/`
2. Add language config to `LanguageContext.tsx`
3. Import appropriate fonts in `src/index.css`
4. Test with `LanguageTest` component

## Troubleshooting

### Common Issues
1. **Missing Translations**: Check JSON file structure
2. **Font Not Loading**: Verify font imports in CSS
3. **Scaling Issues**: Check CSS variable values
4. **Persistence**: Clear localStorage and test again

### Debug Mode
Enable debug mode in `LanguageContext.tsx`:
```typescript
debug: true
```

## Conclusion
The multilingual implementation provides a seamless experience for users across all Indian languages with proper script support, font scaling, and instant language switching. The system is extensible and maintainable for future language additions.
