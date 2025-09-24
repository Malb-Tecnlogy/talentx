import { Card, CardContent } from "@/components/ui/card";
import { Brain, Shield, MessageCircle, Lock, Globe, ClipboardCheck } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export default function FeaturesSection() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Brain,
      titleKey: "features.ai.title",
      descKey: "features.ai.desc",
      color: "primary"
    },
    {
      icon: Shield,
      titleKey: "features.verified.title",
      descKey: "features.verified.desc",
      color: "accent"
    },
    {
      icon: MessageCircle,
      titleKey: "features.communication.title",
      descKey: "features.communication.desc",
      color: "orange-500"
    },
    {
      icon: Lock,
      titleKey: "features.payments.title",
      descKey: "features.payments.desc",
      color: "green-500"
    },
    {
      icon: Globe,
      titleKey: "features.cultural.title",
      descKey: "features.cultural.desc",
      color: "blue-500"
    },
    {
      icon: ClipboardCheck,
      titleKey: "features.compliance.title",
      descKey: "features.compliance.desc",
      color: "purple-500"
    }
  ];

  return (
    <section className="py-20 bg-background" data-testid="features-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4" data-testid="text-features-title">
            {t('features.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-features-description">
            {t('features.description')}
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
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-muted-foreground" data-testid={`text-feature-description-${index}`}>
                    {t(feature.descKey)}
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
