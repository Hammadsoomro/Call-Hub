import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Phone, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OwnedNumber {
  id: string;
  number: string;
  country: string;
  purchasedDate: Date;
  renewalDate: Date;
}

export default function BoughtNumbers() {
  const numbers: OwnedNumber[] = [
    {
      id: '1',
      number: '+1 (555) 000-0001',
      country: 'United States',
      purchasedDate: new Date('2024-01-15'),
      renewalDate: new Date('2025-01-15'),
    },
    {
      id: '2',
      number: '+1 (555) 000-0002',
      country: 'United States',
      purchasedDate: new Date('2024-02-20'),
      renewalDate: new Date('2025-02-20'),
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Phone Numbers</h1>
          <p className="text-muted-foreground">Manage your purchased Telnyx numbers</p>
        </div>

        {numbers.length === 0 ? (
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
          <div className="grid gap-4">
            {numbers.map((num) => (
              <div key={num.id} className="bg-card rounded-lg border border-border p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-primary/10 rounded-lg p-2">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{num.number}</h3>
                        <p className="text-sm text-muted-foreground">{num.country}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                      <div>
                        <p className="text-muted-foreground text-xs">Purchased</p>
                        <p className="font-semibold text-foreground">{num.purchasedDate.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Renewal Date</p>
                        <p className="font-semibold text-foreground">{num.renewalDate.toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <button className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link to="/buy-number">
            <Button className="bg-primary hover:bg-primary/90 text-white">
              Buy Another Number
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
