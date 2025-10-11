import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Header } from './Header';
import { Footer } from './Footer';
import { useI18n } from '../utils/i18n';
import { 
  Users, 
  RefreshCw, 
  TrendingUp, 
  Shield, 
  Wallet, 
  Star,
  ArrowRight,
  CheckCircle,
  Zap,
  Globe,
  Award
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col">
      <Header onGetStarted={onGetStarted} onSignIn={onSignIn} />

      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge variant="secondary" className="w-fit">
                🚀 {t('landing.tagline')}
              </Badge>
              <h1 className="text-4xl lg:text-6xl xl:text-7xl leading-tight">
                {t('landing.heroTitle')}
                <span className="text-primary block mt-2">{t('landing.heroSubtitle')}</span>
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-lg">
                {t('landing.heroDescription')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={onGetStarted} className="gap-2 text-base">
                  {t('landing.getStarted')} <ArrowRight className="h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={onSignIn} className="text-base">
                  {t('auth.signIn')}
                </Button>
              </div>
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
                  <span>{t('landing.freeToJoin')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
                  <span>{t('landing.securePayments')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
                  <span>{t('landing.aiPowered')}</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
                  alt="Professional team collaboration"
                  className="rounded-2xl w-full h-[500px] object-cover shadow-2xl"
                />
              </div>
              {/* Floating Stats Cards */}
              <div className="absolute -bottom-8 -left-8 bg-background p-6 rounded-xl shadow-xl border z-20 hidden lg:block">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('landing.activeUsers')}</p>
                    <p className="text-2xl">10,000+</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-8 -right-8 bg-background p-6 rounded-xl shadow-xl border z-20 hidden lg:block">
                <div className="flex items-center gap-4">
                  <div className="bg-green-500/10 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('landing.transactionsCompleted')}</p>
                    <p className="text-2xl">50,000+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="text-base">
              {t('landing.features')}
            </Badge>
            <h2 className="text-3xl lg:text-5xl">{t('landing.threeWays')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('landing.featuresDescription')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Hire Mode */}
            <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="bg-blue-500/10 p-4 rounded-xl w-fit">
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <CardTitle className="text-2xl mt-4">{t('landing.hireTitle')}</CardTitle>
                <CardDescription className="text-base">
                  {t('landing.hireDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t('landing.hireFeature1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t('landing.hireFeature2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t('landing.hireFeature3')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t('landing.hireFeature4')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Skill Swap */}
            <Card className="border-2 hover:border-green-500 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="bg-green-500/10 p-4 rounded-xl w-fit">
                  <RefreshCw className="h-8 w-8 text-green-500" />
                </div>
                <CardTitle className="text-2xl mt-4">{t('landing.skillSwapTitle')}</CardTitle>
                <CardDescription className="text-base">
                  {t('landing.skillSwapDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t('landing.skillSwapFeature1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t('landing.skillSwapFeature2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t('landing.skillSwapFeature3')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t('landing.skillSwapFeature4')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Micro-Investment */}
            <Card className="border-2 hover:border-purple-500 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="bg-purple-500/10 p-4 rounded-xl w-fit">
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
                <CardTitle className="text-2xl mt-4">{t('landing.investTitle')}</CardTitle>
                <CardDescription className="text-base">
                  {t('landing.investDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t('landing.investFeature1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t('landing.investFeature2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t('landing.investFeature3')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t('landing.investFeature4')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="text-base">
              {t('landing.howItWorks')}
            </Badge>
            <h2 className="text-3xl lg:text-5xl">{t('landing.getStartedInMinutes')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('landing.simpleProcess')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="relative">
              <div className="bg-background p-8 rounded-2xl shadow-lg space-y-4">
                <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center text-xl">
                  1
                </div>
                <h3 className="text-xl">{t('landing.step1Title')}</h3>
                <p className="text-muted-foreground">{t('landing.step1Description')}</p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-background p-8 rounded-2xl shadow-lg space-y-4">
                <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center text-xl">
                  2
                </div>
                <h3 className="text-xl">{t('landing.step2Title')}</h3>
                <p className="text-muted-foreground">{t('landing.step2Description')}</p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-background p-8 rounded-2xl shadow-lg space-y-4">
                <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center text-xl">
                  3
                </div>
                <h3 className="text-xl">{t('landing.step3Title')}</h3>
                <p className="text-muted-foreground">{t('landing.step3Description')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section id="about" className="py-20 lg:py-32 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80"
                alt="Secure platform"
                className="rounded-2xl w-full h-[450px] object-cover shadow-xl"
              />
            </div>
            <div className="space-y-8 order-1 lg:order-2">
              <div>
                <Badge variant="outline" className="text-base mb-4">
                  {t('landing.trustAndSafety')}
                </Badge>
                <h2 className="text-3xl lg:text-4xl mb-4">{t('landing.builtOnTrust')}</h2>
                <p className="text-lg text-muted-foreground">
                  {t('landing.safetyDescription')}
                </p>
              </div>
              <div className="grid gap-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500/10 p-3 rounded-lg flex-shrink-0">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg mb-1">{t('landing.idVerification')}</h4>
                    <p className="text-muted-foreground">{t('landing.idVerificationDesc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-green-500/10 p-3 rounded-lg flex-shrink-0">
                    <Wallet className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg mb-1">{t('landing.secureWallet')}</h4>
                    <p className="text-muted-foreground">{t('landing.secureWalletDesc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-purple-500/10 p-3 rounded-lg flex-shrink-0">
                    <Star className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-lg mb-1">{t('landing.ratingSystem')}</h4>
                    <p className="text-muted-foreground">{t('landing.ratingSystemDesc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-orange-500/10 p-3 rounded-lg flex-shrink-0">
                    <Zap className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-lg mb-1">{t('landing.aiFraudDetection')}</h4>
                    <p className="text-muted-foreground">{t('landing.aiFraudDetectionDesc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl mb-6">
            {t('landing.readyToTransform')}
          </h2>
          <p className="text-lg lg:text-xl mb-10 opacity-90 max-w-3xl mx-auto">
            {t('landing.joinThousands')}
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={onGetStarted}
            className="gap-2 text-lg px-8 py-6 h-auto"
          >
            {t('landing.joinToday')} <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
