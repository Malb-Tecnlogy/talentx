import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Building2, Clock, DollarSign, Briefcase, CheckCircle } from "lucide-react";
import { PublicJob } from "@shared/schema";
import { useLanguage } from "@/contexts/language-context";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedRate, setProposedRate] = useState("");

  // Auto-open apply dialog if user returned from login with action=apply
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    
    // Only proceed if action=apply is present and user is authenticated
    if (action === 'apply' && user) {
      setIsDialogOpen(true);
      // Clean up the URL parameter
      window.history.replaceState({}, '', `/jobs/${id}`);
    }
  }, [user, id]);

  const { data: job, isLoading } = useQuery<PublicJob>({
    queryKey: [`/api/jobs/${id}`],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!id,
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        toast({
          title: t('jobs.apply.loginRequired'),
          variant: "destructive",
        });
        throw new Error("Not authenticated");
      }

      const res = await apiRequest("POST", "/api/applications", {
        jobId: id,
        coverLetter,
        proposedRate: proposedRate ? parseFloat(proposedRate) : undefined,
      });
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: t('jobs.apply.success'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/applications/my'] });
      setIsDialogOpen(false);
      setCoverLetter("");
      setProposedRate("");
    },
    onError: (error: any) => {
      toast({
        title: t('jobs.apply.error'),
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleApply = () => {
    if (!user) {
      const redirectUrl = encodeURIComponent(`/jobs/${id}?action=apply`);
      setLocation(`/auth?redirect=${redirectUrl}`);
      return;
    }
    applyMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <span className="text-muted-foreground">{t('jobs.loading')}</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <Card>
            <CardContent className="text-center py-20">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Job not found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                The job you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/jobs">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('jobs.details.backToJobs')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="job-details-page">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-5xl">
        {/* Back Button */}
        <Link href="/jobs">
          <Button variant="ghost" className="mb-6" data-testid="button-back-to-jobs">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('jobs.details.backToJobs')}
          </Button>
        </Link>

        {/* Job Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl sm:text-3xl mb-3" data-testid="job-detail-title">
                  {job.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-base">
                  <Building2 className="w-5 h-5" />
                  <span data-testid="job-detail-company">{job.company?.name || "Company"}</span>
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-base px-4 py-1" data-testid="job-detail-type">
                {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Job Meta Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              {job.budget && (
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('jobs.details.budget')}</p>
                    <p className="font-semibold" data-testid="job-detail-budget">${job.budget}</p>
                  </div>
                </div>
              )}
              {job.duration && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('jobs.details.duration')}</p>
                    <p className="font-semibold" data-testid="job-detail-duration">{job.duration}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-3">{t('jobs.details.description')}</h3>
              <p className="text-muted-foreground whitespace-pre-wrap" data-testid="job-detail-description">
                {job.description}
              </p>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div>
                <h3 className="text-lg font-semibold mb-3">{t('jobs.details.requirements')}</h3>
                <p className="text-muted-foreground whitespace-pre-wrap" data-testid="job-detail-requirements">
                  {job.requirements}
                </p>
              </div>
            )}

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">{t('jobs.details.skills')}</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" data-testid={`job-detail-skill-${index}`}>
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Apply Button */}
            <div className="pt-4 border-t">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full sm:w-auto" data-testid="button-apply-job">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {t('jobs.details.applyNow')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t('jobs.apply.title')}</DialogTitle>
                    <DialogDescription>
                      {job.title} - {job.company?.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="coverLetter">{t('jobs.apply.coverLetter')}</Label>
                      <Textarea
                        id="coverLetter"
                        placeholder={t('jobs.apply.coverLetterPlaceholder')}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={6}
                        data-testid="input-cover-letter"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="proposedRate">{t('jobs.apply.proposedRate')}</Label>
                      <Input
                        id="proposedRate"
                        type="number"
                        placeholder={t('jobs.apply.proposedRatePlaceholder')}
                        value={proposedRate}
                        onChange={(e) => setProposedRate(e.target.value)}
                        data-testid="input-proposed-rate"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleApply}
                    disabled={applyMutation.isPending}
                    className="w-full"
                    data-testid="button-submit-application"
                  >
                    {applyMutation.isPending ? t('jobs.apply.submitting') : t('jobs.apply.submit')}
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
