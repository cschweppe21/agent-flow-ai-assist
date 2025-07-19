import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, User, Home, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SmartAddDialogProps {
  type: 'buyer' | 'listing';
  onSuccess?: () => void;
  children: React.ReactNode;
}

export const SmartAddDialog = ({ type, onSuccess, children }: SmartAddDialogProps) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const { toast } = useToast();

  const examples = {
    buyer: [
      "Add buyer John Smith, budget 800k to 1.2M, looking for 3-4 bedrooms in Beverly Hills or Santa Monica, email john@email.com, phone 555-0123",
      "Create buyer Sarah Johnson, prefers condos under 600k in downtown area, 2 bed minimum, contact sarah.j@gmail.com",
      "New client Michael Chen, budget up to 2M, wants luxury home in Malibu or Pacific Palisades, 4+ bedrooms, michael.chen@corp.com"
    ],
    listing: [
      "New listing: 456 Oak Street Beverly Hills, 3 bed 2 bath, 1800 sqft, asking $975,000, active status",
      "Add property at 123 Main St Santa Monica, 2 bedroom condo, 1200 sq ft, price 850000, MLS #12345",
      "List 789 Pine Drive Malibu, luxury 5 bed 4 bath estate, 4500 sqft, $3.2M, ocean views"
    ]
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Call the AI parsing function
      const { data, error } = await supabase.functions.invoke('ai-parse-data', {
        body: {
          prompt: prompt.trim(),
          type,
          userId: user.id
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to parse data');
      }

      setExtractedData(data.extractedData);
      
      toast({
        title: "Success!",
        description: `${type === 'buyer' ? 'Buyer' : 'Listing'} added successfully`,
      });

      // Reset form and close dialog after a delay to show success
      setTimeout(() => {
        setPrompt('');
        setExtractedData(null);
        setIsOpen(false);
        onSuccess?.();
      }, 2000);

    } catch (error) {
      console.error('Error creating entry:', error);
      toast({
        title: "Error",
        description: error.message || `Failed to add ${type}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatExtractedData = (data: any) => {
    if (type === 'buyer') {
      return (
        <div className="space-y-2">
          <div><strong>Name:</strong> {data.name}</div>
          {data.email && <div><strong>Email:</strong> {data.email}</div>}
          {data.phone && <div><strong>Phone:</strong> {data.phone}</div>}
          {data.budget_min || data.budget_max ? (
            <div><strong>Budget:</strong> {data.budget_min ? `$${(data.budget_min / 1000).toFixed(0)}K` : ''} {data.budget_min && data.budget_max ? ' - ' : ''} {data.budget_max ? `$${(data.budget_max / 1000).toFixed(0)}K` : ''}</div>
          ) : null}
          {data.preferred_bedrooms && <div><strong>Bedrooms:</strong> {data.preferred_bedrooms}</div>}
          {data.preferred_bathrooms && <div><strong>Bathrooms:</strong> {data.preferred_bathrooms}</div>}
          {data.preferred_areas?.length > 0 && (
            <div><strong>Areas:</strong> {data.preferred_areas.join(', ')}</div>
          )}
          {data.notes && <div><strong>Notes:</strong> {data.notes}</div>}
        </div>
      );
    } else {
      return (
        <div className="space-y-2">
          <div><strong>Address:</strong> {data.address}</div>
          <div><strong>Price:</strong> ${data.price?.toLocaleString()}</div>
          {data.bedrooms && <div><strong>Bedrooms:</strong> {data.bedrooms}</div>}
          {data.bathrooms && <div><strong>Bathrooms:</strong> {data.bathrooms}</div>}
          {data.square_feet && <div><strong>Square Feet:</strong> {data.square_feet.toLocaleString()}</div>}
          <div><strong>Status:</strong> {data.status}</div>
          {data.description && <div><strong>Description:</strong> {data.description}</div>}
          {data.mls_number && <div><strong>MLS:</strong> {data.mls_number}</div>}
        </div>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>AI Smart Add {type === 'buyer' ? 'Buyer' : 'Listing'}</span>
          </DialogTitle>
        </DialogHeader>

        {!extractedData ? (
          <div className="space-y-6">
            <div>
              <Label htmlFor="prompt" className="text-sm font-medium">
                Describe the {type} in natural language
              </Label>
              <Textarea
                id="prompt"
                placeholder={`Example: "${examples[type][0]}"`}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mt-2 min-h-[100px]"
                disabled={isLoading}
              />
            </div>

            {/* Examples */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Examples:</Label>
              <div className="mt-2 space-y-2">
                {examples[type].map((example, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className="text-xs cursor-pointer hover:bg-muted/50 p-2 h-auto whitespace-normal text-left block"
                    onClick={() => setPrompt(example)}
                  >
                    {example}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isLoading || !prompt.trim()}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create {type === 'buyer' ? 'Buyer' : 'Listing'}
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-success">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">{type === 'buyer' ? 'Buyer' : 'Listing'} Created Successfully!</span>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                {type === 'buyer' ? (
                  <User className="h-4 w-4 text-primary" />
                ) : (
                  <Home className="h-4 w-4 text-primary" />
                )}
                <span className="font-medium">Extracted Information:</span>
              </div>
              {formatExtractedData(extractedData)}
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                This dialog will close automatically in a moment...
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};