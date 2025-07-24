import { AIChat } from "@/components/AIChat";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { SidebarOverlay } from "@/components/SidebarOverlay";

const AIAssistant = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 relative">
        <AppSidebar />
        <SidebarOverlay />
        <div className="flex-1 transition-all duration-300">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                  SlipStream AI Assistant
                </h1>
                <p className="max-w-2xl mx-auto text-lg text-slate-950">Your intelligent real estate companion. Get insights and analysis powered by AI.</p>
              </div>
            </div>
            
            <AIChat />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};
export default AIAssistant;