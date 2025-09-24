import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { FileText, Shield, Users, CreditCard, AlertTriangle, Scale } from "lucide-react";

export default function Terms() {
  const sections = [
    {
      icon: Users,
      title: "User Accounts and Responsibilities",
      content: [
        "You must provide accurate and complete information when creating an account",
        "You are responsible for maintaining the security of your account credentials",
        "One person or entity per account - sharing accounts is prohibited",
        "You must notify us immediately of any unauthorized access to your account"
      ]
    },
    {
      icon: Shield,
      title: "Platform Usage",
      content: [
        "Our platform is for legitimate job search and recruitment purposes only",
        "Misrepresentation of skills, experience, or company information is prohibited",
        "Spam, harassment, or inappropriate communication is not tolerated",
        "We reserve the right to suspend accounts that violate our community standards"
      ]
    },
    {
      icon: CreditCard,
      title: "Payment and Billing",
      content: [
        "Companies pay subscription fees for access to professional profiles",
        "All payments are processed securely through our payment partners",
        "Refunds are available according to our refund policy",
        "Prices may change with 30 days advance notice"
      ]
    },
    {
      icon: Scale,
      title: "Intellectual Property",
      content: [
        "All content on our platform is protected by intellectual property laws",
        "Users retain ownership of their original content (profiles, portfolios, etc.)",
        "You grant us license to use your content for platform operations",
        "Unauthorized copying or distribution of platform content is prohibited"
      ]
    },
    {
      icon: AlertTriangle,
      title: "Limitation of Liability",
      content: [
        "MaGenX provides a platform to connect companies and professionals",
        "We are not responsible for employment outcomes or business relationships",
        "Users are responsible for their own due diligence in hiring or job decisions",
        "Our liability is limited to the amount paid for our services"
      ]
    },
    {
      icon: FileText,
      title: "Terms Updates",
      content: [
        "We may update these terms periodically to reflect changes in our services",
        "Users will be notified of significant changes via email or platform notifications",
        "Continued use of the platform constitutes acceptance of updated terms",
        "Previous versions of terms are archived and available upon request"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="terms-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <FileText className="text-primary-foreground" size={32} />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-6" data-testid="text-hero-title">
            Terms of Service
          </h1>
          <p className="text-xl text-muted-foreground mb-8" data-testid="text-hero-description">
            Please read these terms carefully before using our platform. By using MaGenX, you agree to these conditions.
          </p>
          <p className="text-sm text-muted-foreground">
            Last updated: December 2024
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome to MaGenX</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                MaGenX is a professional platform that connects global companies with talented Latin American 
                professionals. These Terms of Service govern your use of our platform, including our website, 
                services, and any related applications or tools we provide.
              </p>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                By accessing or using MaGenX, you agree to be bound by these terms. If you disagree with 
                any part of these terms, then you may not access the service.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Terms Sections */}
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
              <CardTitle className="text-2xl">Questions About These Terms?</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                If you have any questions about these Terms of Service, please contact our legal team.
              </p>
              <div className="space-y-2">
                <p><strong>Email:</strong> legal@magenx.com</p>
                <p><strong>Address:</strong> MaGenX Legal Department, São Paulo, Brazil</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}