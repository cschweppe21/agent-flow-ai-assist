import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, BarChart3, Brain, Calendar, Users, Zap, CheckCircle } from "lucide-react"

interface LandingPageProps {
  onGetStarted: () => void
}

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Organization",
      description: "Smart task management and automated insights to streamline your workflow"
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Track commissions, market trends, and performance metrics in one dashboard"
    },
    {
      icon: Users,
      title: "Client & Vendor Management",
      description: "Comprehensive CRM with buyer profiles, vendor networks, and relationship tracking"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Weekly task calendars with intelligent prioritization and deadline management"
    }
  ]

  const benefits = [
    "Increase productivity by 40% with AI automation",
    "Never miss a deadline with smart task management",
    "Track every commission and market opportunity",
    "Build stronger client relationships with CRM tools"
  ]

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-16 animate-fade-in">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">SlipStream</span>
          </div>
          <Badge variant="secondary" className="bg-white/10 text-white border-white/20 backdrop-blur-sm">
            Real Estate CRM & Analytics
          </Badge>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in delay-200">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Your Real Estate
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Success Engine
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
            AI-powered task management, comprehensive analytics, and smart CRM tools 
            designed specifically for real estate professionals who demand excellence.
          </p>
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 rounded-xl shadow-elevated hover-scale group"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature, index) => (
            <Card 
              key={feature.title}
              className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover-scale animate-fade-in group"
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              <CardContent className="p-6 text-center">
                <feature.icon className="h-12 w-12 text-white mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="max-w-4xl mx-auto animate-fade-in delay-700">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Why Top Agents Choose SlipStream
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center space-x-3 bg-white/10 rounded-lg p-4 backdrop-blur-sm hover:bg-white/20 transition-all hover-scale"
                style={{ animationDelay: `${800 + index * 100}ms` }}
              >
                <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                <span className="text-white text-lg">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20 animate-fade-in delay-1200">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Transform Your Real Estate Business?
            </h3>
            <p className="text-white/80 mb-6">
              Join thousands of successful agents who trust SlipStream to manage their success.
            </p>
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white text-lg px-10 py-6 rounded-xl shadow-elevated hover-scale group"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}