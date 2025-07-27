import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, CheckCircle, Zap } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface AuthFormProps {
  onBack?: () => void;
  initialMode?: 'login' | 'signup';
}
export const AuthForm = ({ onBack, initialMode = 'login' }: AuthFormProps) => {
  const {
    signIn,
    signUp
  } = useAuth();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
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
      price: 'Free Forever',
      description: 'Perfect for new agents',
      features: ['Up to 25 contacts', 'Basic task management', '3 AI queries/month', 'Email support']
    },
    pro: {
      label: 'Pro',
      variant: 'default' as const,
      price: '$29/month',
      description: 'Most popular choice',
      features: ['Unlimited contacts', 'Advanced analytics', 'Unlimited AI queries', 'Priority support', 'Custom integrations']
    },
    team: {
      label: 'Team',
      variant: 'success' as const,
      price: '$79/month',
      description: 'For agencies & teams',
      features: ['Everything in Pro', 'Team collaboration', 'Admin dashboard', 'White-label options', 'Dedicated success manager']
    }
  };
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Header with Logo and Back Button */}
      <div className="relative p-6">
        {onBack && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="absolute top-6 left-6 text-white hover:text-white/80 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        
        <div className="flex justify-center">
          <div className="bg-black/40 backdrop-blur-sm rounded-lg px-6 py-4 border border-white/10">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">SlipStream Dashboard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Centered Login Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-elevated bg-gradient-card border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-foreground">
              {isLogin ? 'Welcome Back' : 'Join SlipStream'}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              {isLogin ? 'Sign in to your account' : 'Create your account to get started'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="name" 
                      type="text" 
                      placeholder="Enter your full name" 
                      value={formData.name} 
                      onChange={e => setFormData({
                        ...formData,
                        name: e.target.value
                      })} 
                      className="pl-10" 
                      required={!isLogin} 
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email" 
                    value={formData.email} 
                    onChange={e => setFormData({
                      ...formData,
                      email: e.target.value
                    })} 
                    className="pl-10" 
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter your password" 
                    value={formData.password} 
                    onChange={e => setFormData({
                      ...formData,
                      password: e.target.value
                    })} 
                    className="pl-10 pr-10" 
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label className="text-foreground">Choose Your Plan</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(roleBadges).map(([role, config]) => (
                      <button 
                        key={role} 
                        type="button" 
                        onClick={() => setFormData({
                          ...formData,
                          role: role as any
                        })} 
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          formData.role === role 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border bg-background hover:bg-accent'
                        }`}
                      >
                        <Badge variant={config.variant} className="mb-1 text-xs">
                          {config.label}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{config.price}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {error && <div className="text-sm text-red-500 text-center">{error}</div>}
              
              <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                {isLoading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <button 
                type="button" 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-sm text-primary hover:text-primary-dark transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Details Section at Bottom */}
      {!isLogin && (
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white text-center mb-6">Compare Plans</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(roleBadges).map(([role, config]) => (
                  <div 
                    key={role}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
                  >
                    <div className="text-center mb-4">
                      <Badge variant={config.variant} className="mb-2">
                        {config.label}
                      </Badge>
                      {role === 'pro' && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Most Popular
                        </Badge>
                      )}
                      <div className="text-2xl font-bold text-white mt-2">{config.price}</div>
                      <p className="text-white/70 text-sm">{config.description}</p>
                    </div>
                    <ul className="space-y-2">
                      {config.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm text-white/80">
                          <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};