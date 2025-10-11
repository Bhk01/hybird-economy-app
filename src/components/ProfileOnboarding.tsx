import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { useI18n } from '../utils/i18n';
import { 
  User, 
  Briefcase, 
  MapPin, 
  Star, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { userApi } from '../utils/api';

interface ProfileOnboardingProps {
  userId: string;
  userName: string;
  userEmail: string;
  onComplete: () => void;
  onSkip: () => void;
}

interface OnboardingData {
  bio: string;
  location: string;
  skills: string[];
  experience: string;
  currentSkill: string;
}

export function ProfileOnboarding({ userId, userName, userEmail, onComplete, onSkip }: ProfileOnboardingProps) {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [data, setData] = useState<OnboardingData>({
    bio: '',
    location: '',
    skills: [],
    experience: '',
    currentSkill: ''
  });

  const steps = [
    {
      id: 'welcome',
      title: t('onboarding.welcomeTitle'),
      description: t('onboarding.welcomeDescription'),
      icon: Sparkles
    },
    {
      id: 'bio',
      title: t('onboarding.bioTitle'),
      description: t('onboarding.bioDescription'),
      icon: User
    },
    {
      id: 'location',
      title: t('onboarding.locationTitle'),
      description: t('onboarding.locationDescription'),
      icon: MapPin
    },
    {
      id: 'skills',
      title: t('onboarding.skillsTitle'),
      description: t('onboarding.skillsDescription'),
      icon: Star
    },
    {
      id: 'experience',
      title: t('onboarding.experienceTitle'),
      description: t('onboarding.experienceDescription'),
      icon: Briefcase
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleAddSkill = () => {
    if (data.currentSkill.trim() && data.skills.length < 10) {
      setData({
        ...data,
        skills: [...data.skills, data.currentSkill.trim()],
        currentSkill: ''
      });
    }
  };

  const handleRemoveSkill = (index: number) => {
    setData({
      ...data,
      skills: data.skills.filter((_, i) => i !== index)
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      await userApi.updateProfile(userId, {
        bio: data.bio,
        location: data.location,
        skills: data.skills,
        onboardingCompleted: true,
        profileCompleteness: calculateCompleteness()
      });
      
      toast.success(t('onboarding.profileCompleted'));
      onComplete();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('onboarding.saveFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCompleteness = () => {
    let score = 20; // Base score for registration
    if (data.bio.length > 50) score += 25;
    if (data.location) score += 15;
    if (data.skills.length >= 3) score += 25;
    if (data.experience) score += 15;
    return Math.min(score, 100);
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    const Icon = step.icon;

    switch (step.id) {
      case 'welcome':
        return (
          <div className="space-y-6 text-center">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <Icon className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl mb-2">
                {t('onboarding.welcome')}, {userName}! 👋
              </h2>
              <p className="text-muted-foreground">
                {t('onboarding.letsSetup')}
              </p>
            </div>
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span>{t('onboarding.benefit1')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span>{t('onboarding.benefit2')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span>{t('onboarding.benefit3')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'bio':
        return (
          <div className="space-y-6">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-4">
              <Label htmlFor="bio">{t('onboarding.tellUs')}</Label>
              <Textarea
                id="bio"
                placeholder={t('onboarding.bioPlaceholder')}
                value={data.bio}
                onChange={(e) => setData({ ...data, bio: e.target.value })}
                rows={5}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {data.bio.length}/500 {t('onboarding.characters')}
              </p>
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-6">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-4">
              <Label htmlFor="location">{t('onboarding.whereLocated')}</Label>
              <Input
                id="location"
                placeholder={t('onboarding.locationPlaceholder')}
                value={data.location}
                onChange={(e) => setData({ ...data, location: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {t('onboarding.locationHelp')}
              </p>
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-6">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-4">
              <Label htmlFor="skills">{t('onboarding.addSkills')}</Label>
              <div className="flex gap-2">
                <Input
                  id="skills"
                  placeholder={t('onboarding.skillsPlaceholder')}
                  value={data.currentSkill}
                  onChange={(e) => setData({ ...data, currentSkill: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                />
                <Button 
                  type="button" 
                  onClick={handleAddSkill}
                  disabled={!data.currentSkill.trim() || data.skills.length >= 10}
                >
                  {t('common.add')}
                </Button>
              </div>
              
              {data.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {data.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                {data.skills.length}/10 {t('onboarding.skillsAdded')}
              </p>
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-6">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-4">
              <Label htmlFor="experience">{t('onboarding.shareExperience')}</Label>
              <Textarea
                id="experience"
                placeholder={t('onboarding.experiencePlaceholder')}
                value={data.experience}
                onChange={(e) => setData({ ...data, experience: e.target.value })}
                rows={5}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {t('onboarding.experienceHelp')}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{steps[currentStep].title}</CardTitle>
                <CardDescription>{steps[currentStep].description}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={onSkip}>
                {t('common.skip')}
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t('onboarding.step')} {currentStep + 1} {t('onboarding.of')} {steps.length}</span>
                <span>{Math.round(progress)}% {t('onboarding.complete')}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {renderStepContent()}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('common.back')}
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="mr-2">Saving...</span>
                  <span className="animate-spin">⏳</span>
                </>
              ) : currentStep === steps.length - 1 ? (
                <>
                  Finish
                  <CheckCircle className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
