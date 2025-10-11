import { mockBackend } from './api'; // Import mockBackend from api.tsx

/**
 * Cleanup utility to reset the database (local storage in mock mode)
 * This is useful for testing and development
 * WARNING: This will delete ALL user data from your browser's local storage!
 */
export async function cleanupDatabase() {
  try {
    console.log('Starting local storage cleanup...');
    
    mockBackend.clearAllData();
    
    console.log('Local storage cleanup completed.');
    // Simulate a successful response with counts
    return {
      success: true,
      message: "Local storage cleaned successfully",
      removed: {
        auth: 'all',
        users: 'all',
        wallets: 'all',
        jobs: 'all',
        skills: 'all',
        projects: 'all',
        transactions: 'all',
        notifications: 'all',
      }
    };
  } catch (error) {
    console.error('Error during local storage cleanup:', error);
    throw error;
  }
}

// Make it available globally for console access
if (typeof window !== 'undefined') {
  (window as any).cleanupDatabase = cleanupDatabase;
}