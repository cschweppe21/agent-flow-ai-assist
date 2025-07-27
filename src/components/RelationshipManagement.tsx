import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { 
  Star,
  Phone,
  Mail,
  Search,
  Eye,
  ArrowLeft,
  DollarSign,
  Users,
  Heart,
  Calendar,
  TrendingUp,
  MessageCircle,
  CheckCircle
} from "lucide-react";

interface RelationshipManagementProps {
  clientId?: string;
  clientName?: string;
}

export const RelationshipManagement = ({ clientId, clientName }: RelationshipManagementProps) => {
  const { user } = useAuth();
  const [pastClients, setPastClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [clientRatings, setClientRatings] = useState<{[key: string]: number}>({});
  const { toast } = useToast();

  // Fetch past clients
  useEffect(() => {
    if (!user) return;

    const fetchPastClients = async () => {
      try {
        const { data, error } = await supabase
          .from('past_clients')
          .select('*')
          .eq('user_id', user.id)
          .order('last_transaction_date', { ascending: false });

        if (error) throw error;
        setPastClients(data || []);
      } catch (error) {
        console.error('Error fetching past clients:', error);
      }
    };

    fetchPastClients();
  }, [user]);

  // Filter past clients based on search term
  const filteredPastClients = pastClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Rate a client (5-star system)
  const rateClient = (clientId: string, rating: number) => {
    setClientRatings(prev => ({ ...prev, [clientId]: rating }));
    toast({
      title: "Client Rated",
      description: `Rated ${rating} stars for ease of working together`,
    });
  };

  // Get highly rated clients for recommendations
  const getHighlyRatedClients = () => {
    return pastClients
      .filter(client => (clientRatings[client.id] || 0) >= 4)
      .sort((a, b) => (clientRatings[b.id] || 0) - (clientRatings[a.id] || 0))
      .slice(0, 3);
  };

  const getClientRating = (clientId: string) => clientRatings[clientId] || 0;

  // Star rating component
  const StarRating = ({ clientId, rating, onRate }: { clientId: string, rating: number, onRate: (rating: number) => void }) => {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onRate(star)}
              className="hover:scale-110 transition-transform"
              title={`Rate ${star} star${star !== 1 ? 's' : ''} - How easy were they to work with?`}
            >
              <Star 
                className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
              />
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">Ease of working</span>
      </div>
    );
  };

  // If viewing a specific client profile, show that instead
  if (selectedClient) {
    return (
      <div className="space-y-6">
        {/* Client Profile Header */}
        <Card className="shadow-card bg-gradient-card border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedClient(null)}
                  className="mr-3"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Users className="h-5 w-5 mr-2 text-primary" />
                {selectedClient.name}
              </CardTitle>
              <div className="flex items-center space-x-3">
                <StarRating 
                  clientId={selectedClient.id} 
                  rating={getClientRating(selectedClient.id)}
                  onRate={(rating) => rateClient(selectedClient.id, rating)}
                />
                <Badge className="bg-success/10 text-success border-success/20">
                  {selectedClient.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Contact Information</h3>
                {selectedClient.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedClient.email}</span>
                  </div>
                )}
                {selectedClient.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedClient.phone}</span>
                  </div>
                )}
              </div>

              {/* Transaction Summary */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Transaction Summary</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Commission:</span>
                    <span className="font-semibold text-success">${selectedClient.total_commission?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Transactions:</span>
                    <span className="font-semibold">{selectedClient.total_transactions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Transaction:</span>
                    <span className="text-sm">{new Date(selectedClient.last_transaction_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Quick Actions</h3>
                <div className="space-y-2">
                  <Button size="sm" className="w-full justify-start">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Client
                  </Button>
                  <Button size="sm" variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                  <Button size="sm" variant="outline" className="w-full justify-start">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Quick Check-in
                  </Button>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {selectedClient.notes && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Notes</h3>
                <div className="bg-muted/50 p-4 rounded-lg text-sm whitespace-pre-wrap">
                  {selectedClient.notes}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const highlyRatedClients = getHighlyRatedClients();

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card bg-gradient-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold text-primary">{pastClients.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Highly Rated</p>
                <p className="text-2xl font-bold text-success">{highlyRatedClients.length}</p>
              </div>
              <Star className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Commission</p>
                <p className="text-2xl font-bold text-success">
                  ${pastClients.reduce((sum, client) => sum + client.total_commission, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations for Highly Rated Clients */}
      {highlyRatedClients.length > 0 && (
        <Card className="shadow-card bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              Reach Out Recommendations
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              These highly-rated clients might appreciate a check-in or have referral opportunities
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {highlyRatedClients.map((client) => (
                <div key={client.id} className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{client.name}</h4>
                    <div className="flex items-center space-x-1">
                      {[...Array(getClientRating(client.id))].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    ${client.total_commission.toLocaleString()} commission • {client.total_transactions} deal{client.total_transactions !== 1 ? 's' : ''}
                  </p>
                  <Button size="sm" className="w-full">
                    <MessageCircle className="h-3 w-3 mr-2" />
                    Quick Reach Out
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Clients Section */}
      <Card className="shadow-card bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Past Clients ({pastClients.length})
            </div>
          </CardTitle>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPastClients.length > 0 ? (
            <div className="space-y-3">
              {filteredPastClients.map((client) => (
                <div 
                  key={client.id}
                  className="p-4 bg-background/50 rounded-lg border border-border/50 hover:bg-background/70 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-foreground">{client.name}</span>
                          <Badge className="text-xs bg-success/10 text-success border-success/20">
                            {client.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {client.email && `${client.email} • `}
                          {client.total_transactions} transaction{client.total_transactions !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Last transaction: {new Date(client.last_transaction_date).toLocaleDateString()}
                        </div>
                        {/* Rating */}
                        <div className="mt-2">
                          <StarRating 
                            clientId={client.id} 
                            rating={getClientRating(client.id)}
                            onRate={(rating) => rateClient(client.id, rating)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-lg font-bold text-success">
                          ${client.total_commission?.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Total Commission</div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedClient(client)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No clients found</p>
              <p className="text-xs text-muted-foreground">
                Try adjusting your search terms
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No past clients found</p>
              <p className="text-xs text-muted-foreground">
                Completed transactions will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simple Relationship Management */}
      <Card className="shadow-card bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2 text-pink-500" />
            Quick Actions
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Simple ways to stay connected with your clients
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="p-6 h-auto flex-col space-y-2">
              <Calendar className="h-8 w-8 text-primary" />
              <span className="font-semibold">Schedule Check-ins</span>
              <span className="text-xs text-muted-foreground text-center">
                Set up simple reminders to reach out
              </span>
            </Button>
            <Button variant="outline" className="p-6 h-auto flex-col space-y-2">
              <MessageCircle className="h-8 w-8 text-success" />
              <span className="font-semibold">Send Market Updates</span>
              <span className="text-xs text-muted-foreground text-center">
                Share relevant market information
              </span>
            </Button>
            <Button variant="outline" className="p-6 h-auto flex-col space-y-2">
              <Star className="h-8 w-8 text-warning" />
              <span className="font-semibold">Ask for Referrals</span>
              <span className="text-xs text-muted-foreground text-center">
                Reach out to your top-rated clients
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};