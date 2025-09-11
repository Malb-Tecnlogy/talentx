import { Card, CardContent } from "@/components/ui/card";
import { Brain, Shield, MessageCircle, Lock, Globe, ClipboardCheck } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Matching",
    description: "Advanced algorithms analyze skills, experience, and project requirements to find perfect matches in minutes, not weeks.",
    color: "primary"
  },
  {
    icon: Shield,
    title: "Verified Professionals",
    description: "Every talent goes through rigorous screening including technical assessments, background checks, and portfolio reviews.",
    color: "accent"
  },
  {
    icon: MessageCircle,
    title: "Seamless Communication",
    description: "Built-in messaging, video calls, and project management tools keep everyone aligned and productive.",
    color: "orange-500"
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description: "Automated escrow system, milestone-based payments, and compliance with international financial regulations.",
    color: "green-500"
  },
  {
    icon: Globe,
    title: "Cultural Alignment",
    description: "Latin American professionals in overlapping time zones with strong English proficiency and cultural compatibility.",
    color: "blue-500"
  },
  {
    icon: ClipboardCheck,
    title: "Full Compliance",
    description: "LGPD/GDPR compliant data handling, employment law adherence, and comprehensive contract management.",
    color: "purple-500"
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-background" data-testid="features-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4" data-testid="text-features-title">
            Why Choose TalentX?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-features-description">
            Our platform revolutionizes nearshore outsourcing with cutting-edge technology and human expertise.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-all" data-testid={`card-feature-${index}`}>
                <CardContent className="p-8">
                  <div className={`w-12 h-12 bg-${feature.color}/10 rounded-lg flex items-center justify-center mb-6`}>
                    <Icon className={`text-${feature.color}`} size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-4" data-testid={`text-feature-title-${index}`}>
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground" data-testid={`text-feature-description-${index}`}>
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
