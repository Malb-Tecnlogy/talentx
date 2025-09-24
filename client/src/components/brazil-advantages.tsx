import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/language-context";
import { Clock, Users, MessageCircle, Award, Shield } from "lucide-react";

export default function BrazilAdvantages() {
  const { t } = useLanguage();

  const advantages = [
    {
      icon: Clock,
      title: t('advantages.timezone.title'),
      description: t('advantages.timezone.desc'),
      color: "text-blue-600"
    },
    {
      icon: Users,
      title: t('advantages.cultural.title'),
      description: t('advantages.cultural.desc'),
      color: "text-green-600"
    },
    {
      icon: MessageCircle,
      title: t('advantages.reliability.title'),
      description: t('advantages.reliability.desc'),
      color: "text-purple-600"
    },
    {
      icon: Award,
      title: t('advantages.talent.title'),
      description: t('advantages.talent.desc'),
      color: "text-orange-600"
    },
    {
      icon: Shield,
      title: t('advantages.compliance.title'),
      description: t('advantages.compliance.desc'),
      color: "text-red-600"
    }
  ];

  return (
    <section className="py-20 bg-gray-50" data-testid="brazil-advantages-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4" data-testid="text-advantages-title">
            {t('advantages.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="text-advantages-subtitle">
            {t('advantages.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {advantages.map((advantage, index) => {
            const IconComponent = advantage.icon;
            return (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-blue-500"
                data-testid={`advantage-card-${index}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 p-3 rounded-lg bg-gray-100 ${advantage.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2" data-testid={`text-advantage-title-${index}`}>
                        {advantage.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed" data-testid={`text-advantage-desc-${index}`}>
                        {advantage.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <div className="inline-block p-6 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg text-white">
            <p className="text-xl font-semibold" data-testid="text-advantages-conclusion">
              {t('advantages.conclusion')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}