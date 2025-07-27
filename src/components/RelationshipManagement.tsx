import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { 
  Heart,
  Calendar,
  Star,
  MessageCircle,
  Phone,
  Mail,
  Gift,
  Clock,
  AlertCircle,
  Plus,
  Edit3,
  Trash2,
  Search,
  Eye,
  ArrowLeft,
  DollarSign,
  Users,
  Home
} from "lucide-react";

interface Contact {
  id: string;
  type: 'follow_up' | 'birthday' | 'anniversary' | 'holiday_greeting' | 'market_update' | 'check_in';
  description: string;
  scheduled_date: string;
  completed: boolean;
  client_name: string;
  client_id: string;
  notes?: string;
}

interface RelationshipManagementProps {
  clientId?: string;
  clientName?: string;
}

export const RelationshipManagement = ({ clientId, clientName }: RelationshipManagementProps) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [pastClients, setPastClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const { toast } = useToast();

  const [newContact, setNewContact] = useState({
    type: 'follow_up' as const,
    description: '',
    scheduled_date: '',
    notes: ''
  });

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

  // Mock data for demonstration
  useEffect(() => {
    const mockContacts: Contact[] = [
      {
        id: '1',
        type: 'follow_up',
        description: 'Follow up on property search progress',
        scheduled_date: '2024-02-01',
        completed: false,
        client_name: clientName || 'Sarah Mitchell',
        client_id: clientId || '1',
        notes: 'Check if they received the listings I sent'
      },
      {
        id: '2',
        type: 'birthday',
        description: 'Send birthday wishes',
        scheduled_date: '2024-03-15',
        completed: false,
        client_name: clientName || 'Sarah Mitchell',
        client_id: clientId || '1'
      },
      {
        id: '3',
        type: 'market_update',
        description: 'Share Q1 market report',
        scheduled_date: '2024-01-15',
        completed: true,
        client_name: clientName || 'Sarah Mitchell',
        client_id: clientId || '1',
        notes: 'Sent comprehensive market analysis for Bluffton area'
      }
    ];

    if (clientId) {
      setContacts(mockContacts.filter(c => c.client_id === clientId));
    } else {
      setContacts(mockContacts);
    }
  }, [clientId, clientName]);

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case 'follow_up':
        return 'bg-primary text-primary-foreground';
      case 'birthday':
        return 'bg-pink-500 text-white';
      case 'anniversary':
        return 'bg-red-500 text-white';
      case 'holiday_greeting':
        return 'bg-green-500 text-white';
      case 'market_update':
        return 'bg-blue-500 text-white';
      case 'check_in':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getContactTypeIcon = (type: string) => {
    switch (type) {
      case 'follow_up':
        return <Phone className="h-4 w-4" />;
      case 'birthday':
        return <Gift className="h-4 w-4" />;
      case 'anniversary':
        return <Heart className="h-4 w-4" />;
      case 'holiday_greeting':
        return <Star className="h-4 w-4" />;
      case 'market_update':
        return <MessageCircle className="h-4 w-4" />;
      case 'check_in':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const formatContactType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const isOverdue = (date: string) => {
    return new Date(date) < new Date() && !contacts.find(c => c.scheduled_date === date)?.completed;
  };

  const handleAddContact = () => {
    const contact: Contact = {
      id: Date.now().toString(),
      ...newContact,
      completed: false,
      client_name: clientName || 'Unknown Client',
      client_id: clientId || 'unknown'
    };

    setContacts([...contacts, contact]);
    setNewContact({
      type: 'follow_up',
      description: '',
      scheduled_date: '',
      notes: ''
    });
    setShowAddContact(false);

    toast({
      title: "Contact Scheduled",
      description: `${formatContactType(contact.type)} scheduled for ${new Date(contact.scheduled_date).toLocaleDateString()}`,
    });
  };

  const handleCompleteContact = (contactId: string) => {
    setContacts(contacts.map(c => 
      c.id === contactId ? { ...c, completed: true } : c
    ));

    toast({
      title: "Contact Completed",
      description: "Contact has been marked as completed",
    });
  };

  const handleDeleteContact = (contactId: string) => {
    setContacts(contacts.filter(c => c.id !== contactId));
    toast({
      title: "Contact Deleted",
      description: "Contact has been removed",
    });
  };

  const upcomingContacts = contacts.filter(c => !c.completed && new Date(c.scheduled_date) >= new Date());
  const overdueContacts = contacts.filter(c => !c.completed && new Date(c.scheduled_date) < new Date());
  const completedContacts = contacts.filter(c => c.completed);

  // Filter past clients based on search term
  const filteredPastClients = pastClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
              <Badge className="bg-success/10 text-success border-success/20">
                {selectedClient.status}
              </Badge>
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
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Contact
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

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card bg-gradient-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold text-primary">{upcomingContacts.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-destructive">{overdueContacts.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-success">{completedContacts.length}</p>
              </div>
              <Star className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Management */}
      <Card className="shadow-card bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-pink-500" />
              Relationship Management
            </div>
            <Button onClick={() => setShowAddContact(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Contact
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Overdue Contacts */}
          {overdueContacts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-destructive mb-3 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Overdue Contacts ({overdueContacts.length})
              </h3>
              <div className="space-y-3">
                {overdueContacts.map((contact) => (
                  <div key={contact.id} className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-destructive/20 p-2 rounded-lg">
                          {getContactTypeIcon(contact.type)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-foreground">{contact.description}</span>
                            <Badge className={`text-xs ${getContactTypeColor(contact.type)}`}>
                              {formatContactType(contact.type)}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Due: {new Date(contact.scheduled_date).toLocaleDateString()}
                            {!clientId && ` • ${contact.client_name}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" onClick={() => handleCompleteContact(contact.id)}>
                          Complete
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteContact(contact.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {contact.notes && (
                      <div className="mt-2 text-xs text-muted-foreground bg-background/50 p-2 rounded">
                        {contact.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Contacts */}
          {upcomingContacts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-primary mb-3 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Upcoming Contacts ({upcomingContacts.length})
              </h3>
              <div className="space-y-3">
                {upcomingContacts.map((contact) => (
                  <div key={contact.id} className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/20 p-2 rounded-lg">
                          {getContactTypeIcon(contact.type)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-foreground">{contact.description}</span>
                            <Badge className={`text-xs ${getContactTypeColor(contact.type)}`}>
                              {formatContactType(contact.type)}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Scheduled: {new Date(contact.scheduled_date).toLocaleDateString()}
                            {!clientId && ` • ${contact.client_name}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" onClick={() => handleCompleteContact(contact.id)}>
                          Complete
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteContact(contact.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {contact.notes && (
                      <div className="mt-2 text-xs text-muted-foreground bg-background/50 p-2 rounded">
                        {contact.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Contacts */}
          {completedContacts.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-success mb-3 flex items-center">
                <Star className="h-4 w-4 mr-2" />
                Recent Completed ({completedContacts.slice(0, 5).length})
              </h3>
              <div className="space-y-2">
                {completedContacts.slice(0, 5).map((contact) => (
                  <div key={contact.id} className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-success/20 p-2 rounded-lg">
                          {getContactTypeIcon(contact.type)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-foreground">{contact.description}</span>
                            <Badge className={`text-xs ${getContactTypeColor(contact.type)}`}>
                              {formatContactType(contact.type)}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Completed: {new Date(contact.scheduled_date).toLocaleDateString()}
                            {!clientId && ` • ${contact.client_name}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {contacts.length === 0 && (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No contacts scheduled</p>
              <p className="text-xs text-muted-foreground">
                Schedule regular touchpoints to maintain strong client relationships
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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
                      <div>
                        <div className="flex items-center space-x-2">
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

      {/* Add Contact Dialog */}
      <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="contact-type">Contact Type</Label>
              <Select 
                value={newContact.type} 
                onValueChange={(value: any) => setNewContact({ ...newContact, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                  <SelectItem value="birthday">Birthday</SelectItem>
                  <SelectItem value="anniversary">Anniversary</SelectItem>
                  <SelectItem value="holiday_greeting">Holiday Greeting</SelectItem>
                  <SelectItem value="market_update">Market Update</SelectItem>
                  <SelectItem value="check_in">Check In</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newContact.description}
                onChange={(e) => setNewContact({ ...newContact, description: e.target.value })}
                placeholder="What's this contact about?"
              />
            </div>

            <div>
              <Label htmlFor="scheduled-date">Scheduled Date</Label>
              <Input
                id="scheduled-date"
                type="date"
                value={newContact.scheduled_date}
                onChange={(e) => setNewContact({ ...newContact, scheduled_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={newContact.notes}
                onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                placeholder="Any additional notes..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddContact(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddContact}
                disabled={!newContact.description || !newContact.scheduled_date}
              >
                Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};