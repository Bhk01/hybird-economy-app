import React, { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { 
  Search,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Filter,
  Plus,
  Users,
  Code,
  Paintbrush,
  Camera,
  PenTool,
  Megaphone,
  TrendingUp,
  Loader2,
  Send
} from 'lucide-react';
import { PageType, useUser } from '../App';
import { Job, jobsApi } from '../utils/api';

interface HireModeProps {
  onNavigate: (page: PageType, userId?: string) => void;
}

export function HireMode({ onNavigate }: HireModeProps) {
  const handleLogout = () => {
    // Navigate back to landing for logout
    onNavigate('landing');
  };
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'browse' | 'my-jobs' | 'post-job'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form states
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobBudget, setJobBudget] = useState('');
  const [jobDeadline, setJobDeadline] = useState('');
  const [jobSkills, setJobSkills] = useState('');

  const categories = [
    { name: 'Development', icon: Code, count: 0 },
    { name: 'Design', icon: Paintbrush, count: 0 },
    { name: 'Photography', icon: Camera, count: 0 },
    { name: 'Writing', icon: PenTool, count: 0 },
    { name: 'Marketing', icon: Megaphone, count: 0 },
    { name: 'Business', icon: TrendingUp, count: 0 }
  ];

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      const response = await jobsApi.getAllJobs();
      setJobs(response.jobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateJob = async () => {
    if (!user || !jobTitle || !jobDescription || !jobBudget) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const budgetNumber = parseFloat(jobBudget);
      if (isNaN(budgetNumber) || budgetNumber <= 0) {
        toast.error('Please enter a valid budget amount');
        return;
      }

      await jobsApi.createJob({
        title: jobTitle,
        description: jobDescription,
        budget: budgetNumber,
        deadline: jobDeadline,
        skills: jobSkills.split(',').map(s => s.trim()).filter(s => s),
        employerId: user.id
      });

      toast.success('Job posted successfully!');
      setIsDialogOpen(false);
      
      // Reset form
      setJobTitle('');
      setJobDescription('');
      setJobBudget('');
      setJobDeadline('');
      setJobSkills('');
      
      // Reload jobs
      loadJobs();
      setActiveTab('my-jobs');
    } catch (error) {
      console.error('Failed to create job:', error);
      toast.error('Failed to create job posting');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyToJob = async (jobId: string) => {
    if (!user) {
      toast.error('Please log in to apply');
      return;
    }

    try {
      await jobsApi.applyToJob(jobId, {
        freelancerId: user.id,
        proposal: 'I am interested in this position and would like to discuss the requirements further.',
      });
      
      toast.success('Application submitted successfully!');
      loadJobs(); // Reload to see updated applicant count
    } catch (error) {
      console.error('Failed to apply to job:', error);
      toast.error('Failed to submit application');
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const myJobs = jobs.filter(job => job.employerId === user?.id);
  const jobsIAppliedTo = jobs.filter(job => 
    job.applicants.some(app => app.freelancerId === user?.id)
  );

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just posted';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return time.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500 bg-green-500/10';
      case 'in-progress': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-yellow-500 bg-yellow-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage="hire" onNavigate={onNavigate} onLogout={handleLogout} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl mb-2">Hire Mode</h1>
            <p className="text-muted-foreground">
              Find skilled professionals for your projects or browse available opportunities
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Post a Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Post a New Job</DialogTitle>
                <DialogDescription>
                  Create a detailed job posting to find the right professional
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="job-title">Job Title*</Label>
                  <Input 
                    id="job-title" 
                    placeholder="e.g., Website Development, Logo Design..." 
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget">Budget (TND)*</Label>
                    <Input 
                      id="budget" 
                      type="number" 
                      placeholder="e.g., 500" 
                      value={jobBudget}
                      onChange={(e) => setJobBudget(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input 
                      id="deadline" 
                      type="date" 
                      value={jobDeadline}
                      onChange={(e) => setJobDeadline(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Job Description*</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe your project requirements, deliverables, and any specific skills needed..."
                    rows={4}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="skills">Required Skills (comma-separated)</Label>
                  <Input 
                    id="skills" 
                    placeholder="e.g., React, Photoshop, Content Writing..." 
                    value={jobSkills}
                    onChange={(e) => setJobSkills(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateJob}
                    disabled={isSubmitting}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {isSubmitting ? 'Posting...' : 'Post Job'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

  <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as any)}>
          <TabsList>
            <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
            <TabsTrigger value="my-jobs">My Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search jobs, skills, or keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <div>
              <h3 className="text-lg mb-4">Browse by Category</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4 text-center">
                        <Icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="text-sm">{category.name}</p>
                        <p className="text-xs text-muted-foreground">{category.count} jobs</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Job Listings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg">Available Jobs</h3>
                <p className="text-sm text-muted-foreground">{filteredJobs.length} jobs found</p>
              </div>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredJobs.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg mb-2">No jobs found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery ? 'Try different search terms or clear filters.' : 'Be the first to post a job!'}
                    </p>
                    {!searchQuery && (
                      <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Post the First Job
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg">{job.title}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {job.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formatTimeAgo(job.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {job.applicants.length} applicant{job.applicants.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{job.description}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {job.skills.map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-green-600">
                            <DollarSign className="h-4 w-4" />
                            {job.budget} TND
                          </span>
                          {job.deadline && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Due {new Date(job.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleApplyToJob(job.id)}
                            disabled={job.applicants.some(app => app.freelancerId === user?.id)}
                          >
                            {job.applicants.some(app => app.freelancerId === user?.id) ? 'Applied' : 'Apply Now'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onNavigate('publicProfile', job.employerId)}
                          >
                            View Employer
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="my-jobs" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg">My Job Postings</h3>
                <p className="text-sm text-muted-foreground">{myJobs.length} active posting{myJobs.length !== 1 ? 's' : ''}</p>
              </div>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : myJobs.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg mb-2">No job postings yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first job posting to start hiring talented professionals.
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Post Your First Job
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                myJobs.map((job) => (
                  <Card key={job.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg">{job.title}</h3>
                            <Badge className={getStatusColor(job.status)}>
                              {job.status.replace('-', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Posted {formatTimeAgo(job.createdAt)}
                            </span>
                            <span className="flex items-center gap-1 text-green-600">
                              <DollarSign className="h-4 w-4" />
                              {job.budget} TND
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {job.applicants.length} applicant{job.applicants.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{job.description}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {job.skills.map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          {job.deadline && (
                            <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">View Applicants</Button>
                          {job.applicants.length > 0 && job.status === 'open' && (
                            <Button size="sm">Select Freelancer</Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}

              {/* Jobs I Applied To */}
              {jobsIAppliedTo.length > 0 && (
                <div className="space-y-4 pt-6 border-t">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg">Jobs I Applied To</h3>
                    <p className="text-sm text-muted-foreground">{jobsIAppliedTo.length} application{jobsIAppliedTo.length !== 1 ? 's' : ''}</p>
                  </div>
                  
                  {jobsIAppliedTo.map((job) => {
                    const myApplication = job.applicants.find(app => app.freelancerId === user?.id);
                    return (
                      <Card key={job.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg">{job.title}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  Applied
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  Applied {formatTimeAgo(myApplication?.appliedAt || job.createdAt)}
                                </span>
                                <span className="flex items-center gap-1 text-green-600">
                                  <DollarSign className="h-4 w-4" />
                                  {job.budget} TND
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{job.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}