import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { AvailableNumber, SearchNumbersRequest } from '@shared/api';
import { Phone, Search, AlertCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BuyNumber() {
  const { user, isTelnyxConnected } = useAuth();
  const navigate = useNavigate();
  const [searchArea, setSearchArea] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [searching, setSearching] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isTelnyxConnected()) {
      setError('Please connect your Telnyx API in Settings first');
      return;
    }

    setSearching(true);
    setError(null);

    try {
      const searchRequest: SearchNumbersRequest = {
        country: selectedCountry,
        areaCode: /^\d+$/.test(searchArea) ? searchArea : undefined,
        city: /^\d+$/.test(searchArea) ? undefined : searchArea,
      };

      const response = await fetch('/api/numbers/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.telnyxApiKey}`,
        },
        body: JSON.stringify(searchRequest),
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableNumbers(data.numbers || []);
        setShowResults(true);
      } else {
        setError('Failed to search numbers. Please try again.');
      }
    } catch (err: any) {
      console.error('Error searching numbers:', err);
      setError(err.message || 'Failed to search numbers');
    } finally {
      setSearching(false);
    }
  };

  const handlePurchase = async (number: AvailableNumber) => {
    if (!isTelnyxConnected()) {
      setError('Telnyx API not connected');
      return;
    }

    setPurchasing(number.id);

    try {
      const response = await fetch('/api/numbers/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.telnyxApiKey}`,
        },
        body: JSON.stringify({
          numberId: number.id,
          number: number.number,
        }),
      });

      if (response.ok) {
        // Redirect to bought numbers page
        setTimeout(() => {
          navigate('/bought-numbers');
        }, 1000);
      } else {
        setError('Failed to purchase number. Please try again.');
      }
    } catch (err: any) {
      console.error('Error purchasing number:', err);
      setError(err.message || 'Failed to purchase number');
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Buy a Phone Number</h1>
          <p className="text-muted-foreground">Search and purchase new Telnyx phone numbers</p>
        </div>

        {!isTelnyxConnected() ? (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-12 text-center">
            <AlertCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Telnyx Not Connected</h2>
            <p className="text-muted-foreground mb-6">
              Connect your Telnyx API in Settings to search and purchase numbers
            </p>
            <a href="/settings">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Go to Settings
              </Button>
            </a>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-border p-8 mb-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">Error</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSearch} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="country" className="text-foreground">Country</Label>
                    <select
                      id="country"
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      disabled={searching}
                      className="mt-2 w-full p-2 border border-border rounded-lg bg-white text-foreground disabled:opacity-50"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="areaCode" className="text-foreground">Area Code or City</Label>
                    <Input
                      id="areaCode"
                      type="text"
                      placeholder="e.g., 555, 800, or New York"
                      value={searchArea}
                      onChange={(e) => setSearchArea(e.target.value)}
                      disabled={searching}
                      className="mt-2"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="submit"
                      disabled={!searchArea.trim() || searching}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-50"
                    >
                      {searching ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Search
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>

            {showResults && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">
                  Available Numbers ({availableNumbers.length})
                </h2>
                {availableNumbers.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                    <p className="text-foreground font-semibold">No numbers found</p>
                    <p className="text-muted-foreground text-sm mt-1">Try a different area code or city</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {availableNumbers.map((number) => (
                      <div
                        key={number.id}
                        className="bg-card rounded-lg border border-border p-6 hover:border-primary/50 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="bg-primary/10 rounded-lg p-3">
                            <Phone className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-foreground">{number.number}</h3>
                            <div className="flex gap-4 mt-2 text-sm">
                              <span className="text-muted-foreground">
                                Area Code: <span className="font-semibold text-foreground">{number.areaCode}</span>
                              </span>
                              <span className="text-muted-foreground">
                                Type: <span className="font-semibold text-foreground capitalize">{number.type}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary mb-3">${number.monthlyPrice}</p>
                          <p className="text-sm text-muted-foreground mb-4">/month</p>
                          <Button
                            onClick={() => handlePurchase(number)}
                            disabled={purchasing === number.id}
                            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-2 px-6 rounded-lg transition-all disabled:opacity-50"
                          >
                            {purchasing === number.id ? (
                              <>
                                <Loader className="w-4 h-4 mr-2 animate-spin" />
                                Purchasing...
                              </>
                            ) : (
                              'Purchase'
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!showResults && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                <Phone className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
                <h2 className="text-xl font-semibold text-foreground mb-2">Search for Available Numbers</h2>
                <p className="text-muted-foreground">
                  Enter an area code or city to search for available phone numbers
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
