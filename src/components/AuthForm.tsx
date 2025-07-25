import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import slipstreamLogo from "@/assets/slipstream-logo.png";
export const AuthForm = () => {
  const {
    signIn,
    signUp
  } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'free' as 'free' | 'pro' | 'team'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (isLogin) {
        const {
          error
        } = await signIn(formData.email, formData.password);
        if (error) {
          setError(error.message);
        }
      } else {
        const {
          error
        } = await signUp(formData.email, formData.password, formData.name);
        if (error) {
          setError(error.message);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  const roleBadges = {
    free: {
      label: 'Free',
      variant: 'secondary' as const,
      description: 'Basic features'
    },
    pro: {
      label: 'Pro',
      variant: 'default' as const,
      description: 'Advanced features'
    },
    team: {
      label: 'Team',
      variant: 'success' as const,
      description: 'Team collaboration'
    }
  };
  return <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elevated bg-gradient-card border-border/50">
        <CardHeader className="space-y-1">
          <div className="text-center mb-6">
            <img src={slipstreamLogo} alt="SlipStream" className="h-16 w-16 mx-auto mb-3" />
            <h1 className="text-foreground mb-2 font-bold text-4xl">SlipStream</h1>
            <p className="text-zinc-950 font-extralight">Glide Through Your Workflow</p>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-foreground">
            {isLogin ? 'Welcome Back' : 'Join SlipStream'}
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            {isLogin ? 'Sign in to your account' : 'Create your account to get started'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="name" type="text" placeholder="Enter your full name" value={formData.name} onChange={e => setFormData({
                ...formData,
                name: e.target.value
              })} className="pl-10" required={!isLogin} />
                </div>
              </div>}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="Enter your email" value={formData.email} onChange={e => setFormData({
                ...formData,
                email: e.target.value
              })} className="pl-10" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={formData.password} onChange={e => setFormData({
                ...formData,
                password: e.target.value
              })} className="pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {!isLogin && <div className="space-y-2">
                <Label className="text-foreground">Account Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(roleBadges).map(([role, config]) => <button key={role} type="button" onClick={() => setFormData({
                ...formData,
                role: role as any
              })} className={`p-3 rounded-lg border-2 transition-all ${formData.role === role ? 'border-primary bg-primary/10' : 'border-border bg-background hover:bg-accent'}`}>
                      <Badge variant={config.variant} className="mb-1">
                        {config.label}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{config.description}</p>
                    </button>)}
                </div>
              </div>}
            
            {error && <div className="text-sm text-red-500 text-center">{error}</div>}
            
            <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm text-primary hover:text-primary-dark transition-colors">
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>;
};