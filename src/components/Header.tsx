
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, Menu, Home } from "lucide-react";
import { OptionsMenu } from "@/components/OptionsMenu";
import slipstreamLogo from "@/assets/slipstream-logo.png";

export const Header = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const roleBadgeVariants = {
    free: 'secondary' as const,
    pro: 'default' as const,
    team: 'success' as const
  };
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-border/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <img src={slipstreamLogo} alt="SlipStream Dashboard" className="h-8 w-8" />
            <div>
              <h1 className="text-lg font-semibold text-foreground">SlipStream Dashboard</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Glide Through Your Workflow</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {user && (
              <div className="flex items-center space-x-3">
                <Badge variant={roleBadgeVariants[profile?.role || 'free']} className="text-xs">
                  {(profile?.role || 'free').toUpperCase()}
                </Badge>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{profile?.display_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            )}
            
            <Button variant="ghost" size="icon" className="relative hover:bg-accent">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center text-xs text-white font-bold">
                3
              </span>
            </Button>
            
            <OptionsMenu />
            
            {!isHomePage && (
              <Button variant="ghost" size="icon" className="hover:bg-accent" onClick={() => navigate('/')} title="Home">
                <Home className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
