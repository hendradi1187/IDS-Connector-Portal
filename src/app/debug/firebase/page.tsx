'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { testFirebaseConnection, debugUserRegistration } from '@/lib/firebase-debug';
import { Badge } from '@/components/ui/badge';

export default function FirebaseDebugPage() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Not tested');
  const [testResult, setTestResult] = useState<any>(null);
  const [userTestResult, setUserTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setConnectionStatus('Testing...');

    try {
      const result = await testFirebaseConnection();
      setTestResult(result);
      setConnectionStatus(result.success ? '✅ Connected' : '❌ Failed');
    } catch (error) {
      setConnectionStatus('❌ Error');
      setTestResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const testUserRegistration = async () => {
    setLoading(true);

    try {
      const testUser = {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        role: 'SKK-Consumer' as const,
        organization: 'Test Organization'
      };

      const result = await debugUserRegistration(testUser);
      setUserTestResult(result);
    } catch (error) {
      setUserTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Firebase Debug Console</h1>
        <Badge variant={connectionStatus.includes('✅') ? 'default' : connectionStatus.includes('❌') ? 'destructive' : 'secondary'}>
          {connectionStatus}
        </Badge>
      </div>

      <div className="grid gap-6">
        {/* Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle>Firebase Connection Test</CardTitle>
            <CardDescription>
              Test basic connectivity to Firebase Firestore
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testConnection} disabled={loading}>
              {loading ? 'Testing...' : 'Test Connection'}
            </Button>

            {testResult && (
              <div className="bg-gray-100 p-4 rounded-md">
                <h4 className="font-semibold mb-2">Connection Result:</h4>
                <pre className="text-sm">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Registration Test */}
        <Card>
          <CardHeader>
            <CardTitle>User Registration Test</CardTitle>
            <CardDescription>
              Test user registration functionality with debug logging
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testUserRegistration} disabled={loading}>
              {loading ? 'Testing...' : 'Test User Registration'}
            </Button>

            {userTestResult && (
              <div className="bg-gray-100 p-4 rounded-md">
                <h4 className="font-semibold mb-2">Registration Result:</h4>
                <pre className="text-sm">
                  {JSON.stringify(userTestResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Firebase Config Info */}
        <Card>
          <CardHeader>
            <CardTitle>Firebase Configuration</CardTitle>
            <CardDescription>
              Current Firebase project configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-md">
              <h4 className="font-semibold mb-2">Project Details:</h4>
              <ul className="text-sm space-y-1">
                <li><strong>Project ID:</strong> studio-433787308-386a9</li>
                <li><strong>Auth Domain:</strong> studio-433787308-386a9.firebaseapp.com</li>
                <li><strong>Storage Bucket:</strong> studio-433787308-386a9.firebasestorage.app</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Tips</CardTitle>
            <CardDescription>
              Common issues and solutions for user registration failures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold">🔒 Permission Denied</h4>
                <p>Check Firebase security rules. Users collection might not allow writes.</p>
              </div>
              <div>
                <h4 className="font-semibold">🌐 Network Issues</h4>
                <p>Verify internet connection and Firebase project status.</p>
              </div>
              <div>
                <h4 className="font-semibold">🔑 API Key Issues</h4>
                <p>Ensure Firebase API key is valid and project is active.</p>
              </div>
              <div>
                <h4 className="font-semibold">📝 Validation Errors</h4>
                <p>Check that all required fields (name, email, role, organization) are provided.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}