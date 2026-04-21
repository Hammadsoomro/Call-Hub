import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, Search } from 'lucide-react';

interface AvailableNumber {
  id: string;
  number: string;
  country: string;
  areaCode: string;
  type: 'local' | 'tollfree';
  monthlyPrice: number;
}

export default function BuyNumber() {
  const [searchArea, setSearchArea] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [searching, setSearching] = useState(false);
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockNumbers: AvailableNumber[] = [
      {
        id: '1',
        number: '+1 (555) 201-0001',
        country: 'United States',
        areaCode: '555',
        type: 'local',
        monthlyPrice: 3.99,
      },
      {
        id: '2',
        number: '+1 (555) 201-0002',
        country: 'United States',
        areaCode: '555',
        type: 'local',
        monthlyPrice: 3.99,
      },
      {
        id: '3',
        number: '+1 (555) 201-0003',
        country: 'United States',
        areaCode: '555',
        type: 'local',
        monthlyPrice: 3.99,
      },
      {
        id: '4',
        number: '+1 (800) 555-0100',
        country: 'United States',
        areaCode: '800',
        type: 'tollfree',
        monthlyPrice: 9.99,
      },
      {
        id: '5',
        number: '+1 (800) 555-0101',
        country: 'United States',
        areaCode: '800',
        type: 'tollfree',
        monthlyPrice: 9.99,
      },
    ];
    
    setAvailableNumbers(mockNumbers);
    setShowResults(true);
    setSearching(false);
  };

  const handlePurchase = (number: AvailableNumber) => {
    alert(`Purchase initiated for ${number.number}. In production, this would process payment via Telnyx API.`);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Buy a Phone Number</h1>
          <p className="text-muted-foreground">Search and purchase new Telnyx phone numbers</p>
        </div>

        <div className="bg-white rounded-2xl border border-border p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="country" className="text-foreground">Country</Label>
                <select
                  id="country"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="mt-2 w-full p-2 border border-border rounded-lg bg-white text-foreground"
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
                  className="mt-2"
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={!searchArea.trim() || searching}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {searching ? 'Searching...' : 'Search'}
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
                      className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-2 px-6 rounded-lg transition-all"
                    >
                      Purchase
                    </Button>
                  </div>
                </div>
              ))}
            </div>
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
      </div>
    </DashboardLayout>
  );
}
