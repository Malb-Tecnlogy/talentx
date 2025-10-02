// Home page component
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User, Briefcase, Shield } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import BrazilAdvantages from "@/components/brazil-advantages";
import WhyChooseUs from "@/components/why-choose-us";
import FeaturesSection from "@/components/features-section";
import ContactSection from "@/components/contact-section";
import JobsSection from "@/components/jobs-section";
import CtaSection from "@/components/cta-section";
import Footer from "@/components/footer";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  // Show complete landing page for non-authenticated users with ALL original components
  if (!user) {
    return (
      <div className="min-h-screen bg-background" data-testid="landing-page">
        <Navbar />
        <HeroSection />
        <BrazilAdvantages />
        <WhyChooseUs />
        <FeaturesSection />
        <ContactSection />
        <CtaSection />
        <JobsSection />
        <Footer />
      </div>
    );
  }

  // Show dashboard for authenticated users
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "company":
        return <Briefcase className="w-5 h-5" />;
      case "admin":
        return <Shield className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "company":
        return "Company";
      case "admin":
        return "Administrator";
      default:
        return "Professional";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome to MaGenX
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Your job matching platform dashboard
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {getRoleIcon(user?.role || "professional")}
                <span className="ml-2">User Profile</span>
              </CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Username:</span>
                  <span className="ml-2" data-testid="text-username">{user?.username}</span>
                </div>
                <div>
                  <span className="font-medium">Email:</span>
                  <span className="ml-2" data-testid="text-email">{user?.email || "Not provided"}</span>
                </div>
                <div>
                  <span className="font-medium">Name:</span>
                  <span className="ml-2" data-testid="text-name">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : "Not provided"}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Role:</span>
                  <span className="ml-2 inline-flex items-center" data-testid="text-role">
                    {getRoleIcon(user?.role || "professional")}
                    <span className="ml-1">{getRoleLabel(user?.role || "professional")}</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with MaGenX</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user?.role === "professional" && (
                  <>
                    <Link href="/jobs">
                      <Button className="w-full" variant="default" data-testid="button-find-jobs">
                        Find Jobs
                      </Button>
                    </Link>
                    <Link href="/professional">
                      <Button className="w-full" variant="outline" data-testid="button-update-profile">
                        Update Profile
                      </Button>
                    </Link>
                  </>
                )}
                {user?.role === "company" && (
                  <>
                    <Link href="/company">
                      <Button className="w-full" variant="default" data-testid="button-post-job">
                        Post a Job
                      </Button>
                    </Link>
                    <Link href="/jobs">
                      <Button className="w-full" variant="outline" data-testid="button-find-talent">
                        Find Talent
                      </Button>
                    </Link>
                  </>
                )}
                {user?.role === "admin" && (
                  <>
                    <Link href="/admin">
                      <Button className="w-full" variant="default" data-testid="button-manage-users">
                        Manage Users
                      </Button>
                    </Link>
                    <Link href="/admin">
                      <Button className="w-full" variant="outline" data-testid="button-view-analytics">
                        View Analytics
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}