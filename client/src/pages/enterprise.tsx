import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Shield, Clock, Users, Globe, CheckCircle, ArrowRight, Building, Zap, Scale, HeadphonesIcon } from "lucide-react";

export default function Enterprise() {
  const features = [
    {
      icon: Shield,
      title: "Complete Compliance",
      description: "Full legal compliance across 15+ Latin American countries with built-in risk management."
    },
    {
      icon: Clock,
      title: "Rapid Scaling",
      description: "Scale your team from 1 to 100+ professionals in weeks, not months."
    },
    {
      icon: Users,
      title: "Dedicated Account Management",
      description: "Enterprise-grade support with dedicated account managers and 24/7 assistance."
    },
    {
      icon: Globe,
      title: "Multi-Country Operations",
      description: "Seamlessly hire across multiple Latin American countries with unified management."
    },
    {
      icon: Zap,
      title: "Advanced Integrations",
      description: "Custom API integrations with your existing HR, payroll, and project management systems."
    },
    {
      icon: Scale,
      title: "Volume Pricing",
      description: "Competitive rates that scale with your team size and long-term commitments."
    }
  ];

  const packages = [
    {
      name: "Growth",
      price: "Custom Pricing",
      description: "Perfect for mid-size companies scaling their remote teams",
      features: [
        "10-50 professionals",
        "Standard compliance coverage",
        "Email & chat support",
        "Monthly reporting",
        "Basic integrations"
      ],
      recommended: false
    },
    {
      name: "Enterprise",
      price: "Custom Pricing",
      description: "Comprehensive solution for large organizations",
      features: [
        "50+ professionals",
        "Complete compliance & risk management",
        "Dedicated account manager",
        "24/7 priority support",
        "Advanced analytics & reporting",
        "Custom integrations",
        "Multi-country management",
        "SLA guarantees"
      ],
      recommended: true
    },
    {
      name: "Enterprise Plus",
      price: "Custom Pricing",
      description: "White-label solution for staffing companies",
      features: [
        "Unlimited professionals",
        "White-label platform",
        "Custom branding",
        "Advanced compliance tools",
        "API access",
        "Custom workflows",
        "Priority feature development",
        "Strategic partnership benefits"
      ],
      recommended: false
    }
  ];

  const testimonials = [
    {
      company: "TechCorp International",
      logo: "TC",
      quote: "TalentX transformed our hiring process. We scaled from 5 to 50 Latin American developers in just 3 months.",
      author: "Sarah Johnson",
      role: "VP of Engineering"
    },
    {
      company: "InnovateLabs",
      logo: "IL",
      quote: "The compliance handling is exceptional. We can focus on building products while TalentX manages all the legal complexities.",
      author: "Michael Chen",
      role: "CTO"
    },
    {
      company: "GlobalSoft Solutions",
      logo: "GS",
      quote: "Cost-effective, reliable, and scalable. TalentX is our trusted partner for international talent acquisition.",
      author: "Lisa Rodriguez",
      role: "Head of HR"
    }
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="enterprise-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-foreground mb-6" data-testid="text-hero-title">
              Enterprise-Grade Latin American Talent Solutions
            </h1>
            <p className="text-xl text-muted-foreground mb-8" data-testid="text-hero-description">
              Scale your engineering teams with the best Latin American talent. 
              Complete compliance, risk management, and dedicated support for enterprise clients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8" data-testid="button-schedule-demo">
                Schedule Enterprise Demo
              </Button>
              <Button variant="outline" size="lg" className="px-8" data-testid="button-pricing">
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-features-title">
            Built for Enterprise Scale
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow" data-testid={`card-feature-${index}`}>
                  <CardContent className="p-6">
                    <Icon className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-16 bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-packages-title">
            Enterprise Packages
          </h2>
          <div className="grid lg:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <Card key={index} className={`relative ${pkg.recommended ? 'ring-2 ring-primary' : ''}`} data-testid={`card-package-${index}`}>
                {pkg.recommended && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                    Recommended
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary mt-2">{pkg.price}</div>
                  <CardDescription className="mt-2">{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle size={16} className="text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={pkg.recommended ? "default" : "outline"}
                    data-testid={`button-contact-${index}`}
                  >
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-testimonials-title">
            Success Stories
          </h2>
          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow" data-testid={`card-testimonial-${index}`}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      {testimonial.logo}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.company}</div>
                    </div>
                  </div>
                  <blockquote className="text-muted-foreground mb-4 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="border-t pt-4">
                    <div className="font-medium">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-process-title">
            How We Work With Enterprises
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Discovery Call",
                description: "Understand your specific needs, timeline, and requirements."
              },
              {
                step: "2",
                title: "Custom Proposal",
                description: "Receive a tailored solution with pricing and implementation plan."
              },
              {
                step: "3",
                title: "Rapid Deployment",
                description: "Start hiring within days with our fast-track onboarding process."
              },
              {
                step: "4",
                title: "Ongoing Support",
                description: "Dedicated account management and 24/7 support for your team."
              }
            ].map((step, index) => (
              <div key={index} className="text-center" data-testid={`step-${index}`}>
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="font-semibold text-lg mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                {index < 3 && (
                  <ArrowRight className="w-6 h-6 text-muted-foreground mx-auto mt-4 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6" data-testid="text-cta-title">
            Ready to Scale Your Engineering Team?
          </h2>
          <p className="text-xl text-muted-foreground mb-8" data-testid="text-cta-description">
            Join leading companies who trust TalentX for their Latin American talent needs. 
            Schedule a call to discuss your specific requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8" data-testid="button-schedule-call">
              <HeadphonesIcon className="mr-2" size={20} />
              Schedule a Call
            </Button>
            <Button variant="outline" size="lg" className="px-8" data-testid="button-enterprise-brochure">
              Download Enterprise Brochure
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}