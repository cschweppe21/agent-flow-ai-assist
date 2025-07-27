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
  Trash2
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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [newContact, setNewContact] = useState({
    type: 'follow_up' as const,
    description: '',
    scheduled_date: '',
    notes: ''
  });

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