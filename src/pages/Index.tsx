import { Header } from "@/components/Header"
import { Dashboard } from "@/components/Dashboard"
import { AuthForm } from "@/components/AuthForm"
import { useAuth } from "@/components/AuthProvider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { SidebarOverlay } from "@/components/SidebarOverlay"

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth()

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
    return <AuthForm />
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background relative">
        <AppSidebar />
        <SidebarOverlay />
        <div className="flex-1 transition-all duration-300">
          <Header />
          <Dashboard />
        </div>
      </div>
    </SidebarProvider>
  )
};

export default Index;
