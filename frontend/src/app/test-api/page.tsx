'use client';

import { useState } from 'react';
import { authService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestApiPage() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('testpass123');
  const [name, setName] = useState('Test User');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testRegister = async () => {
    setLoading(true);
    try {
      console.log('Testing register API...');
      const response = await authService.register({ email, name, password });
      console.log('Register success:', response);
      setResult({ success: true, data: response });
    } catch (error: any) {
      console.error('Register failed:', error);
      setResult({
        success: false,
        error: error.message,
        details: error.response?.data,
      });
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      console.log('Testing login API...');
      const response = await authService.login({ email, password });
      console.log('Login success:', response);
      setResult({ success: true, data: response });
    } catch (error: any) {
      console.error('Login failed:', error);
      setResult({
        success: false,
        error: error.message,
        details: error.response?.data,
      });
    } finally {
      setLoading(false);
    }
  };

  const testGetUser = async () => {
    setLoading(true);
    try {
      console.log('Testing get current user API...');
      const response = await authService.getCurrentUser();
      console.log('Get user success:', response);
      setResult({ success: true, data: response });
    } catch (error: any) {
      console.error('Get user failed:', error);
      setResult({
        success: false,
        error: error.message,
        details: error.response?.data,
      });
    } finally {
      setLoading(false);
    }
  };

  const testBackendHealth = async () => {
    setLoading(true);
    try {
      console.log('Testing backend health...');
      const response = await fetch('http://localhost:8000/api/');
      const data = await response.json();
      console.log('Backend health:', data);
      setResult({ success: true, data });
    } catch (error: any) {
      console.error('Backend health check failed:', error);
      setResult({
        success: false,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>API Testing Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Test Credentials</h3>
            <div className="grid gap-4">
              <Input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={testBackendHealth} disabled={loading}>
              Test Backend Health
            </Button>
            <Button onClick={testRegister} disabled={loading}>
              Test Register
            </Button>
            <Button onClick={testLogin} disabled={loading}>
              Test Login
            </Button>
            <Button onClick={testGetUser} disabled={loading}>
              Test Get User
            </Button>
          </div>

          {result && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Open browser DevTools (F12) and go to Console tab</li>
              <li>Click "Test Backend Health" to verify backend is running</li>
              <li>Click "Test Register" to create a test account</li>
              <li>Click "Test Login" to login with the account</li>
              <li>Check Console for detailed logs</li>
              <li>Check Network tab for API requests</li>
              <li>Check Application → Cookies for tokens</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
