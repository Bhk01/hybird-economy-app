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
  Check
} from 'lucide-react';
import { PageType, useUser } from '../App';
import { useI18n } from '../utils/i18n';

interface ProfileProps {
  onNavigate: (page: PageType) => void;
}

export function Profile({ onNavigate }: ProfileProps) {
  const { user, wallet } = useUser();
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
    avatar: ''
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
        phone: '+216 XX XXX XXX',
        location: user.location || 'Tunisia',
        avatar: user.avatar || ''
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
    rating: user?.rating || 4.8,
    reviewCount: 12,
    completedJobs: user?.completedJobs || 0,
    activeProjects: 3,
    skillCredits: wallet?.credits || 0,
    totalEarnings: user?.totalEarnings || 0,
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

  const handleSaveChanges = () => {
    if (editedData.bio.length > BIO_LIMIT) {
      toast.error(`Bio must be less than ${BIO_LIMIT} characters`);
      return;
    }

    if (usernameAvailable === false) {
      toast.error(t('profile.usernameTaken'));
      return;
    }

    // Save changes
    setOriginalData({ ...editedData });
    setHasUnsavedChanges(false);
    setIsEditing(false);
    toast.success(t('profile.saveChanges') + ' ✓');
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

  // Map user skills to profile skills with default category and level
  const skills = user?.skills && user.skills.length > 0 
    ? user.skills.map(skill => ({
        name: skill,
        level: 75,
        category: 'Skills'
      }))
    : [
        { name: 'Add your skills', level: 0, category: 'Getting Started' }
      ];

  const services = [
    { name: 'Web Development', price: '150-300 TND/project', rating: 4.9 },
    { name: 'UI/UX Design', price: '100-200 TND/project', rating: 4.8 },
    { name: 'French Tutoring', price: '25 TND/hour', rating: 5.0 },
    { name: 'Tech Consulting', price: '50 TND/hour', rating: 4.7 }
  ];

  const portfolio = [
    {
      id: 1,
      title: 'E-commerce Platform',
      type: 'Web Development',
      description: 'Full-stack e-commerce solution with React and Node.js',
      technologies: ['React', 'Node.js', 'MongoDB'],
      link: 'https://example.com'
    },
    {
      id: 2,
      title: 'Mobile Banking App Design',
      type: 'UI/UX Design',
      description: 'Complete mobile app design for a fintech startup',
      technologies: ['Figma', 'Prototyping', 'User Research'],
      link: 'https://figma.com/example'
    },
    {
      id: 3,
      title: 'Restaurant Management System',
      type: 'Web Development',
      description: 'Point of sale and inventory management system',
      technologies: ['Vue.js', 'Laravel', 'MySQL'],
      link: 'https://demo.example.com'
    }
  ];

  const reviews = [
    {
      id: 1,
      reviewer: 'Sarah B.',
      avatar: 'SB',
      rating: 5,
      date: '2 days ago',
      project: 'E-commerce Website',
      comment: 'Excellent work! Delivered exactly what we needed on time and within budget. Great communication throughout the project.'
    },
    {
      id: 2,
      reviewer: 'Mohamed K.',
      avatar: 'MK',
      rating: 5,
      date: '1 week ago',
      project: 'Logo Design',
      comment: 'Very professional and creative. The design exceeded our expectations. Highly recommend!'
    },
    {
      id: 3,
      reviewer: 'Fatma A.',
      avatar: 'FA',
      rating: 4,
      date: '2 weeks ago',
      project: 'French Lessons',
      comment: 'Great teacher! Very patient and explains concepts clearly. My French has improved significantly.'
    }
  ];

  const certifications = [
    { name: 'React Developer Certification', issuer: 'Meta', date: '2024' },
    { name: 'AWS Cloud Practitioner', issuer: 'Amazon', date: '2023' },
    { name: 'UI/UX Design Specialization', issuer: 'Google', date: '2023' }
  ];

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
                      <span>{profileData.rating}</span>
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
                        <Button size="sm" variant="outline" className="gap-2">
                          <Plus className="h-4 w-4" />
                          {t('profile.addSkill')}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {skills.map((skill, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{skill.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {skill.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{skill.level}%</span>
                            {isEditing && skill.level > 0 && (
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <Progress value={skill.level} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Services Offered */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Services I Offer</CardTitle>
                      {isEditing && (
                        <Button size="sm" variant="outline" className="gap-2">
                          <Plus className="h-4 w-4" />
                          Add Service
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {services.map((service, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="text-sm">{service.name}</h4>
                            <p className="text-xs text-muted-foreground">{service.price}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-current text-yellow-500" />
                              <span className="text-xs">{service.rating}</span>
                            </div>
                            {isEditing && (
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                <Edit className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Certifications */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Certifications</CardTitle>
                      {isEditing && (
                        <Button size="sm" variant="outline" className="gap-2">
                          <Plus className="h-4 w-4" />
                          Add Certification
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {certifications.map((cert, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <Award className="h-5 w-5 text-primary" />
                          <div className="flex-1">
                            <h4 className="text-sm">{cert.name}</h4>
                            <p className="text-xs text-muted-foreground">{cert.issuer} • {cert.date}</p>
                          </div>
                          {isEditing && (
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
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
                      {portfolio.map((project) => (
                        <Card key={project.id} className="overflow-hidden">
                          <div className="aspect-video bg-muted flex items-center justify-center">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-sm">{project.title}</h4>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                            <Badge variant="outline" className="text-xs mb-2">
                              {project.type}
                            </Badge>
                            <p className="text-xs text-muted-foreground mb-3">
                              {project.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {project.technologies.map((tech, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
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
                    {reviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{review.avatar}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="text-sm">{review.reviewer}</h4>
                                <p className="text-xs text-muted-foreground">{review.project}</p>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1 mb-1">
                                  {Array.from({ length: review.rating }).map((_, i) => (
                                    <Star key={i} className="h-3 w-3 fill-current text-yellow-500" />
                                  ))}
                                </div>
                                <p className="text-xs text-muted-foreground">{review.date}</p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
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
