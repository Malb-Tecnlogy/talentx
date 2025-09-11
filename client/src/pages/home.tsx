import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if ((user as any)?.role === 'company') {
      setLocation('/company');
    } else if ((user as any)?.role === 'professional') {
      setLocation('/professional');
    } else if ((user as any)?.role === 'admin') {
      setLocation('/admin');
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center" data-testid="home-redirect">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );
}
