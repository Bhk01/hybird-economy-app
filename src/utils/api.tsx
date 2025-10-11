import { toast } from 'sonner'; // Import toast for local feedback

// --- Local Storage Mock Backend Configuration ---
const LOCAL_STORAGE_PREFIX = 'work_invest_mock_';
const MOCK_NETWORK_DELAY = 300; // Simulate network latency

// --- Local Storage Helper Functions ---
function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage for key ${key}:`, error);
    return defaultValue;
  }
}

function setLocalStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage for key ${key}:`, error);
  }
}

function deleteLocalStorageItem(key: string): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_PREFIX + key);
  } catch (error) {
    console.error(`Error deleting from localStorage for key ${key}:`, error);
  }
}

function getAllLocalStorageItems<T>(prefix: string): T[] {
  const items: T[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(LOCAL_STORAGE_PREFIX + prefix)) {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          items.push(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Error parsing localStorage item for key ${key}:`, error);
      }
    }
  }
  return items;
}

function clearAllLocalStorage(): void {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.startsWith(LOCAL_STORAGE_PREFIX)) {
      localStorage.removeItem(key);
    }
  }
}

// Utility function to generate unique IDs
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Utility function to get current timestamp
function getCurrentTimestamp() {
  return new Date().toISOString();
}

// --- Generic Mock API Request Function ---
async function mockApiRequest<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<T & ApiResponse> {
  await new Promise(resolve => setTimeout(resolve, MOCK_NETWORK_DELAY)); // Simulate network delay

  try {
    let result: any = { success: true };

    // Simulate different API endpoints and methods
    if (endpoint.startsWith('/auth')) {
      if (endpoint === '/auth/signup' && method === 'POST') {
        const { email, password, name } = data;
        if (!email || !password || !name) throw new Error("Missing required fields: email, password, name");
        if (getLocalStorageItem(`auth:${email}`, null)) throw new Error("An account with this email already exists. Please sign in instead.");

        const userId = generateId();
        setLocalStorageItem(`auth:${email}`, { id: userId, email, password, createdAt: getCurrentTimestamp() });
        setLocalStorageItem(`user:${userId}`, {
          id: userId, name, email, bio: "", skills: [], avatar: "", location: "", rating: 0, completedJobs: 0, totalEarnings: 0,
          createdAt: getCurrentTimestamp(), updatedAt: getCurrentTimestamp(), onboardingCompleted: false, profileCompleteness: 0,
          jobExperiences: [], studyExperiences: []
        });
        setLocalStorageItem(`wallet:${userId}`, { money: 0, credits: 20, equity: 0 });
        result = { success: true, user: { id: userId, name, email }, message: "Account created successfully" };
      } else if (endpoint === '/auth/signin' && method === 'POST') {
        const { email, password } = data;
        if (!email || !password) throw new Error("Missing required fields: email, password");
        const userAuth = getLocalStorageItem(`auth:${email}`, null);
        if (!userAuth) throw new Error("No account found with this email. Please sign up.");
        if (userAuth.password !== password) throw new Error("Incorrect password. Try again or reset your password.");
        const profile = getLocalStorageItem(`user:${userAuth.id}`, null);
        if (!profile) throw new Error("User profile not found. Please contact support.");
        result = { success: true, user: { id: profile.id, name: profile.name, email: profile.email }, message: "Login successful" };
      }
    } else if (endpoint.startsWith('/users')) {
      const userId = endpoint.split('/')[2];
      if (endpoint === `/users/profile` && method === 'POST') { // For initial profile creation if not done during signup
        const { userId: newUserId, name, email, ...rest } = data;
        const existingProfile = getLocalStorageItem(`user:${newUserId}`, null);
        const profile = {
          id: newUserId, name, email,
          bio: rest.bio || existingProfile?.bio || "", skills: rest.skills || existingProfile?.skills || [],
          avatar: rest.avatar || existingProfile?.avatar || "", location: rest.location || existingProfile?.location || "",
          rating: existingProfile?.rating || 0, completedJobs: existingProfile?.completedJobs || 0, totalEarnings: existingProfile?.totalEarnings || 0,
          createdAt: existingProfile?.createdAt || getCurrentTimestamp(), updatedAt: getCurrentTimestamp(),
          onboardingCompleted: rest.onboardingCompleted ?? existingProfile?.onboardingCompleted ?? false,
          profileCompleteness: rest.profileCompleteness ?? existingProfile?.profileCompleteness ?? 0,
          jobExperiences: rest.jobExperiences || existingProfile?.jobExperiences || [],
          studyExperiences: rest.studyExperiences || existingProfile?.studyExperiences || []
        };
        setLocalStorageItem(`user:${newUserId}`, profile);
        result = { success: true, profile };
      } else if (endpoint === `/users/${userId}` && method === 'GET') {
        const profile = getLocalStorageItem(`user:${userId}`, null);
        if (!profile) throw new Error("User not found");
        result = { profile };
      } else if (endpoint === `/users/${userId}/profile` && method === 'PUT') {
        let profile = getLocalStorageItem(`user:${userId}`, null);
        if (!profile) throw new Error("User not found");
        profile = { ...profile, ...data, updatedAt: getCurrentTimestamp() };
        setLocalStorageItem(`user:${userId}`, profile);
        result = { success: true, profile };
      }
    } else if (endpoint.startsWith('/wallet')) {
      const userId = endpoint.split('/')[2];
      if (endpoint === `/wallet/${userId}` && method === 'GET') {
        let wallet = getLocalStorageItem(`wallet:${userId}`, { money: 0, credits: 20, equity: 0 });
        setLocalStorageItem(`wallet:${userId}`, wallet); // Ensure it's saved if created
        result = { wallet };
      } else if (endpoint === `/wallet/${userId}/update` && method === 'POST') {
        const { type, amount, operation } = data;
        let wallet = getLocalStorageItem(`wallet:${userId}`, { money: 0, credits: 0, equity: 0 });
        if (operation === 'add') wallet[type] += amount;
        else if (operation === 'subtract') wallet[type] = Math.max(0, wallet[type] - amount);
        setLocalStorageItem(`wallet:${userId}`, wallet);
        const transaction = { id: generateId(), userId, type, amount, operation, timestamp: getCurrentTimestamp(), balance: wallet[type], description: data.description };
        setLocalStorageItem(`transaction:${transaction.id}`, transaction);
        result = { success: true, wallet };
      } else if (endpoint === `/wallet/${userId}/transactions` && method === 'GET') {
        const transactions = getAllLocalStorageItems<Transaction>('transaction:').filter(tx => tx.userId === userId);
        result = { transactions };
      }
    } else if (endpoint.startsWith('/jobs')) {
      const jobId = endpoint.split('/')[2];
      if (endpoint === '/jobs' && method === 'POST') {
        const job = { id: generateId(), status: 'open', applicants: [], selectedFreelancer: null, createdAt: getCurrentTimestamp(), updatedAt: getCurrentTimestamp(), ...data };
        setLocalStorageItem(`job:${job.id}`, job);
        result = { success: true, job };
      } else if (endpoint === '/jobs' && method === 'GET') {
        const jobs = getAllLocalStorageItems<Job>('job:').filter(job => job.status === 'open');
        result = { jobs };
      } else if (endpoint === `/jobs/${jobId}/apply` && method === 'POST') {
        let job = getLocalStorageItem(`job:${jobId}`, null);
        if (!job) throw new Error("Job not found");
        job.applicants.push({ appliedAt: getCurrentTimestamp(), ...data });
        setLocalStorageItem(`job:${jobId}`, job);
        result = { success: true, job };
      }
    } else if (endpoint.startsWith('/skills')) {
      const skillId = endpoint.split('/')[2];
      if (endpoint === '/skills' && method === 'POST') {
        const skillOffering = { id: generateId(), status: 'available', matches: [], createdAt: getCurrentTimestamp(), updatedAt: getCurrentTimestamp(), ...data };
        setLocalStorageItem(`skill:${skillOffering.id}`, skillOffering);
        result = { success: true, skillOffering };
      } else if (endpoint === '/skills' && method === 'GET') {
        const skills = getAllLocalStorageItems<SkillOffering>('skill:').filter(skill => skill.status === 'available');
        result = { skills };
      } else if (endpoint === `/skills/${skillId}/request` && method === 'POST') {
        let skill = getLocalStorageItem(`skill:${skillId}`, null);
        if (!skill) throw new Error("Skill offering not found");
        skill.matches.push({ requestedAt: getCurrentTimestamp(), status: 'pending', ...data });
        setLocalStorageItem(`skill:${skillId}`, skill);
        result = { success: true, skill };
      }
    } else if (endpoint.startsWith('/projects')) {
      const projectId = endpoint.split('/')[2];
      if (endpoint === '/projects' && method === 'POST') {
        const project = { id: generateId(), currentFunding: 0, status: 'funding', investors: [], createdAt: getCurrentTimestamp(), updatedAt: getCurrentTimestamp(), ...data };
        setLocalStorageItem(`project:${project.id}`, project);
        result = { success: true, project };
      } else if (endpoint === '/projects' && method === 'GET') {
        const projects = getAllLocalStorageItems<InvestmentProject>('project:').filter(p => p.status === 'funding');
        result = { projects };
      } else if (endpoint === `/projects/${projectId}/invest` && method === 'POST') {
        const { investorId, amount } = data;
        let project = getLocalStorageItem(`project:${projectId}`, null);
        if (!project) throw new Error("Project not found");
        if (project.status !== 'funding') throw new Error("Project is not accepting investments");
        
        let wallet = getLocalStorageItem(`wallet:${investorId}`, { money: 0, credits: 0, equity: 0 });
        if (wallet.money < amount) throw new Error("Insufficient funds");

        const investment = { investorId, amount, investedAt: getCurrentTimestamp(), equityPercentage: (amount / project.fundingGoal) * 100 };
        project.investors.push(investment);
        project.currentFunding += amount;
        if (project.currentFunding >= project.fundingGoal) project.status = 'funded';
        setLocalStorageItem(`project:${projectId}`, project);

        wallet.money -= amount;
        wallet.equity += investment.equityPercentage;
        setLocalStorageItem(`wallet:${investorId}`, wallet);
        
        const transaction = { id: generateId(), userId: investorId, type: "money", amount: -amount, operation: "subtract", timestamp: getCurrentTimestamp(), balance: wallet.money, description: `Investment in ${project.title}` };
        setLocalStorageItem(`transaction:${transaction.id}`, transaction);

        result = { success: true, project, investment };
      }
    } else if (endpoint.startsWith('/notifications')) {
      const userId = endpoint.split('/')[2];
      const notificationId = endpoint.split('/')[3];
      if (endpoint === `/notifications/${userId}` && method === 'GET') {
        const notifications = getAllLocalStorageItems<Notification>('notification:').filter(n => n.userId === userId);
        result = { notifications };
      } else if (endpoint === '/notifications' && method === 'POST') {
        const notification = { id: generateId(), read: false, createdAt: getCurrentTimestamp(), ...data };
        setLocalStorageItem(`notification:${notification.userId}:${notification.id}`, notification);
        result = { success: true, notification };
      } else if (endpoint === `/notifications/${userId}/${notificationId}/read` && method === 'PUT') {
        let notification = getLocalStorageItem(`notification:${userId}:${notificationId}`, null);
        if (!notification) throw new Error("Notification not found");
        notification.read = true;
        setLocalStorageItem(`notification:${userId}:${notificationId}`, notification);
        result = { success: true, notification };
      } else if (endpoint === `/notifications/${userId}/mark-all-read` && method === 'PUT') {
        const notifications = getAllLocalStorageItems<Notification>('notification:').filter(n => n.userId === userId);
        let updatedCount = 0;
        for (const notification of notifications) {
          if (!notification.read) {
            notification.read = true;
            setLocalStorageItem(`notification:${notification.userId}:${notification.id}`, notification);
            updatedCount++;
          }
        }
        result = { success: true, message: `Marked ${updatedCount} notifications as read`, updatedCount };
      }
    } else if (endpoint === '/health' && method === 'GET') {
      result = { status: 'ok', timestamp: getCurrentTimestamp(), message: 'Work & Invest Mock API is running' };
    }

    return { ...result, success: true };
  } catch (error) {
    console.error(`Mock API Request Failed (${method} ${endpoint}):`, error);
    return { success: false, error: (error as Error).message || 'Unknown mock API error' } as T & ApiResponse;
  }
}

interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  [key: string]: any;
}

// ==================== USER API ====================

export interface JobExperience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string | null; // null if current
  description: string;
}

export interface StudyExperience {
  id: string;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string | null; // null if current
  description: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  skills: string[];
  avatar: string;
  location: string;
  rating: number;
  completedJobs: number;
  totalEarnings: number;
  createdAt: string;
  updatedAt: string;
  onboardingCompleted?: boolean;
  profileCompleteness?: number;
  jobExperiences?: JobExperience[];
  studyExperiences?: StudyExperience[];
}

export const userApi = {
  createProfile: (profileData: Partial<UserProfile>) =>
    mockApiRequest<{ profile: UserProfile }>('/users/profile', 'POST', profileData),
  
  getProfile: (userId: string) =>
    mockApiRequest<{ profile: UserProfile }>(`/users/${userId}`),

  updateProfile: (userId: string, profileData: Partial<UserProfile>) =>
    mockApiRequest<{ profile: UserProfile }>(`/users/${userId}/profile`, 'PUT', profileData),
};

// ==================== WALLET API ====================

export interface Wallet {
  money: number;
  credits: number;
  equity: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'money' | 'credits' | 'equity';
  amount: number;
  operation: 'add' | 'subtract';
  timestamp: string;
  balance: number;
  description?: string;
}

export const walletApi = {
  getWallet: (userId: string) =>
    mockApiRequest<{ wallet: Wallet }>(`/wallet/${userId}`),
  
  updateBalance: (userId: string, type: 'money' | 'credits' | 'equity', amount: number, operation: 'add' | 'subtract', description?: string) =>
    mockApiRequest<{ wallet: Wallet }>('/wallet/' + userId + '/update', 'POST', { type, amount, operation, description }),
  
  getTransactions: (userId: string) =>
    mockApiRequest<{ transactions: Transaction[] }>(`/wallet/${userId}/transactions`),
};

// ==================== JOBS API ====================

export interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  skills: string[];
  employerId: string;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  applicants: JobApplication[];
  selectedFreelancer: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  freelancerId: string;
  proposal: string;
  proposedBudget: number;
  appliedAt: string;
}

export const jobsApi = {
  createJob: (jobData: Partial<Job>) =>
    mockApiRequest<{ job: Job }>('/jobs', 'POST', jobData),
  
  getAllJobs: () =>
    mockApiRequest<{ jobs: Job[] }>('/jobs'),
  
  applyToJob: (jobId: string, applicationData: Partial<JobApplication>) =>
    mockApiRequest<{ job: Job }>(`/jobs/${jobId}/apply`, 'POST', applicationData),
};

// ==================== SKILL SWAP API ====================

export interface SkillOffering {
  id: string;
  title: string;
  description: string;
  category: string;
  offeredBy: string;
  lookingFor: string;
  duration: string;
  status: 'available' | 'matched' | 'completed';
  matches: SkillSwapRequest[];
  createdAt: string;
  updatedAt: string;
}

export interface SkillSwapRequest {
  requesterId: string;
  message: string;
  offerInReturn: string;
  requestedAt: string;
  status: 'pending' | 'accepted' | 'declined';
}

export const skillsApi = {
  createSkillOffering: (skillData: Partial<SkillOffering>) =>
    mockApiRequest<{ skillOffering: SkillOffering }>('/skills', 'POST', skillData),
  
  getAllSkills: () =>
    mockApiRequest<{ skills: SkillOffering[] }>('/skills'),
  
  requestSkillSwap: (skillId: string, requestData: Partial<SkillSwapRequest>) =>
    mockApiRequest<{ skill: SkillOffering }>(`/skills/${skillId}/request`, 'POST', requestData),
};

// ==================== PROJECTS API ====================

export interface InvestmentProject {
  id: string;
  title: string;
  description: string;
  fundingGoal: number;
  currentFunding: number;
  minInvestment: number;
  expectedReturn: string;
  riskLevel: string;
  category: string;
  ownerId: string;
  status: 'funding' | 'funded' | 'active' | 'completed';
  investors: Investment[];
  createdAt: string;
  updatedAt: string;
}

export interface Investment {
  investorId: string;
  amount: number;
  investedAt: string;
  equityPercentage: number;
}

export const projectsApi = {
  createProject: (projectData: Partial<InvestmentProject>) =>
    mockApiRequest<{ project: InvestmentProject }>('/projects', 'POST', projectData),
  
  getAllProjects: () =>
    mockApiRequest<{ projects: InvestmentProject[] }>('/projects'),
  
  makeInvestment: (projectId: string, investorId: string, amount: number) =>
    mockApiRequest<{ project: InvestmentProject; investment: Investment }>(`/projects/${projectId}/invest`, 'POST', { investorId, amount }),
};

// ==================== NOTIFICATIONS API ====================

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export const notificationsApi = {
  getNotifications: (userId: string) =>
    mockApiRequest<{ notifications: Notification[] }>(`/notifications/${userId}`),
  
  createNotification: (notificationData: Partial<Notification>) =>
    mockApiRequest<{ notification: Notification }>('/notifications', 'POST', notificationData),
  
  markAsRead: (userId: string, notificationId: string) =>
    mockApiRequest<{ notification: Notification }>(`/notifications/${userId}/${notificationId}/read`, 'PUT'),
  
  markAllAsRead: (userId: string) =>
    mockApiRequest<{ success: boolean; message: string; updatedCount: number }>(`/notifications/${userId}/mark-all-read`, 'PUT'),
};

// ==================== AUTH API ====================

export const authApi = {
  signUp: (email: string, password: string, name: string) =>
    mockApiRequest<{ success: boolean; user: { id: string; name: string; email: string }; message: string }>('/auth/signup', 'POST', { email, password, name }),
  
  signIn: (email: string, password: string) =>
    mockApiRequest<{ success: boolean; user: { id: string; name: string; email: string }; message: string }>('/auth/signin', 'POST', { email, password }),
};

// ==================== HEALTH CHECK ====================

export const healthCheck = () =>
  mockApiRequest<{ status: string }>('/health');

// Expose clearAllLocalStorage for cleanup utility
export const mockBackend = {
  clearAllData: clearAllLocalStorage,
  getAllItems: getAllLocalStorageItems,
  setInitialData: () => {
    // This function can be called once to populate initial data if needed
    // For now, individual API calls will create data if not found.
    // Example:
    // if (!getLocalStorageItem('auth:demo@workandinvest.com', null)) {
    //   const demoUserId = generateId();
    //   setLocalStorageItem('auth:demo@workandinvest.com', { id: demoUserId, email: 'demo@workandinvest.com', password: 'demo123', createdAt: getCurrentTimestamp() });
    //   setLocalStorageItem(`user:${demoUserId}`, { id: demoUserId, name: 'Demo User', email: 'demo@workandinvest.com', bio: 'This is a demo profile.', skills: ['React', 'Design'], location: 'Tunis', rating: 4.5, completedJobs: 5, totalEarnings: 1200, createdAt: getCurrentTimestamp(), updatedAt: getCurrentTimestamp(), onboardingCompleted: true, profileCompleteness: 100 });
    //   setLocalStorageItem(`wallet:${demoUserId}`, { money: 1000, credits: 50, equity: 200 });
    //   toast.info('Demo user created in local storage!');
    // }
  }
};