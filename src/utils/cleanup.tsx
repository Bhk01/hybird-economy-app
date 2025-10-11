import { API_BASE_URL } from './api'; // Import API_BASE_URL from api.tsx
import { publicAnonKey } from './supabase/info';

/**
 * Cleanup utility to reset the database
 * This is useful for testing and development
 * WARNING: This will delete ALL user data!
 */
export async function cleanupDatabase() {
  try {
    console.log('Starting database cleanup...');
    
    const response = await fetch(`${API_BASE_URL}/admin/cleanup`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Cleanup failed:', result);
      throw new Error(result.error || 'Failed to cleanup database');
    }
    
    console.log('Database cleanup completed:', result);
    return result;
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  }
}

// Make it available globally for console access
if (typeof window !== 'undefined') {
  (window as any).cleanupDatabase = cleanupDatabase;
}