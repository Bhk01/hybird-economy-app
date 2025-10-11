import React, { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  Users, 
  RefreshCw, 
  TrendingUp, 
  Wallet,
  Star,
  Clock,
  DollarSign,
  Activity,
  Plus,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { PageType, useUser } from '../App';
import { Transaction, walletApi, jobsApi, skillsApi, projectsApi } from '../utils/api';
import { useI18n } from '../utils/i18n';

interface DashboardProps {
  onNavigate: (page: PageType) => void;
  onLogout: () => void;
}

export function Dashboard({ onNavigate, onLogout }: DashboardProps) {
  const { user, wallet, refreshWallet } = useUser();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalSkills, setTotalSkills] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const [transactionsResponse, jobsResponse, skillsResponse, projectsResponse] = await Promise.all([
        walletApi.getTransactions(user.id).catch(() => ({ transactions: [] })),
        jobsApi.getAllJobs().catch(() => ({ jobs: [] })),
        skillsApi.getAllSkills().catch(() => ({ skills: [] })),
        projectsApi.getAllProjects().catch(() => ({ projects: [] }))
      ]);

      setRecentTransactions(transactionsResponse.transactions.slice(0, 4));
      setTotalJobs(jobsResponse.jobs.length);
      setTotalSkills(skillsResponse.skills.length);
      setTotalProjects(projectsResponse.projects.length);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !wallet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Define totalBalance here, including money, equity, and converted credits
  const totalBalance = (wallet.money || 0) + (wallet.equity || 0) + ((wallet.credits || 0) * 10); // Assuming 1 credit = 10 TND for total value calculation

  const stats = [
    { label: t('dashboard.skillCredits'), value: `${wallet.credits}`, icon: RefreshCw, color: 'text-purple-500' },
    { label: t('dashboard.userRating'), value: user.rating.toFixed(1), icon: Star, color: 'text-yellow-500' },
  ];

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return t('dashboard.justNow');
    if (diffInHours < 24) return `${diffInHours} ${t('dashboard.hoursAgo')}`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} ${t('dashboard.daysAgo')}`;
    return time.toLocaleDateString();
  };

  const getTransactionActivity = (transaction: Transaction) => {
    const isPositive = transaction.operation === 'add';
    return {
      type: transaction.type === 'money' ? 'hire' : transaction.type === 'credits' ? 'swap' : 'investment',
      title: transaction.description || `${transaction.type} ${transaction.operation}`,
      description: `${isPositive ? '+' : '-'}${transaction.amount} ${transaction.type}`,
      time: formatTimeAgo(transaction.timestamp),
      status: t('dashboard.completed')
    };
  };

  const quickActions = [
    {
      title: t('dashboard.postJob'),
      description: t('dashboard.postJobDesc'),
      icon: Users,
      action: () => onNavigate('hire'),
      color: 'bg-blue-500'
    },
    {
      title: t('dashboard.offerSkills'),
      description: t('dashboard.offerSkillsDesc'),
      icon: RefreshCw,
      action: () => onNavigate('skillswap'),
      color: 'bg-green-500'
    },
    {
      title: t('dashboard.browseInvestments'),
      description: t('dashboard.browseInvestmentsDesc'),
      icon: TrendingUp,
      action: () => onNavigate('investment'),
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage="dashboard" onNavigate={onNavigate} />
      
      <div className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl mb-2">{t('dashboard.welcomeBack')}, {user.name}!</h1>
          <p className="text-muted-foreground">
            {t('dashboard.subtitle')}
          </p>
          {isLoading && (
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('dashboard.loadingData')}
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-xl">{stat.value}</p>
                    </div>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.quickActions')}</CardTitle>
                <CardDescription>
                  {t('dashboard.quickActionsDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start gap-3 h-auto p-3"
                      onClick={action.action}
                    >
                      <div className={`p-2 rounded-lg ${action.color} text-white`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-sm">{action.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Portfolio Summary */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{t('dashboard.portfolioSummary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{t('dashboard.cashBalance')}</span>
                    <span>{wallet.money} TND</span>
                  </div>
                  <Progress value={(wallet.money / totalBalance) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{t('dashboard.equityValue')}</span>
                    <span>{(wallet.equity * 100).toFixed(0)} TND</span>
                  </div>
                  <Progress value={(wallet.equity * 100 / totalBalance) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{t('dashboard.skillCredits')}</span>
                    <span>{wallet.credits} credits</span>
                  </div>
                  <Progress value={(wallet.credits * 10 / totalBalance) * 100} className="h-2" />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => onNavigate('wallet')}
                >
                  {t('dashboard.viewDetailedWallet')}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
                <CardDescription>
                  {t('dashboard.recentActivityDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((transaction, index) => {
                      const activity = getTransactionActivity(transaction);
                      return (
                    <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'hire' ? 'bg-blue-500/10 text-blue-500' :
                        activity.type === 'swap' ? 'bg-green-500/10 text-green-500' :
                        'bg-purple-500/10 text-purple-500'
                      }`}>
                        {activity.type === 'hire' && <Users className="h-4 w-4" />}
                        {activity.type === 'swap' && <RefreshCw className="h-4 w-4" />}
                        {activity.type === 'investment' && <TrendingUp className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm">{activity.title}</p>
                          <Badge 
                            variant={activity.status === t('dashboard.completed') ? 'default' : 
                                   activity.status === t('dashboard.active') ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {activity.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.time}
                        </p>
                      </div>
                      {activity.status === t('dashboard.completed') && 
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      }
                      {activity.status === t('dashboard.pending') && 
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      }
                    </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>{t('dashboard.noRecentActivity')}</p>
                      <p className="text-sm">{t('dashboard.noActivityDesc')}</p>
                    </div>
                  )}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  {t('dashboard.viewAllActivity')}
                </Button>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{t('dashboard.aiRecommendations')}</CardTitle>
                <CardDescription>
                  {t('dashboard.aiRecommendationsDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm">{totalJobs} {t('dashboard.activeJobPostings')}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('dashboard.browseJobsDesc')}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => onNavigate('hire')}>{t('dashboard.browse')}</Button>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-500/5 rounded-lg border border-green-500/20">
                    <RefreshCw className="h-5 w-5 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm">{totalSkills} {t('dashboard.skillExchangeOffers')}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('dashboard.exchangeSkillsDesc')}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => onNavigate('skillswap')}>{t('dashboard.explore')}</Button>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    <div className="flex-1">
                      <p className="text-sm">{totalProjects} Investment Opportunities</p>
                      <p className="text-xs text-muted-foreground">
                        Discover local projects seeking micro-investments
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => onNavigate('investment')}>Invest</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}