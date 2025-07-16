import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { Link } from "react-router-dom";

export const FloatingAIButton = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button 
        variant="hero" 
        size="icon"
        className="h-14 w-14 rounded-full shadow-elevated hover:shadow-glow transition-all duration-300"
        asChild
      >
        <Link to="/ai-assistant">
          <Bot className="h-6 w-6" />
        </Link>
      </Button>
    </div>
  );
};