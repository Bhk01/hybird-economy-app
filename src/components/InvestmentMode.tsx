import React, { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { 
  Search,
  TrendingUp,
  Shield,
  Clock,
  Users,
  DollarSign,
  Star,
  MapPin,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Filter,
  Target,
  Briefcase,
  Home,
  ShoppingBag,
  Coffee,
  Car,
  Building,
  Loader2,
  Plus,
  Zap
} from 'lucide-react';
import { PageType, useUser } from '../App';
import { projectsApi, InvestmentProject, walletApi } from '../utils/api';
import { toast } from 'sonner';

interface InvestmentModeProps {
  onNavigate: (page: PageType, userId?: string) => void;
}

export function InvestmentMode({ onNavigate }: InvestmentModeProps) {
  const handleLogout = () => {
    onNavigate('landing');
  };
  const { user, wallet, refreshWallet } = useUser();
  const [activeTab, setActiveTab] = useState<'browse' | 'portfolio' | 'analytics'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<InvestmentProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<InvestmentProject | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [investDialogOpen, setInvestDialogOpen] = useState(false);
  const [aiRecommendationsActive, setAiRecommendationsActive] = useState(false);

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsApi.getAllProjects();
      setProjects(response.projects || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load investment projects');
    } finally {
      setLoading(false);
    }
  };

  const handleInvestment = async () => {
    if (!user || !selectedProject || !investmentAmount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(investmentAmount);
    if (amount < selectedProject.minInvestment) {
      toast.error(`Minimum investment is ${selectedProject.minInvestment} TND`);
      return;
    }

    if (!wallet || wallet.money < amount) {
      toast.error('Insufficient funds in your wallet');
      return;
    }

    try {
      setInvesting(selectedProject.id);
      const response = await projectsApi.makeInvestment(selectedProject.id, user.id, amount);
      
      if (response.success) {
        toast.success(`Successfully invested ${amount} TND in ${selectedProject.title}!`);
        setInvestDialogOpen(false);
        setInvestmentAmount('');
        setSelectedProject(null);
        await refreshWallet();
        await loadProjects();
      }
    } catch (error) {
      console.error('Error making investment:', error);
      toast.error('Failed to make investment');
    } finally {
      setInvesting(null);
    }
  };

  const openInvestDialog = (project: InvestmentProject) => {
    setSelectedProject(project);
    setInvestmentAmount(project.minInvestment.toString());
    setInvestDialogOpen(true);
  };

  // Filter projects based on search query and AI recommendations
  const getFilteredProjects = () => {
    let currentProjects = projects;

    if (searchQuery) {
      currentProjects = currentProjects.filter(project => 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (aiRecommendationsActive && user) {
      // Simple AI recommendation logic:
      // 1. Prioritize projects in categories the user has already invested in (if any)
      // 2. Prioritize projects with 'Low' risk if user has less than 500 TND equity
      // 3. Prioritize projects with 'High' expected return
      const userInvestedCategories = new Set(userInvestments.map(inv => inv.category));
      
      currentProjects = currentProjects.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        // Category match
        if (userInvestedCategories.has(a.category)) scoreA += 2;
        if (userInvestedCategories.has(b.category)) scoreB += 2;

        // Risk preference
        if (wallet && wallet.equity < 500) { // If user has low equity, recommend low risk
          if (a.riskLevel === 'Low') scoreA += 1;
          if (b.riskLevel === 'Low') scoreB += 1;
        }

        // Expected return (simple string comparison for now)
        if (parseFloat(a.expectedReturn.split('-')[0]) > parseFloat(b.expectedReturn.split('-')[0])) scoreA += 1;
        if (parseFloat(b.expectedReturn.split('-')[0]) > parseFloat(a.expectedReturn.split('-')[0])) scoreB += 1;

        return scoreB - scoreA; // Higher score comes first
      });
    }

    return currentProjects;
  };

  const filteredProjects = getFilteredProjects();

  // Calculate user's portfolio from their investments
  const userInvestments = projects.filter(project => 
    project.investors.some(inv => inv.investorId === user?.id)
  );

  const totalInvested = userInvestments.reduce((sum, project) => {
    const userInvestment = project.investors.find(inv => inv.investorId === user?.id);
    return sum + (userInvestment?.amount || 0);
  }, 0);

  const totalEquity = userInvestments.reduce((sum, project) => {
    const userInvestment = project.investors.find(inv => inv.investorId === user?.id);
    return sum + (userInvestment?.equityPercentage || 0);
  }, 0);

  const investmentCategories = [
    { name: 'Tech Startups', icon: Briefcase, count: projects.filter(p => p.category === 'Tech Startup').length, color: 'bg-blue-500' },
    { name: 'Real Estate', icon: Home, count: projects.filter(p => p.category === 'Real Estate').length, color: 'bg-green-500' },
    { name: 'Retail', icon: ShoppingBag, count: projects.filter(p => p.category === 'Retail').length, color: 'bg-purple-500' },
    { name: 'Food & Beverage', icon: Coffee, count: projects.filter(p => p.category === 'Food & Beverage').length, color: 'bg-orange-500' },
    { name: 'Transport', icon: Car, count: projects.filter(p => p.category === 'Transport').length, color: 'bg-red-500' },
    { name: 'Local Business', icon: Building, count: projects.filter(p => p.category === 'Local Business').length, color: 'bg-indigo-500' }
  ];



  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'text-green-500 bg-green-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'high': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return <Shield className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-500 bg-blue-500/10';
      case 'completed': return 'text-green-500 bg-green-500/10';
      case 'at-risk': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage="investment" onNavigate={onNavigate} onLogout={handleLogout} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl mb-2">Micro-Investment</h1>
            <p className="text-muted-foreground">
              Invest in local projects starting from 1 TND
            </p>
          </div>
          <Button className="gap-2" onClick={() => onNavigate('wallet')}>
            <DollarSign className="h-4 w-4" />
            Available: {wallet?.money || 0} TND
          </Button>
        </div>

        {/* Investment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                  <p className="text-xl">{totalInvested} TND</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Equity</p>
                  <p className="text-xl">{totalEquity.toFixed(2)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Available Projects</p>
                  <p className="text-xl">{projects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">My Investments</p>
                  <p className="text-xl">{userInvestments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList>
            <TabsTrigger value="browse">Browse Projects</TabsTrigger>
            <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search investment opportunities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant={aiRecommendationsActive ? "default" : "outline"} onClick={() => setAiRecommendationsActive(!aiRecommendationsActive)}>
                    <Zap className="h-4 w-4 mr-2" />
                    AI Recommendations
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Investment Categories */}
            <div>
              <h3 className="text-lg mb-4">Browse by Category</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {investmentCategories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4 text-center">
                        <div className={`${category.color} text-white p-2 rounded-lg w-fit mx-auto mb-2`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="text-sm">{category.name}</p>
                        <p className="text-xs text-muted-foreground">{category.count} projects</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Available Investments */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg">Featured Investment Opportunities</h3>
                <p className="text-sm text-muted-foreground">{filteredProjects.length} projects available</p>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading investment opportunities...</span>
                </div>
              ) : filteredProjects.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">No investment opportunities available at the moment.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Check back later for new projects!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredProjects.map((project) => (
                    <Card key={project.id} className="hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <ImageWithFallback
                          src="https://images.unsplash.com/photo-1521897258701-21e2a01f5bb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                          alt={project.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <Badge className={`absolute top-3 right-3 ${getRiskColor(project.riskLevel.toLowerCase())}`}>
                          {getRiskIcon(project.riskLevel.toLowerCase())}
                          {project.riskLevel} risk
                        </Badge>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg mb-1">{project.title}</h3>
                            <Badge variant="outline" className="text-xs mb-2">
                              {project.category}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Expected Return</p>
                            <p className="text-green-600">{project.expectedReturn}</p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                        
                        {/* Funding Progress */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Funding Progress</span>
                            <span>{Math.round((project.currentFunding / project.fundingGoal) * 100)}%</span>
                          </div>
                          <Progress 
                            value={(project.currentFunding / project.fundingGoal) * 100} 
                            className="h-2 mb-2" 
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{project.currentFunding.toLocaleString()} TND raised</span>
                            <span>{project.fundingGoal.toLocaleString()} TND goal</span>
                          </div>
                        </div>

                        {/* Key Details */}
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Min Investment</p>
                              <p>{project.minInvestment} TND</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Investors</p>
                              <p>{project.investors.length}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Status</p>
                              <p className="capitalize">{project.status}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Created</p>
                              <p>{new Date(project.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">Learn More</Button>
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => openInvestDialog(project)}
                            disabled={investing === project.id}
                          >
                            {investing === project.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Invest Now
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onNavigate('publicProfile', project.ownerId)}
                          >
                            View Owner
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg">My Investment Portfolio</h3>
              
              {userInvestments.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">You haven't made any investments yet.</p>
                    <Button onClick={() => setActiveTab('browse')}>
                      Browse Investment Opportunities
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                userInvestments.map((project) => {
                  const userInvestment = project.investors.find(inv => inv.investorId === user?.id);
                  return (
                    <Card key={project.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg">{project.title}</h3>
                              <Badge className={getStatusColor(project.status)}>
                                {project.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{project.description}</p>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-8 text-center">
                            <div>
                              <p className="text-sm text-muted-foreground">Invested</p>
                              <p className="text-lg">{userInvestment?.amount || 0} TND</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Equity</p>
                              <p className="text-lg">{userInvestment?.equityPercentage?.toFixed(2) || 0}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Investment Date</p>
                              <p className="text-sm">
                                {userInvestment ? new Date(userInvestment.investedAt).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                          
                          <Button variant="outline" size="sm">View Details</Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Performance</CardTitle>
                  <CardDescription>Your investment performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Invested</span>
                      <span>{totalInvested} TND</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Equity</span>
                      <span>{totalEquity.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Active Projects</span>
                      <span>{userInvestments.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Investment</span>
                      <span>{userInvestments.length > 0 ? Math.round(totalInvested / userInvestments.length) : 0} TND</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Analysis</CardTitle>
                  <CardDescription>AI-powered risk assessment of your portfolio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Overall Risk Level</span>
                      <Badge className="text-yellow-500 bg-yellow-500/10">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Medium
                      </Badge>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Low Risk</span>
                        <span>40%</span>
                      </div>
                      <Progress value={40} className="h-2 mb-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Medium Risk</span>
                        <span>45%</span>
                      </div>
                      <Progress value={45} className="h-2 mb-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>High Risk</span>
                        <span>15%</span>
                      </div>
                      <Progress value={15} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>AI Investment Recommendations</CardTitle>
                <CardDescription>Personalized suggestions based on your portfolio and risk profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm">Diversify into Agriculture</p>
                      <p className="text-xs text-muted-foreground">
                        Consider the Organic Farm project to balance your tech-heavy portfolio
                      </p>
                    </div>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-500/5 rounded-lg border border-green-500/20">
                    <Shield className="h-5 w-5 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm">Lower Your Risk</p>
                      <p className="text-xs text-muted-foreground">
                        Add more low-risk investments to stabilize returns
                      </p>
                    </div>
                    <Button size="sm" variant="outline">Explore</Button>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                    <div className="flex-1">
                      <p className="text-sm">Increase Investment Amount</p>
                      <p className="text-xs text-muted-foreground">
                        You have {wallet?.money || 0} TND available for new investments
                      </p>
                    </div>
                    <Button size="sm" variant="outline">Invest</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Investment Dialog */}
        <Dialog open={investDialogOpen} onOpenChange={setInvestDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Invest in {selectedProject?.title}</DialogTitle>
              <DialogDescription>
                Enter the amount you want to invest (Min: {selectedProject?.minInvestment} TND)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Investment Amount (TND)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder={selectedProject?.minInvestment.toString()}
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  min={selectedProject?.minInvestment}
                  max={wallet?.money}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Available balance: {wallet?.money || 0} TND
                </p>
              </div>
              
              {selectedProject && investmentAmount && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm">Investment Summary:</p>
                  <div className="flex justify-between mt-2">
                    <span>Amount:</span>
                    <span>{investmentAmount} TND</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Equity:</span>
                    <span>{((parseFloat(investmentAmount) / selectedProject.fundingGoal) * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Return:</span>
                    <span>{selectedProject.expectedReturn}</span>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setInvestDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInvestment} disabled={investing !== null}>
                  {investing === null ? 'Confirm Investment' : (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Investing...
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}