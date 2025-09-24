import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';

interface LoginFormProps {
  onToggleMode: () => void;
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingStep, setLoadingStep] = useState('');

  const { login } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setLoadingStep(t('auth.login.steps.validating'));

    try {
      // Simulate loading steps for better UX
      setLoadingStep(t('auth.login.steps.connecting'));
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLoadingStep(t('auth.login.steps.authenticating'));
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setLoadingStep(t('auth.login.steps.loadingDashboard'));
      await login(email, password);
      
      setLoadingStep(t('auth.login.steps.welcome'));
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t('auth.login.errors.failed'));
      setLoadingStep('');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-light via-blue-50/30 to-indigo-50/50 dark:from-background-dark dark:via-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-card-light/95 dark:bg-card-dark/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          {/* Logo Section */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-success-light dark:bg-success-dark rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Title Section */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark font-display">{t('auth.login.title')}</h1>
            <p className="text-subtle-light dark:text-subtle-dark">{t('auth.login.subtitle')}</p>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-danger-light/10 dark:bg-danger-dark/20 border border-danger-light/20 dark:border-danger-dark/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-danger-light dark:text-danger-dark flex-shrink-0" />
                <p className="text-sm text-danger-light dark:text-danger-dark">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground-light dark:text-foreground-dark">{t('auth.common.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-subtle-light dark:text-subtle-dark" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.common.emailPlaceholder')}
                  className="w-full pl-10 pr-4 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-content-light dark:text-content-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground-light dark:text-foreground-dark">{t('auth.common.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-subtle-light dark:text-subtle-dark" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.common.passwordPlaceholder')}
                  className="w-full pl-10 pr-12 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-content-light dark:text-content-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-subtle-light dark:text-subtle-dark hover:text-foreground-light dark:text-foreground-dark transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark rounded focus:ring-primary focus:ring-2"
                />
                <span className="text-sm text-subtle-light dark:text-subtle-dark">{t('auth.login.rememberMe')}</span>
              </label>
              <button
                type="button"
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {t('auth.login.forgotPassword')}
              </button>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="text-sm">{loadingStep || t('auth.login.signingIn')}</span>
                </>
              ) : (
                <>
                  {t('auth.login.signIn')}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            {/* Loading Progress Indicator */}
            {isLoading && loadingStep && (
              <div className="mt-4 p-3 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-primary font-medium">{loadingStep}</span>
                </div>
                <div className="mt-2 w-full bg-primary/20 rounded-full h-1">
                  <div className="bg-primary h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-light dark:border-border-dark"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card-light dark:bg-card-dark text-subtle-light dark:text-subtle-dark">{t('auth.login.newHere')}</span>
              </div>
            </div>

            {/* Register Link */}
            <button
              type="button"
              onClick={onToggleMode}
              className="w-full text-center py-3 px-4 border border-border-light dark:border-border-dark rounded-lg text-foreground-light dark:text-foreground-dark hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-medium"
            >
              {t('auth.login.createAccount')}
            </button>
          </form>
        </CardContent>

        {/* Footer */}
        <div className="px-8 pb-6">
          <div className="text-center">
            <p className="text-xs text-subtle-light dark:text-subtle-dark">
              {t('auth.login.agreePrefix')}{' '}
              <a href="#" className="text-primary hover:text-primary/80 transition-colors">{t('auth.login.terms')}</a>{' '}
              {t('auth.login.and')}{' '}
              <a href="#" className="text-primary hover:text-primary/80 transition-colors">{t('auth.login.privacy')}</a>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}