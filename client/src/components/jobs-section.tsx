import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, DollarSign, Briefcase, Filter, ArrowRight, Building2 } from "lucide-react";
import { PublicJob } from "@shared/schema";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/language-context";
import { getQueryFn } from "@/lib/queryClient";

export default function JobsSection() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [jobType, setJobType] = useState<string>("all");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Fetch jobs with search parameters - build query string manually
  const buildJobsUrl = () => {
    const params = new URLSearchParams();
    if (jobType !== "all") params.append("type", jobType);
    selectedSkills.forEach(skill => params.append("skills", skill));
    return `/api/jobs${params.toString() ? `?${params.toString()}` : ""}`;
  };

  const { data: jobs = [], isLoading } = useQuery<PublicJob[]>({
    queryKey: [buildJobsUrl()],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
  });

  // Filter jobs by search term
  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get unique skills from all jobs
  const allSkills = Array.from(new Set(jobs.flatMap(job => job.skills))).slice(0, 30);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  return (
    <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-900" data-testid="jobs-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4" data-testid="text-jobs-title">
            {t('jobs.title')}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto" data-testid="text-jobs-description">
            {t('jobs.description')}
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Search & Filter Jobs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={t('jobs.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-job-search"
                />
              </div>
              
              {/* Job Type Filter */}
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger className="w-full sm:w-48" data-testid="select-job-type">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('jobs.allTypes')}</SelectItem>
                  <SelectItem value="full-time">{t('jobs.fullTime')}</SelectItem>
                  <SelectItem value="part-time">{t('jobs.partTime')}</SelectItem>
                  <SelectItem value="contract">{t('jobs.contract')}</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Skills Filter */}
            {allSkills.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Skills:</h4>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {allSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant={selectedSkills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => toggleSkill(skill)}
                      data-testid={`skill-filter-${skill}`}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Clear Filters */}
            {(searchTerm || jobType !== "all" || selectedSkills.length > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setJobType("all");
                  setSelectedSkills([]);
                }}
                data-testid="button-clear-filters"
              >
                Clear All Filters
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Jobs Grid/List */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
            Available Positions ({filteredJobs.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mb-4"></div>
            <span className="text-muted-foreground">Loading jobs...</span>
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16 sm:py-20">
              <Briefcase className="w-14 h-14 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2">No jobs found</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {searchTerm || jobType !== "all" || selectedSkills.length > 0
                  ? "Try adjusting your search criteria"
                  : "Check back later for new opportunities!"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow" data-testid={`job-card-${job.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg sm:text-xl mb-2 break-words" data-testid={`job-title-${job.id}`}>
                        {job.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate" data-testid={`job-company-${job.id}`}>
                          {job.company?.name || "Company"}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="flex-shrink-0 whitespace-nowrap" data-testid={`job-type-${job.id}`}>
                      {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`job-description-${job.id}`}>
                    {job.description}
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.slice(0, 6).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs" data-testid={`job-skill-${job.id}-${index}`}>
                        {skill}
                      </Badge>
                    ))}
                    {job.skills.length > 6 && (
                      <Badge variant="secondary" className="text-xs">
                        +{job.skills.length - 6} more
                      </Badge>
                    )}
                  </div>

                  {/* Job Details Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                    {job.budget && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium" data-testid={`job-budget-${job.id}`}>${job.budget}</span>
                      </div>
                    )}
                    {job.duration && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span data-testid={`job-duration-${job.id}`}>{job.duration}</span>
                      </div>
                    )}
                  </div>

                  {/* View Details Button */}
                  <Link href={`/jobs/${job.id}`}>
                    <Button className="w-full" size="sm" data-testid={`button-view-details-${job.id}`}>
                      {t('jobs.viewDetails')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {filteredJobs.length > 0 && (
          <div className="text-center mt-10 sm:mt-12">
            <Link href="/auth">
              <Button size="lg" data-testid="button-view-all-jobs">
                Start Your Application
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
