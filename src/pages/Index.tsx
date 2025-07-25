import { Header } from "@/components/Header"
import { Dashboard } from "@/components/Dashboard"
import { AuthForm } from "@/components/AuthForm"
import { useAuth } from "@/components/AuthProvider"
import slipstreamLogo from "@/assets/slipstream-logo.png"

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <img src={slipstreamLogo} alt="SlipStream" className="h-20 w-20 mx-auto mb-4 animate-pulse" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading SlipStream...</p>
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
