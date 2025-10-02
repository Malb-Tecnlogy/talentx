import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/language-context";
import { Link } from "wouter";
import { Briefcase, Award, MessageCircle, Users } from "lucide-react";

export default function StrategicShortcuts() {
  const { t } = useLanguage();

  const shortcuts = [
    {
      icon: Briefcase,
      titleKey: "shortcuts.services",
      href: "/about",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      icon: Award,
      titleKey: "shortcuts.cases",
      href: "/about", // Pode ser alterado para uma página específica de casos
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      icon: MessageCircle,
      titleKey: "shortcuts.contact",
      href: "#contact",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      icon: Users,
      titleKey: "shortcuts.hireTalent",
      href: "/find-talent",
      color: "bg-orange-500 hover:bg-orange-600"
    }
  ];

  const handleScrollToContact = (href: string) => {
    if (href === "#contact") {
      const contactElement = document.getElementById("contact");
      if (contactElement) {
        contactElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-primary/10 via-primary/5 to-background" data-testid="strategic-shortcuts">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4" data-testid="text-shortcuts-title">
            {t('shortcuts.title')}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {shortcuts.map((shortcut, index) => {
            const IconComponent = shortcut.icon;
            
            if (shortcut.href.startsWith("#")) {
              return (
                <Card 
                  key={index}
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => handleScrollToContact(shortcut.href)}
                  data-testid={`shortcut-card-${index}`}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${shortcut.color} rounded-full flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-blue-600 transition-colors" data-testid={`text-shortcut-title-${index}`}>
                      {t(shortcut.titleKey)}
                    </h3>
                  </CardContent>
                </Card>
              );
            }

            return (
              <Link key={index} href={shortcut.href}>
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group" data-testid={`shortcut-card-${index}`}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${shortcut.color} rounded-full flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-blue-600 transition-colors" data-testid={`text-shortcut-title-${index}`}>
                      {t(shortcut.titleKey)}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}