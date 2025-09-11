import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Search, Star, MapPin, Clock, Users, Code, Palette, BarChart3 } from "lucide-react";

export default function FindTalent() {
  const talents = [
    {
      id: 1,
      name: "Carlos Rodriguez",
      role: "Full Stack Developer",
      location: "São Paulo, Brazil",
      rating: 4.9,
      hourlyRate: "$45",
      skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
      experience: "5+ years",
      availability: "Available now",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
    },
    {
      id: 2,
      name: "Maria Santos",
      role: "UX/UI Designer",
      location: "Buenos Aires, Argentina",
      rating: 4.8,
      hourlyRate: "$40",
      skills: ["Figma", "Adobe XD", "Prototyping", "User Research"],
      experience: "4+ years",
      availability: "Available in 2 weeks",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
    },
    {
      id: 3,
      name: "Diego Fernandez",
      role: "DevOps Engineer",
      location: "Mexico City, Mexico",
      rating: 4.9,
      hourlyRate: "$50",
      skills: ["AWS", "Docker", "Kubernetes", "Terraform"],
      experience: "6+ years",
      availability: "Available now",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
    }
  ];

  const categories = [
    { icon: Code, name: "Developers", count: "2,500+" },
    { icon: Palette, name: "Designers", count: "1,200+" },
    { icon: BarChart3, name: "Data Scientists", count: "800+" },
    { icon: Users, name: "Product Managers", count: "600+" }
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="find-talent-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-foreground mb-6" data-testid="text-hero-title">
              Find Top Latin American Talent
            </h1>
            <p className="text-xl text-muted-foreground mb-8" data-testid="text-hero-description">
              Access a curated pool of pre-vetted professionals from across Latin America. 
              All managed by TalentX for seamless hiring and compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="text"
                  placeholder="Search skills, roles, or locations..."
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  data-testid="input-search"
                />
              </div>
              <Button size="lg" className="px-8" data-testid="button-search">
                Search Talent
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-categories-title">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow cursor-pointer" data-testid={`card-category-${index}`}>
                  <CardContent className="p-6">
                    <Icon className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                    <p className="text-muted-foreground">{category.count}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Talent Listings */}
      <section className="py-16 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-talent-title">
            Featured Talent
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {talents.map((talent) => (
              <Card key={talent.id} className="hover:shadow-lg transition-shadow" data-testid={`card-talent-${talent.id}`}>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <img
                      src={talent.image}
                      alt={`${talent.name} profile`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <CardTitle className="text-lg">{talent.name}</CardTitle>
                      <CardDescription>{talent.role}</CardDescription>
                      <div className="flex items-center space-x-2 mt-1">
                        <MapPin size={14} className="text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{talent.location}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{talent.rating}</span>
                      </div>
                      <div className="text-lg font-semibold text-primary">
                        {talent.hourlyRate}/hr
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {talent.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{talent.experience}</span>
                      </div>
                      <span>{talent.availability}</span>
                    </div>
                    
                    <Button className="w-full" data-testid={`button-view-profile-${talent.id}`}>
                      View Profile
                    </Button>
                  </div>
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
            Ready to Build Your Dream Team?
          </h2>
          <p className="text-xl text-muted-foreground mb-8" data-testid="text-cta-description">
            Join hundreds of companies that trust TalentX to manage their Latin American talent.
          </p>
          <Button size="lg" className="px-8" data-testid="button-get-started">
            Get Started Today
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}