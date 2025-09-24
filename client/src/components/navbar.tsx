import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import logoImage from "@assets/logo-removebg-preview_1757611508140.png";

export default function Navbar() {
  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-200" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 md:h-16">
          <div className="flex items-center space-x-3 md:space-x-8">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity" data-testid="link-logo">
              <img 
                src={logoImage} 
                alt="MaGenX Logo" 
                className="h-6 md:h-8 w-auto"
                data-testid="logo"
              />
            </Link>
            <div className="flex space-x-3 md:space-x-6">
              <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm md:text-base" data-testid="link-about">About</Link>
              <Link href="/jobs" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm md:text-base" data-testid="link-jobs">Jobs</Link>
              <Link href="/company" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm md:text-base" data-testid="link-find-talent">Find Talent</Link>
              <Link href="/professional" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm md:text-base" data-testid="link-find-work">Find Work</Link>
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <Button 
              variant="ghost"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium text-sm md:text-base px-2 md:px-4"
              onClick={() => window.location.href = "/auth"}
              data-testid="button-login"
            >
              Log In
            </Button>
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 md:px-6 py-2 rounded-full font-medium text-sm md:text-base"
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
