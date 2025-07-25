
import { Settings, LogOut, User, Bell, Info } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const OptionsMenu = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-white/10"
          title="Options"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 bg-popover border border-border shadow-elevated z-50" 
        align="end"
      >
        <DropdownMenuLabel className="text-popover-foreground">
          Settings
        </DropdownMenuLabel>
        <DropdownMenuItem 
          onClick={() => navigate('/settings')}
          className="flex items-center cursor-pointer hover:bg-accent hover:text-accent-foreground"
        >
          <User className="mr-2 h-4 w-4" />
          Profile Settings
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => navigate('/settings')}
          className="flex items-center cursor-pointer hover:bg-accent hover:text-accent-foreground"
        >
          <Bell className="mr-2 h-4 w-4" />
          Notifications
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => navigate('/settings')}
          className="flex items-center cursor-pointer hover:bg-accent hover:text-accent-foreground"
        >
          <Info className="mr-2 h-4 w-4" />
          About
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-border" />
        
        <DropdownMenuItem 
          onClick={signOut}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
