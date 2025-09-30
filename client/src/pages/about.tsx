import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Target, Users, Globe, Shield, Award, Handshake } from "lucide-react";
import andersonImage from "@assets/Anderson Alves_1759194411047.jfif";
import andreImage from "@assets/Andre Felipe ALves_1759194411049.jpeg";

export default function About() {
  const values = [
    {
      icon: Target,
      title: "Excellence",
      description: "We maintain the highest standards in talent vetting and service delivery."
    },
    {
      icon: Shield,
      title: "Trust",
      description: "Complete transparency and reliability in all our business relationships."
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connecting talent across Latin America with opportunities worldwide."
    },
    {
      icon: Handshake,
      title: "Partnership",
      description: "Building long-term relationships that benefit everyone involved."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Vetted Professionals" },
    { number: "500+", label: "Partner Companies" },
    { number: "15", label: "Countries Covered" },
    { number: "98%", label: "Client Satisfaction" }
  ];

  const team = [
    {
      name: "Anderson Alves",
      role: "CEO & Founder",
      image: andersonImage,
      description: "25+ years in Software Engineering and international business development."
    },
    {
      name: "Andre Felipe Alves",
      role: "COO & Co-Founder",
      image: andreImage,
      description: "Former tech lead at major Silicon Valley companies and Operations expert ensuring seamless service delivery and client satisfaction."
    }
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="about-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6" data-testid="text-hero-title">
            About MaGenX
          </h1>
          <p className="text-xl text-muted-foreground mb-8" data-testid="text-hero-description">
            We're revolutionizing how companies access Latin American talent by removing barriers, 
            ensuring compliance, and creating opportunities that benefit everyone.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6" data-testid="text-mission-title">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground mb-6" data-testid="text-mission-description">
                MaGenX bridges the gap between exceptional Latin American professionals and global opportunities. 
                We serve as the official employer, handling all compliance, contracts, and administrative complexities 
                so our clients can focus on building great products with amazing talent.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Our unique model ensures legal compliance across 15+ countries while providing professionals 
                with stable employment, benefits, and career growth opportunities.
              </p>
              <Button size="lg" data-testid="button-learn-more">
                Learn More About Our Process
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center p-6" data-testid={`card-stat-${index}`}>
                  <CardContent className="p-0">
                    <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                    <div className="text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-values-title">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="text-center" data-testid={`card-value-${index}`}>
                  <CardContent className="p-6">
                    <Icon className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-3">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-team-title">
            Meet Our Leadership Team
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="text-center" data-testid={`card-team-${index}`}>
                <CardContent className="p-6">
                  <img
                    src={member.image}
                    alt={`${member.name} profile`}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                  />
                  <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-story-title">
            Our Story
          </h2>
          <div className="prose prose-lg mx-auto text-muted-foreground">
            <p className="text-center mb-8">
              Founded in 2020, MaGenX emerged from a simple observation: Latin America was home to 
              world-class technical talent, but accessing this talent pool was complicated by legal, 
              cultural, and administrative barriers.
            </p>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">The Challenge</h3>
                <p>
                  Companies wanted to hire the best talent regardless of location, but navigating 
                  international employment law, tax compliance, and cultural differences was overwhelming. 
                  Meanwhile, talented professionals in Latin America struggled to access global opportunities.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Our Solution</h3>
                <p>
                  We created a comprehensive platform that acts as the employer of record, handling 
                  all legal and administrative complexities while ensuring professionals receive 
                  competitive compensation, benefits, and career development opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6" data-testid="text-cta-title">
            Ready to Join Our Mission?
          </h2>
          <p className="text-xl text-muted-foreground mb-8" data-testid="text-cta-description">
            Whether you're a company looking for exceptional talent or a professional seeking global opportunities, 
            we're here to make it happen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8" data-testid="button-hire-talent">
              Hire Talent
            </Button>
            <Button variant="outline" size="lg" className="px-8" data-testid="button-join-talent">
              Join as Professional
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}