import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Building, Users, Clock, DollarSign, Plus, Eye } from "lucide-react";

export default function CompanyDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch company data
  const { data: company } = useQuery({
    queryKey: ["/api/companies/my"],
    enabled: !!user && user.role === 'company',
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["/api/jobs/my"],
    enabled: !!company,
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ["/api/contracts/my"],
    enabled: !!company,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user?.role !== 'company') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
              <p className="text-muted-foreground mb-4">This dashboard is only accessible to companies.</p>
              <Button onClick={() => window.location.href = "/"} data-testid="button-home">
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeProjects = jobs.filter(job => job.status === 'active').length;
  const totalTeamMembers = contracts.filter(c => c.status === 'active').length;
  const pendingReviews = jobs.filter(job => job.status === 'pending_approval').length;
  const monthlySpend = contracts
    .filter(c => c.status === 'active')
    .reduce((sum, c) => sum + (parseFloat(c.rate) || 0), 0);

  return (
    <div className="min-h-screen bg-background" data-testid="company-dashboard">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Building className="text-primary-foreground" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground" data-testid="text-company-name">
                  {company?.name || 'Your Company'}
                </h3>
                <p className="text-sm text-muted-foreground">Company Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button data-testid="button-post-job">
                <Plus className="mr-2" size={16} />
                Post Job
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = "/api/logout"}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                  <p className="text-2xl font-bold text-card-foreground" data-testid="text-active-projects">
                    {activeProjects}
                  </p>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building className="text-primary" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Team Members</p>
                  <p className="text-2xl font-bold text-card-foreground" data-testid="text-team-members">
                    {totalTeamMembers}
                  </p>
                </div>
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Users className="text-accent" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Reviews</p>
                  <p className="text-2xl font-bold text-card-foreground" data-testid="text-pending-reviews">
                    {pendingReviews}
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <Clock className="text-orange-500" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Spend</p>
                  <p className="text-2xl font-bold text-card-foreground" data-testid="text-monthly-spend">
                    ${monthlySpend.toFixed(0)}K
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-green-500" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects & AI Recommendations */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {jobs.slice(0, 3).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg" data-testid={`card-job-${job.id}`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building className="text-primary" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground" data-testid={`text-job-title-${job.id}`}>
                        {job.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {job.type} • {(job.skills as string[]).slice(0, 2).join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={job.status === 'active' ? 'default' : 'secondary'}
                      data-testid={`badge-status-${job.id}`}
                    >
                      {job.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {jobs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-no-projects">
                  No projects yet. <Button variant="link" className="p-0">Post your first job</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Contracts */}
          <Card>
            <CardHeader>
              <CardTitle>Active Contracts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contracts.slice(0, 3).map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg" data-testid={`card-contract-${contract.id}`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Users className="text-accent" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground" data-testid={`text-contract-title-${contract.id}`}>
                        {contract.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${contract.rate}/{contract.currency}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={contract.status === 'active' ? 'default' : 'secondary'}
                      data-testid={`badge-contract-status-${contract.id}`}
                    >
                      {contract.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {contracts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-no-contracts">
                  No active contracts yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
