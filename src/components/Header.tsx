import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/AuthProvider"
import { Bell, Menu, User, LogOut } from "lucide-react"

export const Header = () => {
  const { user, profile, signOut } = useAuth()

  const roleBadgeVariants = {
    free: 'secondary' as const,
    pro: 'default' as const,
    team: 'success' as const
  }

  return (
    <header className="bg-gradient-hero border-b border-border/10 shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="ml-4">
              <h1 className="text-xl font-bold text-white">SlipStream</h1>
              <p className="text-sm text-white/80">Real Estate Commission Tracker</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <Badge variant={roleBadgeVariants[profile?.role || 'free']} className="text-xs">
                  {(profile?.role || 'free').toUpperCase()}
                </Badge>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{profile?.display_name || 'User'}</p>
                  <p className="text-xs text-white/70">{user?.email}</p>
                </div>
              </div>
            )}
            
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-warning rounded-full flex items-center justify-center text-xs text-white font-bold">
                3
              </span>
            </Button>
            
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <User className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/10"
              onClick={signOut}
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}