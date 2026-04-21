import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, CheckCircle, Unlink } from 'lucide-react';

const RINGTONES = [
  { id: 'default', name: 'Default (Classic Phone Ring)' },
  { id: 'digital', name: 'Digital' },
  { id: 'gentle', name: 'Gentle' },
  { id: 'loud', name: 'Loud' },
  { id: 'short_beep', name: 'Short Beep' },
  { id: 'bell', name: 'Bell' },
  { id: 'chime', name: 'Chime' },
  { id: 'alarm', name: 'Alarm' },
  { id: 'vibrant', name: 'Vibrant' },
  { id: 'classic', name: 'Classic' },
];

export default function Settings() {
  const { user, setTelnyxApiKey, setSipCredentials, persistCredentials, isTelnyxConnected } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [apiKey, setApiKey] = useState('');
  const [sipUsername, setSipUsername] = useState('');
  const [sipPassword, setSipPassword] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSipPassword, setShowSipPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [apiSuccess, setApiSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState(user?.webhookUrl || '');
  const [webhookFailoverUrl, setWebhookFailoverUrl] = useState(user?.webhookFailoverUrl || '');
  const [selectedRingtone, setSelectedRingtone] = useState(user?.selectedRingtone || 'default');
  const [telnyxBalance, setTelnyxBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [webhookSuccess, setWebhookSuccess] = useState(false);

  useEffect(() => {
    if (isTelnyxConnected()) {
      fetchTelnyxBalance();
    }
  }, [isTelnyxConnected()]);

  const fetchTelnyxBalance = async () => {
    try {
      setLoadingBalance(true);
      const response = await fetch('/api/telnyx/balance', {
        headers: {
          'Authorization': `Bearer ${user?.telnyxApiKey}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTelnyxBalance(data.balance);
      }
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    } finally {
      setLoadingBalance(false);
    }
  };

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
      setError(null);
      await persistCredentials(apiKey, sipUsername || undefined, sipPassword || undefined);
      setTelnyxApiKey(apiKey);
      setApiKey('');
      setSipUsername('');
      setSipPassword('');
      setApiSuccess(true);
      setTimeout(() => setApiSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save credentials');
    }
  };

  const handleUpdateSipCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sipUsername.trim() || !sipPassword.trim()) return;

    try {
      setError(null);
      await persistCredentials(user?.telnyxApiKey, sipUsername, sipPassword);
      setSipCredentials(sipUsername, sipPassword);
      setSipPassword('');
      setApiSuccess(true);
      setTimeout(() => setApiSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save SIP credentials');
    }
  };

  const handleDisconnectApi = () => {
    if (confirm('Are you sure you want to disconnect your Telnyx API and SIP credentials? This cannot be undone.')) {
      setTelnyxApiKey('');
      setSipCredentials('', '');
    }
  };

  const handleSaveWebhookSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const response = await fetch('/api/settings/webhooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          webhookUrl: webhookUrl || undefined,
          webhookFailoverUrl: webhookFailoverUrl || undefined,
          selectedRingtone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }

      setWebhookSuccess(true);
      setTimeout(() => setWebhookSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save webhook settings');
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
            <TabsList className="grid w-full grid-cols-3 bg-muted">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="integration">Integration</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks & Ringtones</TabsTrigger>
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
                      <p className="font-semibold text-green-900">Credentials Saved</p>
                      <p className="text-sm text-green-700">Your Telnyx API and SIP credentials have been saved successfully.</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900">Error</p>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {isTelnyxConnected() ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-green-900">Connected</p>
                        <p className="text-sm text-green-700">Your Telnyx API and SIP connection are active.</p>
                      </div>
                    </div>

                    <div className="bg-background border border-border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-2">API Key Status</p>
                      <p className="font-mono text-sm text-foreground mb-4">
                        {user?.telnyxApiKey?.substring(0, 10)}••••••••••
                      </p>
                    </div>

                    {user?.sipUsername && (
                      <div className="bg-background border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-2">SIP Username</p>
                        <p className="text-sm text-foreground mb-4">{user.sipUsername}</p>
                      </div>
                    )}

                    <form onSubmit={handleUpdateSipCredentials} className="space-y-4 bg-background border border-border rounded-lg p-4">
                      <h3 className="font-semibold text-foreground">Update SIP Credentials</h3>

                      <div>
                        <Label htmlFor="editSipUsername" className="text-foreground">SIP Username</Label>
                        <Input
                          id="editSipUsername"
                          type="text"
                          placeholder="Enter SIP username"
                          value={sipUsername || user?.sipUsername || ''}
                          onChange={(e) => setSipUsername(e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="editSipPassword" className="text-foreground">SIP Password</Label>
                        <Input
                          id="editSipPassword"
                          type={showSipPassword ? 'text' : 'password'}
                          placeholder="Enter SIP password"
                          value={sipPassword}
                          onChange={(e) => setSipPassword(e.target.value)}
                          className="mt-2"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSipPassword(!showSipPassword)}
                          className="text-xs text-primary hover:underline mt-2"
                        >
                          {showSipPassword ? 'Hide' : 'Show'} Password
                        </button>
                      </div>

                      <Button
                        type="submit"
                        disabled={!sipUsername.trim() || !sipPassword.trim()}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 rounded-lg transition-all"
                      >
                        Update SIP Credentials
                      </Button>
                    </form>

                    <div className="space-y-3">
                      <Button
                        onClick={handleDisconnectApi}
                        variant="outline"
                        className="w-full py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Unlink className="w-4 h-4 mr-2" />
                        Disconnect All
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateApi} className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-900">Not Connected</p>
                        <p className="text-sm text-blue-700">Connect your Telnyx API and SIP credentials to enable calling features.</p>
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

                    <div>
                      <Label htmlFor="sipUsername" className="text-foreground">SIP Username</Label>
                      <Input
                        id="sipUsername"
                        type="text"
                        placeholder="Enter your SIP username"
                        value={sipUsername}
                        onChange={(e) => setSipUsername(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="sipPassword" className="text-foreground">SIP Password</Label>
                      <Input
                        id="sipPassword"
                        type={showSipPassword ? 'text' : 'password'}
                        placeholder="Enter your SIP password"
                        value={sipPassword}
                        onChange={(e) => setSipPassword(e.target.value)}
                        className="mt-2"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSipPassword(!showSipPassword)}
                        className="text-xs text-primary hover:underline mt-2"
                      >
                        {showSipPassword ? 'Hide' : 'Show'} Password
                      </button>
                    </div>

                    <Button
                      type="submit"
                      disabled={!apiKey.trim() || !sipUsername.trim() || !sipPassword.trim()}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 rounded-lg transition-all"
                    >
                      Connect API & SIP
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

            {/* Webhooks & Ringtones Tab */}
            <TabsContent value="webhooks" className="space-y-6 mt-6">
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-xl font-bold text-foreground mb-6">Webhook Configuration</h2>

                {webhookSuccess && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">Settings Saved</p>
                      <p className="text-sm text-green-700">Your webhook and ringtone settings have been saved successfully.</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900">Error</p>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {/* Telnyx Balance Display */}
                {isTelnyxConnected() && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-300 rounded-lg">
                    <div className="flex items-start gap-4">
                      <div>
                        <p className="text-sm text-blue-700 font-semibold">Telnyx Account Balance</p>
                        {loadingBalance ? (
                          <p className="text-2xl font-bold text-blue-900 mt-2">Loading...</p>
                        ) : telnyxBalance !== null ? (
                          <p className="text-2xl font-bold text-blue-900 mt-2">${telnyxBalance.toFixed(2)}</p>
                        ) : (
                          <p className="text-lg text-blue-700 mt-2">Unable to fetch balance</p>
                        )}
                      </div>
                      <Button
                        onClick={fetchTelnyxBalance}
                        variant="outline"
                        disabled={loadingBalance}
                        className="ml-auto"
                      >
                        Refresh
                      </Button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSaveWebhookSettings} className="space-y-4">
                  <div>
                    <Label htmlFor="webhookUrl" className="text-foreground">Webhook URL</Label>
                    <Input
                      id="webhookUrl"
                      type="url"
                      placeholder="https://example.com/webhook"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Primary webhook endpoint for incoming call notifications</p>
                  </div>

                  <div>
                    <Label htmlFor="webhookFailoverUrl" className="text-foreground">Webhook Failover URL</Label>
                    <Input
                      id="webhookFailoverUrl"
                      type="url"
                      placeholder="https://backup.example.com/webhook"
                      value={webhookFailoverUrl}
                      onChange={(e) => setWebhookFailoverUrl(e.target.value)}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Backup webhook URL if primary fails</p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 rounded-lg transition-all mt-6"
                  >
                    Save Webhook Settings
                  </Button>
                </form>
              </div>

              {/* Ringtone Selection */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-xl font-bold text-foreground mb-6">Incoming Call Ringtone</h2>

                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Select your preferred ringtone for incoming calls</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {RINGTONES.map((ringtone) => (
                      <label
                        key={ringtone.id}
                        className="flex items-center p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      >
                        <input
                          type="radio"
                          name="ringtone"
                          value={ringtone.id}
                          checked={selectedRingtone === ringtone.id}
                          onChange={(e) => setSelectedRingtone(e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-foreground">{ringtone.name}</span>
                      </label>
                    ))}
                  </div>

                  <Button
                    onClick={handleSaveWebhookSettings}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 rounded-lg transition-all mt-6"
                  >
                    Save Ringtone Settings
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
