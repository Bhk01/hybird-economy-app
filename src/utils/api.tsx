import { projectId, publicAnonKey } from './supabase/info';

// Use environment variable for API_BASE_URL, fallback to Supabase URL if not set
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `https://${projectId}.supabase.co/functions/v1/make-server-478a5c23`;

interface ApiResponse<T = any> {
  success?: boolean; // Added success property
  error?: string;
  [key: string]: any;
}

// Generic API request function
async function apiRequest<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<T & ApiResponse> { // Ensure ApiResponse is part of the return type
  let rawResponseText = '';
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`API Request URL (${method}):`, url); // Log the full URL
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    // Read the response as text first to debug JSON parsing issues
    rawResponseText = await response.text();
    console.log(`API Raw Response (${method} ${endpoint}):`, rawResponseText);

    let result;
    try {
      result = JSON.parse(rawResponseText);
    } catch (jsonError) {
      console.error(`API JSON Parse Error (${method} ${endpoint}):`, jsonError);
      console.error('Raw response text that caused the error:', rawResponseText);
      throw new Error(`Failed to parse JSON response: ${rawResponseText.substring(0, 100)}...`);
    }

    console.log(`API Parsed Response (${method} ${endpoint}):`, {
      status: response.status,
      ok: response.ok,
      result
    });

    if (!response.ok) {
      console.error(`API Error (${method} ${endpoint}):`, result);
      const errorMessage = result.error || result.message || `HTTP ${response.status}`;
      console.error('Throwing error:', errorMessage);
      throw new Error(errorMessage);
    }

    return { ...result, success: true }; // Add success: true for successful responses
  } catch (error) {
    console.error(`API Request Failed (${method} ${endpoint}):`, error);
    // Return a structured error response
    return { success: false, error: (error as Error).message || 'Unknown API error' } as T & ApiResponse;
  }
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
    apiRequest<{ profile: UserProfile }>('/users/profile', 'POST', profileData),
  
  getProfile: (userId: string) =>
    apiRequest<{ profile: UserProfile }>(`/users/${userId}`),

  updateProfile: (userId: string, profileData: Partial<UserProfile>) =>
    apiRequest<{ profile: UserProfile }>(`/users/${userId}/profile`, 'PUT', profileData),
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
    apiRequest<{ wallet: Wallet }>(`/wallet/${userId}`),
  
  updateBalance: (userId: string, type: 'money' | 'credits' | 'equity', amount: number, operation: 'add' | 'subtract') =>
    apiRequest<{ wallet: Wallet }>(`/wallet/${userId}/update`, 'POST', { type, amount, operation }),
  
  getTransactions: (userId: string) =>
    apiRequest<{ transactions: Transaction[] }>(`/wallet/${userId}/transactions`),
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
    apiRequest<{ job: Job }>('/jobs', 'POST', jobData),
  
  getAllJobs: () =>
    apiRequest<{ jobs: Job[] }>('/jobs'),
  
  applyToJob: (jobId: string, applicationData: Partial<JobApplication>) =>
    apiRequest<{ job: Job }>(`/jobs/${jobId}/apply`, 'POST', applicationData),
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
    apiRequest<{ skillOffering: SkillOffering }>('/skills', 'POST', skillData),
  
  getAllSkills: () =>
    apiRequest<{ skills: SkillOffering[] }>('/skills'),
  
  requestSkillSwap: (skillId: string, requestData: Partial<SkillSwapRequest>) =>
    apiRequest<{ skill: SkillOffering }>(`/skills/${skillId}/request`, 'POST', requestData),
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
    apiRequest<{ project: InvestmentProject }>('/projects', 'POST', projectData),
  
  getAllProjects: () =>
    apiRequest<{ projects: InvestmentProject[] }>('/projects'),
  
  makeInvestment: (projectId: string, investorId: string, amount: number) =>
    apiRequest<{ project: InvestmentProject; investment: Investment }>(`/projects/${projectId}/invest`, 'POST', { investorId, amount }),
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
    apiRequest<{ notifications: Notification[] }>(`/notifications/${userId}`),
  
  createNotification: (notificationData: Partial<Notification>) =>
    apiRequest<{ notification: Notification }>('/notifications', 'POST', notificationData),
  
  markAsRead: (userId: string, notificationId: string) =>
    apiRequest<{ notification: Notification }>(`/notifications/${userId}/${notificationId}/read`, 'PUT'),
  
  markAllAsRead: (userId: string) =>
    apiRequest<{ success: boolean; message: string; updatedCount: number }>(`/notifications/${userId}/mark-all-read`, 'PUT'),
};

// ==================== AUTH API ====================

export const authApi = {
  signUp: (email: string, password: string, name: string) =>
    apiRequest<{ success: boolean; user: { id: string; name: string; email: string }; message: string }>('/auth/signup', 'POST', { email, password, name }),
  
  signIn: (email: string, password: string) =>
    apiRequest<{ success: boolean; user: { id: string; name: string; email: string }; message: string }>('/auth/signin', 'POST', { email, password }),
};

// ==================== HEALTH CHECK ====================

export const healthCheck = () =>
  apiRequest<{ status: string }>('/health');