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
app.get("/make-server-478a5c23/health", (c) => {
  return c.json({ 
    status: "ok",
    timestamp: getCurrentTimestamp(),
    message: "Work & Invest API is running"
  });
});

// Database cleanup endpoint (for development/testing)
app.delete("/make-server-478a5c23/admin/cleanup", async (c) => {
  try {
    // Get all keys and delete auth, user, and wallet data
    const authKeys = await kv.getByPrefix("auth:");
    const userKeys = await kv.getByPrefix("user:");
    const walletKeys = await kv.getByPrefix("wallet:");
    
    // Delete all auth entries
    for (const entry of authKeys) {
      const email = entry.email;
      if (email) {
        await kv.del(`auth:${email}`);
      }
    }
    
    // Delete all user profiles
    for (const entry of userKeys) {
      const id = entry.id;
      if (id) {
        await kv.del(`user:${id}`);
      }
    }
    
    // Delete all wallets
    for (const entry of walletKeys) {
      const id = entry.id || entry.userId;
      if (id) {
        await kv.del(`wallet:${id}`);
      }
    }
    
    console.log(`Database cleanup completed. Removed ${authKeys.length} auth entries, ${userKeys.length} users, ${walletKeys.length} wallets.`);
    
    return c.json({ 
      success: true, 
      message: "Database cleaned successfully",
      removed: {
        auth: authKeys.length,
        users: userKeys.length,
        wallets: walletKeys.length
      }
    });
  } catch (error) {
    console.log(`Error cleaning database: ${error}`);
    return c.json({ success: false, error: "Failed to clean database" }, 500);
  }
});

// ==================== AUTHENTICATION ====================

// Sign up new user
app.post("/make-server-478a5c23/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return c.json({ success: false, error: "Missing required fields: email, password, name" }, 400);
    }

    // Check if user already exists
    const existingUser = await kv.get(`auth:${email}`);
    if (existingUser) {
      console.log(`Signup blocked - email already exists: ${email}`);
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

    // Create user profile
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
      updatedAt: getCurrentTimestamp()
    };

    await kv.set(`user:${userId}`, profile);
    
    // Create initial wallet with 0 money (users will use credit cards for payments)
    await kv.set(`wallet:${userId}`, {
      money: 0,  // No money balance - payments are via credit card
      credits: 20,  // Starting credits for skill swaps
      equity: 0  // No initial equity
    });
    
    console.log(`Created new user: ${userId}`);
    
    return c.json({ 
      success: true, 
      user: { id: userId, name, email },
      message: "Account created successfully"
    });
  } catch (error) {
    console.log(`Error creating user: ${error}`);
    return c.json({ success: false, error: "Failed to create account" }, 500);
  }
});

// Sign in user
app.post("/make-server-478a5c23/auth/signin", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    console.log(`Signin attempt for email: ${email}`);

    if (!email || !password) {
      return c.json({ success: false, error: "Missing required fields: email, password" }, 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log(`❌ Invalid email format: ${email}`);
      return c.json({ 
        success: false, 
        error: "Invalid email format. Please enter a valid email address." 
      }, 400);
    }

    // Check if user exists
    const userAuth = await kv.get(`auth:${email}`);
    console.log(`Retrieved user auth for ${email}:`, userAuth ? "✅ found" : "❌ not found");
    
    if (!userAuth) {
      console.log(`❌ No user found for email: ${email}`);
      return c.json({ 
        success: false, 
        error: "No account found with this email. Please sign up." 
      }, 401);
    }

    // Check password
    if (userAuth.password !== password) {
      console.log(`❌ Password mismatch for ${email}`);
      console.log(`Expected: ${userAuth.password}, Got: ${password}`);
      return c.json({ 
        success: false, 
        error: "Incorrect password. Try again or reset your password." 
      }, 401);
    }

    // Get user profile
    const profile = await kv.get(`user:${userAuth.id}`);
    if (!profile) {
      console.log(`No profile found for user ID: ${userAuth.id}`);
      return c.json({ success: false, error: "User profile not found. Please contact support." }, 404);
    }

    console.log(`User signed in successfully: ${userAuth.id}`);
    
    return c.json({ 
      success: true, 
      user: { id: profile.id, name: profile.name, email: profile.email },
      message: "Login successful"
    });
  } catch (error) {
    console.log(`Error signing in user: ${error}`);
    return c.json({ success: false, error: "Failed to sign in. Please try again." }, 500);
  }
});

// ==================== USER MANAGEMENT ====================

// Create or update user profile
app.post("/make-server-478a5c23/users/profile", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, name, email, bio, skills, avatar, location } = body;

    if (!userId || !name || !email) {
      return c.json({ error: "Missing required fields: userId, name, email" }, 400);
    }

    // Get existing profile to preserve certain fields
    const existingProfile = await kv.get(`user:${userId}`);
    
    const profile = {
      id: userId,
      name,
      email,
      bio: bio || "",
      skills: skills || [],
      avatar: avatar || "",
      location: location || "",
      rating: existingProfile?.rating || 0,
      completedJobs: existingProfile?.completedJobs || 0,
      totalEarnings: existingProfile?.totalEarnings || 0,
      createdAt: existingProfile?.createdAt || getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };

    await kv.set(`user:${userId}`, profile);
    console.log(`Created/updated profile for user: ${userId}`);
    
    return c.json({ success: true, profile });
  } catch (error) {
    console.log(`Error creating/updating user profile: ${error}`);
    return c.json({ error: "Failed to create/update profile" }, 500);
  }
});

// Get user profile
app.get("/make-server-478a5c23/users/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const profile = await kv.get(`user:${userId}`);
    
    if (!profile) {
      return c.json({ error: "User not found" }, 404);
    }
    
    return c.json({ profile });
  } catch (error) {
    console.log(`Error fetching user profile: ${error}`);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

// ==================== WALLET MANAGEMENT ====================

// Get wallet balance
app.get("/make-server-478a5c23/wallet/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    let wallet = await kv.get(`wallet:${userId}`);
    
    if (!wallet) {
      // Create default wallet if doesn't exist - start with 0 money, 20 credits
      wallet = {
        money: 0,
        credits: 20,
        equity: 0
      };
      await kv.set(`wallet:${userId}`, wallet);
      console.log(`Created default wallet for user: ${userId}`);
    }
    
    return c.json({ wallet });
  } catch (error) {
    console.log(`Error fetching wallet: ${error}`);
    return c.json({ error: "Failed to fetch wallet" }, 500);
  }
});

// Update wallet balance
app.post("/make-server-478a5c23/wallet/:userId/update", async (c) => {
  try {
    const userId = c.req.param("userId");
    const body = await c.req.json();
    const { type, amount, operation } = body; // type: 'money', 'credits', 'equity'; operation: 'add', 'subtract'

    if (!type || !amount || !operation) {
      return c.json({ error: "Missing required fields: type, amount, operation" }, 400);
    }

    const currentWallet = await kv.get(`wallet:${userId}`) || {
      money: 0,
      credits: 100,
      equity: 0
    };

    if (operation === 'add') {
      currentWallet[type] = (currentWallet[type] || 0) + amount;
    } else if (operation === 'subtract') {
      currentWallet[type] = Math.max(0, (currentWallet[type] || 0) - amount);
    }

    await kv.set(`wallet:${userId}`, currentWallet);
    
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
    
    return c.json({ success: true, wallet: currentWallet });
  } catch (error) {
    console.log(`Error updating wallet: ${error}`);
    return c.json({ error: "Failed to update wallet" }, 500);
  }
});

// Get transaction history
app.get("/make-server-478a5c23/wallet/:userId/transactions", async (c) => {
  try {
    const userId = c.req.param("userId");
    const transactions = await kv.getByPrefix(`transaction:`);
    
    const userTransactions = transactions
      .filter(tx => tx.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return c.json({ transactions: userTransactions });
  } catch (error) {
    console.log(`Error fetching transactions: ${error}`);
    return c.json({ error: "Failed to fetch transactions" }, 500);
  }
});

// ==================== HIRE MODE ====================

// Create job posting
app.post("/make-server-478a5c23/jobs", async (c) => {
  try {
    const body = await c.req.json();
    const { title, description, budget, deadline, skills, employerId } = body;

    if (!title || !description || !budget || !employerId) {
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
    console.log(`Created job posting: ${job.id}`);
    
    return c.json({ success: true, job });
  } catch (error) {
    console.log(`Error creating job: ${error}`);
    return c.json({ error: "Failed to create job posting" }, 500);
  }
});

// Get all job postings
app.get("/make-server-478a5c23/jobs", async (c) => {
  try {
    const jobs = await kv.getByPrefix("job:");
    const openJobs = jobs
      .filter(job => job.status === "open")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return c.json({ jobs: openJobs });
  } catch (error) {
    console.log(`Error fetching jobs: ${error}`);
    return c.json({ error: "Failed to fetch jobs" }, 500);
  }
});

// Apply to job
app.post("/make-server-478a5c23/jobs/:jobId/apply", async (c) => {
  try {
    const jobId = c.req.param("jobId");
    const body = await c.req.json();
    const { freelancerId, proposal, proposedBudget } = body;

    if (!freelancerId || !proposal) {
      return c.json({ error: "Missing required fields: freelancerId, proposal" }, 400);
    }

    const job = await kv.get(`job:${jobId}`);
    if (!job) {
      return c.json({ error: "Job not found" }, 404);
    }

    if (job.status !== "open") {
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
    
    return c.json({ success: true, job });
  } catch (error) {
    console.log(`Error applying to job: ${error}`);
    return c.json({ error: "Failed to apply to job" }, 500);
  }
});

// ==================== SKILL SWAP MODE ====================

// Create skill offering
app.post("/make-server-478a5c23/skills", async (c) => {
  try {
    const body = await c.req.json();
    const { title, description, category, offeredBy, lookingFor, duration } = body;

    if (!title || !description || !category || !offeredBy) {
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
    console.log(`Created skill offering: ${skillOffering.id}`);
    
    return c.json({ success: true, skillOffering });
  } catch (error) {
    console.log(`Error creating skill offering: ${error}`);
    return c.json({ error: "Failed to create skill offering" }, 500);
  }
});

// Get skill offerings
app.get("/make-server-478a5c23/skills", async (c) => {
  try {
    const skills = await kv.getByPrefix("skill:");
    const availableSkills = skills
      .filter(skill => skill.status === "available")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return c.json({ skills: availableSkills });
  } catch (error) {
    console.log(`Error fetching skills: ${error}`);
    return c.json({ error: "Failed to fetch skills" }, 500);
  }
});

// Request skill swap
app.post("/make-server-478a5c23/skills/:skillId/request", async (c) => {
  try {
    const skillId = c.req.param("skillId");
    const body = await c.req.json();
    const { requesterId, message, offerInReturn } = body;

    if (!requesterId || !message) {
      return c.json({ error: "Missing required fields: requesterId, message" }, 400);
    }

    const skill = await kv.get(`skill:${skillId}`);
    if (!skill) {
      return c.json({ error: "Skill offering not found" }, 404);
    }

    if (skill.status !== "available") {
      return c.json({ error: "Skill offering is no longer available" }, 400);
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
    
    return c.json({ success: true, skill });
  } catch (error) {
    console.log(`Error requesting skill swap: ${error}`);
    return c.json({ error: "Failed to request skill swap" }, 500);
  }
});

// ==================== INVESTMENT MODE ====================

// Create investment project
app.post("/make-server-478a5c23/projects", async (c) => {
  try {
    const body = await c.req.json();
    const { title, description, fundingGoal, minInvestment, expectedReturn, riskLevel, category, ownerId } = body;

    if (!title || !description || !fundingGoal || !ownerId) {
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
    console.log(`Created investment project: ${project.id}`);
    
    return c.json({ success: true, project });
  } catch (error) {
    console.log(`Error creating project: ${error}`);
    return c.json({ error: "Failed to create project" }, 500);
  }
});

// Get investment projects
app.get("/make-server-478a5c23/projects", async (c) => {
  try {
    const projects = await kv.getByPrefix("project:");
    const activeProjects = projects
      .filter(project => project.status === "funding")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return c.json({ projects: activeProjects });
  } catch (error) {
    console.log(`Error fetching projects: ${error}`);
    return c.json({ error: "Failed to fetch projects" }, 500);
  }
});

// Make investment
app.post("/make-server-478a5c23/projects/:projectId/invest", async (c) => {
  try {
    const projectId = c.req.param("projectId");
    const body = await c.req.json();
    const { investorId, amount } = body;

    if (!investorId || !amount || amount < 1) {
      return c.json({ error: "Missing required fields or invalid amount (minimum 1 TND)" }, 400);
    }

    const project = await kv.get(`project:${projectId}`);
    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }

    if (project.status !== "funding") {
      return c.json({ error: "Project is not accepting investments" }, 400);
    }

    // Check investor's wallet
    const wallet = await kv.get(`wallet:${investorId}`) || { money: 0, credits: 0, equity: 0 };
    if (wallet.money < amount) {
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
    
    return c.json({ success: true, project, investment });
  } catch (error) {
    console.log(`Error making investment: ${error}`);
    return c.json({ error: "Failed to make investment" }, 500);
  }
});

// ==================== NOTIFICATIONS ====================

// Get notifications for user
app.get("/make-server-478a5c23/notifications/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const notifications = await kv.getByPrefix(`notification:${userId}:`);
    
    const sortedNotifications = notifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return c.json({ notifications: sortedNotifications });
  } catch (error) {
    console.log(`Error fetching notifications: ${error}`);
    return c.json({ error: "Failed to fetch notifications" }, 500);
  }
});

// Create notification
app.post("/make-server-478a5c23/notifications", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, title, message, type } = body;

    if (!userId || !title || !message) {
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
    
    return c.json({ success: true, notification });
  } catch (error) {
    console.log(`Error creating notification: ${error}`);
    return c.json({ error: "Failed to create notification" }, 500);
  }
});

// Mark notification as read
app.put("/make-server-478a5c23/notifications/:userId/:notificationId/read", async (c) => {
  try {
    const userId = c.req.param("userId");
    const notificationId = c.req.param("notificationId");
    
    const notification = await kv.get(`notification:${userId}:${notificationId}`);
    if (!notification) {
      return c.json({ error: "Notification not found" }, 404);
    }

    notification.read = true;
    await kv.set(`notification:${userId}:${notificationId}`, notification);
    
    return c.json({ success: true, notification });
  } catch (error) {
    console.log(`Error marking notification as read: ${error}`);
    return c.json({ error: "Failed to mark notification as read" }, 500);
  }
});

// Mark all notifications as read
app.put("/make-server-478a5c23/notifications/:userId/mark-all-read", async (c) => {
  try {
    const userId = c.req.param("userId");
    const notifications = await kv.getByPrefix(`notification:${userId}:`);
    
    // Update all notifications to read
    for (const notification of notifications) {
      notification.read = true;
      await kv.set(`notification:${userId}:${notification.id}`, notification);
    }
    
    return c.json({ 
      success: true, 
      message: `Marked ${notifications.length} notifications as read`,
      updatedCount: notifications.length 
    });
  } catch (error) {
    console.log(`Error marking all notifications as read: ${error}`);
    return c.json({ error: "Failed to mark all notifications as read" }, 500);
  }
});

Deno.serve(app.fetch);