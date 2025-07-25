import { Header } from "@/components/Header"
import { Dashboard } from "@/components/Dashboard"
import { AuthForm } from "@/components/AuthForm"
import { useAuth } from "@/components/AuthProvider"
import slipstreamLogo from "@/assets/slipstream-logo.png"

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <img src={slipstreamLogo} alt="SlipStream" className="h-16 w-16 mx-auto mb-4 animate-pulse" />
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-foreground text-lg font-medium">Loading SlipStream...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthForm />
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Dashboard />
    </div>
  )
};

export default Index;
