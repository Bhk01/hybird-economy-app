import React, { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { 
  User,
  Star,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Edit,
  Shield,
  Award,
  TrendingUp,
  Users,
  RefreshCw,
  CheckCircle,
  Upload,
  Plus,
  X,
  Camera,
  FileText,
  ExternalLink,
  Loader2,
  AlertCircle,
  Check,
  Briefcase,
  GraduationCap,
  DollarSign
} from 'lucide-react';
import { PageType, useUser } from '../App';
import { useI18n } from '../utils/i18n';
import { userApi, Certification, Service, JobExperience, StudyExperience } from '../utils/api';

interface ProfileProps {
  onNavigate: (page: PageType) => void;
}

export function Profile({ onNavigate }: ProfileProps) {
  const { user, wallet, setUser } = useUser();
  const { t } = useI18n();
  const handleLogout = () => {
    onNavigate('landing');
  };
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'reviews' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  
  // Editable form state
  const [editedData, setEditedData] = useState({
    name: '',
    username: '',
    bio: '',
    email: '',
    phone: '',
    location: '',
    avatar: '',
    skills: [] as string[],
    jobExperiences: [] as JobExperience[],
    studyExperiences: [] as StudyExperience[],
    certifications: [] as Certification[], // New field
    servicesOffered: [] as Service[], // New field
  });
  
  const [originalData, setOriginalData] = useState({ ...editedData });
  
  // Initialize editable fields when user data changes
  useEffect(() => {
    if (user) {
      const initialData = {
        name: user.name || 'User',
        username: user.email?.split('@')[0] || 'user',
        bio: user.bio || 'Welcome to Work & Invest! I\'m excited to collaborate with talented professionals.',
        email: user.email || '',
        phone: '+216 XX XXX XXX', // Placeholder, as phone is not in UserProfile
        location: user.location || 'Tunisia',
        avatar: user.avatar || '',
        skills: user.skills || [],
        jobExperiences: user.jobExperiences || [],
        studyExperiences: user.studyExperiences || [],
        certifications: user.certifications || [], // Initialize new field
        servicesOffered: user.servicesOffered || [], // Initialize new field
      };
      setEditedData(initialData);
      setOriginalData(initialData);
    }
  }, [user]);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(editedData) !== JSON.stringify(originalData);
    setHasUnsavedChanges(hasChanges);
  }, [editedData, originalData]);

  // Use actual user data from context
  const profileData = {
    name: editedData.name,
    title: 'Work & Invest Member',
    location: editedData.location,
    joinedDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently',
    rating: user?.rating || 0, // Dynamically set from user context
    reviewCount: 0, // Set to 0 for new users, would be dynamic from reviews API
    completedJobs: user?.completedJobs || 0, // Dynamically set from user context
    activeProjects: 0, // Set to 0 for new users, would be dynamic from jobs/projects API
    skillCredits: wallet?.credits || 0, // Dynamically set from wallet context
    totalEarnings: user?.totalEarnings || 0, // Dynamically set from user context
    bio: editedData.bio,
    phone: editedData.phone,
    email: editedData.email,
    verified: true,
    responseTime: '< 2 hours'
  };

  const BIO_LIMIT = 1000;
  const bioCharsRemaining = BIO_LIMIT - editedData.bio.length;

  // Check username availability
  const checkUsernameAvailability = async (username: string) => {
    if (username === originalData.username) {
      setUsernameAvailable(null);
      return;
    }
    
    setCheckingUsername(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    // Simple validation - in real app, check against database
    const isTaken = ['admin', 'user', 'test'].includes(username.toLowerCase());
    setUsernameAvailable(!isTaken);
    setCheckingUsername(false);
  };

  useEffect(() => {
    if (editedData.username && editedData.username.length >= 3) {
      const timeout = setTimeout(() => {
        checkUsernameAvailability(editedData.username);
      }, 500);
      return () => clearTimeout(timeout);
    } else {
      setUsernameAvailable(null);
    }
  }, [editedData.username]);

  const handleSaveChanges = async () => {
    if (editedData.bio.length > BIO_LIMIT) {
      toast.error(t('profile.bioTooLong', { limit: BIO_LIMIT }));
      return;
    }

    if (usernameAvailable === false) {
      toast.error(t('profile.usernameTaken'));
      return;
    }

    try {
      const updatedProfile = await userApi.updateProfile(user!.id, {
        name: editedData.name,
        // username: editedData.username, // Username update logic would be more complex in a real app
        bio: editedData.bio,
        // email: editedData.email, // Email update usually requires re-verification
        location: editedData.location,
        // avatar: editedData.avatar,
        skills: editedData.skills,
        jobExperiences: editedData.jobExperiences,
        studyExperiences: editedData.studyExperiences,
        certifications: editedData.certifications, // Save new field
        servicesOffered: editedData.servicesOffered, // Save new field
      });
      setUser(updatedProfile.profile); // Update user context
      setOriginalData({ ...editedData });
      setHasUnsavedChanges(false);
      setIsEditing(false);
      toast.success(t('profile.saveChangesSuccess'));
    } catch (error) {
      console.error('Failed to save profile changes:', error);
      toast.error(t('profile.saveChangesError'));
    }
  };

  const handleCancelEditing = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
    } else {
      setEditedData({ ...originalData });
      setIsEditing(false);
    }
  };

  const confirmCancelEditing = () => {
    setEditedData({ ...originalData });
    setHasUnsavedChanges(false);
    setIsEditing(false);
    setShowUnsavedDialog(false);
  };

  const handleTabChange = (newTab: string) => {
    if (hasUnsavedChanges && isEditing) {
      setPendingTab(newTab);
      setShowUnsavedDialog(true);
    } else {
      setActiveTab(newTab as any);
    }
  };

  const confirmTabChange = () => {
    setEditedData({ ...originalData });
    setHasUnsavedChanges(false);
    setIsEditing(false);
    if (pendingTab) {
      setActiveTab(pendingTab as any);
      setPendingTab(null);
    }
    setShowUnsavedDialog(false);
  };

  const handlePhotoUpload = () => {
    // In a real app, this would open a file picker and handle upload
    toast.info('Photo upload coming soon! This would open a file picker with crop and compression options.');
  };

  // Add/Remove Skill
  const [currentSkillInput, setCurrentSkillInput] = useState('');
  const handleAddSkill = () => {
    if (currentSkillInput.trim() && !editedData.skills.includes(currentSkillInput.trim())) {
      setEditedData(prev => ({ ...prev, skills: [...prev.skills, currentSkillInput.trim()] }));
      setCurrentSkillInput('');
    }
  };
  const handleRemoveSkill = (skillToRemove: string) => {
    setEditedData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };

  // Add/Remove Job Experience
  const [newJobExp, setNewJobExp] = useState<Omit<JobExperience, 'id'>>({ title: '', company: '', startDate: '', endDate: null, description: '' });
  const handleAddJobExperience = () => {
    if (newJobExp.title && newJobExp.company && newJobExp.startDate) {
      setEditedData(prev => ({ ...prev, jobExperiences: [...prev.jobExperiences, { ...newJobExp, id: generateId() }] }));
      setNewJobExp({ title: '', company: '', startDate: '', endDate: null, description: '' });
    } else {
      toast.error(t('onboarding.jobExperienceRequiredFields'));
    }
  };
  const handleRemoveJobExperience = (id: string) => {
    setEditedData(prev => ({ ...prev, jobExperiences: prev.jobExperiences.filter(exp => exp.id !== id) }));
  };

  // Add/Remove Study Experience
  const [newStudyExp, setNewStudyExp] = useState<Omit<StudyExperience, 'id'>>({ degree: '', institution: '', startDate: '', endDate: null, description: '' });
  const handleAddStudyExperience = () => {
    if (newStudyExp.degree && newStudyExp.institution && newStudyExp.startDate) {
      setEditedData(prev => ({ ...prev, studyExperiences: [...prev.studyExperiences, { ...newStudyExp, id: generateId() }] }));
      setNewStudyExp({ degree: '', institution: '', startDate: '', endDate: null, description: '' });
    } else {
      toast.error(t('onboarding.studyExperienceRequiredFields'));
    }
  };
  const handleRemoveStudyExperience = (id: string) => {
    setEditedData(prev => ({ ...prev, studyExperiences: prev.studyExperiences.filter(exp => exp.id !== id) }));
  };

  // Add/Remove Certification
  const [newCert, setNewCert] = useState<Omit<Certification, 'id'>>({ name: '', issuer: '', date: '' });
  const handleAddCertification = () => {
    if (newCert.name && newCert.issuer && newCert.date) {
      setEditedData(prev => ({ ...prev, certifications: [...prev.certifications, { ...newCert, id: generateId() }] }));
      setNewCert({ name: '', issuer: '', date: '' });
    } else {
      toast.error(t('profile.certificationRequiredFields'));
    }
  };
  const handleRemoveCertification = (id: string) => {
    setEditedData(prev => ({ ...prev, certifications: prev.certifications.filter(cert => cert.id !== id) }));
  };

  // Add/Remove Service
  const [newService, setNewService] = useState<Omit<Service, 'id'>>({ name: '', price: '', rating: 0 });
  const handleAddService = () => {
    if (newService.name && newService.price) {
      setEditedData(prev => ({ ...prev, servicesOffered: [...prev.servicesOffered, { ...newService, id: generateId() }] }));
      setNewService({ name: '', price: '', rating: 0 });
    } else {
      toast.error(t('profile.serviceRequiredFields'));
    }
  };
  const handleRemoveService = (id: string) => {
    setEditedData(prev => ({ ...prev, servicesOffered: prev.servicesOffered.filter(service => service.id !== id) }));
  };

  // Helper to generate unique IDs (mocked for frontend)
  function generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage="profile" onNavigate={onNavigate} onLogout={handleLogout} />
      
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Profile Sidebar */}
            <div className="lg:w-80">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  {/* Profile Header */}
                  <div className="text-center mb-6">
                    <div className="relative inline-block">
                      <Avatar className="h-24 w-24 mx-auto mb-3">
                        <AvatarFallback className="text-2xl">
                          {user ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                        </AvatarFallback>
                        {editedData.avatar && <AvatarImage src={editedData.avatar} />}
                      </Avatar>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0"
                        onClick={handlePhotoUpload}
                        title={t('profile.changePhoto')}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <h2 className="text-xl">{profileData.name}</h2>
                      {profileData.verified && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">{profileData.title}</p>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4" />
                      {profileData.location}
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Star className="h-4 w-4 fill-current text-yellow-500" />
                      <span>{profileData.rating.toFixed(1)}</span> {/* Use dynamic rating */}
                      <span className="text-muted-foreground">({profileData.reviewCount} reviews)</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant={isEditing ? "outline" : "default"}
                        size="sm" 
                        onClick={() => isEditing ? handleCancelEditing() : setIsEditing(true)}
                        className="gap-2 flex-1"
                      >
                        {isEditing ? (
                          <>
                            <X className="h-4 w-4" />
                            {t('common.cancel')}
                          </>
                        ) : (
                          <>
                            <Edit className="h-4 w-4" />
                            {t('profile.editProfile')}
                          </>
                        )}
                      </Button>
                      {isEditing && (
                        <Button 
                          size="sm" 
                          onClick={handleSaveChanges}
                          disabled={!hasUnsavedChanges || checkingUsername || usernameAvailable === false}
                          className="gap-2 flex-1"
                        >
                          <Check className="h-4 w-4" />
                          {t('common.save')}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-2xl text-primary">{profileData.completedJobs}</p>
                      <p className="text-xs text-muted-foreground">Completed Jobs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl text-green-500">{profileData.totalEarnings}</p>
                      <p className="text-xs text-muted-foreground">Total Earnings (TND)</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl text-blue-500">{profileData.activeProjects}</p>
                      <p className="text-xs text-muted-foreground">Active Projects</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl text-purple-500">{profileData.skillCredits}</p>
                      <p className="text-xs text-muted-foreground">Skill Credits</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{profileData.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{profileData.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Joined {profileData.joinedDate}</span>
                    </div>
                  </div>

                  {/* Navigation Tabs */}
                  <TabsList className="grid w-full grid-cols-2 mt-6">
                    <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                    <TabsTrigger value="portfolio" className="text-xs">Portfolio</TabsTrigger>
                  </TabsList>
                  <TabsList className="grid w-full grid-cols-2 mt-2">
                    <TabsTrigger value="reviews" className="text-xs">Reviews</TabsTrigger>
                    <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
                  </TabsList>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <TabsContent value="overview" className="space-y-6">
                {/* Bio Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>About Me</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editedData.bio}
                          onChange={(e) => {
                            if (e.target.value.length <= BIO_LIMIT) {
                              setEditedData({ ...editedData, bio: e.target.value });
                            }
                          }}
                          rows={6}
                          placeholder="Tell people about yourself, your experience, and what you're passionate about..."
                          className={bioCharsRemaining < 0 ? 'border-red-500' : ''}
                        />
                        <div className="flex justify-between text-xs">
                          <span className={bioCharsRemaining < 100 ? 'text-orange-500' : 'text-muted-foreground'}>
                            {bioCharsRemaining} {t('profile.bioLimit')}
                          </span>
                          <span className="text-muted-foreground">
                            {editedData.bio.length} / {BIO_LIMIT}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground whitespace-pre-wrap">{profileData.bio}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Skills Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Skills & Expertise</CardTitle>
                      {isEditing && (
                        <div className="flex gap-2">
                          <Input
                            placeholder={t('profile.addSkillPlaceholder')}
                            value={currentSkillInput}
                            onChange={(e) => setCurrentSkillInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                            className="h-8 w-40"
                          />
                          <Button size="sm" onClick={handleAddSkill} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {t('common.add')}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editedData.skills.length === 0 ? (
                      <p className="text-muted-foreground text-sm">{t('profile.noSkillsAdded')}</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {editedData.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-sm">
                            {skill}
                            {isEditing && (
                              <button
                                onClick={() => handleRemoveSkill(skill)}
                                className="ml-1 text-muted-foreground hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Job Experiences */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{t('profile.jobExperienceTitle')}</CardTitle>
                      {isEditing && (
                        <Button size="sm" variant="outline" className="gap-2" onClick={handleAddJobExperience}>
                          <Plus className="h-4 w-4" />
                          {t('profile.addExperience')}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editedData.jobExperiences.length === 0 ? (
                      <p className="text-muted-foreground text-sm">{t('profile.noJobExperience')}</p>
                    ) : (
                      editedData.jobExperiences.map((exp) => (
                        <div key={exp.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <Briefcase className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">{exp.title} at {exp.company}</h4>
                            <p className="text-xs text-muted-foreground">
                              {exp.startDate} - {exp.endDate || t('onboarding.current')}
                            </p>
                            {exp.description && <p className="text-sm text-muted-foreground mt-1">{exp.description}</p>}
                          </div>
                          {isEditing && (
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleRemoveJobExperience(exp.id)}>
                              <X className="h-3 w-3 text-destructive" />
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Study Experiences */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{t('profile.studyExperienceTitle')}</CardTitle>
                      {isEditing && (
                        <Button size="sm" variant="outline" className="gap-2" onClick={handleAddStudyExperience}>
                          <Plus className="h-4 w-4" />
                          {t('profile.addEducation')}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editedData.studyExperiences.length === 0 ? (
                      <p className="text-muted-foreground text-sm">{t('profile.noStudyExperience')}</p>
                    ) : (
                      editedData.studyExperiences.map((exp) => (
                        <div key={exp.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <GraduationCap className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">{exp.degree} at {exp.institution}</h4>
                            <p className="text-xs text-muted-foreground">
                              {exp.startDate} - {exp.endDate || t('onboarding.current')}
                            </p>
                            {exp.description && <p className="text-sm text-muted-foreground mt-1">{exp.description}</p>}
                          </div>
                          {isEditing && (
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleRemoveStudyExperience(exp.id)}>
                              <X className="h-3 w-3 text-destructive" />
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Services Offered */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{t('profile.servicesOfferedTitle')}</CardTitle>
                      {isEditing && (
                        <Button size="sm" variant="outline" className="gap-2" onClick={handleAddService}>
                          <Plus className="h-4 w-4" />
                          {t('profile.addService')}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {editedData.servicesOffered.length === 0 ? (
                        <p className="text-muted-foreground text-sm">{t('profile.noServicesOffered')}</p>
                      ) : (
                        editedData.servicesOffered.map((service) => (
                          <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <h4 className="text-sm">{service.name}</h4>
                              <p className="text-xs text-muted-foreground">{service.price}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-current text-yellow-500" />
                                <span className="text-xs">{service.rating.toFixed(1)}</span>
                              </div>
                              {isEditing && (
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleRemoveService(service.id)}>
                                  <X className="h-3 w-3 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Certifications */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{t('profile.certificationsTitle')}</CardTitle>
                      {isEditing && (
                        <Button size="sm" variant="outline" className="gap-2" onClick={handleAddCertification}>
                          <Plus className="h-4 w-4" />
                          {t('profile.addCertification')}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {editedData.certifications.length === 0 ? (
                        <p className="text-muted-foreground text-sm">{t('profile.noCertifications')}</p>
                      ) : (
                        editedData.certifications.map((cert) => (
                          <div key={cert.id} className="flex items-center gap-3 p-3 border rounded-lg">
                            <Award className="h-5 w-5 text-primary" />
                            <div className="flex-1">
                              <h4 className="text-sm">{cert.name}</h4>
                              <p className="text-xs text-muted-foreground">{cert.issuer} • {cert.date}</p>
                            </div>
                            {isEditing && (
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleRemoveCertification(cert.id)}>
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="portfolio" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>My Portfolio</CardTitle>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Project
                      </Button>
                    </div>
                    <CardDescription>
                      Showcase your best work and achievements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Placeholder for portfolio items */}
                      <Card className="overflow-hidden">
                        <div className="aspect-video bg-muted flex items-center justify-center">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm">E-commerce Platform</h4>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                          <Badge variant="outline" className="text-xs mb-2">
                            Web Development
                          </Badge>
                          <p className="text-xs text-muted-foreground mb-3">
                            Full-stack e-commerce solution with React and Node.js
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">React</Badge>
                            <Badge variant="secondary" className="text-xs">Node.js</Badge>
                            <Badge variant="secondary" className="text-xs">MongoDB</Badge>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="overflow-hidden">
                        <div className="aspect-video bg-muted flex items-center justify-center">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm">Mobile Banking App Design</h4>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                          <Badge variant="outline" className="text-xs mb-2">
                            UI/UX Design
                          </Badge>
                          <p className="text-xs text-muted-foreground mb-3">
                            Complete mobile app design for a fintech startup
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">Figma</Badge>
                            <Badge variant="secondary" className="text-xs">Prototyping</Badge>
                            <Badge variant="secondary" className="text-xs">User Research</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Reviews & Feedback</CardTitle>
                    <CardDescription>
                      What clients say about working with me
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Placeholder for reviews */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>SB</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="text-sm">Sarah B.</h4>
                              <p className="text-xs text-muted-foreground">E-commerce Website</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 mb-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className="h-3 w-3 fill-current text-yellow-500" />
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground">2 days ago</p>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">Excellent work! Delivered exactly what we needed on time and within budget. Great communication throughout the project.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account preferences and security
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">{t('profile.fullName')}</Label>
                        <Input 
                          id="name" 
                          value={editedData.name} 
                          onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="username">{t('profile.username')}</Label>
                        <div className="relative">
                          <Input 
                            id="username" 
                            value={editedData.username}
                            onChange={(e) => setEditedData({ ...editedData, username: e.target.value })}
                            disabled={!isEditing}
                            className={
                              isEditing && editedData.username !== originalData.username
                                ? usernameAvailable === true ? 'border-green-500' : usernameAvailable === false ? 'border-red-500' : ''
                                : ''
                            }
                          />
                          {isEditing && editedData.username && editedData.username !== originalData.username && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {checkingUsername ? (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              ) : usernameAvailable === true ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : usernameAvailable === false ? (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              ) : null}
                            </div>
                          )}
                        </div>
                        {isEditing && usernameAvailable !== null && editedData.username !== originalData.username && (
                          <p className={`text-xs mt-1 ${usernameAvailable ? 'text-green-600' : 'text-red-600'}`}>
                            {usernameAvailable ? t('profile.usernameAvailable') : t('profile.usernameTaken')}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="email">{t('auth.email')}</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={editedData.email}
                          onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">{t('profile.phone')}</Label>
                        <Input 
                          id="phone" 
                          value={editedData.phone}
                          onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">{t('profile.location')}</Label>
                        <Input 
                          id="location" 
                          value={editedData.location}
                          onChange={(e) => setEditedData({ ...editedData, location: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h4 className="text-sm mb-4">Security & Verification</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm">Identity Verification</p>
                            <p className="text-xs text-muted-foreground">Verify your identity to build trust</p>
                          </div>
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm">Two-Factor Authentication</p>
                            <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                          </div>
                          <Button size="sm" variant="outline">Enable</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              {t('profile.unsavedChanges')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowUnsavedDialog(false);
              setPendingTab(null);
            }}>
              Stay on Page
            </AlertDialogCancel>
            <AlertDialogAction onClick={pendingTab ? confirmTabChange : confirmCancelEditing}>
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}