import React, { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { healthCheck, userApi, jobsApi, walletApi } from './utils/api';

export function TestBackend() {
  const [status, setStatus] = useState<string>('Not tested');
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const response = await healthCheck();
      setStatus(`✅ Backend connected: ${response.status}`);
      
      // Test creating a user
      const userResponse = await userApi.createProfile({
        userId: 'test-user-123',
        name: 'Test User',
        email: 'test@example.com'
      });
      
      console.log('User created:', userResponse);
      
      // Test wallet
      const walletResponse = await walletApi.getWallet('test-user-123');
      console.log('Wallet:', walletResponse);
      
      // Test getting jobs
      const jobsResponse = await jobsApi.getAllJobs();
      console.log('Jobs:', jobsResponse);
      
    } catch (error) {
      console.error('Backend test failed:', error);
      setStatus(`❌ Backend error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Backend Integration Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Status: {status}</p>
          <Button 
            onClick={testConnection} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Test Backend Connection'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default TestBackend;