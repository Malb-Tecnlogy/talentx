import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Filter,
  ArrowRight,
} from "lucide-react";
import { Job } from "@shared/schema";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/language-context";

export default function JobsSection() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [jobType, setJobType] = useState<string>("all");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Fetch jobs with search parameters
  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: [
      "/api/jobs",
      { type: jobType !== "all" ? jobType : undefined, skills: selectedSkills },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (jobType !== "all") params.append("type", jobType);
      selectedSkills.forEach((skill) => params.append("skills", skill));

      const url = `/api/jobs${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch jobs");
      return response.json();
    },
  });

  // Filter jobs by search term
  const filteredJobs =
    jobs?.filter(
      (job) =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills.some((skill) =>
          skill.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
    ) || [];

  // Get unique skills from all jobs
  const allSkills = Array.from(
    new Set(jobs?.flatMap((job) => job.skills) || []),
  );

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  return (
    <section
      className="py-20 bg-gray-50 dark:bg-gray-800"
      data-testid="jobs-section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
            data-testid="text-jobs-title"
          >
            {t("jobs.title")}
          </h2>
          <p
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            data-testid="text-jobs-description"
          >
            {t("jobs.description")}
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Search & Filter Jobs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={t("jobs.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-job-search"
                />
              </div>

              {/* Job Type Filter */}
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger
                  className="w-full md:w-48"
                  data-testid="select-job-type"
                >
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("jobs.allTypes")}</SelectItem>
                  <SelectItem value="full-time">
                    {t("jobs.fullTime")}
                  </SelectItem>
                  <SelectItem value="part-time">
                    {t("jobs.partTime")}
                  </SelectItem>
                  <SelectItem value="contract">{t("jobs.contract")}</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Skills Filter */}
            {allSkills.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Skills:
                </h4>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {allSkills.slice(0, 20).map((skill) => (
                    <Badge
                      key={skill}
                      variant={
                        selectedSkills.includes(skill) ? "default" : "outline"
                      }
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
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

        {/* Jobs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Available Positions ({filteredJobs.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-muted-foreground">
                  Loading jobs...
                </span>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No jobs found
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {searchTerm || jobType !== "all" || selectedSkills.length > 0
                    ? "Try adjusting your search criteria"
                    : "Check back later for new opportunities!"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Position</TableHead>
                      <TableHead className="w-[120px]">Type</TableHead>
                      <TableHead className="w-[200px]">Skills</TableHead>
                      <TableHead className="w-[120px]">Budget</TableHead>
                      <TableHead className="w-[120px]">Duration</TableHead>
                      <TableHead className="w-[100px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.map((job) => (
                      <TableRow
                        key={job.id}
                        className="hover:bg-muted/50"
                        data-testid={`job-row-${job.id}`}
                      >
                        <TableCell>
                          <div>
                            <h4
                              className="font-medium text-foreground"
                              data-testid={`job-title-${job.id}`}
                            >
                              {job.title}
                            </h4>
                            <p
                              className="text-sm text-muted-foreground line-clamp-2 mt-1"
                              data-testid={`job-description-${job.id}`}
                            >
                              {job.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            data-testid={`job-type-${job.id}`}
                          >
                            {job.type.charAt(0).toUpperCase() +
                              job.type.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {job.skills.slice(0, 3).map((skill, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                                data-testid={`job-skill-${job.id}-${index}`}
                              >
                                {skill}
                              </Badge>
                            ))}
                            {job.skills.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{job.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {job.budget && (
                            <div className="flex items-center text-sm">
                              <DollarSign className="w-4 h-4 mr-1" />
                              <span data-testid={`job-budget-${job.id}`}>
                                ${job.budget}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {job.duration && (
                            <div className="flex items-center text-sm">
                              <Clock className="w-4 h-4 mr-1" />
                              <span data-testid={`job-duration-${job.id}`}>
                                {job.duration}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Link href={`/auth?jobId=${job.id}`}>
                            <Button
                              size="sm"
                              className="w-full"
                              data-testid={`button-apply-${job.id}`}
                            >
                              Apply
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Link href="/auth">
            <Button size="lg" data-testid="button-view-all-jobs">
              View All Jobs & Start Applying
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
