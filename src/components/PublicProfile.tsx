import React, { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { 
  User,
  Star,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Shield,
  Award,
  TrendingUp,
  Users,
  RefreshCw,
  CheckCircle,
  Briefcase,
  GraduationCap,
  DollarSign,
  MessageSquare,
  Flag,
  Ban,
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { PageType, useUser } from '../App';
import { useI18n } from '../utils/i18n';
import { userApi, Review, reviewsApi, UserProfile } from '../utils/api';

interface PublicProfileProps {
  userId: string;
  onNavigate: (page: PageType, userId?: string) => void;
}

export function PublicProfile({ userId, onNavigate }: PublicProfileProps) {
  const { user: currentUser } = useUser(); // The logged-in user
  const { t } = useI18n();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await userApi.getProfile(userId);
        if (response.profile) {
          setProfile(response.profile);
        } else {
          setError(t('publicProfile.profileNotFound'));
        }
      } catch (err: any) {
        console.error('Failed to fetch public profile:', err);
        setError(err.message || t('publicProfile.fetchError'));
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId, t]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl mb-2">{t('common.error')}</h2>
        <p className="text-muted-foreground text-center">{error}</p>
        <Button onClick={() => onNavigate('dashboard')} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.backToDashboard')}
        </Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl mb-2">{t('publicProfile.profileNotFound')}</h2>
        <p className="text-muted-foreground text-center">{t('publicProfile.profileUnavailable')}</p>
        <Button onClick={() => onNavigate('dashboard')} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.backToDashboard')}
        </Button>
      </div>
    );
  }

  const handleBlockUser = async () => {
    if (!currentUser) {
      toast.error(t('publicProfile.loginToBlock'));
      return;
    }
    if (window.confirm(t('publicProfile.confirmBlock', { userName: profile.name }))) {
      try {
        const response = await userApi.blockUser(profile.id, currentUser.id);
        if (response.success) {
          toast.success(t('publicProfile.blockSuccess', { userName: profile.name }));
          onNavigate('dashboard'); // Redirect after blocking
        } else {
          toast.error(response.error || t('publicProfile.blockError'));
        }
      } catch (err: any) {
        toast.error(err.message || t('publicProfile.blockError'));
      }
    }
  };

  const handleReportUser = async () => {
    if (!currentUser) {
      toast.error(t('publicProfile.loginToReport'));
      return;
    }
    if (!reportReason) {
      toast.error(t('publicProfile.selectReportReason'));
      return;
    }
    try {
      const response = await userApi.reportUser(profile.id, currentUser.id, reportReason);
      if (response.success) {
        toast.success(t('publicProfile.reportSuccess', { userName: profile.name }));
        setShowReportDialog(false);
        setReportReason('');
      } else {
        toast.error(response.error || t('publicProfile.reportError'));
      }
    } catch (err: any) {
      toast.error(err.message || t('publicProfile.reportError'));
    }
  };

  const handleAddReview = async () => {
    if (!currentUser) {
      toast.error(t('publicProfile.loginToAddReview'));
      return;
    }
    if (currentUser.id === profile.id) {
      toast.error(t('publicProfile.cannotReviewSelf'));
      return;
    }
    if (reviewRating === 0 || !reviewComment.trim()) {
      toast.error(t('publicProfile.reviewRequiredFields'));
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await reviewsApi.addReview(profile.id, currentUser.id, reviewRating, reviewComment);
      if (response.success) {
        toast.success(t('publicProfile.reviewSuccess'));
        setShowReviewDialog(false);
        setReviewRating(0);
        setReviewComment('');
        // Refresh profile to show new review and updated rating
        const updatedProfileResponse = await userApi.getProfile(profile.id);
        if (updatedProfileResponse.profile) {
          setProfile(updatedProfileResponse.profile);
        }
      } else {
        toast.error(response.error || t('publicProfile.reviewError'));
      }
    } catch (err: any) {
      toast.error(err.message || t('publicProfile.reviewError'));
    } finally {
      setSubmittingReview(false);
    }
  };

  const profileData = {
    name: profile.name,
    title: 'Work & Invest Member',
    location: profile.location,
    joinedDate: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently',
    rating: profile.rating || 0,
    reviewCount: profile.reviews?.length || 0,
    completedJobs: profile.completedJobs || 0,
    activeProjects: 0, // Placeholder, would be dynamic
    skillCredits: 0, // Placeholder, would be dynamic
    totalEarnings: profile.totalEarnings || 0,
    bio: profile.bio,
    phone: '+216 XX XXX XXX', // Placeholder
    email: profile.email,
    verified: true,
    responseTime: '< 2 hours'
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage="dashboard" onNavigate={onNavigate} /> {/* Using dashboard as a placeholder for current page */}
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Profile Sidebar */}
          <div className="lg:w-80">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                {/* Profile Header */}
                <div className="text-center mb-6">
                  <Avatar className="h-24 w-24 mx-auto mb-3">
                    <AvatarFallback className="text-2xl">
                      {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                    {profile.avatar && <AvatarImage src={profile.avatar} />}
                  </Avatar>
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
                    <span>{profileData.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({profileData.reviewCount} reviews)</span>
                  </div>
                  
                  {/* Interaction Buttons */}
                  {currentUser?.id !== profile.id && (
                    <div className="flex flex-col gap-2">
                      <Button className="gap-2" onClick={() => toast.info(t('publicProfile.chatFeatureComingSoon'))}>
                        <MessageSquare className="h-4 w-4" />
                        {t('publicProfile.message')}
                      </Button>
                      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="gap-2">
                            <Star className="h-4 w-4" />
                            {t('publicProfile.addReview')}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{t('publicProfile.addReviewFor', { userName: profile.name })}</DialogTitle>
                            <DialogDescription>{t('publicProfile.shareExperience')}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>{t('publicProfile.yourRating')}</Label>
                              <div className="flex gap-1 mt-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-6 w-6 cursor-pointer ${reviewRating >= star ? 'fill-current text-yellow-500' : 'text-muted-foreground'}`}
                                    onClick={() => setReviewRating(star)}
                                  />
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="review-comment">{t('publicProfile.yourComment')}</Label>
                              <Textarea
                                id="review-comment"
                                placeholder={t('publicProfile.commentPlaceholder')}
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                rows={4}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>{t('common.cancel')}</Button>
                            <Button onClick={handleAddReview} disabled={submittingReview}>
                              {submittingReview && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                              {t('common.submit')}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" className="gap-2 text-destructive hover:text-destructive">
                            <Flag className="h-4 w-4" />
                            {t('publicProfile.reportUser')}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{t('publicProfile.reportUserFor', { userName: profile.name })}</DialogTitle>
                            <DialogDescription>{t('publicProfile.reportReasonDesc')}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="report-reason">{t('publicProfile.reason')}</Label>
                              <Select value={reportReason} onValueChange={setReportReason}>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('publicProfile.selectReason')} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="spam">{t('publicProfile.reasonSpam')}</SelectItem>
                                  <SelectItem value="harassment">{t('publicProfile.reasonHarassment')}</SelectItem>
                                  <SelectItem value="fraud">{t('publicProfile.reasonFraud')}</SelectItem>
                                  <SelectItem value="other">{t('publicProfile.reasonOther')}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowReportDialog(false)}>{t('common.cancel')}</Button>
                            <Button variant="destructive" onClick={handleReportUser}>{t('publicProfile.submitReport')}</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" className="gap-2 text-destructive hover:text-destructive" onClick={handleBlockUser}>
                        <Ban className="h-4 w-4" />
                        {t('publicProfile.blockUser')}
                      </Button>
                    </div>
                  )}
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
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Bio Section */}
            <Card>
              <CardHeader>
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{profileData.bio}</p>
              </CardContent>
            </Card>

            {/* Skills Section */}
            <Card>
              <CardHeader>
                <CardTitle>Skills & Expertise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.skills?.length === 0 ? (
                  <p className="text-muted-foreground text-sm">{t('profile.noSkillsAdded')}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills?.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Experiences */}
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.jobExperienceTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.jobExperiences?.length === 0 ? (
                  <p className="text-muted-foreground text-sm">{t('profile.noJobExperience')}</p>
                ) : (
                  profile.jobExperiences?.map((exp) => (
                    <div key={exp.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Briefcase className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{exp.title} at {exp.company}</h4>
                        <p className="text-xs text-muted-foreground">
                          {exp.startDate} - {exp.endDate || t('onboarding.current')}
                        </p>
                        {exp.description && <p className="text-sm text-muted-foreground mt-1">{exp.description}</p>}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Study Experiences */}
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.studyExperienceTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.studyExperiences?.length === 0 ? (
                  <p className="text-muted-foreground text-sm">{t('profile.noStudyExperience')}</p>
                ) : (
                  profile.studyExperiences?.map((exp) => (
                    <div key={exp.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <GraduationCap className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{exp.degree} at {exp.institution}</h4>
                        <p className="text-xs text-muted-foreground">
                          {exp.startDate} - {exp.endDate || t('onboarding.current')}
                        </p>
                        {exp.description && <p className="text-sm text-muted-foreground mt-1">{exp.description}</p>}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Services Offered */}
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.servicesOfferedTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {profile.servicesOffered?.length === 0 ? (
                    <p className="text-muted-foreground text-sm">{t('profile.noServicesOffered')}</p>
                  ) : (
                    profile.servicesOffered?.map((service) => (
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
                <CardTitle>{t('profile.certificationsTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.certifications?.length === 0 ? (
                    <p className="text-muted-foreground text-sm">{t('profile.noCertifications')}</p>
                  ) : (
                    profile.certifications?.map((cert) => (
                      <div key={cert.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Award className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <h4 className="text-sm">{cert.name}</h4>
                          <p className="text-xs text-muted-foreground">{cert.issuer} • {cert.date}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews for {profile.name}</CardTitle>
                <CardDescription>
                  What others say about working with {profile.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.reviews?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>{t('profile.noReviewsYet')}</p>
                    <p className="text-sm">{t('profile.noReviewsDesc')}</p>
                  </div>
                ) : (
                  profile.reviews?.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{review.reviewerId.substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="text-sm">User {review.reviewerId.substring(0,8)}</h4>
                              <p className="text-xs text-muted-foreground">Reviewed on {new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 mb-1">
                                {Array.from({ length: review.rating }).map((_, i) => (
                                  <Star key={i} className="h-3 w-3 fill-current text-yellow-500" />
                                ))}
                                {Array.from({ length: 5 - review.rating }).map((_, i) => (
                                  <Star key={i} className="h-3 w-3 text-muted-foreground" />
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}