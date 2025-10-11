import React, { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Search,
  RefreshCw,
  Star,
  Clock,
  Plus,
  Users,
  BookOpen,
  Code,
  Paintbrush,
  Camera,
  Music,
  Languages,
  ChefHat,
  Wrench,
  Heart,
  CheckCircle,
  ArrowRightLeft,
  Loader2
} from 'lucide-react';
import { PageType, useUser } from '../App';
import { skillsApi, SkillOffering, walletApi } from '../utils/api';
import { toast } from 'sonner';

interface SkillSwapModeProps {
  onNavigate: (page: PageType) => void;
}

export function SkillSwapMode({ onNavigate }: SkillSwapModeProps) {
  const handleLogout = () => {
    onNavigate('landing');
  };
  const { user, wallet, refreshWallet } = useUser();
  const [activeTab, setActiveTab] = useState<'discover' | 'my-offers' | 'matches'>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [skillOfferings, setSkillOfferings] = useState<SkillOffering[]>([]);
  const [myOffers, setMyOffers] = useState<SkillOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state for creating skill offerings
  const [formData, setFormData] = useState({
    skillOffered: '',
    skillWanted: '',
    description: '',
    duration: '',
    location: ''
  });

  // Load skill offerings on component mount and create sample data if needed
  useEffect(() => {
    loadSkillOfferings();
    // Only create sample data after a delay to ensure user is loaded
    setTimeout(() => {
      createSampleDataIfEmpty();
    }, 1000);
  }, []);

  const createSampleDataIfEmpty = async () => {
    try {
      const response = await skillsApi.getAllSkills();
      if (response.skills.length === 0) {
        // Create sample skill offerings
        const sampleSkills = [
          {
            title: 'French Tutoring ↔ Web Development',
            description: 'Native French speaker with 5 years teaching experience. Looking to learn React development.',
            category: 'Languages',
            offeredBy: 'sample-user-1',
            lookingFor: 'Programming',
            duration: '2 hours/week'
          },
          {
            title: 'Photography ↔ Logo Design',
            description: 'Professional photographer specializing in events and portraits. Need help with brand identity.',
            category: 'Photography',
            offeredBy: 'sample-user-2',
            lookingFor: 'Design',
            duration: '1 day session'
          },
          {
            title: 'Guitar Lessons ↔ Video Editing',
            description: 'Professional guitarist and music teacher. Want to create better content for my music channel.',
            category: 'Music',
            offeredBy: 'sample-user-3',
            lookingFor: 'Programming',
            duration: '1 hour/lesson'
          }
        ];

        for (const skill of sampleSkills) {
          await skillsApi.createSkillOffering(skill);
        }
        console.log('Sample skill offerings created');
      }
    } catch (error) {
      console.error('Error creating sample skill data:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadMyOffers();
    }
  }, [user, skillOfferings]);

  const loadSkillOfferings = async () => {
    try {
      setLoading(true);
      const response = await skillsApi.getAllSkills();
      setSkillOfferings(response.skills || []);
    } catch (error) {
      console.error('Error loading skill offerings:', error);
      toast.error('Failed to load skill offerings');
    } finally {
      setLoading(false);
    }
  };

  const loadMyOffers = () => {
    if (!user) return;
    const userOffers = skillOfferings.filter(skill => skill.offeredBy === user.id);
    setMyOffers(userOffers);
  };

  const handleCreateOffer = async () => {
    if (!user) {
      toast.error('Please log in to create skill offers');
      return;
    }

    if (!formData.skillOffered || !formData.skillWanted || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setCreating(true);
      const response = await skillsApi.createSkillOffering({
        title: `${formData.skillOffered} ↔ ${formData.skillWanted}`,
        description: formData.description,
        category: formData.skillOffered,
        offeredBy: user.id,
        lookingFor: formData.skillWanted,
        duration: formData.duration || 'Flexible'
      });

      if (response.success) {
        toast.success('Skill swap offer created successfully!');
        setDialogOpen(false);
        setFormData({
          skillOffered: '',
          skillWanted: '',
          description: '',
          duration: '',
          location: ''
        });
        await loadSkillOfferings();
      }
    } catch (error) {
      console.error('Error creating skill offer:', error);
      toast.error('Failed to create skill offer');
    } finally {
      setCreating(false);
    }
  };

  const handleConnect = async (skillId: string) => {
    if (!user) {
      toast.error('Please log in to connect with other users');
      return;
    }

    try {
      const response = await skillsApi.requestSkillSwap(skillId, {
        requesterId: user.id,
        message: 'I\'m interested in this skill swap opportunity!',
        offerInReturn: 'My skills and experience'
      });

      if (response.success) {
        toast.success('Connection request sent successfully!');
        await loadSkillOfferings();
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error('Failed to send connection request');
    }
  };

  const skillCategories = [
    { name: 'Programming', icon: Code, count: skillOfferings.filter(s => s.category === 'Programming').length, color: 'bg-blue-500' },
    { name: 'Design', icon: Paintbrush, count: skillOfferings.filter(s => s.category === 'Design').length, color: 'bg-purple-500' },
    { name: 'Languages', icon: Languages, count: skillOfferings.filter(s => s.category === 'Languages').length, color: 'bg-green-500' },
    { name: 'Photography', icon: Camera, count: skillOfferings.filter(s => s.category === 'Photography').length, color: 'bg-yellow-500' },
    { name: 'Music', icon: Music, count: skillOfferings.filter(s => s.category === 'Music').length, color: 'bg-pink-500' },
    { name: 'Cooking', icon: ChefHat, count: skillOfferings.filter(s => s.category === 'Cooking').length, color: 'bg-orange-500' },
    { name: 'Tutoring', icon: BookOpen, count: skillOfferings.filter(s => s.category === 'Tutoring').length, color: 'bg-indigo-500' },
    { name: 'Handcraft', icon: Wrench, count: skillOfferings.filter(s => s.category === 'Handcraft').length, color: 'bg-gray-500' }
  ];

  // Filter skill offerings based on search query
  const filteredSkillOfferings = skillOfferings.filter(skill => 
    skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    skill.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate statistics
  const activeSwaps = myOffers.filter(offer => offer.status === 'available').length;
  const totalMatches = myOffers.reduce((sum, offer) => sum + offer.matches.length, 0);
  const skillCredits = wallet?.credits || 0;

  const getMatchColor = (match: number) => {
    if (match >= 90) return 'text-green-500 bg-green-500/10';
    if (match >= 80) return 'text-blue-500 bg-blue-500/10';
    if (match >= 70) return 'text-yellow-500 bg-yellow-500/10';
    return 'text-gray-500 bg-gray-500/10';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10';
      case 'matched': return 'text-blue-500 bg-blue-500/10';
      case 'pending': return 'text-yellow-500 bg-yellow-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage="skillswap" onNavigate={onNavigate} onLogout={handleLogout} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl mb-2">Skill Swap</h1>
            <p className="text-muted-foreground">
              Exchange your skills with others in the community
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Swap Offer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create a Skill Swap Offer</DialogTitle>
                <DialogDescription>
                  Tell us what you can offer and what you're looking for
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="skill-offered">Skill I Can Offer</Label>
                  <Select value={formData.skillOffered} onValueChange={(value) => setFormData(prev => ({ ...prev, skillOffered: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Programming">Programming</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Languages">Languages</SelectItem>
                      <SelectItem value="Photography">Photography</SelectItem>
                      <SelectItem value="Music">Music</SelectItem>
                      <SelectItem value="Cooking">Cooking</SelectItem>
                      <SelectItem value="Tutoring">Tutoring</SelectItem>
                      <SelectItem value="Handcraft">Handcraft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="skill-wanted">Skill I Want to Learn</Label>
                  <Select value={formData.skillWanted} onValueChange={(value) => setFormData(prev => ({ ...prev, skillWanted: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select desired skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Programming">Programming</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Languages">Languages</SelectItem>
                      <SelectItem value="Photography">Photography</SelectItem>
                      <SelectItem value="Music">Music</SelectItem>
                      <SelectItem value="Cooking">Cooking</SelectItem>
                      <SelectItem value="Tutoring">Tutoring</SelectItem>
                      <SelectItem value="Handcraft">Handcraft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description & Experience</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe your skill level, experience, and what you can teach..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Session Duration</Label>
                    <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30 minutes">30 minutes</SelectItem>
                        <SelectItem value="1 hour">1 hour</SelectItem>
                        <SelectItem value="2 hours">2 hours</SelectItem>
                        <SelectItem value="Flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Preferred Location</Label>
                    <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Online">Online</SelectItem>
                        <SelectItem value="Tunis">Tunis</SelectItem>
                        <SelectItem value="Sfax">Sfax</SelectItem>
                        <SelectItem value="Sousse">Sousse</SelectItem>
                        <SelectItem value="Flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateOffer} disabled={creating}>
                    {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Offer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Swaps</p>
                  <p className="text-xl">{activeSwaps}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Available Offers</p>
                  <p className="text-xl">{skillOfferings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Skill Credits</p>
                  <p className="text-xl">{skillCredits}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                  <p className="text-xl">{totalMatches}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList>
            <TabsTrigger value="discover">Discover Swaps</TabsTrigger>
            <TabsTrigger value="my-offers">My Offers</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search skills to learn or teach..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">AI Match</Button>
                </div>
              </CardContent>
            </Card>

            {/* Skill Categories */}
            <div>
              <h3 className="text-lg mb-4">Browse by Category</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {skillCategories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-3 text-center">
                        <div className={`${category.color} text-white p-2 rounded-lg w-fit mx-auto mb-2`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className="text-xs font-medium">{category.name}</p>
                        <p className="text-xs text-muted-foreground">{category.count}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Available Swaps */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg">Available Skill Swaps</h3>
                <p className="text-sm text-muted-foreground">{filteredSkillOfferings.length} swaps available</p>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading skill swaps...</span>
                </div>
              ) : filteredSkillOfferings.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No skill swaps available at the moment.</p>
                    <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                      Create the first offer
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredSkillOfferings.map((skill) => (
                  <Card key={skill.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {skill.offeredBy.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg">User {skill.offeredBy.substring(0, 8)}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {skill.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-3 mb-3">
                            <Badge variant="outline" className="gap-1">
                              <ArrowRightLeft className="h-3 w-3" />
                              {skill.category} → {skill.lookingFor}
                            </Badge>
                            <Badge className="text-blue-500 bg-blue-500/10">
                              {skill.duration}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">{skill.description}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {skill.duration}
                            </span>
                            <span>{skill.matches.length} requests</span>
                            <span>Created {new Date(skill.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {skill.offeredBy === user?.id ? (
                            <Badge variant="outline">Your Offer</Badge>
                          ) : (
                            <>
                              <Button size="sm" onClick={() => handleConnect(skill.id)}>Connect</Button>
                              <Button size="sm" variant="outline">View Details</Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="my-offers" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg">My Skill Swap Offers</h3>
                <Button size="sm" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Offer
                </Button>
              </div>
              
              {myOffers.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">You haven't created any skill swap offers yet.</p>
                    <Button onClick={() => setDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Offer
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                myOffers.map((offer) => (
                  <Card key={offer.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="gap-1">
                              <ArrowRightLeft className="h-3 w-3" />
                              {offer.category} → {offer.lookingFor}
                            </Badge>
                            <Badge className={getStatusColor(offer.status)}>
                              {offer.status}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">{offer.description}</p>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Requests</p>
                              <p className="text-lg">{offer.matches.length}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Duration</p>
                              <p className="text-lg">{offer.duration}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Created</p>
                              <p className="text-sm">{new Date(offer.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm">View Requests ({offer.matches.length})</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="matches" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg">Skill Swap Requests</h3>
              
              {myOffers.filter(offer => offer.matches.length > 0).length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No requests for your skill offers yet.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Create more offers or promote your existing ones to get requests!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                myOffers.filter(offer => offer.matches.length > 0).map((offer) => (
                  <div key={offer.id} className="space-y-3">
                    <h4 className="text-md">Requests for: {offer.title}</h4>
                    {offer.matches.map((match, index) => (
                      <Card key={index}>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>
                                {match.requesterId.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg">User {match.requesterId.substring(0, 8)}</h3>
                                <Badge className={getStatusColor(match.status)}>
                                  {match.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{match.message}</p>
                              <p className="text-xs text-muted-foreground">
                                Requested {new Date(match.requestedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {match.status === 'pending' && (
                                <>
                                  <Button size="sm" variant="outline">Decline</Button>
                                  <Button size="sm">Accept</Button>
                                </>
                              )}
                              {match.status === 'accepted' && (
                                <Button size="sm">Start Chat</Button>
                              )}
                              {match.status === 'declined' && (
                                <Badge variant="secondary">Declined</Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}