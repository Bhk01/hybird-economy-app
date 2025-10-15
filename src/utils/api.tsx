import { toast } from 'sonner'; // Import toast for local feedback

// --- Local Storage Mock Backend Configuration ---
const LOCAL_STORAGE_PREFIX = 'work_invest_mock_';
const MOCK_NETWORK_DELAY = 300; // Simulate network latency

// --- Local Storage Helper Functions ---
function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage for key ${key}:`, error);
    return defaultValue;
  }
}

// Export helper for tests and utilities
export { getLocalStorageItem };

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

function getLocalStorageKeys(prefix: string): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(LOCAL_STORAGE_PREFIX + prefix)) {
      keys.push(key);
    }
  }
  return keys;
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
          jobExperiences: [], studyExperiences: [], certifications: [], servicesOffered: [], reviews: [], portfolio: []
        });
        setLocalStorageItem(`wallet:${userId}`, { money: 0, credits: 20, equity: 0 });
        result = { success: true, user: { id: userId, name, email }, message: "Account created successfully" };
      } else if (endpoint === '/auth/signin' && method === 'POST') {
        const { email, password } = data;
        if (!email || !password) throw new Error("Missing required fields: email, password");
        const userAuth = getLocalStorageItem<{ id: string; password: string }>(`auth:${email}`, { id: '', password: '' });
        if (!userAuth.id) throw new Error("No account found with this email. Please sign up.");

        const profile = getLocalStorageItem<UserProfile>(`user:${userAuth.id}`, {
          id: '',
          name: '',
          email: '',
          bio: '',
          skills: [],
          avatar: '',
          location: '',
          rating: 0,
          completedJobs: 0,
          totalEarnings: 0,
          createdAt: '',
          updatedAt: '',
          onboardingCompleted: false,
          profileCompleteness: 0,
          jobExperiences: [],
          studyExperiences: [],
          certifications: [],
          servicesOffered: [],
          reviews: []
        });
        if (!profile.id) throw new Error("User profile not found. Please contact support.");
        result = { success: true, user: { id: profile.id, name: profile.name, email: profile.email }, message: "Login successful" };
      }
    } else if (endpoint.startsWith('/users')) {
      const userId = endpoint.split('/')[2];
      if (endpoint === `/users/profile` && method === 'POST') { // For initial profile creation if not done during signup
        const { userId: newUserId, name, email, ...rest } = data;
        const existingProfile = getLocalStorageItem<UserProfile | null>(`user:${newUserId}`, null);
        // Add type guards to ensure objects are not null or undefined
        if (!existingProfile) {
          throw new Error("User profile not found.");
        }

        if (existingProfile) {
          const {
            bio = "",
            skills = [],
            avatar = "",
            location = "",
            rating = 0,
            completedJobs = 0,
            totalEarnings = 0,
            createdAt = getCurrentTimestamp(),
            updatedAt = getCurrentTimestamp(),
            onboardingCompleted = false,
            profileCompleteness = 0,
            jobExperiences = [],
            studyExperiences = [],
            certifications = [],
            servicesOffered = [],
            reviews = []
          } = existingProfile;

          // Use these destructured values safely
        }

        const profile = {
          id: newUserId, name, email,
          bio: rest.bio || existingProfile?.bio || "", skills: rest.skills || existingProfile?.skills || [],
          avatar: rest.avatar || existingProfile?.avatar || "", location: rest.location || existingProfile?.location || "",
          rating: existingProfile?.rating || 0, completedJobs: existingProfile?.completedJobs || 0, totalEarnings: existingProfile?.totalEarnings || 0,
          createdAt: existingProfile?.createdAt || getCurrentTimestamp(), updatedAt: getCurrentTimestamp(),
          onboardingCompleted: rest.onboardingCompleted ?? existingProfile?.onboardingCompleted ?? false,
          profileCompleteness: rest.profileCompleteness ?? existingProfile?.profileCompleteness ?? 0,
          jobExperiences: rest.jobExperiences || existingProfile?.jobExperiences || [],
          studyExperiences: rest.studyExperiences || existingProfile?.studyExperiences || [],
          certifications: rest.certifications || existingProfile?.certifications || [],
          servicesOffered: rest.servicesOffered || existingProfile?.servicesOffered || [],
          reviews: existingProfile?.reviews || [],
          portfolio: existingProfile?.portfolio || []
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
        // Refactor dynamic property access
        if (profile && typeof profile === 'object') {
          profile = { ...(profile as UserProfile), ...data, updatedAt: getCurrentTimestamp() };
        } else {
          throw new Error("Invalid profile object");
        }
        setLocalStorageItem(`user:${userId}`, profile);
        result = { success: true, profile };
      } else if (endpoint === `/users/${userId}/block` && method === 'POST') {
        // Simulate blocking user
        console.log(`User ${data.blockerId} blocked user ${userId}`);
        result = { success: true, message: "User blocked successfully" };
      } else if (endpoint === `/users/${userId}/report` && method === 'POST') {
        // Simulate reporting user
        console.log(`User ${data.reporterId} reported user ${userId} for reason: ${data.reason}`);
        result = { success: true, message: "User reported successfully" };
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
        // Refactor dynamic property access
        if (wallet && typeof wallet === 'object' && type in wallet) {
          if (operation === 'add') {
            wallet[type as keyof Wallet] += amount;
          } else if (operation === 'subtract') {
            wallet[type as keyof Wallet] = Math.max(0, wallet[type as keyof Wallet] - amount);
          }
        }
        setLocalStorageItem(`wallet:${userId}`, wallet);
        const transaction = {
          id: generateId(),
          userId,
          type,
          amount,
          operation,
          timestamp: getCurrentTimestamp(),
          balance: wallet[type as keyof Wallet],
          description: data.description,
        };
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
        if (job && typeof job === 'object' && 'applicants' in job && Array.isArray((job as Job).applicants)) {
          (job as Job).applicants.push({ appliedAt: getCurrentTimestamp(), ...data });
        } else {
          throw new Error("Invalid job object or applicants array");
        }
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
        if (skill && typeof skill === 'object' && 'matches' in skill && Array.isArray((skill as SkillOffering).matches)) {
          (skill as SkillOffering).matches.push({ requestedAt: getCurrentTimestamp(), status: 'pending', ...data });
        } else {
          throw new Error("Invalid skill object or matches array");
        }
        setLocalStorageItem(`skill:${skillId}`, skill);
        result = { success: true, skill };
      } else if (endpoint === '/skills/paid' && method === 'POST') { // New endpoint for paid skill offerings
        const paidSkillOffering = { id: generateId(), status: 'available', matches: [], createdAt: getCurrentTimestamp(), updatedAt: getCurrentTimestamp(), isPaid: true, ...data };
        setLocalStorageItem(`skill:${paidSkillOffering.id}`, paidSkillOffering);
        result = { success: true, skillOffering: paidSkillOffering };
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
        if (project && typeof project === 'object' && 'status' in project && 'fundingGoal' in project && 'investors' in project && 'currentFunding' in project) {
          const typedProject = project as InvestmentProject;
          if (typedProject.status !== 'funding') throw new Error("Project is not accepting investments");
          const investment = {
            investorId,
            amount,
            investedAt: getCurrentTimestamp(),
            equityPercentage: (amount / typedProject.fundingGoal) * 100,
          };
          if (Array.isArray(typedProject.investors)) {
            typedProject.investors.push(investment);
          } else {
            throw new Error("Invalid investors array");
          }
          typedProject.currentFunding += amount;
          if (typedProject.currentFunding >= typedProject.fundingGoal) typedProject.status = 'funded';

          const wallet = getLocalStorageItem<Wallet>(`wallet:${investorId}`, { money: 0, credits: 0, equity: 0 });
          wallet.money -= amount;
          wallet.equity += investment.equityPercentage;
          setLocalStorageItem(`wallet:${investorId}`, wallet);

          result = { success: true, project: typedProject, investment };
        } else {
          throw new Error("Invalid project object");
        }
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
        if (notification && typeof notification === 'object' && 'read' in notification) {
          (notification as Notification).read = true;
        } else {
          throw new Error("Invalid notification object");
        }
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
    } else if (endpoint.startsWith('/reviews')) {
      const targetUserId = endpoint.split('/')[2];
      if (endpoint === `/reviews/${targetUserId}` && method === 'GET') {
        const reviews = getAllLocalStorageItems<Review>('review:').filter(r => r.targetUserId === targetUserId);
        result = { reviews };
      } else if (endpoint === `/reviews/${targetUserId}/add` && method === 'POST') {
        const { reviewerId, rating, comment } = data;
        if (!reviewerId || !rating || !comment) throw new Error("Missing required fields for review");
        const review: Review = { id: generateId(), targetUserId, reviewerId, rating, comment, createdAt: getCurrentTimestamp() };
        setLocalStorageItem(`review:${review.id}`, review);

        // Update target user's average rating and review count
        let targetProfile = getLocalStorageItem(`user:${targetUserId}`, null);
        if (targetProfile) {
          const allReviewsForTarget = getAllLocalStorageItems<Review>('review:').filter(r => r.targetUserId === targetUserId);
          const totalRating = allReviewsForTarget.reduce((sum, r) => sum + r.rating, 0);
          if (targetProfile && typeof targetProfile === 'object' && 'rating' in targetProfile && 'reviews' in targetProfile) {
            const typedProfile = targetProfile as UserProfile;
            typedProfile.rating = totalRating / allReviewsForTarget.length;
            typedProfile.reviews = allReviewsForTarget;
          } else {
            throw new Error("Invalid target profile object");
          }
          setLocalStorageItem(`user:${targetUserId}`, targetProfile);
        }
        result = { success: true, review };
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

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface Service {
  id: string;
  name: string;
  price: string; // e.g., "150-300 TND/project"
  rating: number;
}

export interface Review {
  id: string;
  targetUserId: string;
  reviewerId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
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
  certifications?: Certification[];
  servicesOffered?: Service[];
  reviews?: Review[]; // Added reviews to UserProfile
  portfolio?: {
    id: string;
    title: string;
    description?: string;
    tags?: string[];
    link?: string;
    media?: string | null;
    createdAt?: string;
  }[];
}

export const userApi = {
  createProfile: (profileData: Partial<UserProfile>) =>
    mockApiRequest<{ profile: UserProfile }>('/users/profile', 'POST', profileData),

  getProfile: (userId: string) =>
    mockApiRequest<{ profile: UserProfile }>(`/users/${userId}`),

  // Public profile fetch (non-destructive)
  getPublicProfile: (userId: string) =>
    mockApiRequest<{ profile: UserProfile }>(`/users/${userId}`),

  // Update profile fields
  updateProfile: (userId: string, profileData: Partial<UserProfile>) =>
    mockApiRequest<{ success: boolean; profile: UserProfile }>(`/users/${userId}/profile`, 'PUT', profileData),

  blockUser: (targetUserId: string, blockerId: string) =>
    mockApiRequest<{ success: boolean; message: string }>(`/users/${targetUserId}/block`, 'POST', { blockerId }),

  reportUser: (targetUserId: string, reporterId: string, reason: string) =>
    mockApiRequest<{ success: boolean; message: string }>(`/users/${targetUserId}/report`, 'POST', { reporterId, reason }),

  // Reset profile: clean up associated items and write a blank profile
  resetProfile: async (userId: string) => {
    try {
      const existing = getLocalStorageItem<UserProfile | null>(`user:${userId}`, null);
      const userEmail = existing?.email;

      // Remove jobs
      const jobKeys = getLocalStorageKeys('job:');
      for (const key of jobKeys) {
        try {
          const job = JSON.parse(localStorage.getItem(key) || 'null');
          if (job && (job.employerId === userId || job.employerId === userEmail)) {
            localStorage.removeItem(key);
          }
        } catch (e) { /* ignore */ }
      }

      // Remove skills
      const skillKeys = getLocalStorageKeys('skill:');
      for (const key of skillKeys) {
        try {
          const skill = JSON.parse(localStorage.getItem(key) || 'null');
          if (skill && (skill.offeredBy === userId || skill.offeredBy === userEmail)) {
            localStorage.removeItem(key);
          }
        } catch (e) { /* ignore */ }
      }

      // Remove projects
      const projectKeys = getLocalStorageKeys('project:');
      for (const key of projectKeys) {
        try {
          const project = JSON.parse(localStorage.getItem(key) || 'null');
          if (project && (project.ownerId === userId || project.ownerId === userEmail)) {
            localStorage.removeItem(key);
          }
        } catch (e) { /* ignore */ }
      }

      // Remove transactions
      const txKeys = getLocalStorageKeys('transaction:');
      for (const key of txKeys) {
        try {
          const tx = JSON.parse(localStorage.getItem(key) || 'null');
          if (tx && tx.userId === userId) {
            localStorage.removeItem(key);
          }
        } catch (e) { /* ignore */ }
      }

      // Remove notifications
      const notifKeys = getLocalStorageKeys('notification:');
      for (const key of notifKeys) {
        try {
          const n = JSON.parse(localStorage.getItem(key) || 'null');
          if (n && n.userId === userId) {
            localStorage.removeItem(key);
          }
        } catch (e) { /* ignore */ }
      }

      // Remove reviews written by or targeting this user
      const reviewKeys = getLocalStorageKeys('review:');
      for (const key of reviewKeys) {
        try {
          const r = JSON.parse(localStorage.getItem(key) || 'null');
          if (r && (r.reviewerId === userId || r.targetUserId === userId)) {
            localStorage.removeItem(key);
          }
        } catch (e) { /* ignore */ }
      }

      // Remove wallet and auth entries
      deleteLocalStorageItem(`wallet:${userId}`);
      if (userEmail) deleteLocalStorageItem(`auth:${userEmail}`);

      // Write a default blank profile
      const defaultProfile: UserProfile = {
        id: userId,
        name: '',
        email: userEmail || '',
        bio: '',
        skills: [],
        avatar: '',
        location: '',
        rating: 0,
        completedJobs: 0,
        totalEarnings: 0,
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
        onboardingCompleted: false,
        profileCompleteness: 0,
        jobExperiences: [],
        studyExperiences: [],
        certifications: [],
        servicesOffered: [],
        reviews: [],
        portfolio: []
      };
      setLocalStorageItem(`user:${userId}`, defaultProfile);
      return { success: true, profile: defaultProfile };
    } catch (err) {
      console.error('resetProfile error', err);
      return { success: false, error: (err as Error).message || 'reset failed' } as any;
    }
  }
,
  // Permanently delete a user's account and all associated artifacts
  deleteAccount: async (userId: string) => {
    try {
      const existing = getLocalStorageItem<UserProfile | null>(`user:${userId}`, null);
      const userEmail = existing?.email;

      // Robust scan: remove any localStorage key that contains the userId or userEmail
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const fullKey = localStorage.key(i);
        if (!fullKey) continue;
        const rawKey = fullKey.startsWith(LOCAL_STORAGE_PREFIX) ? fullKey.slice(LOCAL_STORAGE_PREFIX.length) : fullKey;
        try {
          const itemRaw = localStorage.getItem(fullKey);
          // Remove if the key name references the userId or if contents reference the user
          if (rawKey.includes(userId) || (userEmail && rawKey.includes(userEmail))) {
            localStorage.removeItem(fullKey);
            continue;
          }
          if (!itemRaw) continue;
          const item = JSON.parse(itemRaw);
          if (item && typeof item === 'object') {
            const vals = [item.userId, item.ownerId, item.employerId, item.reviewerId, item.targetUserId, item.offeredBy, item.email];
            if (vals.some(v => v === userId || (userEmail && v === userEmail))) {
              localStorage.removeItem(fullKey);
            }
          }
        } catch (e) {
          // ignore parse errors
        }
      }

      // Finally remove any session/auth tokens referencing this user
      deleteLocalStorageItem(`auth:${userEmail || ''}`);
      deleteLocalStorageItem(`user:${userId}`);
      deleteLocalStorageItem(`wallet:${userId}`);

      return { success: true, message: 'Account deleted' };
    } catch (err) {
      console.error('deleteAccount error', err);
      return { success: false, error: (err as Error).message || 'delete failed' } as any;
    }
  }
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
  isPaid?: boolean; // New field for paid teaching offers
  price?: number | null; // New field for paid teaching offers
  certificateRequired?: boolean; // New field for paid teaching offers
  certificateUrl?: string | null; // New field for paid teaching offers
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
  
  createPaidSkillOffering: (skillData: Partial<SkillOffering>) => // New API function
    mockApiRequest<{ skillOffering: SkillOffering }>('/skills/paid', 'POST', { ...skillData, isPaid: true }),

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

// ==================== REVIEWS API ====================

export const reviewsApi = {
  addReview: (targetUserId: string, reviewerId: string, rating: number, comment: string) =>
    mockApiRequest<{ success: boolean; review: Review }>(`/reviews/${targetUserId}/add`, 'POST', { reviewerId, rating, comment }),
  
  getReviewsForUser: (targetUserId: string) =>
    mockApiRequest<{ reviews: Review[] }>(`/reviews/${targetUserId}`),
};

// ==================== AUTH API ====================

export const authApi = {
  signUp: (email: string, password: string, name: string) =>
    mockApiRequest<{ success: boolean; user: { id: string; name: string; email: string }; message: string }>('/auth/signup', 'POST', { email, password, name }),
  
  signIn: (email: string, password: string) =>
    mockApiRequest<{ success: boolean; user: { id: string; name: string; email: string }; message: string }>('/auth/signin', 'POST', { email, password }),
  
  logout: (userId: string) => {
    // Logout should only remove session tokens, not the user's stored profile
    // Many parts of the app rely on persistent profile/wallet data; deleting them on logout caused data loss.
    // If you have a session token stored use `session:${userId}` or similar key; remove it here.
    deleteLocalStorageItem(`session:${userId}`);
    return { success: true, message: 'User logged out.' };
  },
};

// ==================== HEALTH CHECK ====================

export const healthCheck = () =>
  mockApiRequest<{ status: string }>('/health');

// Remove demo data initialization
export const mockBackend = {
  clearAllData: clearAllLocalStorage,
  getAllItems: getAllLocalStorageItems,
  // kept for backwards compatibility — previously initialized demo data; now a noop
  setInitialData: async () => {
    // No demo data to initialize. Keep for compatibility with callers.
    try {
      const mockDataInitialized = getLocalStorageItem('mockDataInitialized', false);
      if (!mockDataInitialized) {
        setLocalStorageItem('mockDataInitialized', true);
        console.log('Mock backend: setInitialData called (noop) - marked initialized.');
      }
    } catch (e) {
      console.warn('mockBackend.setInitialData noop failed:', e);
    }
  }
};