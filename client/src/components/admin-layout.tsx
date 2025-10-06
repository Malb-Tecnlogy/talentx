import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  Users,
  Building2,
  Briefcase,
  FileText,
  FileSignature,
  Bell,
  LayoutDashboard,
  LogOut,
  UserCog
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();

  const menuItems = [
    { 
      path: "/admin", 
      label: "Dashboard", 
      icon: LayoutDashboard,
      exact: true
    },
    { 
      path: "/admin/users", 
      label: "Users", 
      icon: Users 
    },
    { 
      path: "/admin/companies", 
      label: "Companies", 
      icon: Building2 
    },
    { 
      path: "/admin/professionals", 
      label: "Professionals", 
      icon: UserCog 
    },
    { 
      path: "/admin/jobs", 
      label: "Jobs", 
      icon: Briefcase 
    },
    { 
      path: "/admin/applications", 
      label: "Applications", 
      icon: FileText 
    },
    { 
      path: "/admin/contracts", 
      label: "Contracts", 
      icon: FileSignature 
    },
    { 
      path: "/admin/notifications", 
      label: "Notifications", 
      icon: Bell 
    },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location === path;
    }
    return location.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', { method: 'POST' });
      if (response.ok) {
        window.location.href = "/auth";
      }
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.href = "/auth";
    }
  };

  return (
    <div className="flex h-screen bg-background" data-testid="admin-layout">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card flex flex-col" data-testid="admin-sidebar">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-destructive rounded-lg flex items-center justify-center">
              <Shield className="text-destructive-foreground" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">MaGenX Admin</h3>
              <p className="text-xs text-muted-foreground">Platform Management</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1" data-testid="admin-nav">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              
              return (
                <Button
                  key={item.path}
                  variant={active ? "secondary" : "ghost"}
                  className={`w-full justify-start ${
                    active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                  asChild
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Link href={item.path}>
                    <Icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Logout Button */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="p-6">
            {children}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
