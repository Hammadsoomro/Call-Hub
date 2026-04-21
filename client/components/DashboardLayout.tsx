import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Phone, PhoneOff, ShoppingCart, Settings, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const { user, logout, isTelnyxConnected } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [telnyxBalance, setTelnyxBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Fetch Telnyx balance when component mounts or when Telnyx is connected
  useEffect(() => {
    if (isTelnyxConnected() && user?.telnyxApiKey) {
      fetchBalance();
    }
  }, [isTelnyxConnected(), user?.telnyxApiKey]);

  const fetchBalance = async () => {
    try {
      setLoadingBalance(true);
      const response = await fetch('/api/telnyx/balance', {
        headers: {
          'Authorization': `Bearer ${user?.telnyxApiKey}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTelnyxBalance(Number(data.balance));
      }
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    } finally {
      setLoadingBalance(false);
    }
  };

  const mainNavItems = [
    { path: '/dialpad', label: 'DialPad', icon: Phone },
    { path: '/bought-numbers', label: 'Bought Numbers', icon: PhoneOff },
    { path: '/buy-number', label: 'Buy New Number', icon: ShoppingCart },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={cn(
        'bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out overflow-hidden',
        isSidebarOpen ? 'w-64' : 'w-20'
      )}>
        {/* Logo & Toggle */}
        <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
          {isSidebarOpen && (
            <Link to="/dialpad" className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1">
              <div className="bg-sidebar-primary rounded-lg p-2 flex-shrink-0">
                <Phone className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-sidebar-primary-foreground">Call Hub</h1>
                <p className="text-xs text-sidebar-accent-foreground">VoIP Platform</p>
              </div>
            </Link>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-sidebar-accent rounded-lg transition-colors flex-shrink-0"
            title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            <Menu className="w-5 h-5 text-sidebar-foreground" />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          {mainNavItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              title={label}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                isSidebarOpen ? 'justify-start' : 'justify-center',
                isActive(path)
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-sidebar-border p-3 space-y-2">
          <Link
            to="/settings"
            title="Settings"
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
              isSidebarOpen ? 'justify-start' : 'justify-center',
              isActive('/settings')
                ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span>Settings</span>}
          </Link>

          <button
            onClick={logout}
            title="Sign Out"
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-red-500/20 hover:text-red-500 transition-all',
              isSidebarOpen ? 'justify-start w-full' : 'justify-center'
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>

        {/* Telnyx Balance Display */}
        {isSidebarOpen && isTelnyxConnected() && (
          <div className="border-t border-sidebar-border p-3 bg-sidebar-accent/50">
            <p className="text-xs text-sidebar-accent-foreground mb-1">Telnyx Balance</p>
            {loadingBalance ? (
              <p className="text-sm font-semibold text-sidebar-foreground">Loading...</p>
            ) : telnyxBalance !== null && !isNaN(telnyxBalance) ? (
              <p className="text-lg font-bold text-sidebar-primary">${telnyxBalance.toFixed(2)}</p>
            ) : (
              <p className="text-sm text-sidebar-foreground">—</p>
            )}
          </div>
        )}

        {/* User Info */}
        {isSidebarOpen && (
          <div className="border-t border-sidebar-border p-3">
            <p className="text-xs text-sidebar-accent-foreground">Signed in as</p>
            <p className="text-sm font-semibold text-sidebar-foreground truncate">{user?.email}</p>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  );
}
