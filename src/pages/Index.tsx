import { Header } from "@/components/Header"
import { Dashboard } from "@/components/Dashboard"
import { AuthForm } from "@/components/AuthForm"
import { useAuth } from "@/components/AuthProvider"

const Index = () => {
  const { isAuthenticated, isLoading, login } = useAuth()

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
    return <AuthForm onSuccess={login} />
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Dashboard />
    </div>
  )
};

export default Index;
