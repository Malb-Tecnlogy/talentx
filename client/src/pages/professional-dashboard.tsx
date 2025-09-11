import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { User, Eye, ListTodo, CheckCircle, DollarSign } from "lucide-react";

export default function ProfessionalDashboard() {
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

  // Fetch professional data
  const { data: professional } = useQuery({
    queryKey: ["/api/professionals/my"],
    enabled: !!user && (user as any).role === 'professional',
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["/api/applications/my"],
    enabled: !!professional,
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ["/api/contracts/my"],
    enabled: !!professional,
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ["/api/professionals/my/job-recommendations"],
    enabled: !!professional,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if ((user as any)?.role !== 'professional') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
              <p className="text-muted-foreground mb-4">This dashboard is only accessible to professionals.</p>
              <Button onClick={() => window.location.href = "/"} data-testid="button-home">
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profileViews = 156; // Mock data - would come from analytics
  const activeProjects = (contracts as any[]).filter((c: any) => c.status === 'active').length;
  const successRate = (applications as any[]).length > 0 ? 
    Math.round(((applications as any[]).filter((a: any) => a.status === 'selected').length / (applications as any[]).length) * 100) : 0;
  const monthlyEarnings = (contracts as any[])
    .filter((c: any) => c.status === 'active')
    .reduce((sum: number, c: any) => sum + (parseFloat(c.rate) || 0), 0);

  return (
    <div className="min-h-screen bg-background" data-testid="professional-dashboard">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img 
                src={(user as any)?.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${(user as any)?.email}`}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
                data-testid="img-profile"
              />
              <div>
                <h3 className="font-semibold text-card-foreground" data-testid="text-professional-name">
                  {(user as any)?.firstName} {(user as any)?.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">{professional?.title || 'Professional'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                <span className="text-sm text-muted-foreground" data-testid="text-availability">
                  {professional?.availability || 'Available'}
                </span>
              </div>
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
                  <p className="text-sm text-muted-foreground">Profile Views</p>
                  <p className="text-2xl font-bold text-card-foreground" data-testid="text-profile-views">
                    {profileViews}
                  </p>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Eye className="text-primary" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                  <p className="text-2xl font-bold text-card-foreground" data-testid="text-active-projects">
                    {activeProjects}
                  </p>
                </div>
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <ListTodo className="text-accent" size={20} />
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
                    {successRate}%
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-green-500" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Earnings</p>
                  <p className="text-2xl font-bold text-card-foreground" data-testid="text-earnings">
                    ${monthlyEarnings.toFixed(1)}K
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-orange-500" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Recommendations & Skills Portfolio */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recommended Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(recommendations as any[]).slice(0, 3).map((rec: any) => (
                <div key={rec.jobId} className="p-4 bg-muted/50 rounded-lg" data-testid={`card-recommendation-${rec.jobId}`}>
                  <div className="flex items-start justify-between mb-3">
                    <h5 className="font-medium text-card-foreground" data-testid={`text-job-title-${rec.jobId}`}>
                      Job Opportunity
                    </h5>
                    <Badge className="bg-accent/10 text-accent" data-testid={`badge-match-${rec.jobId}`}>
                      {rec.matchScore}% Match
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3" data-testid={`text-reasoning-${rec.jobId}`}>
                    {rec.reasoning}
                  </p>
                  <Button size="sm" data-testid={`button-apply-${rec.jobId}`}>
                    Apply
                  </Button>
                </div>
              ))}
              {(recommendations as any[]).length === 0 && (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-no-recommendations">
                  No job recommendations available. Complete your profile to get matched with opportunities.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills & Portfolio */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Skills Portfolio</CardTitle>
                <Button variant="outline" size="sm" data-testid="button-edit-profile">
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h5 className="text-sm font-medium text-card-foreground mb-3">Technical Skills</h5>
                <div className="flex flex-wrap gap-2">
                  {(professional?.skills as string[] || []).map((skill, index) => (
                    <Badge key={index} variant="outline" data-testid={`badge-skill-${index}`}>
                      {skill}
                    </Badge>
                  ))}
                  {(!professional?.skills || professional.skills.length === 0) && (
                    <p className="text-sm text-muted-foreground" data-testid="text-no-skills">
                      No skills added yet.
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h5 className="text-sm font-medium text-card-foreground mb-3">Recent Work</h5>
                <div className="space-y-3">
                  {(professional?.portfolio as any[] || []).slice(0, 2).map((project, index) => (
                    <div key={index} className="flex items-center space-x-3" data-testid={`card-portfolio-${index}`}>
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <ListTodo className="text-primary" size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground" data-testid={`text-project-title-${index}`}>
                          {project.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {project.tech?.join(', ') || 'No tech specified'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!professional?.portfolio || professional.portfolio.length === 0) && (
                    <div className="text-center py-4 text-muted-foreground" data-testid="text-no-portfolio">
                      No portfolio items yet. <Button variant="link" className="p-0">Add your work</Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
