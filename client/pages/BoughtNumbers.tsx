import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { PhoneNumber } from '@shared/api';
import { Phone, Trash2, AlertCircle, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BoughtNumbers() {
  const { user, isTelnyxConnected } = useAuth();
  const [numbers, setNumbers] = useState<PhoneNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNumbers = async () => {
      if (!isTelnyxConnected()) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const response = await fetch('/api/numbers/bought', {
          headers: {
            Authorization: `Bearer ${user?.telnyxApiKey}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setNumbers(data.numbers || []);
        } else {
          setError('Failed to load phone numbers');
        }
      } catch (err: any) {
        console.error('Error fetching numbers:', err);
        setError(err.message || 'Failed to load phone numbers');
      } finally {
        setLoading(false);
      }
    };

    fetchNumbers();
  }, [isTelnyxConnected(), user?.telnyxApiKey]);

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Phone Numbers</h1>
          <p className="text-muted-foreground">Manage your purchased Telnyx numbers</p>
        </div>

        {!isTelnyxConnected() ? (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-12 text-center">
            <AlertCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Telnyx Not Connected</h2>
            <p className="text-muted-foreground mb-6">
              Connect your Telnyx API in Settings to see your purchased numbers
            </p>
            <Link to="/settings">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Go to Settings
              </Button>
            </Link>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading Numbers</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button variant="outline" className="py-2 rounded-lg">
              Try Again
            </Button>
          </div>
        ) : numbers.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <Phone className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Numbers Yet</h2>
            <p className="text-muted-foreground mb-6">Get started by purchasing your first phone number</p>
            <Link to="/buy-number">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Buy a Number
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {numbers.map((num) => (
              <div key={num.id} className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 rounded-lg p-3">
                        <Phone className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{num.number}</h3>
                        <p className="text-sm text-muted-foreground">{num.country} • {num.areaCode}</p>
                      </div>
                    </div>
                    <button className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 mt-auto pt-4 border-t border-border">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-muted-foreground text-xs font-medium">Purchased</p>
                        <p className="font-semibold text-foreground text-sm">
                          {new Date(num.purchasedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground text-xs font-medium">Renews</p>
                        <p className="font-semibold text-foreground text-sm">
                          {new Date(num.renewalDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {numbers.length > 0 && (
          <div className="mt-8">
            <Link to="/buy-number">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Buy Another Number
              </Button>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
