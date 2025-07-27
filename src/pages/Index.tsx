import { Header } from "@/components/Header"
import { Dashboard } from "@/components/Dashboard"
import { AuthForm } from "@/components/AuthForm"
import { LandingPage } from "@/components/LandingPage"
import { useAuth } from "@/components/AuthProvider"
import { useState } from "react"

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading SlipStream...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    if (!showAuth) {
      return <LandingPage onGetStarted={() => {
        setAuthMode('signup')
        setShowAuth(true)
      }} />
    }
    return <AuthForm onBack={() => setShowAuth(false)} initialMode={authMode} />
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Dashboard />
    </div>
  )
};

export default Index;
