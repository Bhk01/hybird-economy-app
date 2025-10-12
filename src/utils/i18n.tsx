import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ar' | 'fr';

interface TranslationData {
  [key: string]: string | TranslationData;
}

const translations: Record<Language, TranslationData> = {
  en: {
    // Landing Page
    landing: {
      tagline: 'The Future of Collaborative Economy',
      heroTitle: 'Work, Swap & Invest',
      heroSubtitle: 'Starting from Just 1 TND',
      heroDescription: 'The hybrid economy platform where you can hire talent, exchange skills, or invest in local projects. Start with as little as 1 TND or 1 skill.',
      getStarted: 'Get Started',
      freeToJoin: 'Free to join',
      securePayments: 'Secure payments',
      aiPowered: 'AI-powered matching',
      activeUsers: 'Active Users',
      transactionsCompleted: 'Transactions Completed',
      features: 'Features',
      threeWays: 'Three Ways to Succeed',
      featuresDescription: 'Whether you want to earn, learn, or invest, our platform adapts to your goals.',
      hireTitle: 'Hire Mode',
      hireDescription: 'Find and hire skilled professionals for your projects',
      hireFeature1: 'Post jobs or service requests',
      hireFeature2: 'Secure escrow payments',
      hireFeature3: 'Integrated TND payments',
      hireFeature4: 'Rating & review system',
      skillSwapTitle: 'Skill Swap',
      skillSwapDescription: 'Exchange your skills with others in the community',
      skillSwapFeature1: 'Direct skill exchanges',
      skillSwapFeature2: 'Credits for indirect swaps',
      skillSwapFeature3: 'AI-powered matching',
      skillSwapFeature4: 'Build your network',
      investTitle: 'Micro-Investment',
      investDescription: 'Invest in local projects starting from just 1 TND',
      investFeature1: 'Minimum 1 TND investment',
      investFeature2: 'Profit sharing opportunities',
      investFeature3: 'AI risk assessment',
      investFeature4: 'Local project focus',
      howItWorks: 'How It Works',
      getStartedInMinutes: 'Get Started in Minutes',
      simpleProcess: 'Join our platform in three simple steps and start your journey today',
      step1Title: 'Create Your Account',
      step1Description: 'Sign up for free and complete your profile with your skills and interests',
      step2Title: 'Choose Your Mode',
      step2Description: 'Select whether you want to hire, swap skills, or invest in projects',
      step3Title: 'Start Transacting',
      step3Description: 'Connect with others and start building your economic future',
      trustAndSafety: 'Trust & Safety',
      builtOnTrust: 'Built on Trust & Security',
      safetyDescription: 'Your safety is our priority. We\'ve built comprehensive systems to ensure secure transactions and trustworthy interactions.',
      idVerification: 'ID Verification',
      idVerificationDesc: 'All users undergo identity verification',
      secureWallet: 'Secure Wallet',
      secureWalletDesc: 'Multi-currency wallet with escrow protection',
      ratingSystem: 'Rating System',
      ratingSystemDesc: 'Community-driven trust scores',
      aiFraudDetection: 'AI Fraud Detection',
      aiFraudDetectionDesc: 'Advanced AI monitors for suspicious activity',
      readyToTransform: 'Ready to Transform Your Economic Life?',
      joinThousands: 'Join thousands of Tunisians who are already working, swapping, and investing in the new collaborative economy.',
      joinToday: 'Join Work & Invest Today',
      platform: 'Platform',
      services: 'Services',
      legal: 'Legal',
      about: 'About',
      subtitle: 'Your hybrid economy platform for hiring, skill swapping, and micro-investing',
      allRightsReserved: 'All rights reserved',
      madeInTunisia: 'Made with ❤️ in Tunisia'
    },
    // Common
    common: {
      back: 'Back',
      next: 'Next',
      skip: 'Skip',
      finish: 'Finish',
      save: 'Save',
      saving: 'Saving...',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      add: 'Add',
      loading: 'Loading...',
      view: 'View',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      apply: 'Apply',
      submit: 'Submit',
      previous: 'Previous',
      yes: 'Yes',
      no: 'No',
      confirm: 'Confirm',
      completed: 'Completed',
      pending: 'Pending',
      active: 'Active',
      inactive: 'Inactive',
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info',
      backToDashboard: 'Back to Dashboard'
    },
    // Navigation
    navigation: {
      dashboard: 'Dashboard',
      hire: 'Hire',
      skillSwap: 'Skill Swap',
      investment: 'Invest',
      profile: 'Profile',
      wallet: 'Wallet',
      notifications: 'Notifications',
      settings: 'Settings',
      logout: 'Logout'
    },
    // Onboarding
    onboarding: {
      welcomeTitle: 'Welcome to Work & Invest!',
      welcomeDescription: 'Let\'s set up your profile in just a few steps',
      bioTitle: 'Tell us about yourself',
      bioDescription: 'Share a brief introduction',
      locationTitle: 'Where are you located?',
      locationDescription: 'Help others find you',
      skillsTitle: 'What are your skills?',
      skillsDescription: 'Add your top skills',
      jobExperienceTitle: 'Your Job Experience',
      jobExperienceDescription: 'Tell us about your professional background',
      studyExperienceTitle: 'Your Study Experience',
      studyExperienceDescription: 'Share your educational background',
      welcome: 'Welcome',
      letsSetup: 'Let\'s set up your profile to help you get the most out of Work & Invest',
      benefit1: 'Get matched with the right opportunities',
      benefit2: 'Build trust with a complete profile',
      benefit3: 'Stand out in the community',
      tellUs: 'Tell us about yourself',
      bioPlaceholder: 'I\'m a professional with experience in... I\'m passionate about... I\'m looking to...',
      characters: 'characters',
      whereLocated: 'Where are you located?',
      locationPlaceholder: 'e.g., Tunis, Tunisia',
      locationHelp: 'This helps us connect you with local opportunities',
      addSkills: 'Add your skills (minimum 3 recommended)',
      skillsPlaceholder: 'e.g., Web Development, Design, Marketing',
      skillsAdded: 'skills added',
      jobExperienceRequiredFields: 'Please fill in job title, company, and start date.',
      studyExperienceRequiredFields: 'Please fill in degree, institution, and start date.',
      addJobExperience: 'Add Job Experience',
      addStudyExperience: 'Add Education',
      jobTitle: 'Job Title',
      jobTitlePlaceholder: 'e.g., Software Engineer',
      company: 'Company',
      companyPlaceholder: 'e.g., Tech Solutions Inc.',
      startDate: 'Start Date',
      endDate: 'End Date',
      optional: 'Optional',
      description: 'Description',
      jobDescriptionPlaceholder: 'Responsibilities, achievements, etc.',
      degree: 'Degree/Field of Study',
      degreePlaceholder: 'e.g., Bachelor of Computer Science',
      institution: 'Institution',
      institutionPlaceholder: 'e.g., University of Tunis',
      studyDescriptionPlaceholder: 'Courses, projects, honors, etc.',
      current: 'Current',
      addExperience: 'Add Experience',
      addEducation: 'Add Education',
      step: 'Step',
      of: 'of',
      complete: 'complete',
      profileCompleted: 'Profile setup complete!',
      saveFailed: 'Failed to save profile. Please try again.'
    },
    // Auth
    auth: {
      welcome: 'Work & Invest',
      description: 'Your hybrid economy platform for hiring, skill swapping, and micro-investing',
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      fullName: 'Full Name',
      signIn: 'Sign In',
      createAccount: 'Create Account',
      demoMode: 'Try Demo Mode',
      signingIn: 'Signing in...',
      creatingAccount: 'Creating account...',
      loginSuccess: 'Login successful!',
      registrationSuccess: 'Account created successfully! You are now logged in.',
      demoActivated: 'Demo mode activated!',
      passwordMismatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 6 characters long',
      fillAllFields: 'Please fill in all required fields',
      forgotPassword: 'Forgot password?',
      resetPassword: 'Reset Password',
      resetPasswordDesc: 'Enter your email address and we\'ll send you a link to reset your password.',
      emailAddress: 'Email Address',
      sendResetLink: 'Send Reset Link',
      sending: 'Sending...',
      resetLinkSent: 'Password reset link sent to',
      resetLinkError: 'Failed to send password reset email',
      passwordStrength: 'Password Strength',
      weak: 'Weak',
      medium: 'Medium',
      strong: 'Strong',
      passwordRequirements: 'Password Recommendations:',
      minLength: 'At least 6 characters (required)',
      hasUppercase: 'At least one uppercase letter (recommended)',
      hasLowercase: 'At least one lowercase letter (recommended)',
      hasNumber: 'At least one number (recommended)',
      emailVerification: 'Email Verification',
      emailNotVerified: 'Email not verified',
      resendVerification: 'Resend verification email',
      verificationSent: 'Verification email sent',
      verificationError: 'Failed to send verification email',
      loginFailed: 'Login failed. Please check your credentials.',
      registrationFailed: 'Registration failed. Please try again.',
      wrongPassword: 'Incorrect password. Try again or reset your password.',
      noAccountFound: 'No account found with this email. Please sign up.',
      invalidEmail: 'Enter a valid email.',
      developerTools: 'Developer Tools',
      hideDeveloperTools: 'Hide Developer Tools',
      showDeveloperTools: 'Show Developer Tools',
      cleanupWarning: 'Warning: This will delete ALL user accounts and data. Use only for testing.',
      resetDatabase: 'Reset Database (Delete All Data)',
      cleaning: 'Cleaning...',
      emailExistsHint: 'Use this if you see "email already exists" errors',
      secureAuthentication: 'Secure Authentication',
      multiLanguage: 'Multi-Language'
    },
    // Dashboard
    dashboard: {
      welcomeBack: 'Welcome back',
      subtitle: "Here's what's happening with your work, swaps, and investments.",
      loadingData: 'Loading your latest data...',
      totalBalance: 'Total Balance',
      money: 'Money',
      skillCredits: 'Skill Credits',
      userRating: 'User Rating',
      quickActions: 'Quick Actions',
      quickActionsDesc: 'Start earning, learning, or investing',
      postJob: 'Post a Job',
      postJobDesc: 'Find skilled professionals',
      offerSkills: 'Offer Skills',
      offerSkillsDesc: 'Exchange your expertise',
      browseInvestments: 'Browse Investments',
      browseInvestmentsDesc: 'Discover local projects',
      portfolioSummary: 'Portfolio Summary',
      cashBalance: 'Cash Balance',
      equityValue: 'Equity Value',
      viewDetailedWallet: 'View Detailed Wallet',
      recentActivity: 'Recent Activity',
      recentActivityDesc: 'Your latest transactions and interactions',
      noRecentActivity: 'No recent activity',
      noActivityDesc: 'Start by posting a job, offering skills, or making an investment!',
      viewAllActivity: 'View All Activity',
      aiRecommendations: 'AI Recommendations',
      aiRecommendationsDesc: 'Personalized opportunities based on your profile',
      activeJobPostings: 'Active Job Postings',
      browseJobsDesc: 'Browse available projects and freelance opportunities',
      skillExchangeOffers: 'Skill Exchange Offers',
      exchangeSkillsDesc: 'Exchange your skills with other professionals',
      investmentOpportunities: 'Investment Opportunities',
      discoverProjectsDesc: 'Discover local projects seeking micro-investments',
      browse: 'Browse',
      explore: 'Explore',
      invest: 'Invest',
      justNow: 'Just now',
      hoursAgo: 'hours ago',
      daysAgo: 'days ago',
      completed: 'completed',
      pending: 'pending',
      active: 'active'
    },
    // Settings
    settings: {
      title: 'Settings',
      language: 'Language',
      theme: 'Theme',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      systemMode: 'System',
      notifications: 'Notifications',
      emailNotifications: 'Email Notifications',
      pushNotifications: 'Push Notifications',
      privacy: 'Privacy',
      account: 'Account',
      support: 'Support',
      about: 'About',
      selectLanguage: 'Select Language',
      selectTheme: 'Select Theme',
      emailNotificationsDesc: 'Receive notifications via email',
      pushNotificationsDesc: 'Receive browser notifications',
      marketing: 'Marketing Communications',
      marketingDesc: 'Receive updates about new features',
      editProfile: 'Edit Profile',
      paymentSecurity: 'Payment & Security',
      helpCenter: 'Help Center',
      contactSupport: 'Contact Support',
      dangerZone: 'Danger Zone',
      dangerZoneDesc: 'Irreversible actions for your account',
      signOut: 'Sign Out',
      appDescription: 'Your hybrid economy platform for hiring, skill swapping, and micro-investing.',
      version: 'Version 1.0.0',
      beta: 'Beta',
      tunisia: 'Tunisia',
      accountPreferences: 'Manage your account preferences and application settings',
      supportHelp: 'Support & Help',
      aboutAppTitle: 'About Work & Invest',
      helpCenterSoon: 'Help center coming soon!',
      contactSupportSoon: 'Contact support feature coming soon!',
      faq: 'FAQ',
      termsOfService: 'Terms of Service',
      privacyPolicy: 'Privacy Policy',
      faqSoon: 'FAQ coming soon!',
      developerTools: 'Developer Tools',
      developerToolsDesc: 'Tools for testing and development',
      cleanupDatabase: 'Cleanup Database',
      cleanupWarning: 'Warning: This will delete ALL user accounts and data. Use only for testing.',
      cleanupConfirm: 'Are you sure you want to delete ALL data from the database? This cannot be undone.',
      cleanupSuccess: 'Database cleaned successfully',
      cleanupError: 'Failed to cleanup database'
    },
    // Profile
    profile: {
      editProfile: 'Edit Profile',
      saveChanges: 'Save Changes',
      unsavedChanges: 'You have unsaved changes. Are you sure you want to leave?',
      bioLimit: 'characters remaining',
      uploadPhoto: 'Upload Photo',
      changePhoto: 'Change Photo',
      username: 'Username',
      usernameTaken: 'Username already taken',
      usernameAvailable: 'Username available',
      fullName: 'Full Name',
      bio: 'Bio',
      phone: 'Phone Number',
      location: 'Location',
      skills: 'Skills',
      addSkill: 'Add Skill',
      removeSkill: 'Remove Skill',
      bioTooLong: 'Bio must be less than {{limit}} characters',
      saveChangesSuccess: 'Profile changes saved successfully!',
      saveChangesError: 'Failed to save profile changes.',
      addYourSkills: 'Add your skills',
      jobExperienceTitle: 'Job Experience',
      studyExperienceTitle: 'Study Experience',
      addExperience: 'Add Experience',
      addEducation: 'Add Education',
      noJobExperience: 'No job experiences added yet.',
      noStudyExperience: 'No study experiences added yet.',
      certificationsTitle: 'Certifications', // New
      certificationsDescription: 'Showcase your professional certifications and achievements.', // New
      addCertification: 'Add Certification', // New
      noCertifications: 'No certifications added yet.', // New
      certificationName: 'Certification Name', // New
      certificationNamePlaceholder: 'e.g., Google Project Management Certificate', // New
      issuer: 'Issuer', // New
      issuerPlaceholder: 'e.g., Google, Coursera', // New
      dateIssued: 'Date Issued', // New
      certificationRequiredFields: 'Please fill in certification name, issuer, and date issued.', // New
      servicesOfferedTitle: 'Services I Offer', // New
      servicesOfferedDescription: 'List the services you provide to clients.', // New
      addService: 'Add Service', // New
      noServicesOffered: 'No services offered yet.', // New
      serviceName: 'Service Name', // New
      serviceNamePlaceholder: 'e.g., Custom Web Development', // New
      servicePrice: 'Price/Rate', // New
      servicePricePlaceholder: 'e.g., 50 TND/hour, 200-500 TND/project', // New
      serviceRequiredFields: 'Please fill in service name and price/rate.', // New
      addSkillPlaceholder: 'e.g., React, Photoshop', // New
      noReviewsYet: 'No reviews yet',
      noReviewsDesc: 'Be the first to leave a review for this user!'
    },
    // Public Profile
    publicProfile: {
      profileNotFound: 'Profile not found',
      profileUnavailable: 'The user profile you are looking for is not available.',
      fetchError: 'Failed to fetch user profile.',
      chatFeatureComingSoon: 'Chat feature coming soon!',
      message: 'Message',
      addReview: 'Add Review',
      addReviewFor: 'Add Review for {{userName}}',
      shareExperience: 'Share your experience with this user.',
      yourRating: 'Your Rating',
      yourComment: 'Your Comment',
      commentPlaceholder: 'Write your review here...',
      loginToAddReview: 'Please log in to add a review.',
      cannotReviewSelf: 'You cannot review your own profile.',
      reviewRequiredFields: 'Please provide a rating and a comment.',
      reviewSuccess: 'Review submitted successfully!',
      reviewError: 'Failed to submit review.',
      reportUser: 'Report User',
      reportUserFor: 'Report User: {{userName}}',
      reportReasonDesc: 'Please select a reason for reporting this user. Your report will be reviewed by our team.',
      reason: 'Reason',
      selectReason: 'Select a reason',
      reasonSpam: 'Spam or misleading content',
      reasonHarassment: 'Harassment or hate speech',
      reasonFraud: 'Fraudulent activity',
      reasonOther: 'Other (please specify in message)',
      loginToReport: 'Please log in to report a user.',
      selectReportReason: 'Please select a reason for reporting.',
      reportSuccess: 'User reported successfully!',
      reportError: 'Failed to report user.',
      blockUser: 'Block User',
      confirmBlock: 'Are you sure you want to block {{userName}}? You will no longer see their content or be able to interact with them.',
      loginToBlock: 'Please log in to block a user.',
      blockSuccess: '{{userName}} has been blocked.',
      blockError: 'Failed to block user.'
    },
    // Wallet
    wallet: {
      title: 'My Wallet',
      addCard: 'Add Payment Method',
      removeCard: 'Remove Card',
      setDefault: 'Set as Default',
      cardAdded: 'Payment method added successfully',
      cardRemoved: 'Payment method removed',
      topUp: 'Top Up',
      topUpSuccess: 'Successfully added funds',
      topUpFailed: 'Failed to add funds',
      insufficientFunds: 'Insufficient funds',
      transactionHistory: 'Transaction History',
      noTransactions: 'No transactions yet',
      cardNumber: 'Card Number',
      expiryDate: 'Expiry Date',
      cvv: 'CVV',
      cardholderName: 'Cardholder Name'
    },
    // Notifications
    notifications: {
      markAllRead: 'Mark all read',
      noNotifications: 'No notifications yet',
      noNotificationsDesc: 'We\'ll notify you when something happens',
      justNow: 'Just now',
      minutesAgo: 'm ago',
      hoursAgo: 'h ago',
      daysAgo: 'd ago',
      highPriority: 'High Priority',
      deleteSuccess: 'Notification deleted',
      markReadSuccess: 'All notifications marked as read',
      loadError: 'Failed to load notifications'
    },
    // Skill Swap Mode
    skillSwap: {
      paidTeaching: 'Paid Teaching', // New
      sellSkill: 'Sell Skill', // New
      pricePerSession: 'Price per Session', // New
      certificateRequired: 'Certificate Required?', // New
      certificateUrl: 'Certificate URL', // New
      confirmPurchase: 'Confirm Purchase', // New
      offerDetails: 'Offer Details', // New
      skill: 'Skill', // New
      price: 'Price', // New
      yourBalance: 'Your Balance', // New
      deductionWarning: 'By confirming, {{price}} TND will be deducted from your wallet.', // New
      insufficientFunds: 'Insufficient funds in your wallet. Please top up.', // New
      invalidPurchase: 'Invalid purchase request.', // New
      purchaseSuccess: 'Successfully purchased "{{title}}" for {{price}} TND!', // New
      purchaseFailed: 'Failed to complete purchase.', // New
      cannotPurchaseOwnSkill: 'You cannot purchase your own skill offer.', // New
      aiMatch: 'AI Match', // New
      aiMatchDescription: 'Find skill swaps that best match your profile and learning goals.', // New
      createPaidOffer: 'Create Paid Teaching Offer', // New
      createFreeSwap: 'Create Free Skill Swap', // New
      offerAsPaidTeaching: 'Offer as Paid Teaching?', // New
      specifySkillWanted: 'Please specify a skill you want to learn for a free swap.', // New
      enterValidPrice: 'Please enter a valid price for your paid teaching offer.', // New
      provideCertificateUrl: 'Please provide a certificate URL if certificate is required.' // New
    }
  },
  ar: {
    // Landing Page
    landing: {
      tagline: 'مستقبل الاقتصاد التشاركي',
      heroTitle: 'اعمل، تبادل واستثمر',
      heroSubtitle: 'ابدأ بدينار واحد فقط',
      heroDescription: 'منصة الاقتصاد الهجين حيث يمكنك توظيف المواهب أو تبادل المهارات أو الاستثمار في المشاريع المحلية. ابدأ بدينار واحد أو مهارة واحدة.',
      getStarted: 'ابدأ الآن',
      freeToJoin: 'الانضمام مجاني',
      securePayments: 'مدفوعات آمنة',
      aiPowered: 'مطابقة بالذكاء الاصطناعي',
      activeUsers: 'المستخدمون النشطون',
      transactionsCompleted: 'المعاملات المكتملة',
      features: 'المميزات',
      threeWays: 'ثلاث طرق للنجاح',
      featuresDescription: 'سواء كنت ترغب في الكسب أو التعلم أو الاستثمار، تتكيف منصتنا مع أهدافك.',
      hireTitle: 'وضع التوظيف',
      hireDescription: 'ابحث عن محترفين ماهرين ووظفهم لمشاريعك',
      hireFeature1: 'نشر الوظائف أو طلبات الخدمة',
      hireFeature2: 'مدفوعات ضمان آمنة',
      hireFeature3: 'مدفوعات متكاملة بالدينار',
      hireFeature4: 'نظام التقييم والمراجعة',
      skillSwapTitle: 'تبادل المهارات',
      skillSwapDescription: 'تبادل مهاراتك مع الآخرين في المجتمع',
      skillSwapFeature1: 'تبادلات مهارات مباشرة',
      skillSwapFeature2: 'رصيد للتبادلات غير المباشرة',
      skillSwapFeature3: 'مطابقة بالذكاء الاصطناعي',
      skillSwapFeature4: 'بناء شبكتك',
      investTitle: 'الاستثمار المصغر',
      investDescription: 'استثمر في المشاريع المحلية ابتداءً من دينار واحد فقط',
      investFeature1: 'استثمار بحد أدنى دينار واحد',
      investFeature2: 'فرص المشاركة في الأرباح',
      investFeature3: 'تقييم المخاطر بالذكاء الاصطناعي',
      investFeature4: 'التركيز على المشاريع المحلية',
      howItWorks: 'كيف يعمل',
      getStartedInMinutes: 'ابدأ في دقائق',
      simpleProcess: 'انضم إلى منصتنا في ثلاث خطوات بسيطة وابدأ رحلتك اليوم',
      step1Title: 'أنشئ حسابك',
      step1Description: 'سجل مجاناً وأكمل ملفك الشخصي بمهاراتك واهتماماتك',
      step2Title: 'اختر وضعك',
      step2Description: 'حدد ما إذا كنت تريد التوظيف أو تبادل المهارات أو الاستثمار في المشاريع',
      step3Title: 'ابدأ المعاملات',
      step3Description: 'تواصل مع الآخرين وابدأ في بناء مستقبلك الاقتصادي',
      trustAndSafety: 'الثقة والأمان',
      builtOnTrust: 'مبني على الثقة والأمان',
      safetyDescription: 'سلامتك هي أولويتنا. لقد بنينا أنظمة شاملة لضمان معاملات آمنة وتفاعلات موثوقة.',
      idVerification: 'التحقق من الهوية',
      idVerificationDesc: 'جميع المستخدمين يخضعون للتحقق من الهوية',
      secureWallet: 'محفظة آمنة',
      secureWalletDesc: 'محفظة متعددة العملات مع حماية الضمان',
      ratingSystem: 'نظام التقييم',
      ratingSystemDesc: 'درجات الثقة المدفوعة من المجتمع',
      aiFraudDetection: 'كشف الاحتيال بالذكاء الاصطناعي',
      aiFraudDetectionDesc: 'الذكاء الاصطناعي المتقدم يراقب النشاط المشبوه',
      readyToTransform: 'هل أنت مستعد لتحويل حياتك الاقتصادية؟',
      joinThousands: 'انضم إلى آلاف التونسيين الذين يعملون ويتبادلون ويستثمرون بالفعل في الاقتصاد التشاركي الجديد.',
      joinToday: 'انضم إلى Work & Invest اليوم',
      platform: 'المنصة',
      services: 'الخدمات',
      legal: 'قانوني',
      about: 'حول',
      subtitle: 'منصتك الاقتصادية الهجينة للتوظيف وتبادل المهارات والاستثمار المصغر',
      allRightsReserved: 'جميع الحقوق محفوظة',
      madeInTunisia: 'صنع بـ ❤️ في تونس'
    },
    // Common
    common: {
      back: 'رجوع',
      next: 'التالي',
      skip: 'تخطي',
      finish: 'إنهاء',
      save: 'حفظ',
      saving: 'جاري الحفظ...',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      close: 'إغلاق',
      add: 'إضافة',
      loading: 'جاري التحميل...',
      view: 'عرض',
      search: 'بحث',
      filter: 'تصفية',
      sort: 'ترتيب',
      apply: 'تطبيق',
      submit: 'إرسال',
      previous: 'السابق',
      yes: 'نعم',
      no: 'لا',
      confirm: 'تأكيد',
      completed: 'مكتمل',
      pending: 'معلق',
      active: 'نشط',
      inactive: 'غير نشط',
      success: 'نجح',
      error: 'خطأ',
      warning: 'تحذير',
      info: 'معلومات',
      backToDashboard: 'العودة إلى لوحة التحكم'
    },
    // Navigation
    navigation: {
      dashboard: 'لوحة التحكم',
      hire: 'توظيف',
      skillSwap: 'تبادل المهارات',
      investment: 'استثمار',
      profile: 'الملف الشخصي',
      wallet: 'المحفظة',
      notifications: 'الإشعارات',
      settings: 'الإعدادات',
      logout: 'تسجيل الخروج'
    },
    // Onboarding
    onboarding: {
      welcomeTitle: 'مرحباً بك في Work & Invest!',
      welcomeDescription: 'لنقم بإعداد ملفك الشخصي في خطوات قليلة',
      bioTitle: 'أخبرنا عن نفسك',
      bioDescription: 'شارك مقدمة موجزة',
      locationTitle: 'أين تقع؟',
      locationDescription: 'ساعد الآخرين في العثور عليك',
      skillsTitle: 'ما هي مهاراتك؟',
      skillsDescription: 'أضف أهم مهاراتك',
      jobExperienceTitle: 'خبرتك المهنية',
      jobExperienceDescription: 'أخبرنا عن خلفيتك المهنية',
      studyExperienceTitle: 'خبرتك الدراسية',
      studyExperienceDescription: 'شارك خلفيتك التعليمية',
      welcome: 'مرحباً',
      letsSetup: 'لنقم بإعداد ملفك الشخصي لمساعدتك في الاستفادة القصوى من Work & Invest',
      benefit1: 'احصل على مطابقة مع الفرص المناسبة',
      benefit2: 'بناء الثقة مع ملف شخصي كامل',
      benefit3: 'تميز في المجتمع',
      tellUs: 'أخبرنا عن نفسك',
      bioPlaceholder: 'أنا محترف ذو خبرة في... أنا شغوف بـ... أبحث عن...',
      characters: 'أحرف',
      whereLocated: 'أين تقع؟',
      locationPlaceholder: 'مثال: تونس، تونس',
      locationHelp: 'هذا يساعدنا في ربطك بالفرص المحلية',
      addSkills: 'أضف مهاراتك (يوصى بـ 3 على الأقل)',
      skillsPlaceholder: 'مثال: تطوير الويب، التصميم، التسويق',
      skillsAdded: 'مهارات مضافة',
      jobExperienceRequiredFields: 'يرجى ملء المسمى الوظيفي والشركة وتاريخ البدء.',
      studyExperienceRequiredFields: 'يرجى ملء الدرجة العلمية والمؤسسة وتاريخ البدء.',
      addJobExperience: 'إضافة خبرة عمل',
      addStudyExperience: 'إضافة تعليم',
      jobTitle: 'المسمى الوظيفي',
      jobTitlePlaceholder: 'مثال: مهندس برمجيات',
      company: 'الشركة',
      companyPlaceholder: 'مثال: شركة حلول تقنية',
      startDate: 'تاريخ البدء',
      endDate: 'تاريخ الانتهاء',
      optional: 'اختياري',
      description: 'الوصف',
      jobDescriptionPlaceholder: 'المسؤوليات، الإنجازات، إلخ.',
      degree: 'الدرجة العلمية/مجال الدراسة',
      degreePlaceholder: 'مثال: بكالوريوس علوم الحاسوب',
      institution: 'المؤسسة التعليمية',
      institutionPlaceholder: 'مثال: جامعة تونس',
      studyDescriptionPlaceholder: 'الدورات، المشاريع، التكريمات، إلخ.',
      current: 'حالي',
      addExperience: 'إضافة خبرة',
      addEducation: 'إضافة تعليم',
      step: 'خطوة',
      of: 'من',
      complete: 'مكتمل',
      profileCompleted: 'اكتمل إعداد الملف الشخصي!',
      saveFailed: 'فشل حفظ الملف الشخصي. حاول مرة أخرى.'
    },
    // Auth
    auth: {
      welcome: 'العمل والاستثمار',
      description: 'منصة الاقتصاد المختلط للتوظيف وتبادل المهارات والاستثمارات الصغيرة',
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      fullName: 'الاسم الكامل',
      signIn: 'دخول',
      createAccount: 'إنشاء حساب',
      demoMode: 'جرب النسخة التجريبية',
      signingIn: 'جاري تسجيل الدخول...',
      creatingAccount: 'جاري إنشاء الحساب...',
      loginSuccess: 'تم تسجيل الدخول بنجاح!',
      registrationSuccess: 'تم إنشاء الحساب بنجاح! أنت الآن مسجل الدخول.',
      demoActivated: 'تم تفعيل النسخة التجريبية!',
      passwordMismatch: 'كلمات المرور غير متطابقة',
      passwordTooShort: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
      fillAllFields: 'يرجى ملء جميع الحقول المطلوبة',
      forgotPassword: 'نسيت كلمة المرور؟',
      resetPassword: 'إعادة تعيين كلمة المرور',
      resetPasswordDesc: 'أدخل عنوان بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور.',
      emailAddress: 'عنوان البريد الإلكتروني',
      sendResetLink: 'إرسال رابط إعادة التعيين',
      sending: 'جاري الإرسال...',
      resetLinkSent: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى',
      resetLinkError: 'فشل إرسال بريد إعادة تعيين كلمة المرور',
      passwordStrength: 'قوة كلمة المرور',
      weak: 'ضعيفة',
      medium: 'متوسطة',
      strong: 'قوية',
      passwordRequirements: 'توصيات كلمة المرور:',
      minLength: '6 أحرف على الأقل (مطلوب)',
      hasUppercase: 'حرف كبير واحد على الأقل (موصى به)',
      hasLowercase: 'حرف صغير واحد على الأقل (موصى به)',
      hasNumber: 'رقم واحد على الأقل (موصى به)',
      emailVerification: 'التحقق من البريد الإلكتروني',
      emailNotVerified: 'البريد الإلكتروني غير مُحقق منه',
      resendVerification: 'إعادة إرسال بريد التحقق',
      verificationSent: 'تم إرسال بريد التحقق',
      verificationError: 'فشل إرسال بريد التحقق',
      loginFailed: 'فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.',
      registrationFailed: 'فشل التسجيل. يرجى المحاولة مرة أخرى.',
      wrongPassword: 'كلمة المرور غير صحيحة. حاول مرة أخرى أو أعد تعيين كلمة المرور.',
      noAccountFound: 'لم يتم العثور على حساب بهذا البريد الإلكتروني. يرجى التسجيل.',
      invalidEmail: 'أدخل بريدًا إلكترونيًا صالحًا.',
      developerTools: 'أدوات المطور',
      hideDeveloperTools: 'إخفاء أدوات المطور',
      showDeveloperTools: 'إظهار أدوات المطور',
      cleanupWarning: 'تحذير: سيؤدي هذا إلى حذف جميع حسابات المستخدمين والبيانات. استخدمه للاختبار فقط.',
      resetDatabase: 'إعادة تعيين قاعدة البيانات (حذف جميع البيانات)',
      cleaning: 'جاري التنظيف...',
      emailExistsHint: 'استخدم هذا إذا رأيت أخطاء "البريد الإلكتروني موجود بالفعل"',
      secureAuthentication: 'مصادقة آمنة',
      multiLanguage: 'متعدد اللغات'
    },
    // Dashboard
    dashboard: {
      welcomeBack: 'مرحباً بعودتك',
      subtitle: 'إليك ما يحدث مع أعمالك وتبادل المهارات والاستثمارات.',
      loadingData: 'جاري تحميل أحدث البيانات...',
      totalBalance: 'الرصيد الإجمالي',
      money: 'المال',
      skillCredits: 'نقاط المهارات',
      userRating: 'تقييم المستخدم',
      quickActions: 'الإجراءات السريعة',
      quickActionsDesc: 'ابدأ في الكسب أو التعلم أو الاستثمار',
      postJob: 'نشر وظيفة',
      postJobDesc: 'العثور على متخصصين مهرة',
      offerSkills: 'عرض المهارات',
      offerSkillsDesc: 'تبادل خبرتك',
      browseInvestments: 'تصفح الاستثمارات',
      browseInvestmentsDesc: 'اكتشف المشاريع المحلية',
      portfolioSummary: 'ملخص المحفظة',
      cashBalance: 'الرصيد النقدي',
      equityValue: 'قيمة الأسهم',
      viewDetailedWallet: 'عرض المحفظة التفصيلية',
      recentActivity: 'النشاط الأخير',
      recentActivityDesc: 'أحدث معاملاتك وتفاعلاتك',
      noRecentActivity: 'لا يوجد نشاط حديث',
      noActivityDesc: 'ابدأ بنشر وظيفة أو عرض مهارات أو القيام باستثمار!',
      viewAllActivity: 'عرض جميع الأنشطة',
      aiRecommendations: 'توصيات الذكاء الاصطناعي',
      aiRecommendationsDesc: 'فرص شخصية بناءً على ملفك الشخصي',
      activeJobPostings: 'إعلانات الوظائف النشطة',
      browseJobsDesc: 'تصفح المشاريع المتاحة وفرص العمل الحر',
      skillExchangeOffers: 'عروض تبادل المهارات',
      exchangeSkillsDesc: 'تبادل مهاراتك مع متخصصين آخرين',
      investmentOpportunities: 'فرص الاستثمار',
      discoverProjectsDesc: 'اكتشف المشاريع المحلية التي تسعى للاستثمارات الصغيرة',
      browse: 'تصفح',
      explore: 'استكشف',
      invest: 'استثمر',
      justNow: 'الآن',
      hoursAgo: 'ساعات مضت',
      daysAgo: 'أيام مضت',
      completed: 'مكتمل',
      pending: 'معلق',
      active: 'نشط'
    },
    // Settings
    settings: {
      title: 'الإعدادات',
      language: 'اللغة',
      theme: 'السمة',
      lightMode: 'الوضع الفاتح',
      darkMode: 'الوضع الداكن',
      systemMode: 'وضع النظام',
      notifications: 'الإشعارات',
      emailNotifications: 'إشعارات البريد الإلكتروني',
      pushNotifications: 'الإشعارات المدفوعة',
      privacy: 'الخصوصية',
      account: 'الحساب',
      support: 'الدعم',
      about: 'حول',
      selectLanguage: 'اختر اللغة',
      selectTheme: 'اختر السمة',
      emailNotificationsDesc: 'تلقي الإشعارات عبر البريد الإلكتروني',
      pushNotificationsDesc: 'تلقي إشعارات المتصفح',
      marketing: 'اتصالات التسويق',
      marketingDesc: 'تلقي تحديثات حول الميزات الجديدة',
      editProfile: 'تعديل الملف الشخصي',
      paymentSecurity: 'الدفع والأمان',
      helpCenter: 'مركز المساعدة',
      contactSupport: 'اتصل بالدعم',
      dangerZone: 'المنطقة الخطرة',
      dangerZoneDesc: 'إجراءات لا رجعة فيها لحسابك',
      signOut: 'تسجيل الخروج',
      appDescription: 'منصة الاقتصاد المختلط للتوظيف وتبادل المهارات والاستثمارات الصغيرة.',
      version: 'الإصدار 1.0.0',
      beta: 'تجريبي',
      tunisia: 'تونس',
      accountPreferences: 'إدارة تفضيلات حسابك وإعدادات التطبيق',
      supportHelp: 'الدعم والمساعدة',
      aboutAppTitle: 'حول العمل والاستثمار',
      helpCenterSoon: 'مركز المساعدة قريباً!',
      contactSupportSoon: 'ميزة الاتصال بالدعم قريباً!'
    },
    // Profile
    profile: {
      editProfile: 'تعديل الملف الشخصي',
      saveChanges: 'حفظ التغييرات',
      unsavedChanges: 'لديك تغييرات غير محفوظة. هل أنت متأكد أنك تريد المغادرة؟',
      bioLimit: 'حرف متبقي',
      uploadPhoto: 'تحميل صورة',
      changePhoto: 'تغيير الصورة',
      username: 'اسم المستخدم',
      usernameTaken: 'اسم المستخدم مأخوذ بالفعل',
      usernameAvailable: 'اسم المستخدم متاح',
      fullName: 'الاسم الكامل',
      bio: 'نبذة',
      phone: 'رقم الهاتف',
      location: 'الموقع',
      skills: 'المهارات',
      addSkill: 'إضافة مهارة',
      removeSkill: 'إزالة مهارة',
      bioTooLong: 'يجب أن تكون السيرة الذاتية أقل من {{limit}} حرفًا',
      saveChangesSuccess: 'تم حفظ تغييرات الملف الشخصي بنجاح!',
      saveChangesError: 'فشل حفظ تغييرات الملف الشخصي.',
      addYourSkills: 'أضف مهاراتك',
      jobExperienceTitle: 'الخبرة المهنية',
      studyExperienceTitle: 'الخبرة الدراسية',
      addExperience: 'إضافة خبرة',
      addEducation: 'إضافة تعليم',
      noJobExperience: 'لم يتم إضافة أي خبرات عمل بعد.',
      noStudyExperience: 'لم يتم إضافة أي خبرات دراسية بعد.',
      certificationsTitle: 'الشهادات', // New
      certificationsDescription: 'اعرض شهاداتك وإنجازاتك المهنية.', // New
      addCertification: 'إضافة شهادة', // New
      noCertifications: 'لم يتم إضافة أي شهادات بعد.', // New
      certificationName: 'اسم الشهادة', // New
      certificationNamePlaceholder: 'مثال: شهادة إدارة مشاريع جوجل', // New
      issuer: 'الجهة المصدرة', // New
      issuerPlaceholder: 'مثال: جوجل، كورسيرا', // New
      dateIssued: 'تاريخ الإصدار', // New
      certificationRequiredFields: 'يرجى ملء اسم الشهادة والجهة المصدرة وتاريخ الإصدار.', // New
      servicesOfferedTitle: 'الخدمات التي أقدمها', // New
      servicesOfferedDescription: 'قائمة بالخدمات التي تقدمها للعملاء.', // New
      addService: 'إضافة خدمة', // New
      noServicesOffered: 'لم يتم تقديم أي خدمات بعد.', // New
      serviceName: 'اسم الخدمة', // New
      serviceNamePlaceholder: 'مثال: تطوير مواقع ويب مخصصة', // New
      servicePrice: 'السعر/المعدل', // New
      servicePricePlaceholder: 'مثال: 50 دينار/ساعة، 200-500 دينار/مشروع', // New
      serviceRequiredFields: 'يرجى ملء اسم الخدمة والسعر/المعدل.', // New
      addSkillPlaceholder: 'مثال: React, Photoshop', // New
      noReviewsYet: 'لا توجد مراجعات بعد',
      noReviewsDesc: 'كن أول من يترك مراجعة لهذا المستخدم!'
    },
    // Public Profile
    publicProfile: {
      profileNotFound: 'الملف الشخصي غير موجود',
      profileUnavailable: 'الملف الشخصي للمستخدم الذي تبحث عنه غير متاح.',
      fetchError: 'فشل جلب الملف الشخصي للمستخدم.',
      chatFeatureComingSoon: 'ميزة الدردشة قريباً!',
      message: 'رسالة',
      addReview: 'إضافة مراجعة',
      addReviewFor: 'إضافة مراجعة لـ {{userName}}',
      shareExperience: 'شارك تجربتك مع هذا المستخدم.',
      yourRating: 'تقييمك',
      yourComment: 'تعليقك',
      commentPlaceholder: 'اكتب مراجعتك هنا...',
      loginToAddReview: 'يرجى تسجيل الدخول لإضافة مراجعة.',
      cannotReviewSelf: 'لا يمكنك مراجعة ملفك الشخصي.',
      reviewRequiredFields: 'يرجى تقديم تقييم وتعليق.',
      reviewSuccess: 'تم إرسال المراجعة بنجاح!',
      reviewError: 'فشل إرسال المراجعة.',
      reportUser: 'الإبلاغ عن المستخدم',
      reportUserFor: 'الإبلاغ عن المستخدم: {{userName}}',
      reportReasonDesc: 'يرجى تحديد سبب الإبلاغ عن هذا المستخدم. سيتم مراجعة تقريرك من قبل فريقنا.',
      reason: 'السبب',
      selectReason: 'اختر سبباً',
      reasonSpam: 'محتوى غير مرغوب فيه أو مضلل',
      reasonHarassment: 'مضايقة أو خطاب كراهية',
      reasonFraud: 'نشاط احتيالي',
      reasonOther: 'أخرى (يرجى التحديد في الرسالة)',
      loginToReport: 'يرجى تسجيل الدخول للإبلاغ عن مستخدم.',
      selectReportReason: 'يرجى تحديد سبب للإبلاغ.',
      reportSuccess: 'تم الإبلاغ عن المستخدم بنجاح!',
      reportError: 'فشل الإبلاغ عن المستخدم.',
      blockUser: 'حظر المستخدم',
      confirmBlock: 'هل أنت متأكد أنك تريد حظر {{userName}}؟ لن تتمكن بعد الآن من رؤية محتواه أو التفاعل معه.',
      loginToBlock: 'يرجى تسجيل الدخول لحظر مستخدم.',
      blockSuccess: 'تم حظر {{userName}}.',
      blockError: 'فشل حظر المستخدم.'
    },
    // Wallet
    wallet: {
      title: 'محفظتي',
      addCard: 'إضافة طريقة دفع',
      removeCard: 'إزالة البطاقة',
      setDefault: 'تعيين كافتراضي',
      cardAdded: 'تمت إضافة طريقة الدفع بنجاح',
      cardRemoved: 'تمت إزالة طريقة الدفع',
      topUp: 'إضافة رصيد',
      topUpSuccess: 'تمت إضافة الأموال بنجاح',
      topUpFailed: 'فشلت إضافة الأموال',
      insufficientFunds: 'رصيد غير كاف',
      transactionHistory: 'سجل المعاملات',
      noTransactions: 'لا توجد معاملات بعد',
      cardNumber: 'رقم البطاقة',
      expiryDate: 'تاريخ الانتهاء',
      cvv: 'CVV',
      cardholderName: 'اسم حامل البطاقة'
    },
    // Notifications
    notifications: {
      markAllRead: 'تحديد الكل كمقروء',
      noNotifications: 'لا توجد إشعارات بعد',
      noNotificationsDesc: 'سنخطرك عندما يحدث شيء',
      justNow: 'الآن',
      minutesAgo: 'د مضت',
      hoursAgo: 'س مضت',
      daysAgo: 'ي مضت',
      highPriority: 'أولوية عالية',
      deleteSuccess: 'تم حذف الإشعار',
      markReadSuccess: 'تم تحديد جميع الإشعارات كمقروءة',
      loadError: 'فشل في تحميل الإشعارات'
    },
    // Skill Swap Mode
    skillSwap: {
      paidTeaching: 'تدريس مدفوع', // New
      sellSkill: 'بيع مهارة', // New
      pricePerSession: 'السعر لكل جلسة', // New
      certificateRequired: 'شهادة مطلوبة؟', // New
      certificateUrl: 'رابط الشهادة', // New
      confirmPurchase: 'تأكيد الشراء', // New
      offerDetails: 'تفاصيل العرض', // New
      skill: 'المهارة', // New
      price: 'السعر', // New
      yourBalance: 'رصيدك', // New
      deductionWarning: 'بتأكيدك، سيتم خصم {{price}} دينار من محفظتك.', // New
      insufficientFunds: 'رصيد غير كاف في محفظتك. يرجى إعادة الشحن.', // New
      invalidPurchase: 'طلب شراء غير صالح.', // New
      purchaseSuccess: 'تم شراء "{{title}}" بنجاح مقابل {{price}} دينار!', // New
      purchaseFailed: 'فشل إتمام عملية الشراء.', // New
      cannotPurchaseOwnSkill: 'لا يمكنك شراء عرض مهارتك الخاص.', // New
      aiMatch: 'مطابقة بالذكاء الاصطناعي', // New
      aiMatchDescription: 'ابحث عن تبادلات المهارات التي تتناسب بشكل أفضل مع ملفك الشخصي وأهدافك التعليمية.', // New
      createPaidOffer: 'إنشاء عرض تدريس مدفوع', // New
      createFreeSwap: 'إنشاء تبادل مهارات مجاني', // New
      offerAsPaidTeaching: 'عرض كتدريس مدفوع؟', // New
      specifySkillWanted: 'يرجى تحديد المهارة التي ترغب في تعلمها لتبادل مجاني.', // New
      enterValidPrice: 'يرجى إدخال سعر صالح لعرض التدريس المدفوع الخاص بك.', // New
      provideCertificateUrl: 'يرجى تقديم رابط الشهادة إذا كانت الشهادة مطلوبة.' // New
    }
  },
  fr: {
    // Landing Page
    landing: {
      tagline: 'L\'avenir de l\'économie collaborative',
      heroTitle: 'Travaillez, Échangez et Investissez',
      heroSubtitle: 'À partir de seulement 1 TND',
      heroDescription: 'La plateforme d\'économie hybride où vous pouvez embaucher des talents, échanger des compétences ou investir dans des projets locaux. Commencez avec seulement 1 TND ou 1 compétence.',
      getStarted: 'Commencer',
      freeToJoin: 'Inscription gratuite',
      securePayments: 'Paiements sécurisés',
      aiPowered: 'Correspondance par IA',
      activeUsers: 'Utilisateurs Actifs',
      transactionsCompleted: 'Transactions Complétées',
      features: 'Fonctionnalités',
      threeWays: 'Trois façons de réussir',
      featuresDescription: 'Que vous souhaitiez gagner, apprendre ou investir, notre plateforme s\'adapte à vos objectifs.',
      hireTitle: 'Mode Embauche',
      hireDescription: 'Trouvez et embauchez des professionnels qualifiés pour vos projets',
      hireFeature1: 'Publier des offres d\'emploi ou demandes de service',
      hireFeature2: 'Paiements sécurisés par séquestre',
      hireFeature3: 'Paiements intégrés en TND',
      hireFeature4: 'Système de notation et d\'évaluation',
      skillSwapTitle: 'Échange de Compétences',
      skillSwapDescription: 'Échangez vos compétences avec d\'autres dans la communauté',
      skillSwapFeature1: 'Échanges de compétences directs',
      skillSwapFeature2: 'Crédits pour les échanges indirects',
      skillSwapFeature3: 'Correspondance par IA',
      skillSwapFeature4: 'Construisez votre réseau',
      investTitle: 'Micro-Investissement',
      investDescription: 'Investissez dans des projets locaux à partir de seulement 1 TND',
      investFeature1: 'Investissement minimum de 1 TND',
      investFeature2: 'Opportunités de partage des bénéfices',
      investFeature3: 'Évaluation des risques par IA',
      investFeature4: 'Focus sur les projets locaux',
      howItWorks: 'Comment ça marche',
      getStartedInMinutes: 'Commencez en quelques minutes',
      simpleProcess: 'Rejoignez notre plateforme en trois étapes simples et commencez votre voyage aujourd\'hui',
      step1Title: 'Créez votre compte',
      step1Description: 'Inscrivez-vous gratuitement et complétez votre profil avec vos compétences et intérêts',
      step2Title: 'Choisissez votre mode',
      step2Description: 'Sélectionnez si vous voulez embaucher, échanger des compétences ou investir dans des projets',
      step3Title: 'Commencez à transiger',
      step3Description: 'Connectez-vous avec les autres et commencez à construire votre avenir économique',
      trustAndSafety: 'Confiance et Sécurité',
      builtOnTrust: 'Basé sur la confiance et la sécurité',
      safetyDescription: 'Votre sécurité est notre priorité. Nous avons construit des systèmes complets pour garantir des transactions sécurisées et des interactions de confiance.',
      idVerification: 'Vérification d\'identité',
      idVerificationDesc: 'Tous les utilisateurs subissent une vérification d\'identité',
      secureWallet: 'Portefeuille sécurisé',
      secureWalletDesc: 'Portefeuille multi-devises avec protection par séquestre',
      ratingSystem: 'Système de notation',
      ratingSystemDesc: 'Scores de confiance basés sur la communauté',
      aiFraudDetection: 'Détection de fraude par IA',
      aiFraudDetectionDesc: 'L\'IA avancée surveille les activités suspectes',
      readyToTransform: 'Prêt à transformer votre vie économique?',
      joinThousands: 'Rejoignez des milliers de Tunisiens qui travaillent, échangent et investissent déjà dans la nouvelle économie collaborative.',
      joinToday: 'Rejoignez Work & Invest aujourd\'hui',
      platform: 'Plateforme',
      services: 'Services',
      legal: 'Légal',
      about: 'À propos',
      subtitle: 'Votre plateforme d\'économie hybride pour l\'embauche, l\'échange de compétences et le micro-investissement',
      allRightsReserved: 'Tous droits réservés',
      madeInTunisia: 'Fait avec ❤️ en Tunisie'
    },
    // Common
    common: {
      back: 'Retour',
      next: 'Suivant',
      skip: 'Passer',
      finish: 'Terminer',
      save: 'Enregistrer',
      saving: 'Enregistrement...',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      close: 'Fermer',
      add: 'Ajouter',
      loading: 'Chargement...',
      view: 'Voir',
      search: 'Rechercher',
      filter: 'Filtrer',
      sort: 'Trier',
      apply: 'Appliquer',
      submit: 'Soumettre',
      previous: 'Précédent',
      yes: 'Oui',
      no: 'Non',
      confirm: 'Confirmer',
      completed: 'Terminé',
      pending: 'En attente',
      active: 'Actif',
      inactive: 'Inactif',
      success: 'Succès',
      error: 'Erreur',
      warning: 'Avertissement',
      info: 'Info',
      backToDashboard: 'Retour au tableau de bord'
    },
    // Navigation
    navigation: {
      dashboard: 'Tableau de bord',
      hire: 'Embaucher',
      skillSwap: 'Échange de compétences',
      investment: 'Investir',
      profile: 'Profil',
      wallet: 'Portefeuille',
      notifications: 'Notifications',
      settings: 'Paramètres',
      logout: 'Se déconnecter'
    },
    // Onboarding
    onboarding: {
      welcomeTitle: 'Bienvenue sur Work & Invest!',
      welcomeDescription: 'Configurons votre profil en quelques étapes',
      bioTitle: 'Parlez-nous de vous',
      bioDescription: 'Partagez une brève introduction',
      locationTitle: 'Où êtes-vous situé?',
      locationDescription: 'Aidez les autres à vous trouver',
      skillsTitle: 'Quelles sont vos compétences?',
      skillsDescription: 'Ajoutez vos principales compétences',
      jobExperienceTitle: 'Votre Expérience Professionnelle',
      jobExperienceDescription: 'Parlez-nous de votre parcours professionnel',
      studyExperienceTitle: 'Votre Expérience Scolaire',
      studyExperienceDescription: 'Partagez votre parcours éducatif',
      welcome: 'Bienvenue',
      letsSetup: 'Configurons votre profil pour vous aider à tirer le meilleur parti de Work & Invest',
      benefit1: 'Soyez jumelé avec les bonnes opportunités',
      benefit2: 'Établir la confiance avec un profil complet',
      benefit3: 'Se démarquer dans la communauté',
      tellUs: 'Parlez-nous de vous',
      bioPlaceholder: 'Je suis un professionnel avec de l\'expérience en... Je suis passionné par... Je cherche à...',
      characters: 'caractères',
      whereLocated: 'Où êtes-vous situé?',
      locationPlaceholder: 'ex: Tunis, Tunisie',
      locationHelp: 'Cela nous aide à vous connecter avec des opportunités locales',
      addSkills: 'Ajoutez vos compétences (minimum 3 recommandées)',
      skillsPlaceholder: 'ex: Développement Web, Design, Marketing',
      skillsAdded: 'compétences ajoutées',
      jobExperienceRequiredFields: 'Veuillez remplir le titre du poste, l\'entreprise et la date de début.',
      studyExperienceRequiredFields: 'Veuillez remplir le diplôme, l\'établissement et la date de début.',
      addJobExperience: 'Ajouter une expérience professionnelle',
      addStudyExperience: 'Ajouter une formation',
      jobTitle: 'Titre du poste',
      jobTitlePlaceholder: 'ex: Ingénieur Logiciel',
      company: 'Entreprise',
      companyPlaceholder: 'ex: Tech Solutions Inc.',
      startDate: 'Date de début',
      endDate: 'Date de fin',
      optional: 'Optionnel',
      description: 'Description',
      jobDescriptionPlaceholder: 'Responsabilités, réalisations, etc.',
      degree: 'Diplôme/Domaine d\'études',
      degreePlaceholder: 'ex: Licence en Informatique',
      institution: 'Établissement',
      institutionPlaceholder: 'ex: Université de Tunis',
      studyDescriptionPlaceholder: 'Cours, projets, distinctions, etc.',
      current: 'Actuel',
      addExperience: 'Ajouter une expérience',
      addEducation: 'Ajouter une formation',
      step: 'Étape',
      of: 'de',
      complete: 'terminé',
      profileCompleted: 'Configuration du profil terminée!',
      saveFailed: 'Échec de l\'enregistrement du profil. Veuillez réessayer.'
    },
    // Auth
    auth: {
      welcome: 'Travail & Investissement',
      description: 'Votre plateforme d\'économie hybride pour l\'embauche, l\'échange de compétences et les micro-investissements',
      login: 'Connexion',
      register: 'S\'inscrire',
      email: 'Email',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      fullName: 'Nom complet',
      signIn: 'Se connecter',
      createAccount: 'Créer un compte',
      demoMode: 'Essayer le mode démo',
      signingIn: 'Connexion en cours...',
      creatingAccount: 'Création du compte...',
      loginSuccess: 'Connexion réussie!',
      registrationSuccess: 'Compte créé avec succès! Vous êtes maintenant connecté.',
      demoActivated: 'Mode démo activé!',
      passwordMismatch: 'Les mots de passe ne correspondent pas',
      passwordTooShort: 'Le mot de passe doit contenir au moins 6 caractères',
      fillAllFields: 'Veuillez remplir tous les champs requis',
      forgotPassword: 'Mot de passe oublié?',
      resetPassword: 'Réinitialiser le mot de passe',
      resetPasswordDesc: 'Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.',
      emailAddress: 'Adresse email',
      sendResetLink: 'Envoyer le lien de réinitialisation',
      sending: 'Envoi...',
      resetLinkSent: 'Lien de réinitialisation envoyé à',
      resetLinkError: 'Échec de l\'envoi de l\'email de réinitialisation',
      passwordStrength: 'Force du mot de passe',
      weak: 'Faible',
      medium: 'Moyen',
      strong: 'Fort',
      passwordRequirements: 'Recommandations du mot de passe:',
      minLength: 'Au moins 6 caractères (requis)',
      hasUppercase: 'Au moins une lettre majuscule (recommandé)',
      hasLowercase: 'Au moins une lettre minuscule (recommandé)',
      hasNumber: 'Au moins un chiffre (recommandé)',
      emailVerification: 'Vérification de l\'email',
      emailNotVerified: 'Email non vérifié',
      resendVerification: 'Renvoyer l\'email de vérification',
      verificationSent: 'Email de vérification envoyé',
      verificationError: 'Échec de l\'envoi de l\'email de vérification',
      loginFailed: 'Échec de la connexion. Veuillez vérifier vos informations d\'identification.',
      registrationFailed: 'Échec de l\'inscription. Veuillez réessayer.',
      wrongPassword: 'Mot de passe incorrect. Réessayez ou réinitialisez votre mot de passe.',
      noAccountFound: 'Aucun compte trouvé avec cet email. Veuillez vous inscrire.',
      invalidEmail: 'Entrez un email valide.',
      developerTools: 'Outils de développement',
      hideDeveloperTools: 'Masquer les outils de développement',
      showDeveloperTools: 'Afficher les outils de développement',
      cleanupWarning: 'Attention: Cela supprimera TOUS les comptes utilisateurs et les données. Utilisez uniquement pour les tests.',
      resetDatabase: 'Réinitialiser la base de données (Supprimer toutes les données)',
      cleaning: 'Nettoyage...',
      emailExistsHint: 'Utilisez ceci si vous voyez des erreurs "l\'email existe déjà"',
      secureAuthentication: 'Authentification sécurisée',
      multiLanguage: 'Multi-langue'
    },
    // Dashboard
    dashboard: {
      welcomeBack: 'Bon retour',
      subtitle: 'Voici ce qui se passe avec votre travail, vos échanges et vos investissements.',
      loadingData: 'Chargement de vos dernières données...',
      totalBalance: 'Solde total',
      money: 'Argent',
      skillCredits: 'Crédits de compétences',
      userRating: 'Évaluation utilisateur',
      quickActions: 'Actions rapides',
      quickActionsDesc: 'Commencez à gagner, apprendre ou investir',
      postJob: 'Publier un emploi',
      postJobDesc: 'Trouvez des professionnels qualifiés',
      offerSkills: 'Offrir des compétences',
      offerSkillsDesc: 'Échangez votre expertise',
      browseInvestments: 'Parcourir les investissements',
      browseInvestmentsDesc: 'Découvrez les projets locaux',
      portfolioSummary: 'Résumé du portefeuille',
      cashBalance: 'Solde de trésorerie',
      equityValue: 'Valeur des actions',
      viewDetailedWallet: 'Voir le portefeuille détaillé',
      recentActivity: 'Activité récente',
      recentActivityDesc: 'Vos dernières transactions et interactions',
      noRecentActivity: 'Aucune activité récente',
      noActivityDesc: 'Commencez par publier un emploi, offrir des compétences ou faire un investissement!',
      viewAllActivity: 'Voir toute l\'activité',
      aiRecommendations: 'Recommandations IA',
      aiRecommendationsDesc: 'Opportunités personnalisées basées sur votre profil',
      activeJobPostings: 'Offres d\'emploi actives',
      browseJobsDesc: 'Parcourez les projets disponibles et les opportunités freelance',
      skillExchangeOffers: 'Offres d\'échange de compétences',
      exchangeSkillsDesc: 'Échangez vos compétences avec d\'autres professionnels',
      investmentOpportunities: 'Opportunités d\'investissement',
      discoverProjectsDesc: 'Découvrez les projets locaux cherchant des micro-investissements',
      browse: 'Parcourir',
      explore: 'Explorer',
      invest: 'Investir',
      justNow: 'À l\'instant',
      hoursAgo: 'heures écoulées',
      daysAgo: 'jours écoulés',
      completed: 'terminé',
      pending: 'en attente',
      active: 'actif'
    },
    // Settings
    settings: {
      title: 'Paramètres',
      language: 'Langue',
      theme: 'Thème',
      lightMode: 'Mode clair',
      darkMode: 'Mode sombre',
      systemMode: 'Système',
      notifications: 'Notifications',
      emailNotifications: 'Notifications par email',
      pushNotifications: 'Notifications push',
      privacy: 'Confidentialité',
      account: 'Compte',
      support: 'Support',
      about: 'À propos',
      selectLanguage: 'Sélectionner la langue',
      selectTheme: 'Sélectionner le thème',
      emailNotificationsDesc: 'Recevoir des notifications par email',
      pushNotificationsDesc: 'Recevoir des notifications du navigateur',
      marketing: 'Communications marketing',
      marketingDesc: 'Recevoir des mises à jour sur les nouvelles fonctionnalités',
      editProfile: 'Modifier le profil',
      paymentSecurity: 'Paiement et sécurité',
      helpCenter: 'Centre d\'aide',
      contactSupport: 'Contacter le support',
      dangerZone: 'Zone dangereuse',
      dangerZoneDesc: 'Actions irréversibles pour votre compte',
      signOut: 'Se déconnecter',
      appDescription: 'Votre plateforme d\'économie hybride pour l\'embauche, l\'échange de compétences et les micro-investissements.',
      version: 'Version 1.0.0',
      beta: 'Bêta',
      tunisia: 'Tunisie',
      accountPreferences: 'Gérer vos préférences de compte et paramètres d\'application',
      supportHelp: 'Support et aide',
      aboutAppTitle: 'À propos de Work & Invest',
      helpCenterSoon: 'Centre d\'aide bientôt disponible!',
      contactSupportSoon: 'Fonctionnalité de contact support bientôt disponible!'
    },
    // Profile
    profile: {
      editProfile: 'Modifier le profil',
      saveChanges: 'Enregistrer les modifications',
      unsavedChanges: 'Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter?',
      bioLimit: 'caractères restants',
      uploadPhoto: 'Télécharger une photo',
      changePhoto: 'Changer la photo',
      username: 'Nom d\'utilisateur',
      usernameTaken: 'Nom d\'utilisateur déjà pris',
      usernameAvailable: 'Nom d\'utilisateur disponible',
      fullName: 'Nom complet',
      bio: 'Biographie',
      phone: 'Numéro de téléphone',
      location: 'Emplacement',
      skills: 'Compétences',
      addSkill: 'Ajouter une compétence',
      removeSkill: 'Supprimer la compétence',
      bioTooLong: 'La biographie doit contenir moins de {{limit}} caractères',
      saveChangesSuccess: 'Modifications du profil enregistrées avec succès!',
      saveChangesError: 'Échec de l\'enregistrement des modifications du profil.',
      addYourSkills: 'Ajoutez vos compétences',
      jobExperienceTitle: 'Expérience Professionnelle',
      studyExperienceTitle: 'Expérience Scolaire',
      addExperience: 'Ajouter une expérience',
      addEducation: 'Ajouter une formation',
      noJobExperience: 'Aucune expérience professionnelle ajoutée pour le moment.',
      noStudyExperience: 'Aucune expérience scolaire ajoutée pour le moment.',
      certificationsTitle: 'Certifications', // New
      certificationsDescription: 'Présentez vos certifications et réalisations professionnelles.', // New
      addCertification: 'Ajouter une certification', // New
      noCertifications: 'Aucune certification ajoutée pour le moment.', // New
      certificationName: 'Nom de la certification', // New
      certificationNamePlaceholder: 'ex: Certificat de gestion de projet Google', // New
      issuer: 'Émetteur', // New
      issuerPlaceholder: 'ex: Google, Coursera', // New
      dateIssued: 'Date d\'émission', // New
      certificationRequiredFields: 'Veuillez remplir le nom de la certification, l\'émetteur et la date d\'émission.', // New
      servicesOfferedTitle: 'Services que j\'offre', // New
      servicesOfferedDescription: 'Listez les services que vous proposez à vos clients.', // New
      addService: 'Ajouter un service', // New
      noServicesOffered: 'Aucun service proposé pour le moment.', // New
      serviceName: 'Nom du service', // New
      serviceNamePlaceholder: 'ex: Développement Web personnalisé', // New
      servicePrice: 'Prix/Tarif', // New
      servicePricePlaceholder: 'ex: 50 TND/heure, 200-500 TND/projet', // New
      serviceRequiredFields: 'Veuillez remplir le nom du service et le prix/tarif.', // New
      addSkillPlaceholder: 'ex: React, Photoshop', // New
      noReviewsYet: 'Aucun avis pour le moment',
      noReviewsDesc: 'Soyez le premier à laisser un avis pour cet utilisateur!'
    },
    // Public Profile
    publicProfile: {
      profileNotFound: 'Profil introuvable',
      profileUnavailable: 'Le profil utilisateur que vous recherchez n\'est pas disponible.',
      fetchError: 'Échec de la récupération du profil utilisateur.',
      chatFeatureComingSoon: 'Fonctionnalité de chat bientôt disponible!',
      message: 'Message',
      addReview: 'Ajouter un avis',
      addReviewFor: 'Ajouter un avis pour {{userName}}',
      shareExperience: 'Partagez votre expérience avec cet utilisateur.',
      yourRating: 'Votre note',
      yourComment: 'Votre commentaire',
      commentPlaceholder: 'Écrivez votre avis ici...',
      loginToAddReview: 'Veuillez vous connecter pour ajouter un avis.',
      cannotReviewSelf: 'Vous ne pouvez pas évaluer votre propre profil.',
      reviewRequiredFields: 'Veuillez fournir une note et un commentaire.',
      reviewSuccess: 'Avis soumis avec succès!',
      reviewError: 'Échec de la soumission de l\'avis.',
      reportUser: 'Signaler l\'utilisateur',
      reportUserFor: 'Signaler l\'utilisateur : {{userName}}',
      reportReasonDesc: 'Veuillez sélectionner une raison pour signaler cet utilisateur. Votre rapport sera examiné par notre équipe.',
      reason: 'Raison',
      selectReason: 'Sélectionner une raison',
      reasonSpam: 'Contenu indésirable ou trompeur',
      reasonHarassment: 'Harcèlement ou discours haineux',
      reasonFraud: 'Activité frauduleuse',
      reasonOther: 'Autre (veuillez préciser dans le message)',
      loginToReport: 'Veuillez vous connecter pour signaler un utilisateur.',
      selectReportReason: 'Veuillez sélectionner une raison pour le signalement.',
      reportSuccess: 'Utilisateur signalé avec succès!',
      reportError: 'Échec du signalement de l\'utilisateur.',
      blockUser: 'Bloquer l\'utilisateur',
      confirmBlock: 'Êtes-vous sûr de vouloir bloquer {{userName}} ? Vous ne verrez plus son contenu et ne pourrez plus interagir avec lui.',
      loginToBlock: 'Veuillez vous connecter pour bloquer un utilisateur.',
      blockSuccess: '{{userName}} a été bloqué.',
      blockError: 'Échec du blocage de l\'utilisateur.'
    },
    // Wallet
    wallet: {
      title: 'Mon portefeuille',
      addCard: 'Ajouter un moyen de paiement',
      removeCard: 'Supprimer la carte',
      setDefault: 'Définir par défaut',
      cardAdded: 'Moyen de paiement ajouté avec succès',
      cardRemoved: 'Moyen de paiement supprimé',
      topUp: 'Recharger',
      topUpSuccess: 'Fonds ajoutés avec succès',
      topUpFailed: 'Échec de l\'ajout de fonds',
      insufficientFunds: 'Fonds insuffisants',
      transactionHistory: 'Historique des transactions',
      noTransactions: 'Aucune transaction pour le moment',
      cardNumber: 'Numéro de carte',
      expiryDate: 'Date d\'expiration',
      cvv: 'CVV',
      cardholderName: 'Nom du titulaire'
    },
    // Notifications
    notifications: {
      markAllRead: 'Tout marquer comme lu',
      noNotifications: 'Aucune notification',
      noNotificationsDesc: 'Nous vous avertirons quand quelque chose se passe',
      justNow: 'À l\'instant',
      minutesAgo: 'min',
      hoursAgo: 'h',
      daysAgo: 'j',
      highPriority: 'Priorité élevée',
      deleteSuccess: 'Notification supprimée',
      markReadSuccess: 'Toutes les notifications marquées comme lues',
      loadError: 'Échec du chargement des notifications'
    },
    // Skill Swap Mode
    skillSwap: {
      paidTeaching: 'Enseignement payant', // New
      sellSkill: 'Vendre une compétence', // New
      pricePerSession: 'Prix par session', // New
      certificateRequired: 'Certificat requis?', // New
      certificateUrl: 'URL du certificat', // New
      confirmPurchase: 'Confirmer l\'achat', // New
      offerDetails: 'Détails de l\'offre', // New
      skill: 'Compétence', // New
      price: 'Prix', // New
      yourBalance: 'Votre solde', // New
      deductionWarning: 'En confirmant, {{price}} TND seront déduits de votre portefeuille.', // New
      insufficientFunds: 'Fonds insuffisants dans votre portefeuille. Veuillez recharger.', // New
      invalidPurchase: 'Demande d\'achat invalide.', // New
      purchaseSuccess: 'Achat de "{{title}}" réussi pour {{price}} TND!', // New
      purchaseFailed: 'Échec de l\'achat.', // New
      cannotPurchaseOwnSkill: 'Vous ne pouvez pas acheter votre propre offre de compétence.', // New
      aiMatch: 'Correspondance IA', // New
      aiMatchDescription: 'Trouvez les échanges de compétences qui correspondent le mieux à votre profil et à vos objectifs d\'apprentissage.', // New
      createPaidOffer: 'Créer une offre d\'enseignement payant', // New
      createFreeSwap: 'Créer un échange de compétences gratuit', // New
      offerAsPaidTeaching: 'Proposer comme enseignement payant?', // New
      specifySkillWanted: 'Veuillez spécifier une compétence que vous souhaitez apprendre pour un échange gratuit.', // New
      enterValidPrice: 'Veuillez entrer un prix valide pour votre offre d\'enseignement payant.', // New
      provideCertificateUrl: 'Veuillez fournir une URL de certificat si un certificat est requis.' // New
    }
  }
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

const getNestedTranslation = (obj: TranslationData, path: string, options?: { [key: string]: string | number }): string => {
  const keys = path.split('.');
  let current: any = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return path; // Return the key if translation not found
    }
  }
  
  let translatedString = typeof current === 'string' ? current : path;

  // Replace placeholders if options are provided
  if (options) {
    for (const [key, value] of Object.entries(options)) {
      translatedString = translatedString.replace(`{{${key}}}`, String(value));
    }
  }

  return translatedString;
};

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language;
    return saved || 'en';
  });

  const t = (key: string, options?: { [key: string]: string | number }): string => {
    return getNestedTranslation(translations[language], key, options);
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  // Set initial direction
  React.useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  const contextValue: I18nContextType = {
    language,
    setLanguage: handleSetLanguage,
    t,
    dir
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};