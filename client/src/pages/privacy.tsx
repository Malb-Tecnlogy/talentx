import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Shield, Eye, Lock, Database, Globe, Users } from "lucide-react";

export default function Privacy() {
  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: [
        "Personal information you provide when creating an account (name, email, professional details)",
        "Profile information for job matching and hiring processes",
        "Communication data when you contact our support team",
        "Usage data to improve our platform and services"
      ]
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      content: [
        "To provide and maintain our job matching services",
        "To facilitate connections between companies and professionals",
        "To send important updates about your account and opportunities",
        "To improve our platform based on user feedback and usage patterns"
      ]
    },
    {
      icon: Lock,
      title: "Data Protection",
      content: [
        "We use industry-standard encryption to protect your data",
        "Access to personal information is restricted to authorized personnel only",
        "Regular security audits and updates to maintain data integrity",
        "Compliance with GDPR, LGPD, and other applicable data protection regulations"
      ]
    },
    {
      icon: Users,
      title: "Information Sharing",
      content: [
        "We share professional profiles with companies only with your explicit consent",
        "Aggregate, anonymized data may be used for industry insights",
        "We never sell personal information to third parties",
        "Legal compliance may require disclosure in specific circumstances"
      ]
    },
    {
      icon: Globe,
      title: "International Transfers",
      content: [
        "Data may be processed in different countries where we operate",
        "We ensure adequate protection measures for international data transfers",
        "All transfers comply with applicable data protection laws",
        "You can contact us for specific information about data locations"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="privacy-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <Shield className="text-primary-foreground" size={32} />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-6" data-testid="text-hero-title">
            Privacy Policy
          </h1>
          <p className="text-xl text-muted-foreground mb-8" data-testid="text-hero-description">
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
          </p>
          <p className="text-sm text-muted-foreground">
            Last updated: December 2024
          </p>
        </div>
      </section>

      {/* Privacy Sections */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <Card key={index} className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                        <Icon className="text-primary" size={20} />
                      </div>
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {section.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></div>
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Questions About Privacy?</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                If you have any questions about this Privacy Policy or how we handle your data, 
                please don't hesitate to contact us.
              </p>
              <div className="space-y-2">
                <p><strong>Email:</strong> privacy@magenx.com</p>
                <p><strong>Address:</strong> MaGenX Privacy Team, São Paulo, Brazil</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}