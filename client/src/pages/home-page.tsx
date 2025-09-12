// Home page component
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User, Briefcase, Shield, ArrowRight, Users, Globe, Zap } from "lucide-react";
import { Link } from "wouter";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  // Show public landing page for non-authenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Header */}
        <header className="border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">TalentX</span>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/auth">
                  <Button variant="ghost" data-testid="button-login">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button data-testid="button-get-started">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Connect with
              <span className="text-blue-600"> Top Latin American</span>
              <br />Tech Talent
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              TalentX is the premier platform for global companies to discover and hire exceptional 
              software developers, designers, and tech professionals from Latin America.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="w-full sm:w-auto" data-testid="button-find-talent">
                  Find Talent
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-find-jobs">
                  Find Jobs
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose TalentX?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Powered by AI, designed for success
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="w-6 h-6 text-blue-600 mr-3" />
                    AI-Powered Matching
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Our advanced AI algorithms match the right talent with the right opportunities, 
                    ensuring perfect fits every time.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-6 h-6 text-blue-600 mr-3" />
                    Global Reach
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Connect with top-tier professionals across Latin America, from Mexico to Argentina, 
                    all in one platform.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-6 h-6 text-blue-600 mr-3" />
                    Real-Time Collaboration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Built-in tools for seamless communication, project management, and contract handling 
                    from start to finish.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of companies and professionals already using TalentX
            </p>
            <Link href="/auth">
              <Button size="lg" data-testid="button-join-now">
                Join TalentX Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              © 2024 TalentX. Connecting talent with opportunity.
            </p>
          </div>
        </footer>
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
              Welcome to TalentX
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
              <CardDescription>Get started with TalentX</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user?.role === "professional" && (
                  <>
                    <Button className="w-full" variant="default" data-testid="button-find-jobs">
                      Find Jobs
                    </Button>
                    <Button className="w-full" variant="outline" data-testid="button-update-profile">
                      Update Profile
                    </Button>
                  </>
                )}
                {user?.role === "company" && (
                  <>
                    <Button className="w-full" variant="default" data-testid="button-post-job">
                      Post a Job
                    </Button>
                    <Button className="w-full" variant="outline" data-testid="button-find-talent">
                      Find Talent
                    </Button>
                  </>
                )}
                {user?.role === "admin" && (
                  <>
                    <Button className="w-full" variant="default" data-testid="button-manage-users">
                      Manage Users
                    </Button>
                    <Button className="w-full" variant="outline" data-testid="button-view-analytics">
                      View Analytics
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Authentication system is working correctly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-600 dark:text-green-400" data-testid="text-auth-status">
                ✅ Authentication successful - New username/password system is active
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}