import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface AuthFormProps {
  onBack?: () => void;
}
export const AuthForm = ({ onBack }: AuthFormProps) => {
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
  return <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Information */}
          <div className="text-white space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">Transform Your Real Estate Business</h1>
              <p className="text-lg text-white/80">Join thousands of successful agents using AI-powered tools to close more deals and save time.</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-1">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Task Management</h3>
                  <p className="text-white/70">Automatically prioritize leads, schedule follow-ups, and never miss a deadline.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-1">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Smart Analytics</h3>
                  <p className="text-white/70">Track commissions, market trends, and performance metrics in real-time.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-1">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Complete CRM</h3>
                  <p className="text-white/70">Manage clients, vendors, and relationships with intelligent insights.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-sm text-white/80">"SlipStream increased my productivity by 60% and helped me close 3x more deals this quarter." - Sarah M., Top Producer</p>
            </div>
          </div>
          
          {/* Right side - Auth form */}
          <Card className="w-full max-w-md mx-auto shadow-elevated bg-gradient-card border-border/50">
        <CardHeader className="space-y-1">
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="absolute top-4 left-4 text-white hover:text-white/80 hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div className="text-center mb-6">
            <h1 className="text-foreground font-bold text-4xl">SlipStream</h1>
            <h2 className="text-foreground font-bold text-2xl">Dashboard</h2>
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

            {!isLogin && <div className="space-y-4">
                <Label className="text-foreground text-lg font-semibold">Choose Your Plan</Label>
                <div className="space-y-3">
                  {Object.entries(roleBadges).map(([role, config]) => (
                    <button 
                      key={role} 
                      type="button" 
                      onClick={() => setFormData({
                        ...formData,
                        role: role as any
                      })} 
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        formData.role === role 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border bg-background hover:bg-accent'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant={config.variant} className="mb-1">
                            {config.label}
                          </Badge>
                          {role === 'pro' && (
                            <Badge variant="secondary" className="text-xs">
                              Most Popular
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm font-bold text-foreground">{config.price}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{config.description}</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {config.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
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
        </div>
      </div>
    </div>;
};