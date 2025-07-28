
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, Menu, Home, Sparkles } from "lucide-react";
import { OptionsMenu } from "@/components/OptionsMenu";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { SmartAIHelper } from "@/components/SmartAIHelper";

export const Header = () => {
  const { user, profile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isDashboard = isAuthenticated && isHomePage;
  const showHomeButton = isAuthenticated && !isHomePage;
  
  const roleBadgeVariants = {
    free: 'secondary' as const,
    pro: 'default' as const,
    team: 'success' as const
  };
  
  return <header className="bg-gradient-hero border-b border-border/10 shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Home button for authenticated non-dashboard pages */}
          <div className="flex items-center ml-16">
            {showHomeButton && (
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => navigate('/')} title="Home">
                <Home className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          {/* Right side - User info and actions */}
          <div className="flex items-center space-x-4">
            {user && <div className="flex items-center space-x-3">
                <Badge variant={roleBadgeVariants[profile?.role || 'free']} className="text-xs">
                  {(profile?.role || 'free').toUpperCase()}
                </Badge>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{profile?.display_name || 'User'}</p>
                  <p className="text-xs text-white/70">{user?.email}</p>
                </div>
              </div>}
            
            <NotificationDropdown />
            
            <OptionsMenu />
          </div>
        </div>
      </div>
    </header>;
};
