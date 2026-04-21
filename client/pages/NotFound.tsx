import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-6 opacity-50" />
        <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-3">
          <Link to="/" className="block">
            <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 rounded-lg">
              Go Home
            </Button>
          </Link>
          <Link to="/login" className="block">
            <Button variant="outline" className="w-full py-2 rounded-lg">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
