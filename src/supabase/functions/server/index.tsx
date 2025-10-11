import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Utility function to generate unique IDs
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Utility function to get current timestamp
function getCurrentTimestamp() {
  return new Date().toISOString();
}

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ 
    status: "ok",
    timestamp: getCurrentTimestamp(),
    message: "Work & Invest API is running"
  });
});

// Database cleanup endpoint (for development/testing)
app.delete("/admin/cleanup", async (c) => {
  try {
    // Get all keys and delete auth, user, and wallet data
    const authKeys = await kv.getByPrefix("auth:");
    const userKeys = await kv.getByPrefix("user:");
    const walletKeys = await kv.getByPrefix("wallet:");
    const jobKeys = await kv.getByPrefix("job:");
    const skillKeys = await kv.getByPrefix("skill:");
    const projectKeys = await kv.getByPrefix("project:");
    const transactionKeys = await kv.getByPrefix("transaction:");
    const notificationKeys = await kv.getByPrefix("notification:");
    
    const allKeysToDelete = [
      ...authKeys.map((e: any) => `auth:${e.email}`),
      ...userKeys.map((e: any) => `user:${e.id}`),
      ...walletKeys.map((e: any) => `wallet:${e.id || e.userId}`),
      ...jobKeys.map((e: any) => `job:${e.id}`),
      ...skillKeys.map((e: any) => `skill:${e.id}`),
      ...projectKeys.map((e: any) => `project:${e.id}`),
      ...transactionKeys.map((e: any) => `transaction:${e.id}`),
      ...notificationKeys.map((e: any) => `notification:${e.userId}:${e.id}`),
    ];

    console.log(`Backend: Initiating database cleanup. Total keys to delete: ${allKeysToDelete.length}`);
    
    // Delete all entries
    for (const key of allKeysToDelete) {
      await kv.del(key);
    }
    
    console.log(`Backend: Database cleanup completed. Removed ${authKeys.length} auth entries, ${userKeys.length} users, ${walletKeys.length} wallets, etc.`);
    
    return c.json({ 
      success: true, 
      message: "Database cleaned successfully",
      removed: {
        auth: authKeys.length,
        users: userKeys.length,
        wallets: walletKeys.length,
        jobs: jobKeys.length,
        skills: skillKeys.length,
        projects: projectKeys.length,
        transactions: transactionKeys.length,
        notifications: notificationKeys.length,
      }
    });
  } catch (error) {
    console.log(`Backend: Error cleaning database: ${error}`);
    return c.json({ success: false, error: "Failed to clean database" }, 500);
  }
});

// ==================== AUTHENTICATION ====================

// Sign up new user
app.post("/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    console.log(`Backend: Signup attempt for email: ${email}, name: ${name}`);

    if (!email || !password || !name) {
      console.log("Backend: Missing required fields for signup.");
      return c.json({ success: false, error: "Missing required fields: email, password, name" }, 400);
    }

    // Check if user already exists
    const existingUserAuth = await kv.get(`auth:${email}`);
    if (existingUserAuth) {
      console.log(`Backend: Signup blocked - email already exists: ${email}`);
      return c.json({ 
        success: false, 
        error: "An account with this email already exists. Please sign in instead.",
        code: "EMAIL_EXISTS"
      }, 409);
    }

    // Create user ID
    const userId = generateId();

    // Store user credentials (in production, passwords should be hashed)
    const userAuth = {
      id: userId,
      email,
      password, // In production, hash this with bcrypt or similar
      createdAt: getCurrentTimestamp()
    };

    await kv.set(`auth:${email}`, userAuth);
    console.log(`Backend: Stored auth for user: ${userId}`);

    // Create user profile with onboardingCompleted: false
    const profile = {
      id: userId,
      name,
      email,
      bio: "",
      skills: [],
      avatar: "",
      location: "",
      rating: 0,
      completedJobs: 0,
      totalEarnings: 0,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
      onboardingCompleted: false, // Explicitly set to false for new users
      profileCompleteness: 0,
      jobExperiences: [],
      studyExperiences: []
    };

    await kv.set(`user:${userId}`, profile);
    console.log(`Backend: Created initial user profile for: ${userId}`);
    
    // Create initial wallet with 0 money, 20 credits, 0 equity
    await kv.set(`wallet:${userId}`, {
      money: 0,
      credits: 20,
      equity: 0
    });
    console.log(`Backend: Created initial wallet for user: ${userId}`);
    
    console.log(`Backend: New user signed up successfully: ${userId}`);
    
    return c.json({ 
      success: true, 
      user: { id: userId, name, email },
      message: "Account created successfully"
    });
  } catch (error) {
    console.error(`Backend: Error creating user during signup: ${error}`);
    return c.json({ success: false, error: "Failed to create account" }, 500);
  }
});

// Sign in user
app.post("/auth/signin", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    console.log(`Backend: Signin attempt for email: ${email}`);

    if (!email || !password) {
      console.log("Backend: Missing required fields for signin.");
      return c.json({ success: false, error: "Missing required fields: email, password" }, 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log(`Backend: ❌ Invalid email format: ${email}`);
      return c.json({ 
        success: false, 
        error: "Invalid email format. Please enter a valid email address." 
      }, 400);
    }

    // Check if user exists
    const userAuth = await kv.get(`auth:${email}`);
    console.log(`Backend: Retrieved user auth for ${email}:`, userAuth ? "✅ found" : "❌ not found");
    
    if (!userAuth) {
      console.log(`Backend: ❌ No user found for email: ${email}`);
      return c.json({ 
        success: false, 
        error: "No account found with this email. Please sign up." 
      }, 401);
    }

    // Check password
    if (userAuth.password !== password) {
      console.log(`Backend: ❌ Password mismatch for ${email}`);
      return c.json({ 
        success: false, 
        error: "Incorrect password. Try again or reset your password." 
      }, 401);
    }

    // Get user profile
    const profile = await kv.get(`user:${userAuth.id}`);
    if (!profile) {
      console.log(`Backend: No profile found for user ID: ${userAuth.id} after successful auth.`);
      return c.json({ success: false, error: "User profile not found. Please contact support." }, 404);
    }

    console.log(`Backend: User signed in successfully: ${userAuth.id}`);
    
    return c.json({ 
      success: true, 
      user: { id: profile.id, name: profile.name, email: profile.email },
      message: "Login successful"
    });
  } catch (error) {
    console.error(`Backend: Error signing in user: ${error}`);
    return c.json({ success: false, error: "Failed to sign in. Please try again." }, 500);
  }
});

// ==================== USER MANAGEMENT ====================

// Create user profile (POST for initial creation if not done during signup)
app.post("/users/profile", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, name, email, bio, skills, avatar, location, onboardingCompleted, profileCompleteness, jobExperiences, studyExperiences } = body;

    console.log(`Backend: POST /users/profile received for userId: ${userId}, body:`, body);

    if (!userId || !name || !email) {
      console.log("Backend: Missing required fields for POST /users/profile.");
      return c.json({ error: "Missing required fields: userId, name, email" }, 400);
    }

    // Get existing profile to preserve certain fields if it already exists
    const existingProfile = await kv.get(`user:${userId}`);
    console.log(`Backend: Existing profile for ${userId} (POST):`, existingProfile ? 'Found' : 'Not Found');
    
    const profile = {
      id: userId,
      name,
      email,
      bio: bio || existingProfile?.bio || "",
      skills: skills || existingProfile?.skills || [],
      avatar: avatar || existingProfile?.avatar || "",
      location: location || existingProfile?.location || "",
      rating: existingProfile?.rating || 0,
      completedJobs: existingProfile?.completedJobs || 0,
      totalEarnings: existingProfile?.totalEarnings || 0,
      createdAt: existingProfile?.createdAt || getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
      onboardingCompleted: onboardingCompleted ?? existingProfile?.onboardingCompleted ?? false,
      profileCompleteness: profileCompleteness ?? existingProfile?.profileCompleteness ?? 0,
      jobExperiences: jobExperiences || existingProfile?.jobExperiences || [],
      studyExperiences: studyExperiences || existingProfile?.studyExperiences || []
    };

    await kv.set(`user:${userId}`, profile);
    console.log(`Backend: Created/updated profile for user: ${userId} via POST. Final profile:`, profile);
    
    return c.json({ success: true, profile });
  } catch (error) {
    console.error(`Backend: Error creating/updating user profile via POST: ${error}`);
    return c.json({ error: "Failed to create/update profile" }, 500);
  }
});

// Get user profile
app.get("/users/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    console.log(`Backend: GET /users/:userId for userId: ${userId}`);
    const profile = await kv.get(`user:${userId}`);
    
    if (!profile) {
      console.log(`Backend: User profile not found for userId: ${userId}.`);
      return c.json({ error: "User not found" }, 404);
    }
    
    console.log(`Backend: Successfully fetched profile for userId: ${userId}.`);
    return c.json({ profile });
  } catch (error) {
    console.error(`Backend: Error fetching user profile: ${error}`);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

// Update user profile (PUT request)
app.put("/users/:userId/profile", async (c) => {
  try {
    const userId = c.req.param("userId");
    const body = await c.req.json();

    console.log(`Backend: Attempting to handle PUT /users/:userId/profile for userId: ${userId}`); // New log here!
    console.log(`Backend: PUT /users/:userId/profile received for userId: ${userId}, body:`, body);

    const existingProfile = await kv.get(`user:${userId}`);
    console.log(`Backend: Attempting to retrieve profile for userId: ${userId} for update.`);
    console.log(`Backend: Existing profile found:`, existingProfile ? 'YES' : 'NO');

    if (!existingProfile) {
      console.log(`Backend: User profile not found for userId: ${userId} during PUT update. Returning 404.`);
      return c.json({ success: false, error: "User not found" }, 404);
    }

    const updatedProfile = {
      ...existingProfile,
      ...body, // Merge incoming data
      updatedAt: getCurrentTimestamp()
    };

    await kv.set(`user:${userId}`, updatedProfile);
    console.log(`Backend: Successfully updated profile for user: ${userId}. New profile:`, updatedProfile);
    
    return c.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error(`Backend: Error updating user profile for userId ${userId}: ${error}`);
    return c.json({ success: false, error: "Failed to update profile" }, 500);
  }
});

// ==================== WALLET MANAGEMENT ====================

// Get wallet balance
app.get("/wallet/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    console.log(`Backend: GET /wallet/:userId for userId: ${userId}`);
    let wallet = await kv.get(`wallet:${userId}`);
    
    if (!wallet) {
      // Create default wallet if doesn't exist - start with 0 money, 20 credits
      wallet = {
        money: 0,
        credits: 20,
        equity: 0
      };
      await kv.set(`wallet:${userId}`, wallet);
      console.log(`Backend: Created default wallet for user: ${userId}`);
    }
    
    console.log(`Backend: Fetched wallet for userId: ${userId}. Wallet:`, wallet);
    return c.json({ wallet });
  } catch (error) {
    console.error(`Backend: Error fetching wallet: ${error}`);
    return c.json({ error: "Failed to fetch wallet" }, 500);
  }
});

// Update wallet balance
app.post("/wallet/:userId/update", async (c) => {
  try {
    const userId = c.req.param("userId");
    const body = await c.req.json();
    const { type, amount, operation } = body; // type: 'money', 'credits', 'equity'; operation: 'add', 'subtract'

    console.log(`Backend: POST /wallet/:userId/update for userId: ${userId}, type: ${type}, amount: ${amount}, operation: ${operation}`);

    if (!type || !amount || !operation) {
      console.log("Backend: Missing required fields for wallet update.");
      return c.json({ error: "Missing required fields: type, amount, operation" }, 400);
    }

    const currentWallet = await kv.get(`wallet:${userId}`) || {
      money: 0,
      credits: 100,
      equity: 0
    };
    console.log(`Backend: Current wallet for ${userId}:`, currentWallet);

    if (operation === 'add') {
      currentWallet[type] = (currentWallet[type] || 0) + amount;
    } else if (operation === 'subtract') {
      currentWallet[type] = Math.max(0, (currentWallet[type] || 0) - amount);
    }

    await kv.set(`wallet:${userId}`, currentWallet);
    console.log(`Backend: Updated wallet for userId: ${userId}. New wallet:`, currentWallet);
    
    // Log transaction
    const transaction = {
      id: generateId(),
      userId,
      type,
      amount,
      operation,
      timestamp: getCurrentTimestamp(),
      balance: currentWallet[type]
    };
    await kv.set(`transaction:${transaction.id}`, transaction);
    console.log(`Backend: Logged transaction:`, transaction);
    
    return c.json({ success: true, wallet: currentWallet });
  } catch (error) {
    console.error(`Backend: Error updating wallet: ${error}`);
    return c.json({ error: "Failed to update wallet" }, 500);
  }
});

// Get transaction history
app.get("/wallet/:userId/transactions", async (c) => {
  try {
    const userId = c.req.param("userId");
    console.log(`Backend: GET /wallet/:userId/transactions for userId: ${userId}`);
    const transactions = await kv.getByPrefix(`transaction:`);
    
    const userTransactions = transactions
      .filter(tx => tx.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    console.log(`Backend: Fetched ${userTransactions.length} transactions for userId: ${userId}.`);
    return c.json({ transactions: userTransactions });
  } catch (error) {
    console.error(`Backend: Error fetching transactions: ${error}`);
    return c.json({ error: "Failed to fetch transactions" }, 500);
  }
});

// ==================== HIRE MODE ====================

// Create job posting
app.post("/jobs", async (c) => {
  try {
    const body = await c.req.json();
    const { title, description, budget, deadline, skills, employerId } = body;

    console.log(`Backend: POST /jobs received for employerId: ${employerId}, title: ${title}`);

    if (!title || !description || !budget || !employerId) {
      console.log("Backend: Missing required fields for job creation.");
      return c.json({ error: "Missing required fields: title, description, budget, employerId" }, 400);
    }

    const job = {
      id: generateId(),
      title,
      description,
      budget,
      deadline: deadline || "",
      skills: skills || [],
      employerId,
      status: "open", // open, in-progress, completed, cancelled
      applicants: [],
      selectedFreelancer: null,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };

    await kv.set(`job:${job.id}`, job);
    console.log(`Backend: Created job posting: ${job.id}`);
    
    return c.json({ success: true, job });
  } catch (error) {
    console.error(`Backend: Error creating job: ${error}`);
    return c.json({ error: "Failed to create job posting" }, 500);
  }
});

// Get all job postings
app.get("/jobs", async (c) => {
  try {
    console.log("Backend: GET /jobs received.");
    const jobs = await kv.getByPrefix("job:");
    const openJobs = jobs
      .filter(job => job.status === "open")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    console.log(`Backend: Fetched ${openJobs.length} open jobs.`);
    return c.json({ jobs: openJobs });
  } catch (error) {
    console.error(`Backend: Error fetching jobs: ${error}`);
    return c.json({ error: "Failed to fetch jobs" }, 500);
  }
});

// Apply to job
app.post("/jobs/:jobId/apply", async (c) => {
  try {
    const jobId = c.req.param("jobId");
    const body = await c.req.json();
    const { freelancerId, proposal, proposedBudget } = body;

    console.log(`Backend: POST /jobs/:jobId/apply for jobId: ${jobId}, freelancerId: ${freelancerId}`);

    if (!freelancerId || !proposal) {
      console.log("Backend: Missing required fields for job application.");
      return c.json({ error: "Missing required fields: freelancerId, proposal" }, 400);
    }

    const job = await kv.get(`job:${jobId}`);
    if (!job) {
      console.log(`Backend: Job not found for jobId: ${jobId}.`);
      return c.json({ error: "Job not found" }, 404);
    }

    if (job.status !== "open") {
      console.log(`Backend: Job ${jobId} is not open for applications.`);
      return c.json({ error: "Job is no longer accepting applications" }, 400);
    }

    const application = {
      freelancerId,
      proposal,
      proposedBudget: proposedBudget || job.budget,
      appliedAt: getCurrentTimestamp()
    };

    job.applicants.push(application);
    job.updatedAt = getCurrentTimestamp();

    await kv.set(`job:${jobId}`, job);
    console.log(`Backend: Freelancer ${freelancerId} applied to job ${jobId}.`);
    
    return c.json({ success: true, job });
  } catch (error) {
    console.error(`Backend: Error applying to job: ${error}`);
    return c.json({ error: "Failed to apply to job" }, 500);
  }
});

// ==================== SKILL SWAP MODE ====================

// Create skill offering
app.post("/skills", async (c) => {
  try {
    const body = await c.req.json();
    const { title, description, category, offeredBy, lookingFor, duration } = body;

    console.log(`Backend: POST /skills received for offeredBy: ${offeredBy}, title: ${title}`);

    if (!title || !description || !category || !offeredBy) {
      console.log("Backend: Missing required fields for skill offering creation.");
      return c.json({ error: "Missing required fields: title, description, category, offeredBy" }, 400);
    }

    const skillOffering = {
      id: generateId(),
      title,
      description,
      category,
      offeredBy,
      lookingFor: lookingFor || "",
      duration: duration || "1-2 hours",
      status: "available", // available, matched, completed
      matches: [],
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };

    await kv.set(`skill:${skillOffering.id}`, skillOffering);
    console.log(`Backend: Created skill offering: ${skillOffering.id}`);
    
    return c.json({ success: true, skillOffering });
  } catch (error) {
    console.error(`Backend: Error creating skill offering: ${error}`);
    return c.json({ error: "Failed to create skill offering" }, 500);
  }
});

// Get skill offerings
app.get("/skills", async (c) => {
  try {
    console.log("Backend: GET /skills received.");
    const skills = await kv.getByPrefix("skill:");
    const availableSkills = skills
      .filter(skill => skill.status === "available")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    console.log(`Backend: Fetched ${availableSkills.length} available skill offerings.`);
    return c.json({ skills: availableSkills });
  } catch (error) {
    console.error(`Backend: Error fetching skills: ${error}`);
    return c.json({ error: "Failed to fetch skills" }, 500);
  }
});

// Request skill swap
app.post("/skills/:skillId/request", async (c) => {
  try {
    const skillId = c.req.param("skillId");
    const body = await c.req.json();
    const { requesterId, message, offerInReturn } = body;

    console.log(`Backend: POST /skills/:skillId/request for skillId: ${skillId}, requesterId: ${requesterId}`);

    if (!requesterId || !message) {
      console.log("Backend: Missing required fields for skill swap request.");
      return c.json({ error: "Missing required fields: requesterId, message" }, 400);
    }

    const skill = await kv.get(`skill:${skillId}`);
    if (!skill) {
      console.log(`Backend: Skill offering not found for skillId: ${skillId}.`);
      return c.json({ error: "Skill offering not found" }, 404);
    }

    if (skill.status !== "available") {
      console.log(`Backend: Skill offering ${skillId} is not available for requests.`);
      return c.json({ error: "Skill offering is no longer accepting applications" }, 400);
    }

    const swapRequest = {
      requesterId,
      message,
      offerInReturn: offerInReturn || "",
      requestedAt: getCurrentTimestamp(),
      status: "pending" // pending, accepted, declined
    };

    skill.matches.push(swapRequest);
    skill.updatedAt = getCurrentTimestamp();

    await kv.set(`skill:${skillId}`, skill);
    console.log(`Backend: Skill swap request from ${requesterId} for skill ${skillId}.`);
    
    return c.json({ success: true, skill });
  } catch (error) {
    console.error(`Backend: Error requesting skill swap: ${error}`);
    return c.json({ error: "Failed to request skill swap" }, 500);
  }
});

// ==================== INVESTMENT MODE ====================

// Create investment project
app.post("/projects", async (c) => {
  try {
    const body = await c.req.json();
    const { title, description, fundingGoal, minInvestment, expectedReturn, riskLevel, category, ownerId } = body;

    console.log(`Backend: POST /projects received for ownerId: ${ownerId}, title: ${title}`);

    if (!title || !description || !fundingGoal || !ownerId) {
      console.log("Backend: Missing required fields for project creation.");
      return c.json({ error: "Missing required fields: title, description, fundingGoal, ownerId" }, 400);
    }

    const project = {
      id: generateId(),
      title,
      description,
      fundingGoal,
      currentFunding: 0,
      minInvestment: minInvestment || 1,
      expectedReturn: expectedReturn || "10-15%",
      riskLevel: riskLevel || "Medium",
      category: category || "Local Business",
      ownerId,
      status: "funding", // funding, funded, active, completed
      investors: [],
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };

    await kv.set(`project:${project.id}`, project);
    console.log(`Backend: Created investment project: ${project.id}`);
    
    return c.json({ success: true, project });
  } catch (error) {
    console.error(`Backend: Error creating project: ${error}`);
    return c.json({ error: "Failed to create project" }, 500);
  }
});

// Get investment projects
app.get("/projects", async (c) => {
  try {
    console.log("Backend: GET /projects received.");
    const projects = await kv.getByPrefix("project:");
    const activeProjects = projects
      .filter(project => project.status === "funding")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    console.log(`Backend: Fetched ${activeProjects.length} active investment projects.`);
    return c.json({ projects: activeProjects });
  } catch (error) {
    console.error(`Backend: Error fetching projects: ${error}`);
    return c.json({ error: "Failed to fetch projects" }, 500);
  }
});

// Make investment
app.post("/projects/:projectId/invest", async (c) => {
  try {
    const projectId = c.req.param("projectId");
    const body = await c.req.json();
    const { investorId, amount } = body;

    console.log(`Backend: POST /projects/:projectId/invest for projectId: ${projectId}, investorId: ${investorId}, amount: ${amount}`);

    if (!investorId || !amount || amount < 1) {
      console.log("Backend: Missing required fields or invalid amount for investment.");
      return c.json({ error: "Missing required fields or invalid amount (minimum 1 TND)" }, 400);
    }

    const project = await kv.get(`project:${projectId}`);
    if (!project) {
      console.log(`Backend: Project not found for projectId: ${projectId}.`);
      return c.json({ error: "Project not found" }, 404);
    }

    if (project.status !== "funding") {
      console.log(`Backend: Project ${projectId} is not accepting investments.`);
      return c.json({ error: "Project is not accepting investments" }, 400);
    }

    // Check investor's wallet
    const wallet = await kv.get(`wallet:${investorId}`) || { money: 0, credits: 0, equity: 0 };
    if (wallet.money < amount) {
      console.log(`Backend: Insufficient funds for investor ${investorId}. Available: ${wallet.money}, Required: ${amount}.`);
      return c.json({ error: "Insufficient funds" }, 400);
    }

    // Create investment record
    const investment = {
      investorId,
      amount,
      investedAt: getCurrentTimestamp(),
      equityPercentage: (amount / project.fundingGoal) * 100
    };

    project.investors.push(investment);
    project.currentFunding += amount;
    project.updatedAt = getCurrentTimestamp();

    if (project.currentFunding >= project.fundingGoal) {
      project.status = "funded";
      console.log(`Backend: Project ${projectId} fully funded!`);
    }

    await kv.set(`project:${projectId}`, project);

    // Update investor's wallet
    wallet.money -= amount;
    wallet.equity += investment.equityPercentage;
    await kv.set(`wallet:${investorId}`, wallet);

    // Log transaction
    const transaction = {
      id: generateId(),
      userId: investorId,
      type: "money",
      amount: -amount,
      operation: "subtract",
      timestamp: getCurrentTimestamp(),
      balance: wallet.money,
      description: `Investment in ${project.title}`
    };
    await kv.set(`transaction:${transaction.id}`, transaction);
    
    console.log(`Backend: Investment of ${amount} TND made by ${investorId} in project ${projectId}.`);
    return c.json({ success: true, project, investment });
  } catch (error) {
    console.error(`Backend: Error making investment: ${error}`);
    return c.json({ error: "Failed to make investment" }, 500);
  }
  }
);

// ==================== NOTIFICATIONS ====================

// Get notifications for user
app.get("/notifications/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    console.log(`Backend: GET /notifications/:userId for userId: ${userId}`);
    const notifications = await kv.getByPrefix(`notification:${userId}:`);
    
    const sortedNotifications = notifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    console.log(`Backend: Fetched ${sortedNotifications.length} notifications for userId: ${userId}.`);
    return c.json({ notifications: sortedNotifications });
  } catch (error) {
    console.error(`Backend: Error fetching notifications: ${error}`);
    return c.json({ error: "Failed to fetch notifications" }, 500);
  }
});

// Create notification
app.post("/notifications", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, title, message, type } = body;

    console.log(`Backend: POST /notifications received for userId: ${userId}, title: ${title}`);

    if (!userId || !title || !message) {
      console.log("Backend: Missing required fields for notification creation.");
      return c.json({ error: "Missing required fields: userId, title, message" }, 400);
    }

    const notification = {
      id: generateId(),
      userId,
      title,
      message,
      type: type || "info", // info, success, warning, error
      read: false,
      createdAt: getCurrentTimestamp()
    };

    await kv.set(`notification:${userId}:${notification.id}`, notification);
    console.log(`Backend: Created notification: ${notification.id} for user ${userId}.`);
    
    return c.json({ success: true, notification });
  } catch (error) {
    console.error(`Backend: Error creating notification: ${error}`);
    return c.json({ error: "Failed to create notification" }, 500);
  }
});

// Mark notification as read
app.put("/notifications/:userId/:notificationId/read", async (c) => {
  try {
    const userId = c.req.param("userId");
    const notificationId = c.req.param("notificationId");
    
    console.log(`Backend: PUT /notifications/:userId/:notificationId/read for userId: ${userId}, notificationId: ${notificationId}`);

    const notification = await kv.get(`notification:${userId}:${notificationId}`);
    if (!notification) {
      console.log(`Backend: Notification not found for userId: ${userId}, notificationId: ${notificationId}.`);
      return c.json({ error: "Notification not found" }, 404);
    }

    notification.read = true;
    await kv.set(`notification:${userId}:${notification.id}`, notification);
    console.log(`Backend: Notification ${notificationId} marked as read for user ${userId}.`);
    
    return c.json({ success: true, notification });
  } catch (error) {
    console.error(`Backend: Error marking notification as read: ${error}`);
    return c.json({ error: "Failed to mark notification as read" }, 500);
  }
});

// Mark all notifications as read
app.put("/notifications/:userId/mark-all-read", async (c) => {
  try {
    const userId = c.req.param("userId");
    console.log(`Backend: PUT /notifications/:userId/mark-all-read for userId: ${userId}`);
    const notifications = await kv.getByPrefix(`notification:${userId}:`);
    
    // Update all notifications to read
    for (const notification of notifications) {
      notification.read = true;
      await kv.set(`notification:${userId}:${notification.id}`, notification);
    }
    
    console.log(`Backend: Marked ${notifications.length} notifications as read for user ${userId}.`);
    return c.json({ 
      success: true, 
      message: `Marked ${notifications.length} notifications as read`,
      updatedCount: notifications.length 
    });
  } catch (error) {
    console.error(`Backend: Error marking all notifications as read: ${error}`);
    return c.json({ error: "Failed to mark all notifications as read" }, 500);
  }
});

// Fallback 404 route
app.notFound((c) => {
  console.log(`Backend: ❌ 404 Not Found for path: ${c.req.path}`);
  return c.json({ success: false, error: "Endpoint not found", path: c.req.path }, 404);
});

Deno.serve(app.fetch);