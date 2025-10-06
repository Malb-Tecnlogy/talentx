import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
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
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Eye, ListTodo, CheckCircle, DollarSign, Plus, Trash2, Edit, Briefcase, Calendar, Clock, Upload, FileText, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Professional } from "@shared/schema";
import { SuggestionInput } from "@/components/ui/suggestion-input";
import { ProfileUpdateForm } from "@/components/profile-update-form";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Professional profile form schema
const professionalProfileSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  bio: z.string().optional(),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  experience: z.coerce.number().min(0, "Experience must be 0 or more years").optional(),
  hourlyRate: z.string().optional(),
  availability: z.string().optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  portfolio: z.array(z.object({
    title: z.string().min(1, "Project title is required"),
    description: z.string().min(1, "Project description is required"),
    url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
    tech: z.array(z.string()),
  })).optional(),
});

type ProfessionalProfileForm = z.infer<typeof professionalProfileSchema>;

// Professional Profile Creation Form Component
function ProfessionalProfileForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const form = useForm<ProfessionalProfileForm>({
    resolver: zodResolver(professionalProfileSchema),
    defaultValues: {
      title: "",
      bio: "",
      skills: [],
      experience: undefined,
      hourlyRate: "",
      availability: "available",
      location: "",
      timezone: "",
      portfolio: [],
    },
  });

  const { fields: portfolioFields, append: appendPortfolio, remove: removePortfolio } = useFieldArray({
    control: form.control,
    name: "portfolio",
  });

  const createProfessionalMutation = useMutation({
    mutationFn: (data: ProfessionalProfileForm) => apiRequest('POST', '/api/professionals', data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Professional profile created successfully!",
      });
      // Invalidate both professional and user queries to update role
      queryClient.invalidateQueries({ queryKey: ["/api/professionals/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Check if there's a pending job application
      const pendingJobId = sessionStorage.getItem('pendingJobApplication');
      if (pendingJobId) {
        sessionStorage.removeItem('pendingJobApplication');
        // Redirect to the job page with action=apply to auto-open the dialog
        setLocation(`/jobs/${pendingJobId}?action=apply`);
      } else {
        onSuccess();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create professional profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfessionalProfileForm) => {
    createProfessionalMutation.mutate(data);
  };

  // Skills management
  const [skillInput, setSkillInput] = useState("");
  const addSkill = () => {
    if (skillInput.trim() && !form.getValues("skills").includes(skillInput.trim())) {
      const currentSkills = form.getValues("skills");
      form.setValue("skills", [...currentSkills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues("skills");
    form.setValue("skills", currentSkills.filter(skill => skill !== skillToRemove));
  };

  // Resume upload and auto-fill
  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Error",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    setResumeFile(file);
    setIsUploadingResume(true);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch('/api/professionals/upload-resume', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to upload resume');
      }

      const data = await response.json();
      
      // Auto-fill form fields with parsed data
      if (data.parsedData) {
        const parsed = data.parsedData;
        
        if (parsed.title) form.setValue('title', parsed.title);
        if (parsed.bio) form.setValue('bio', parsed.bio);
        if (parsed.skills && Array.isArray(parsed.skills)) {
          form.setValue('skills', parsed.skills.slice(0, 30)); // max 30 skills
        }
        if (parsed.experience) form.setValue('experience', parsed.experience);
        if (parsed.location) form.setValue('location', parsed.location);
        
        toast({
          title: "Success! ✨",
          description: "Resume processed successfully. Fields have been auto-filled. Please review and adjust as needed.",
        });
      }
    } catch (error) {
      console.error('Resume upload error:', error);
      toast({
        title: "Error",
        description: "Failed to process resume. Please try again or fill the form manually.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingResume(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8" data-testid="professional-profile-setup">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">Complete Your Professional Profile</CardTitle>
            <p className="text-center text-muted-foreground">
              Showcase your skills and experience to connect with opportunities on MaGenX
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Resume Upload Section */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Quick Start: Upload Your Resume
                          </h3>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            Save time! Upload your PDF resume and let our AI automatically fill in your profile details.
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant="default"
                            className="relative"
                            disabled={isUploadingResume}
                            onClick={() => document.getElementById('resume-upload')?.click()}
                            data-testid="button-upload-resume"
                          >
                            {isUploadingResume ? (
                              <>
                                <Clock className="mr-2 h-4 w-4 animate-spin" />
                                Processing Resume...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Resume (PDF)
                              </>
                            )}
                          </Button>
                          
                          <input
                            id="resume-upload"
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={handleResumeUpload}
                            disabled={isUploadingResume}
                          />
                          
                          {resumeFile && (
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              {resumeFile.name}
                            </span>
                          )}
                        </div>

                        <Alert className="bg-white/50 dark:bg-black/20 border-blue-300 dark:border-blue-700">
                          <AlertDescription className="text-xs text-blue-600 dark:text-blue-400">
                            💡 <strong>Tip:</strong> Make sure your resume includes your skills, work experience, education, and contact info for best results. Max file size: 10MB.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Senior Frontend Developer" {...field} data-testid="input-professional-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about yourself and your experience..." 
                            rows={4} 
                            {...field} 
                            data-testid="input-professional-bio"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience</FormLabel>
                          <FormControl>
                            <SuggestionInput
                              value={field.value}
                              onChange={(value) => field.onChange(value ? Number(value) : undefined)}
                              suggestions={["1", "2", "3", "5", "7", "10"]}
                              placeholder="e.g., 5"
                              type="number"
                              data-testid="input-professional-experience"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hourlyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hourly Rate (USD)</FormLabel>
                          <FormControl>
                            <SuggestionInput
                              value={field.value}
                              onChange={field.onChange}
                              suggestions={["25", "35", "50", "75", "100", "150"]}
                              placeholder="e.g., 50"
                              type="number"
                              data-testid="input-professional-rate"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="availability"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Availability</FormLabel>
                          <FormControl>
                            <select 
                              {...field} 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              data-testid="select-professional-availability"
                            >
                              <option value="">Select availability</option>
                              <option value="available">Available</option>
                              <option value="busy">Busy</option>
                              <option value="unavailable">Unavailable</option>
                            </select>
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
                            <Input placeholder="City, Country" {...field} data-testid="input-professional-location" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timezone</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., UTC-3" {...field} data-testid="input-professional-timezone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Skills Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Skills *</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill..."
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      data-testid="input-add-skill"
                    />
                    <Button type="button" onClick={addSkill} data-testid="button-add-skill">
                      <Plus size={16} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.watch("skills").map((skill, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1" data-testid={`badge-skill-${index}`}>
                        {skill}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeSkill(skill)}
                          data-testid={`button-remove-skill-${index}`}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  {form.formState.errors.skills && (
                    <p className="text-sm text-destructive">{form.formState.errors.skills.message}</p>
                  )}
                </div>

                {/* Portfolio Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Portfolio Projects</h3>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => appendPortfolio({ title: "", description: "", url: "", tech: [] })}
                      data-testid="button-add-portfolio"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Project
                    </Button>
                  </div>

                  {portfolioFields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Project {index + 1}</h4>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removePortfolio(index)}
                            data-testid={`button-remove-portfolio-${index}`}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`portfolio.${index}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Project Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Project name" {...field} data-testid={`input-portfolio-title-${index}`} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`portfolio.${index}.url`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Project URL</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://..." {...field} data-testid={`input-portfolio-url-${index}`} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name={`portfolio.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe the project and your role..." 
                                  rows={3} 
                                  {...field} 
                                  data-testid={`input-portfolio-description-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit" 
                    disabled={createProfessionalMutation.isPending}
                    className="flex-1"
                    data-testid="button-create-profile"
                  >
                    {createProfessionalMutation.isPending ? "Creating..." : "Create Professional Profile"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProfessionalDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [profileCreated, setProfileCreated] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

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

  // Fetch professional data
  const { data: professional, isLoading: professionalLoading, error: professionalError } = useQuery<Professional>({
    queryKey: ["/api/professionals/me"],
    enabled: !!user, // Enable for any authenticated user
    retry: false,
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
    queryKey: ["/api/professionals/me/job-recommendations"],
    enabled: !!professional,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user already has a different role and it's not professional-related, redirect
  if ((user as any)?.role && (user as any)?.role !== 'professional' && (user as any)?.role !== 'company') {
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

  // Show profile creation form if no professional profile exists
  if (!professionalLoading && !professional && !profileCreated) {
    // If there's no error, or it's a 404, show the profile creation form
    // Backend returns null (200 status) for new users without profiles
    if (!professionalError) {
      return (
        <ProfessionalProfileForm onSuccess={() => setProfileCreated(true)} />
      );
    }

    // Check if this is a 404 error (user doesn't have profile yet)
    const errorMessage = professionalError?.message || '';
    const is404 = errorMessage.includes('404') || errorMessage.includes('not found') || 
                  (professionalError as any)?.status === 404;
    
    // Show profile creation form for 404s too
    if (is404) {
      return (
        <ProfessionalProfileForm onSuccess={() => setProfileCreated(true)} />
      );
    }
    
    // Only show error for genuine server errors (500, network errors, etc.)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">Error Loading Profile</h1>
              <p className="text-muted-foreground mb-4">Unable to load professional information. Please try again.</p>
              <Button onClick={() => window.location.reload()} data-testid="button-retry">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Real metrics based on actual data
  const profileViews = 0; // TODO: Implement analytics tracking
  const activeProjects = (contracts as any[]).filter((c: any) => c.status === 'active').length;
  const successRate = (applications as any[]).length > 0 ? 
    Math.round(((applications as any[]).filter((a: any) => a.status === 'selected').length / (applications as any[]).length) * 100) : 0;

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
                <p className="text-sm text-muted-foreground">{(professional as Professional)?.title || 'Professional'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                <span className="text-sm text-muted-foreground" data-testid="text-availability">
                  {(professional as Professional)?.availability || 'Available'}
                </span>
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setShowUpdateForm(!showUpdateForm)}
                data-testid="button-edit-profile"
              >
                <Edit className="w-4 h-4 mr-2" />
                {showUpdateForm ? "View Dashboard" : "Edit Profile"}
              </Button>
              <Button 
                variant="ghost" 
                onClick={async () => {
                  try {
                    await fetch('/api/logout', { method: 'POST' });
                    window.location.href = "/";
                  } catch (error) {
                    console.error('Logout failed:', error);
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
        {/* Show Update Form if toggled */}
        {showUpdateForm ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Meu currículo</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileUpdateForm professional={professional} />
            </CardContent>
          </Card>
        ) : (
          <>
        {/* Stats Cards - Only 3 cards now */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
        </div>

        {/* Job Recommendations & Skills Portfolio */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recommended Projects */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recommended Projects</CardTitle>
                <Link href="/jobs">
                  <Button variant="outline" size="sm" data-testid="button-view-all-jobs">
                    Ver Todas as Vagas
                  </Button>
                </Link>
              </div>
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
                <div className="text-center py-8" data-testid="text-no-recommendations">
                  <p className="text-muted-foreground mb-4">
                    No job recommendations available. Complete your profile to get matched with opportunities.
                  </p>
                  <Link href="/jobs">
                    <Button variant="default" data-testid="button-browse-jobs">
                      Explorar Vagas Disponíveis
                    </Button>
                  </Link>
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
                  {((professional as Professional)?.skills || []).map((skill, index) => (
                    <Badge key={index} variant="outline" data-testid={`badge-skill-${index}`}>
                      {skill}
                    </Badge>
                  ))}
                  {(!(professional as Professional)?.skills || (professional as Professional)?.skills?.length === 0) && (
                    <p className="text-sm text-muted-foreground" data-testid="text-no-skills">
                      No skills added yet.
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h5 className="text-sm font-medium text-card-foreground mb-3">Recent Work</h5>
                <div className="space-y-3">
                  {((professional as Professional)?.portfolio || []).slice(0, 2).map((project, index) => (
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
                  {(!(professional as Professional)?.portfolio || (professional as Professional)?.portfolio?.length === 0) && (
                    <div className="text-center py-4 text-muted-foreground" data-testid="text-no-portfolio">
                      No portfolio items yet. <Button variant="link" className="p-0">Add your work</Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applied Jobs Section - Moved to last position */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Vagas Aplicadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(applications as any[]).length === 0 ? (
              <div className="text-center py-8" data-testid="text-no-applications">
                <p className="text-muted-foreground mb-4">
                  Você ainda não se candidatou a nenhuma vaga.
                </p>
                <Link href="/jobs">
                  <Button variant="default" data-testid="button-browse-jobs-applications">
                    Ver Vagas Disponíveis
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {(applications as any[]).map((app: any) => (
                  <div 
                    key={app.id} 
                    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    data-testid={`card-application-${app.id}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-card-foreground mb-1" data-testid={`text-job-title-${app.id}`}>
                          {app.job?.title || 'Vaga não encontrada'}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {app.job?.company?.name || 'Empresa não disponível'}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {app.job?.type || 'N/A'}
                          </span>
                          {app.job?.budget && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              ${app.job.budget}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(app.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          app.status === 'selected' ? 'default' : 
                          app.status === 'rejected' ? 'destructive' : 
                          'secondary'
                        }
                        data-testid={`badge-status-${app.id}`}
                      >
                        {app.status === 'pending' && 'Pendente'}
                        {app.status === 'reviewing' && 'Em Análise'}
                        {app.status === 'selected' && 'Selecionado'}
                        {app.status === 'rejected' && 'Rejeitado'}
                      </Badge>
                    </div>
                    
                    {app.matchScore && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Compatibilidade</span>
                          <span className="font-medium">{app.matchScore}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{ width: `${app.matchScore}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {app.proposedRate && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Taxa proposta: <span className="font-medium text-card-foreground">${app.proposedRate}/hora</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
          </>
        )}
      </div>
    </div>
  );
}
