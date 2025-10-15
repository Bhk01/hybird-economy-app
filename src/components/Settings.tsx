import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Navigation } from './Navigation';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Monitor, 
  Sun, 
  Moon, 
  Bell, 
  Mail, 
  Shield, 
  User, 
  HelpCircle,
  Info,
  ChevronRight
} from 'lucide-react';
import { useI18n, Language } from '../utils/i18n';
import { useTheme, Theme } from '../utils/theme';
import { PageType } from '../App';
import { toast } from 'sonner';

interface SettingsProps {
  onNavigate: (page: PageType) => void;
  onLogout: () => void;
}

export function Settings({ onNavigate, onLogout }: SettingsProps) {
  const { t, language, setLanguage } = useI18n();
  const { theme, setTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [marketing, setMarketing] = useState(false);

  const languages: { value: Language; label: string; nativeLabel: string }[] = [
    { value: 'en', label: 'English', nativeLabel: 'English' },
    { value: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
    { value: 'fr', label: 'French', nativeLabel: 'Français' }
  ];

  const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: t('settings.lightMode'), icon: <Sun className="h-4 w-4" /> },
    { value: 'dark', label: t('settings.darkMode'), icon: <Moon className="h-4 w-4" /> },
    { value: 'system', label: t('settings.systemMode'), icon: <Monitor className="h-4 w-4" /> }
  ];

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    toast.success(`Language changed to ${languages.find(l => l.value === newLanguage)?.label}`);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${themes.find(t => t.value === newTheme)?.label}`);
  };

  const settingSections = [
    {
      title: t('settings.language'),
      icon: <Globe className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="language-select">{t('settings.selectLanguage')}</Label>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-full mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    <div className="flex items-center gap-2">
                      <span>{lang.nativeLabel}</span>
                      <span className="text-muted-foreground">({lang.label})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      title: t('settings.theme'),
      icon: <Monitor className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="theme-select">{t('settings.selectTheme')}</Label>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger className="w-full mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {themes.map((themeOption) => (
                  <SelectItem key={themeOption.value} value={themeOption.value}>
                    <div className="flex items-center gap-2">
                      {themeOption.icon}
                      <span>{themeOption.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      title: t('settings.notifications'),
      icon: <Bell className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('settings.emailNotifications')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.emailNotificationsDesc')}
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('settings.pushNotifications')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.pushNotificationsDesc')}
              </p>
            </div>
            <Switch
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('settings.marketing')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.marketingDesc')}
              </p>
            </div>
            <Switch
              checked={marketing}
              onCheckedChange={setMarketing}
            />
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl mb-2 flex items-center gap-2">
              <SettingsIcon className="h-6 w-6" />
              {t('settings.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('settings.accountPreferences')}
            </p>
          </div>

          {/* Settings Sections */}
          <div className="space-y-6">
            {settingSections.map((section, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {section.icon}
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {section.content}
                </CardContent>
              </Card>
            ))}

            {/* Additional Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t('settings.account')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => onNavigate('profile')}
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t('settings.editProfile')}
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => onNavigate('wallet')}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    {t('settings.paymentSecurity')}
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  {t('settings.supportHelp')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => toast.info(t('settings.helpCenterSoon'))}
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    {t('settings.helpCenter')}
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => toast.info(t('settings.contactSupportSoon'))}
                >
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {t('settings.contactSupport')}
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* App Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  {t('settings.aboutAppTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>{t('settings.version')}</p>
                  <p>{t('settings.appDescription')}</p>
                  <div className="flex gap-2 mt-4">
                    <Badge variant="secondary">{t('settings.beta')}</Badge>
                    <Badge variant="outline">{t('settings.tunisia')}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">{t('settings.dangerZone')}</CardTitle>
                <CardDescription>
                  {t('settings.dangerZoneDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive" 
                  onClick={onLogout}
                  className="w-full"
                >
{t('settings.signOut')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}