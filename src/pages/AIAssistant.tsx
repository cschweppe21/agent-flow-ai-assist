
import { AIChat } from "@/components/AIChat";

const AIAssistant = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            SlipStream AI Assistant
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Your intelligent real estate companion. Get insights, analysis, and professional advice powered by AI.
          </p>
        </div>
        
        <AIChat />
      </div>
    </div>
  );
};

export default AIAssistant;
