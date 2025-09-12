// App.tsx using blueprint:javascript_auth_all_persistance
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { queryClient } from "@/lib/queryClient";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import CompanyDashboard from "@/pages/company-dashboard";
import ProfessionalDashboard from "@/pages/professional-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import About from "@/pages/about";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/about" component={About} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      
      {/* Protected routes */}
      <ProtectedRoute path="/dashboard" component={HomePage} />
      <ProtectedRoute path="/company" component={CompanyDashboard} />
      <ProtectedRoute path="/professional" component={ProfessionalDashboard} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;