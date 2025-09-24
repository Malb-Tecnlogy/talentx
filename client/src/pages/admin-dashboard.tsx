import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Shield, Users, Building, DollarSign, TrendingUp, Server, Database, ShieldCheck } from "lucide-react";

export default function AdminDashboard() {
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

  // Fetch admin data
  const { data: pendingJobs = [] } = useQuery({
    queryKey: ["/api/jobs/pending"],
    enabled: !!user && (user as any).role === 'admin',
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user && (user as any).role === 'admin',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if ((user as any)?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
              <p className="text-muted-foreground mb-4">This dashboard is only accessible to administrators.</p>
              <Button onClick={() => window.location.href = "/"} data-testid="button-home">
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="admin-dashboard">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-destructive rounded-lg flex items-center justify-center">
                <Shield className="text-destructive-foreground" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground">MaGenX Admin</h3>
                <p className="text-sm text-muted-foreground">Platform Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="destructive" data-testid="button-add-user">
                <Users className="mr-2" size={16} />
                Add User
              </Button>
              <Button 
                variant="ghost" 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/logout', { method: 'POST' });
                    if (response.ok) {
                      window.location.href = "/login";
                    }
                  } catch (error) {
                    console.error('Logout failed:', error);
                    window.location.href = "/login";
                  }
                }}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Connected Users</p>
                  <p className="text-2xl font-bold text-card-foreground" data-testid="text-connected-users">
                    {(stats as any)?.connectedClients || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="text-primary" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Jobs</p>
                  <p className="text-2xl font-bold text-card-foreground" data-testid="text-pending-jobs">
                    {(pendingJobs as any[]).length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Building className="text-accent" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-card-foreground" data-testid="text-monthly-revenue">
                    $125K
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-green-500" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-card-foreground" data-testid="text-success-rate">
                    96.2%
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-orange-500" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tools */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pending Job Approvals */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Job Approvals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(pendingJobs as any[]).slice(0, 5).map((job: any) => (
                <div key={job.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg" data-testid={`card-pending-job-${job.id}`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Building className="text-accent" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground" data-testid={`text-job-title-${job.id}`}>
                        {job.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {job.type} • Budget: ${job.budget || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" data-testid={`button-approve-${job.id}`}>
                      Approve
                    </Button>
                    <Button variant="outline" size="sm" data-testid={`button-review-${job.id}`}>
                      Review
                    </Button>
                  </div>
                </div>
              ))}
              {(pendingJobs as any[]).length === 0 && (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-no-pending-jobs">
                  No jobs pending approval.
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Server className="text-accent" size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">API Response Time</p>
                    <p className="text-xs text-muted-foreground">Average: 245ms</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-accent/10 text-accent" data-testid="badge-api-status">
                    Healthy
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Database className="text-primary" size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">Database Load</p>
                    <p className="text-xs text-muted-foreground">CPU: 45% • Memory: 62%</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-accent/10 text-accent" data-testid="badge-db-status">
                    Normal
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="text-green-500" size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">Security Status</p>
                    <p className="text-xs text-muted-foreground">Last scan: 2h ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-accent/10 text-accent" data-testid="badge-security-status">
                    Secure
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
