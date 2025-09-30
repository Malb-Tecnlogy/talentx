import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Target, Users, Globe, Shield, Award, Handshake } from "lucide-react";
import andersonImage from "@assets/Anderson Alves_1759194411047.jfif";
import andreImage from "@assets/Andre Felipe ALves_1759194411049.jpeg";
import { useLanguage } from "@/contexts/language-context";
import { Link } from "wouter";

export default function About() {
  const { t } = useLanguage();
  const values = [
    {
      icon: Target,
      title: t('about.values.excellence.title'),
      description: t('about.values.excellence.desc')
    },
    {
      icon: Shield,
      title: t('about.values.trust.title'),
      description: t('about.values.trust.desc')
    },
    {
      icon: Globe,
      title: t('about.values.global.title'),
      description: t('about.values.global.desc')
    },
    {
      icon: Handshake,
      title: t('about.values.partnership.title'),
      description: t('about.values.partnership.desc')
    }
  ];

  const stats = [
    { number: "10,000+", label: t('about.stats.professionals') },
    { number: "500+", label: t('about.stats.companies') },
    { number: "15", label: t('about.stats.countries') },
    { number: "98%", label: t('about.stats.satisfaction') }
  ];

  const team = [
    {
      name: "Anderson Alves",
      role: t('about.team.anderson.role'),
      image: andersonImage,
      description: t('about.team.anderson.desc')
    },
    {
      name: "Andre Felipe Alves",
      role: t('about.team.andre.role'),
      image: andreImage,
      description: t('about.team.andre.desc')
    }
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="about-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6" data-testid="text-hero-title">
            {t('about.hero.title')}
          </h1>
          <p className="text-xl text-muted-foreground mb-8" data-testid="text-hero-description">
            {t('about.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6" data-testid="text-mission-title">
                {t('about.mission.title')}
              </h2>
              <p className="text-lg text-muted-foreground mb-6" data-testid="text-mission-description">
                {t('about.mission.desc1')}
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                {t('about.mission.desc2')}
              </p>
              <Button size="lg" data-testid="button-learn-more">
                {t('about.mission.button')}
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
            {t('about.values.title')}
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
            {t('about.team.title')}
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="text-center" data-testid={`card-team-${index}`}>
                <CardContent className="p-6">
                  <img
                    src={member.image}
                    alt={`${member.name} profile`}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4 grayscale"
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
            {t('about.story.title')}
          </h2>
          <div className="prose prose-lg mx-auto text-muted-foreground">
            <p className="text-center mb-8">
              {t('about.story.intro')}
            </p>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">{t('about.story.challenge.title')}</h3>
                <p>
                  {t('about.story.challenge.desc')}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">{t('about.story.solution.title')}</h3>
                <p>
                  {t('about.story.solution.desc')}
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
            {t('about.cta.title')}
          </h2>
          <p className="text-xl text-muted-foreground mb-8" data-testid="text-cta-description">
            {t('about.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8" data-testid="button-hire-talent" asChild>
              <Link href="/contact">
                {t('about.cta.button.hire')}
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8" data-testid="button-join-talent" asChild>
              <Link href="/find-work">
                {t('about.cta.button.join')}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}