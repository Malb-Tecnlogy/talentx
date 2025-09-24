import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Search, MapPin, Clock, DollarSign, Building, Calendar, Filter } from "lucide-react";

export default function FindWork() {
  const jobs = [
    {
      id: 1,
      title: "Senior React Developer",
      company: "TechCorp Solutions",
      location: "Remote - US/Canada",
      type: "Full-time",
      salary: "$70,000 - $90,000",
      posted: "2 days ago",
      skills: ["React", "TypeScript", "Node.js", "GraphQL"],
      description: "Join our dynamic team building next-generation web applications for enterprise clients.",
      urgent: false
    },
    {
      id: 2,
      title: "UX/UI Designer",
      company: "DesignCo Inc",
      location: "Remote - Global",
      type: "Contract",
      salary: "$45 - $60/hour",
      posted: "1 day ago",
      skills: ["Figma", "User Research", "Prototyping", "Adobe Creative Suite"],
      description: "Create beautiful and intuitive user experiences for our SaaS platform.",
      urgent: true
    },
    {
      id: 3,
      title: "DevOps Engineer",
      company: "CloudFirst Technologies",
      location: "Remote - Americas",
      type: "Full-time",
      salary: "$80,000 - $100,000",
      posted: "3 days ago",
      skills: ["AWS", "Docker", "Kubernetes", "Terraform", "Python"],
      description: "Build and maintain scalable cloud infrastructure for high-traffic applications.",
      urgent: false
    },
    {
      id: 4,
      title: "Full Stack Engineer",
      company: "StartupXYZ",
      location: "Remote - Latin America",
      type: "Full-time",
      salary: "$60,000 - $75,000",
      posted: "1 week ago",
      skills: ["Vue.js", "Python", "PostgreSQL", "Redis"],
      description: "Help build innovative fintech solutions from the ground up.",
      urgent: false
    }
  ];

  const categories = [
    { name: "Frontend Development", count: "150+ jobs" },
    { name: "Backend Development", count: "120+ jobs" },
    { name: "Full Stack", count: "200+ jobs" },
    { name: "Mobile Development", count: "80+ jobs" },
    { name: "DevOps", count: "60+ jobs" },
    { name: "Design", count: "90+ jobs" },
    { name: "Data Science", count: "40+ jobs" },
    { name: "Product Management", count: "30+ jobs" }
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="find-work-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-foreground mb-6" data-testid="text-hero-title">
              Find Your Dream Remote Job
            </h1>
            <p className="text-xl text-muted-foreground mb-8" data-testid="text-hero-description">
              Access exclusive opportunities with top companies worldwide. 
              MaGenX handles contracts, compliance, and payments so you can focus on what you do best.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="text"
                  placeholder="Search jobs, skills, or companies..."
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  data-testid="input-search"
                />
              </div>
              <Button size="lg" className="px-8" data-testid="button-search">
                Search Jobs
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Categories */}
      <section className="py-8 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 4).map((category, index) => (
                <Button 
                  key={index} 
                  variant="outline" 
                  size="sm" 
                  className="hover:bg-primary hover:text-primary-foreground"
                  data-testid={`button-category-${index}`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm" data-testid="button-filters">
              <Filter size={16} className="mr-2" />
              More Filters
            </Button>
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold" data-testid="text-jobs-title">
              Available Positions
            </h2>
            <p className="text-muted-foreground">{jobs.length} jobs found</p>
          </div>
          
          <div className="space-y-6">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow" data-testid={`card-job-${job.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        {job.urgent && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-muted-foreground mb-3">
                        <div className="flex items-center space-x-1">
                          <Building size={16} />
                          <span>{job.company}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin size={16} />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={16} />
                          <span>{job.type}</span>
                        </div>
                      </div>
                      <CardDescription className="text-base mb-3">
                        {job.description}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-primary mb-1">
                        {job.salary}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Posted {job.posted}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm" data-testid={`button-save-${job.id}`}>
                        Save
                      </Button>
                      <Button size="sm" data-testid={`button-apply-${job.id}`}>
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" data-testid="button-load-more">
              Load More Jobs
            </Button>
          </div>
        </div>
      </section>

      {/* Job Categories Grid */}
      <section className="py-16 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-categories-title">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow cursor-pointer" data-testid={`card-category-${index}`}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                  <p className="text-muted-foreground">{category.count}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6" data-testid="text-cta-title">
            Ready to Start Your Remote Career?
          </h2>
          <p className="text-xl text-muted-foreground mb-8" data-testid="text-cta-description">
            Join thousands of professionals who found their dream jobs through MaGenX.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8" data-testid="button-create-profile">
              Create Your Profile
            </Button>
            <Button variant="outline" size="lg" className="px-8" data-testid="button-upload-resume">
              Upload Resume
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}