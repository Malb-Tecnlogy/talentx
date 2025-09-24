import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/language-context";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { User, Eye, VideoIcon, Shield, Globe, DollarSign, TrendingUp } from "lucide-react";

export default function FindWork() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: User,
      titleKey: "findWork.step1.title",
      descKey: "findWork.step1.desc",
      color: "bg-green-500"
    },
    {
      icon: Eye,
      titleKey: "findWork.step2.title",
      descKey: "findWork.step2.desc",
      color: "bg-purple-500"
    },
    {
      icon: VideoIcon,
      titleKey: "findWork.step3.title",
      descKey: "findWork.step3.desc",
      color: "bg-blue-500"
    },
    {
      icon: Shield,
      titleKey: "findWork.step4.title",
      descKey: "findWork.step4.desc",
      color: "bg-orange-500"
    }
  ];

  const benefits = [
    {
      icon: Globe,
      titleKey: "findWork.benefit1.title",
      descKey: "findWork.benefit1.desc",
      color: "text-green-600"
    },
    {
      icon: DollarSign,
      titleKey: "findWork.benefit2.title",
      descKey: "findWork.benefit2.desc",
      color: "text-blue-600"
    },
    {
      icon: TrendingUp,
      titleKey: "findWork.benefit3.title",
      descKey: "findWork.benefit3.desc",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="find-work-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-100" data-testid="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6" data-testid="text-hero-title">
            {t('findWork.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8" data-testid="text-hero-subtitle">
            {t('findWork.subtitle')}
          </p>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg"
            onClick={() => window.location.href = "/auth"}
            data-testid="button-get-started"
          >
            {t('findWork.getStarted')}
          </Button>
        </div>
      </section>

      {/* Journey Steps Section */}
      <section className="py-20 bg-white" data-testid="journey-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4" data-testid="text-journey-title">
              {t('findWork.journey.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <Card 
                  key={index} 
                  className="text-center hover:shadow-lg transition-shadow duration-300"
                  data-testid={`step-card-${index}`}
                >
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-sm font-semibold text-gray-500 mb-2">
                      {index + 1}. 
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4" data-testid={`text-step-title-${index}`}>
                      {t(step.titleKey)}
                    </h3>
                    <p className="text-gray-600 leading-relaxed" data-testid={`text-step-desc-${index}`}>
                      {t(step.descKey)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50" data-testid="benefits-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4" data-testid="text-benefits-title">
              {t('findWork.benefits.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card 
                  key={index} 
                  className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-green-500"
                  data-testid={`benefit-card-${index}`}
                >
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 p-3 rounded-lg bg-gray-100 ${benefit.color}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3" data-testid={`text-benefit-title-${index}`}>
                          {t(benefit.titleKey)}
                        </h3>
                        <p className="text-gray-600 leading-relaxed" data-testid={`text-benefit-desc-${index}`}>
                          {t(benefit.descKey)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-emerald-700" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6" data-testid="text-cta-title">
            {t('findWork.getStarted')}
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            {t('findWork.subtitle')}
          </p>
          <Button 
            className="bg-white text-green-600 px-8 py-4 text-lg font-semibold hover:bg-gray-50 transition-all shadow-lg"
            onClick={() => window.location.href = "/auth"}
            data-testid="button-cta"
          >
            {t('findWork.getStarted')}
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}