import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/Header";
import { FloatingAIButton } from "@/components/FloatingAIButton";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, User, Bell, Info, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type SettingsView = 'profile' | 'notifications' | 'security' | 'about';

export default function Settings() {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentView, setCurrentView] = useState<SettingsView>('profile');
  
  const [profileData, setProfileData] = useState({
    display_name: profile?.display_name || '',
    email: user?.email || ''
  });
  
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    push_notifications: true,
    task_reminders: true,
    commission_alerts: true,
    market_updates: false
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleProfileSave = async () => {
    if (!updateProfile) return;
    
    setIsLoading(true);
    try {
      await updateProfile(profileData.display_name);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const roleBadgeVariants = {
    free: 'secondary' as const,
    pro: 'default' as const,
    team: 'success' as const
  };

  const navigationItems = [
    { id: 'profile' as const, label: 'Profile Settings', icon: User },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'about' as const, label: 'About', icon: Info },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'profile':
        return (
          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Profile Settings</CardTitle>
              <CardDescription>
                Manage your personal information and account preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-foreground">Account Type</h3>
                  <p className="text-sm text-muted-foreground">Your current subscription plan</p>
                </div>
                <Badge variant={roleBadgeVariants[profile?.role || 'free']}>
                  {(profile?.role || 'free').toUpperCase()}
                </Badge>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="display_name" className="text-foreground">Display Name</Label>
                  <Input
                    id="display_name"
                    value={profileData.display_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="Enter your display name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email Address</Label>
                  <Input
                    id="email"
                    value={profileData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={handleProfileSave}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'notifications':
        return (
          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you'd like to receive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-foreground">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={notifications.email_notifications}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, email_notifications: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-foreground">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive browser notifications</p>
                  </div>
                  <Switch
                    checked={notifications.push_notifications}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, push_notifications: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-foreground">Task Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get reminded about upcoming tasks</p>
                  </div>
                  <Switch
                    checked={notifications.task_reminders}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, task_reminders: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-foreground">Commission Alerts</Label>
                    <p className="text-sm text-muted-foreground">Notifications about commission updates</p>
                  </div>
                  <Switch
                    checked={notifications.commission_alerts}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, commission_alerts: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-foreground">Market Updates</Label>
                    <p className="text-sm text-muted-foreground">Weekly market reports and insights</p>
                  </div>
                  <Switch
                    checked={notifications.market_updates}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, market_updates: checked }))
                    }
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'security':
        return (
          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and privacy settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg bg-muted/50">
                  <h3 className="font-medium text-foreground mb-2">Account Security</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your account is secured with email authentication. Consider enabling two-factor authentication for additional security.
                  </p>
                  <Button variant="outline" disabled>
                    Enable 2FA (Coming Soon)
                  </Button>
                </div>
                
                <div className="p-4 border border-border rounded-lg bg-muted/50">
                  <h3 className="font-medium text-foreground mb-2">Data Privacy</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your data is encrypted and stored securely. You can request a data export or account deletion.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" disabled>
                      Export Data
                    </Button>
                    <Button variant="destructive" disabled>
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'about':
        return (
          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">About SlipStream Dashboard</CardTitle>
              <CardDescription>
                Information about the application and support resources.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-foreground mb-2">Version Information</h3>
                  <p className="text-sm text-muted-foreground">
                    SlipStream Dashboard v1.0.0
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Built for real estate professionals to manage commissions, clients, and workflow.
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium text-foreground mb-2">Support</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" disabled>
                      Help Center
                    </Button>
                    <Button variant="outline" className="w-full justify-start" disabled>
                      Contact Support
                    </Button>
                    <Button variant="outline" className="w-full justify-start" disabled>
                      Report a Bug
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium text-foreground mb-2">Legal</h3>
                  <div className="space-y-2">
                    <Button variant="link" className="h-auto p-0 text-sm text-muted-foreground" disabled>
                      Terms of Service
                    </Button>
                    <Button variant="link" className="h-auto p-0 text-sm text-muted-foreground" disabled>
                      Privacy Policy
                    </Button>
                    <Button variant="link" className="h-auto p-0 text-sm text-muted-foreground" disabled>
                      Cookie Policy
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-foreground hover:bg-muted mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-card bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    
                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-start rounded-none ${
                          isActive 
                            ? "bg-primary text-primary-foreground" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                        onClick={() => setCurrentView(item.id)}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </main>
      
      <FloatingAIButton />
    </div>
  );
}