import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building, Users, Clock, DollarSign, Plus, Eye } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Company profile form schema
const companyProfileSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  description: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  industry: z.string().optional(),
  size: z.string().optional(),
  location: z.string().optional(),
});

type CompanyProfileForm = z.infer<typeof companyProfileSchema>;

// Company Profile Creation Form Component
function CompanyProfileForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CompanyProfileForm>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      name: "",
      description: "",
      website: "",
      industry: "",
      size: "",
      location: "",
    },
  });

  const createCompanyMutation = useMutation({
    mutationFn: (data: CompanyProfileForm) => apiRequest('/api/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Company profile created successfully!",
      });
      // Invalidate both company and user queries to update role
      queryClient.invalidateQueries({ queryKey: ["/api/companies/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create company profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CompanyProfileForm) => {
    createCompanyMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center" data-testid="company-profile-setup">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Complete Your Company Profile</CardTitle>
          <p className="text-center text-muted-foreground">
            Tell us about your company to get started with MaGenX
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your company name" {...field} data-testid="input-company-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us about your company..." 
                        rows={4} 
                        {...field} 
                        data-testid="input-company-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://yourcompany.com" {...field} data-testid="input-company-website" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, Country" {...field} data-testid="input-company-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-company-industry">
                            <SelectValue placeholder="Select your industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="consulting">Consulting</SelectItem>
                          <SelectItem value="startup">Startup</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Size</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-company-size">
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="501-1000">501-1000 employees</SelectItem>
                          <SelectItem value="1000+">1000+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={createCompanyMutation.isPending}
                  className="flex-1"
                  data-testid="button-create-profile"
                >
                  {createCompanyMutation.isPending ? "Creating..." : "Create Company Profile"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CompanyDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [profileCreated, setProfileCreated] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/auth";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch company data
  const { data: company, isLoading: companyLoading, error: companyError } = useQuery({
    queryKey: ["/api/companies/my"],
    enabled: !!user, // Enable for any authenticated user
    retry: false,
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

  // If user already has a different role and it's not company-related, redirect
  if ((user as any)?.role && (user as any)?.role !== 'company' && (user as any)?.role !== 'professional') {
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

  // Show profile creation form if no company profile exists (404 error)
  if (!companyLoading && !company && !profileCreated) {
    // Only show form for 404 errors (no profile) or users without company role
    const is404 = companyError && (companyError as any).status === 404;
    const needsProfile = is404 || !(user as any)?.role || (user as any)?.role === 'professional';
    
    if (needsProfile) {
      return (
        <CompanyProfileForm onSuccess={() => setProfileCreated(true)} />
      );
    }
    
    // Show error for other types of errors
    if (companyError && !is404) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground mb-4">Error Loading Profile</h1>
                <p className="text-muted-foreground mb-4">Unable to load company information. Please try again.</p>
                <Button onClick={() => window.location.reload()} data-testid="button-retry">
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  const activeProjects = (jobs as any[]).filter((job: any) => job.status === 'active').length;
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
