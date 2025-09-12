import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import logoImage from "@assets/logo-removebg-preview_1757611508140.png";

export default function Navbar() {
  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-200" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity" data-testid="link-logo">
              <img 
                src={logoImage} 
                alt="TalentX Logo" 
                className="h-8 w-auto"
                data-testid="logo"
              />
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors font-medium" data-testid="link-home">Home</Link>
              <Link href="/jobs" className="text-gray-600 hover:text-gray-900 transition-colors font-medium" data-testid="link-jobs">Jobs</Link>
              <Link href="/company" className="text-gray-600 hover:text-gray-900 transition-colors font-medium" data-testid="link-find-talent">Find Talent</Link>
              <Link href="/professional" className="text-gray-600 hover:text-gray-900 transition-colors font-medium" data-testid="link-find-work">Find Work</Link>
              <Link href="/admin" className="text-gray-600 hover:text-gray-900 transition-colors font-medium" data-testid="link-admin">Admin</Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium"
              onClick={() => window.location.href = "/auth"}
              data-testid="button-login"
            >
              Log In
            </Button>
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-medium"
              onClick={() => window.location.href = "/auth"}
              data-testid="button-signup"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
