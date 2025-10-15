import React, { useState, createContext, useContext, useEffect, Suspense, startTransition } from 'react';
// Lazy-load larger route components to improve initial bundle size
const LandingPage = React.lazy(() => import('./components/LandingPage').then(m => ({ default: m.LandingPage })));
const AuthForm = React.lazy(() => import('./components/AuthForm').then(m => ({ default: m.AuthForm })));
const ProfileOnboarding = React.lazy(() => import('./components/ProfileOnboarding').then(m => ({ default: m.ProfileOnboarding })));
const Dashboard = React.lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const HireMode = React.lazy(() => import('./components/HireMode').then(m => ({ default: m.HireMode })));
const SkillSwapMode = React.lazy(() => import('./components/SkillSwapMode').then(m => ({ default: m.SkillSwapMode })));
const InvestmentMode = React.lazy(() => import('./components/InvestmentMode').then(m => ({ default: m.InvestmentMode })));
const Profile = React.lazy(() => import('./components/Profile').then(m => ({ default: m.Profile })));
const Wallet = React.lazy(() => import('./components/WalletSimple').then(m => ({ default: m.WalletSimple })));
const Settings = React.lazy(() => import('./components/Settings').then(m => ({ default: m.Settings })));
const PublicProfile = React.lazy(() => import('./components/PublicProfile').then(m => ({ default: m.PublicProfile })));
import { Toaster } from './components/ui/sonner';
import { UserProfile, Wallet as WalletType, userApi, walletApi, mockBackend, authApi } from './utils/api'; // Import mockBackend and authApi
import { I18nProvider } from './utils/i18n';
import { ThemeProvider } from './utils/theme';
import './utils/cleanup'; // Import cleanup utility for console access
import { toast } from 'sonner'; // Import toast for demo mode feedback

export type PageType = 'landing' | 'auth' | 'dashboard' | 'hire' | 'skillswap' | 'investment' | 'profile' | 'wallet' | 'settings' | 'publicProfile'; // Added publicProfile

// User Context
interface UserContextType {
  user: UserProfile | null;
  wallet: WalletType | null;
  setUser: (user: UserProfile | null) => void;
  setWallet: (wallet: WalletType | null) => void;
  refreshWallet: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [newUserData, setNewUserData] = useState<{ userId: string; name: string; email: string } | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [publicProfileUserId, setPublicProfileUserId] = useState<string | null>(null); // State for public profile

  // Initialize mock backend data on first load
  useEffect(() => {
    mockBackend.setInitialData();
  }, []);

  const refreshWallet = async () => {
    if (user) {
      try {
        const response = await walletApi.getWallet(user.id);
        setWallet(response.wallet);
      } catch (error) {
        console.error('Failed to refresh wallet:', error);
      }
    }
  };

  const handleAuthSuccess = async (userData: { userId: string; name: string; email: string }, isNewUser: boolean = false) => {
    // If new user, show onboarding
    if (isNewUser) {
      // Schedule onboarding navigation as a transition so lazy loading can suspend without breaking input
      startTransition(() => {
        setNewUserData(userData);
        setShowOnboarding(true);
      });
      return;
    }
    
    try {
      // Get or create user profile
      let userProfile: UserProfile;
      
      try {
        const getResponse = await userApi.getProfile(userData.userId);
        userProfile = getResponse.profile;
      } catch (getError) {
        // Profile not found for existing user, attempt to create default profile
        const createResponse = await userApi.createProfile({
          id: userData.userId,
          name: userData.name,
          email: userData.email,
          bio: 'Welcome to Work & Invest!',
          skills: [],
          location: '',
          onboardingCompleted: true // For existing users who might not have completed onboarding, assume complete for now
        });
        
        if (createResponse.success) {
          userProfile = createResponse.profile;
        } else {
          throw new Error('Failed to create profile for existing user');
        }
      }

      // Get wallet data
      const walletResponse = await walletApi.getWallet(userData.userId);
      const walletData = walletResponse.wallet;
      
      // Batch these UI updates as a transition to allow lazy-loaded dashboard/profile to suspend
      startTransition(() => {
        setUser(userProfile);
        setWallet(walletData);
        setIsLoggedIn(true);
        setCurrentPage('dashboard');
      });
      
    } catch (error) {
      console.error('Error loading user data after auth success:', error);
      
      // Fallback to basic profile if backend fails
      const fallbackProfile: UserProfile = {
        id: userData.userId,
        name: userData.name,
        email: userData.email,
        bio: 'Welcome to Work & Invest!',
        skills: [],
        location: '',
        avatar: '',
        rating: 0,
        completedJobs: 0,
        totalEarnings: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const fallbackWallet: WalletType = { money: 50, credits: 100, equity: 0 };
      
      startTransition(() => {
        setUser(fallbackProfile);
        setWallet(fallbackWallet);
        setIsLoggedIn(true);
        setCurrentPage('dashboard');
      });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setWallet(null);
    setCurrentPage('landing');
  };

  const navigateTo = (page: PageType, userId?: string) => {
    if (page === 'landing') {
      handleLogout();
    } else if (page === 'publicProfile' && userId) {
      setPublicProfileUserId(userId);
      setCurrentPage('publicProfile');
    } else {
      setPublicProfileUserId(null); // Clear public profile ID if navigating elsewhere
      setCurrentPage(page);
    }
  };

  const userContextValue: UserContextType = {
    user,
    wallet,
    setUser,
    setWallet,
    refreshWallet
  };

  const handleOnboardingComplete = async () => {
    if (!newUserData) {
      console.error('Onboarding completed but newUserData is null.');
      return;
    }
    
    setShowOnboarding(false);
    // Now proceed with normal auth flow, marking onboarding as complete
    await handleAuthSuccess(newUserData, false);
  };

  const handleOnboardingSkip = async () => {
    if (!newUserData) {
      console.error('Onboarding skipped but newUserData is null.');
      return;
    }
    
    setShowOnboarding(false);
    // Proceed with normal auth flow even if skipped
    await handleAuthSuccess(newUserData, false);
  };

  const renderCurrentPage = () => {
    if (currentPage === 'publicProfile' && publicProfileUserId) {
      return <PublicProfile userId={publicProfileUserId} onNavigate={navigateTo} />;
    }
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={navigateTo} onLogout={handleLogout} />;
      case 'hire':
        return <HireMode onNavigate={navigateTo} />;
      case 'skillswap':
        return <SkillSwapMode onNavigate={navigateTo} />;
      case 'investment':
        return <InvestmentMode onNavigate={navigateTo} />;
      case 'profile':
        return <Profile onNavigate={navigateTo} />;
      case 'wallet':
        return <Wallet onNavigate={navigateTo} />;
      case 'settings':
        return <Settings onNavigate={navigateTo} onLogout={handleLogout} />;
      default:
        return <Dashboard onNavigate={navigateTo} onLogout={handleLogout} />;
    }
  };

  return (
    <ThemeProvider>
      <I18nProvider>
        <UserContext.Provider value={userContextValue}>
          <Toaster richColors position="top-right" expand={true} />
          <div className="min-h-screen bg-background">
            {showOnboarding && newUserData ? (
              <ProfileOnboarding
                userId={newUserData.userId}
                userName={newUserData.name}
                userEmail={newUserData.email}
                onComplete={handleOnboardingComplete}
                onSkip={handleOnboardingSkip}
              />
            ) : !isLoggedIn ? (
              currentPage === 'landing' ? (
                <LandingPage 
                  onGetStarted={() => {
                    setAuthMode('register');
                    setCurrentPage('auth');
                  }} 
                  onSignIn={() => {
                    setAuthMode('login');
                    setCurrentPage('auth');
                  }} 
                />
              ) : ( // currentPage === 'auth'
                <AuthForm 
                  onSuccess={handleAuthSuccess}
                  onBack={() => setCurrentPage('landing')}
                  defaultTab={authMode}
                />
              )
            ) : (
              renderCurrentPage()
            )}
          </div>
        </UserContext.Provider>
      </I18nProvider>
    </ThemeProvider>
  );
}