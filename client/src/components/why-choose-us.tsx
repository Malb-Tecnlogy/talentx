import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/language-context";
import { Shield, TrendingUp, Award, Headphones } from "lucide-react";

export default function WhyChooseUs() {
  const { t } = useLanguage();

  const advantages = [
    {
      icon: Shield,
      titleKey: "whyChoose.reliability.title",
      descKey: "whyChoose.reliability.desc",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      icon: TrendingUp,
      titleKey: "whyChoose.results.title",
      descKey: "whyChoose.results.desc",
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      icon: Award,
      titleKey: "whyChoose.expertise.title",
      descKey: "whyChoose.expertise.desc",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      icon: Headphones,
      titleKey: "whyChoose.support.title",
      descKey: "whyChoose.support.desc",
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900" data-testid="why-choose-us">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4" data-testid="text-why-choose-title">
            {t('whyChoose.title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto" data-testid="text-why-choose-subtitle">
            {t('whyChoose.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {advantages.map((advantage, index) => {
            const IconComponent = advantage.icon;
            return (
              <Card 
                key={index} 
                className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg group"
                data-testid={`advantage-card-${index}`}
              >
                <CardContent className="p-8 text-center">
                  <div className={`w-20 h-20 ${advantage.bgColor} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`w-10 h-10 ${advantage.color}`} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" data-testid={`text-why-advantage-title-${index}`}>
                    {t(advantage.titleKey)}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed" data-testid={`text-why-advantage-desc-${index}`}>
                    {t(advantage.descKey)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Statistics Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2" data-testid="stat-satisfaction">
            <div className="text-4xl font-bold text-blue-600">98%</div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">{t('stats.satisfaction')}</div>
          </div>
          
          <div className="space-y-2" data-testid="stat-projects">
            <div className="text-4xl font-bold text-green-600">500+</div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">{t('stats.projects')}</div>
          </div>
          
          <div className="space-y-2" data-testid="stat-countries">
            <div className="text-4xl font-bold text-purple-600">50+</div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">{t('stats.countries')}</div>
          </div>
          
          <div className="space-y-2" data-testid="stat-savings">
            <div className="text-4xl font-bold text-orange-600">60%</div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">{t('stats.savings')}</div>
          </div>
        </div>
      </div>
    </section>
  );
}