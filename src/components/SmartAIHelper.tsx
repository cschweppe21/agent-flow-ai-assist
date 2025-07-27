import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Sparkles, Loader2 } from "lucide-react";

interface SmartAIHelperProps {
  children: React.ReactNode;
}

export const SmartAIHelper = ({ children }: SmartAIHelperProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

  const handleSubmit = async () => {
    if (!input.trim() || !profile?.user_id) return;

    setIsProcessing(true);
    try {
      // First, categorize the input
      const { data: categoryData, error: categoryError } = await supabase.functions.invoke('ai-categorize', {
        body: { text: input }
      });

      if (categoryError) {
        throw new Error('Failed to categorize input');
      }

      const { category } = categoryData;
      console.log('Categorized as:', category);

      // Then parse and create the appropriate entry
      const { data: parseData, error: parseError } = await supabase.functions.invoke('ai-parse-data', {
        body: { 
          prompt: input, 
          type: category, 
          userId: profile.user_id 
        }
      });

      if (parseError) {
        throw new Error('Failed to process input');
      }

      let successMessage = '';
      switch (category) {
        case 'buyer':
          successMessage = `Created buyer profile for ${parseData.extractedData.name}`;
          break;
        case 'vendor':
          successMessage = `Added vendor ${parseData.extractedData.name} to your contacts`;
          break;
        case 'task':
          successMessage = `Added task "${parseData.extractedData.title}" to your to-do list`;
          break;
        case 'listing':
          successMessage = `Created listing for ${parseData.extractedData.address}`;
          break;
        case 'close_buyer':
          successMessage = `Closed ${parseData.extractedData.buyer.name}'s profile with ${parseData.extractedData.commission_amount ? `$${parseData.extractedData.commission_amount.toLocaleString()} commission` : 'commission details'}`;
          break;
        default:
          successMessage = 'Successfully processed your input';
      }

      toast({
        title: "Success!",
        description: successMessage,
      });

      setInput("");
      setIsOpen(false);
    } catch (error) {
      console.error('Error processing input:', error);
      toast({
        title: "Error",
        description: "Failed to process your input. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {children}
      </div>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Smart AI Helper
            </DialogTitle>
            <DialogDescription>
              Describe what you want to add and I'll organize it for you. I can create client profiles, vendor contacts, tasks, or listings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Example: 'Met Sarah Johnson at the open house, she's interested in a 3-bed in Hilton Head around $600k' or 'Schedule roofer for 42 Oak Street next Tuesday'"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="min-h-[100px] resize-none"
                disabled={isProcessing}
              />
              <p className="text-xs text-muted-foreground">
                Press Cmd/Ctrl + Enter to submit
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleSubmit} 
                disabled={!input.trim() || isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Organize
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};