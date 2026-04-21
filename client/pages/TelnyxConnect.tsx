import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function TelnyxConnect() {
  const [apiKey, setApiKey] = useState('');
  const [sipUsername, setSipUsername] = useState('');
  const [sipPassword, setSipPassword] = useState('');
  const [showSipPassword, setShowSipPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { persistCredentials } = useAuth();
  const navigate = useNavigate();

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!apiKey.trim()) {
      setError('Please enter your Telnyx API key');
      return;
    }

    if (!sipUsername.trim() || !sipPassword.trim()) {
      setError('Please enter both SIP username and password');
      return;
    }

    try {
      // Persist all credentials with the backend
      await persistCredentials(apiKey, sipUsername, sipPassword);
      setSuccess(true);

      // Redirect to dialpad after 1 second
      setTimeout(() => {
        navigate('/dialpad');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to save credentials. Please check and try again.');
    }
  };

  const handleSkip = () => {
    navigate('/dialpad');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Connect Telnyx API</h1>
            <p className="text-muted-foreground">
              To use CallHub, you need to connect your Telnyx account. This allows us to access your phone numbers and manage calls on your behalf.
            </p>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">API Connected Successfully!</p>
                <p className="text-sm text-green-700">Redirecting to dialpad...</p>
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

          <form onSubmit={handleConnect} className="space-y-6">
            <div>
              <Label htmlFor="apiKey" className="text-foreground mb-2 block">
                Telnyx API Key
              </Label>
              <Input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                placeholder="Enter your Telnyx API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={success}
                className="mt-2"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-xs text-primary hover:underline mt-2"
              >
                {showApiKey ? 'Hide' : 'Show'} API Key
              </button>
              <p className="text-xs text-muted-foreground mt-2">
                You can find your API key in your Telnyx Dashboard under Account Settings.
                <a href="https://telnyx.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                  Go to Dashboard →
                </a>
              </p>
            </div>

            <div>
              <Label htmlFor="sipUsername" className="text-foreground mb-2 block">
                SIP Username
              </Label>
              <Input
                id="sipUsername"
                type="text"
                placeholder="Enter your SIP username"
                value={sipUsername}
                onChange={(e) => setSipUsername(e.target.value)}
                disabled={success}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Your SIP credentials are used to establish VoIP connections for making and receiving calls.
              </p>
            </div>

            <div>
              <Label htmlFor="sipPassword" className="text-foreground mb-2 block">
                SIP Password
              </Label>
              <Input
                id="sipPassword"
                type={showSipPassword ? 'text' : 'password'}
                placeholder="Enter your SIP password"
                value={sipPassword}
                onChange={(e) => setSipPassword(e.target.value)}
                disabled={success}
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">How to get your API Key:</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Go to Telnyx Dashboard</li>
                <li>Navigate to Account Settings</li>
                <li>Find and copy your API Key</li>
                <li>Paste it in the field above</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-2 rounded-lg transition-all"
                disabled={success}
              >
                Connect API
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 py-2 rounded-lg"
                onClick={handleSkip}
                disabled={success}
              >
                Skip for Now
              </Button>
            </div>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-4">
            You can always connect your API later in Settings.
          </p>
        </div>
      </div>
    </div>
  );
}
