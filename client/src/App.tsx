// App.tsx using blueprint:javascript_auth_all_persistance
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { queryClient } from "@/lib/queryClient";
import { LanguageProvider } from "@/contexts/language-context";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import CompanyDashboard from "@/pages/company-dashboard";
import ProfessionalDashboard from "@/pages/professional-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminCompanies from "@/pages/admin/companies";
import AdminProfessionals from "@/pages/admin/professionals";
import AdminJobs from "@/pages/admin/jobs";
import AdminApplications from "@/pages/admin/applications";
import AdminContracts from "@/pages/admin/contracts";
import AdminNotifications from "@/pages/admin/notifications";
import About from "@/pages/about";
import Jobs from "@/pages/jobs";
import FindTalent from "@/pages/find-talent";
import FindWork from "@/pages/find-work";
import Contact from "@/pages/contact";
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
      <Route path="/jobs" component={Jobs} />
      <Route path="/find-talent" component={FindTalent} />
      <Route path="/find-work" component={FindWork} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      
      {/* Protected routes */}
      <ProtectedRoute path="/dashboard" component={HomePage} />
      <ProtectedRoute path="/company" component={CompanyDashboard} />
      <ProtectedRoute path="/professional" component={ProfessionalDashboard} />
      
      {/* Admin routes */}
      <ProtectedRoute path="/admin/users" component={AdminUsers} />
      <ProtectedRoute path="/admin/companies" component={AdminCompanies} />
      <ProtectedRoute path="/admin/professionals" component={AdminProfessionals} />
      <ProtectedRoute path="/admin/jobs" component={AdminJobs} />
      <ProtectedRoute path="/admin/applications" component={AdminApplications} />
      <ProtectedRoute path="/admin/contracts" component={AdminContracts} />
      <ProtectedRoute path="/admin/notifications" component={AdminNotifications} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;