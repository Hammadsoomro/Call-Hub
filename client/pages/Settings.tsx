import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, CheckCircle, Unlink } from 'lucide-react';

export default function Settings() {
  const { user, setTelnyxApiKey, isTelnyxConnected } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [apiSuccess, setApiSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, call API to update profile
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleUpdateApi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    try {
      const response = await fetch('/api/telnyx/set-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });

      if (response.ok) {
        setTelnyxApiKey(apiKey);
        setApiKey('');
        setApiSuccess(true);
        setTimeout(() => setApiSuccess(false), 3000);
      } else {
        alert('Failed to validate API key. Please check and try again.');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDisconnectApi = () => {
    if (confirm('Are you sure you want to disconnect your Telnyx API? This cannot be undone.')) {
      setTelnyxApiKey('');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and integrations</p>
        </div>

        <div className="max-w-2xl">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="integration">Integration</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6 mt-6">
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-xl font-bold text-foreground mb-6">Profile Information</h2>

                {saveSuccess && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">Profile Updated</p>
                      <p className="text-sm text-green-700">Your profile changes have been saved successfully.</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-foreground">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-foreground">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="created" className="text-foreground">Account Created</Label>
                    <Input
                      id="created"
                      type="text"
                      value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}
                      disabled
                      className="mt-2"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 rounded-lg transition-all mt-6"
                  >
                    Save Changes
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* Integration Tab */}
            <TabsContent value="integration" className="space-y-6 mt-6">
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-xl font-bold text-foreground mb-6">Telnyx Integration</h2>

                {apiSuccess && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">API Connected</p>
                      <p className="text-sm text-green-700">Your Telnyx API has been updated successfully.</p>
                    </div>
                  </div>
                )}

                {isTelnyxConnected() ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-green-900">Connected</p>
                        <p className="text-sm text-green-700">Your Telnyx API is connected and active.</p>
                      </div>
                    </div>

                    <div className="bg-background border border-border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-2">API Key Status</p>
                      <p className="font-mono text-sm text-foreground mb-4">
                        {user?.telnyxApiKey?.substring(0, 10)}••••••••••
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Button
                        onClick={handleDisconnectApi}
                        variant="outline"
                        className="w-full py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Unlink className="w-4 h-4 mr-2" />
                        Disconnect API
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateApi} className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-900">Not Connected</p>
                        <p className="text-sm text-blue-700">Connect your Telnyx API to enable calling features.</p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="apiKey" className="text-foreground">Telnyx API Key</Label>
                      <Input
                        id="apiKey"
                        type={showApiKey ? 'text' : 'password'}
                        placeholder="Enter your Telnyx API key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="mt-2"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="text-xs text-primary hover:underline mt-2"
                      >
                        {showApiKey ? 'Hide' : 'Show'} API Key
                      </button>
                    </div>

                    <Button
                      type="submit"
                      disabled={!apiKey.trim()}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 rounded-lg transition-all"
                    >
                      Connect API
                    </Button>
                  </form>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">How to get your API Key:</h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Go to <a href="https://telnyx.com/dashboard" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">Telnyx Dashboard</a></li>
                  <li>Navigate to Account Settings</li>
                  <li>Find and copy your API Key</li>
                  <li>Paste it in the field above</li>
                </ol>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
