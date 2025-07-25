
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { AuthProvider } from "@/components/AuthProvider";
import Index from "./pages/Index";
import AIAssistant from "./pages/AIAssistant";
import Tasks from "./pages/Tasks";
import ListingDetail from "./pages/ListingDetail";
import Vendors from "./pages/Vendors";
import ClientOverview from "./pages/ClientOverview";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/vendors" element={<Vendors />} />
              <Route path="/clients" element={<ClientOverview />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/listing/:id" element={<ListingDetail />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <PWAInstallPrompt />
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
