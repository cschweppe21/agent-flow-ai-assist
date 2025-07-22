
import { Settings, Sun, Moon, Monitor, Check, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/components/AuthProvider";
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
  const { theme, setTheme } = useTheme();
  const { signOut } = useAuth();

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

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
          Theme
        </DropdownMenuLabel>
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = theme === option.value;
          
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              className="flex items-center justify-between cursor-pointer hover:bg-accent hover:text-accent-foreground"
            >
              <div className="flex items-center">
                <Icon className="mr-2 h-4 w-4" />
                <span>{option.label}</span>
              </div>
              {isSelected && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator className="bg-border" />
        
        <DropdownMenuLabel className="text-popover-foreground">
          Settings
        </DropdownMenuLabel>
        <DropdownMenuItem 
          disabled 
          className="text-muted-foreground cursor-not-allowed"
        >
          Profile Settings
        </DropdownMenuItem>
        <DropdownMenuItem 
          disabled 
          className="text-muted-foreground cursor-not-allowed"
        >
          Notifications
        </DropdownMenuItem>
        <DropdownMenuItem 
          disabled 
          className="text-muted-foreground cursor-not-allowed"
        >
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
