import React from 'react';
import { TrendingUp, Mail, MapPin, Phone } from 'lucide-react';
import { useI18n } from '../utils/i18n';
import { Separator } from './ui/separator';

export function Footer() {
  const { t } = useI18n();

  const footerLinks = {
    platform: [
      { label: t('landing.features'), href: '#features' },
      { label: t('landing.howItWorks'), href: '#how-it-works' },
      { label: t('landing.about'), href: '#about' },
    ],
    services: [
      { label: t('landing.hireTitle'), href: '#hire' },
      { label: t('landing.skillSwapTitle'), href: '#skill-swap' },
      { label: t('landing.investTitle'), href: '#invest' },
    ],
    legal: [
      { label: t('settings.termsOfService'), href: '#terms' },
      { label: t('settings.privacyPolicy'), href: '#privacy' },
      { label: t('settings.helpCenter'), href: '#help' },
    ],
  };

  return (
    <footer className="bg-muted/30 border-t mt-auto">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground rounded-lg p-2">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg">Work & Invest</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('landing.subtitle')}
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Tunis, Tunisia</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>contact@workandinvest.com</span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('landing.platform')}</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">{t('landing.services')}</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">{t('landing.legal')}</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Work & Invest. {t('landing.allRightsReserved')}</p>
          <p>{t('landing.madeInTunisia')}</p>
        </div>
      </div>
    </footer>
  );
}
