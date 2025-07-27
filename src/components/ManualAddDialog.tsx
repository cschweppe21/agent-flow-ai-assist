import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Plus, Loader2 } from 'lucide-react';

interface ManualAddDialogProps {
  type: 'buyer' | 'listing' | 'vendor' | 'task';
  onSuccess?: () => void;
  children: React.ReactNode;
  selectedDate?: string; // For tasks
}

export const ManualAddDialog = ({ type, onSuccess, children, selectedDate }: ManualAddDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Buyer state
  const [buyerData, setBuyerData] = useState({
    name: '',
    email: '',
    phone: '',
    budget_min: '',
    budget_max: '',
    preferred_bedrooms: '',
    preferred_bathrooms: '',
    preferred_areas: '',
    status: 'active',
    notes: ''
  });

  // Listing state
  const [listingData, setListingData] = useState({
    address: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    square_feet: '',
    description: '',
    mls_number: '',
    status: 'active'
  });

  // Vendor state
  const [vendorData, setVendorData] = useState({
    name: '',
    business_name: '',
    category: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    notes: '',
    rating: '',
    is_preferred: false
  });

  // Task state
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    due_date: selectedDate || '',
    priority: 'medium'
  });

  const vendorCategories = [
    { value: 'attorney', label: 'Real Estate Attorney' },
    { value: 'appraiser', label: 'Appraiser' },
    { value: 'inspector', label: 'Home Inspector' },
    { value: 'insurance', label: 'Insurance Agent' },
    { value: 'lender', label: 'Mortgage Lender' },
    { value: 'contractor', label: 'General Contractor' },
    { value: 'stager', label: 'Home Stager' },
    { value: 'photographer', label: 'Real Estate Photographer' },
    { value: 'other', label: 'Other Service Provider' }
  ];

  const resetForm = () => {
    setBuyerData({
      name: '',
      email: '',
      phone: '',
      budget_min: '',
      budget_max: '',
      preferred_bedrooms: '',
      preferred_bathrooms: '',
      preferred_areas: '',
      status: 'active',
      notes: ''
    });
    setListingData({
      address: '',
      price: '',
      bedrooms: '',
      bathrooms: '',
      square_feet: '',
      description: '',
      mls_number: '',
      status: 'active'
    });
    setVendorData({
      name: '',
      business_name: '',
      category: '',
      phone: '',
      email: '',
      website: '',
      address: '',
      notes: '',
      rating: '',
      is_preferred: false
    });
    setTaskData({
      title: '',
      description: '',
      due_date: selectedDate || '',
      priority: 'medium'
    });
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let data;
      let error;

      switch (type) {
        case 'buyer':
          if (!buyerData.name) {
            throw new Error('Name is required');
          }
          ({ data, error } = await supabase
            .from('buyers')
            .insert({
              user_id: user.id,
              name: buyerData.name,
              email: buyerData.email || null,
              phone: buyerData.phone || null,
              budget_min: buyerData.budget_min ? parseInt(buyerData.budget_min) : null,
              budget_max: buyerData.budget_max ? parseInt(buyerData.budget_max) : null,
              preferred_bedrooms: buyerData.preferred_bedrooms ? parseInt(buyerData.preferred_bedrooms) : null,
              preferred_bathrooms: buyerData.preferred_bathrooms ? parseInt(buyerData.preferred_bathrooms) : null,
              preferred_areas: buyerData.preferred_areas ? buyerData.preferred_areas.split(',').map(area => area.trim()) : null,
              status: buyerData.status,
              notes: buyerData.notes || null
            }));
          break;

        case 'listing':
          if (!listingData.address || !listingData.price) {
            throw new Error('Address and price are required');
          }
          ({ data, error } = await supabase
            .from('listings')
            .insert({
              user_id: user.id,
              address: listingData.address,
              price: parseInt(listingData.price),
              bedrooms: listingData.bedrooms ? parseInt(listingData.bedrooms) : null,
              bathrooms: listingData.bathrooms ? parseInt(listingData.bathrooms) : null,
              square_feet: listingData.square_feet ? parseInt(listingData.square_feet) : null,
              description: listingData.description || null,
              mls_number: listingData.mls_number || null,
              status: listingData.status,
              listing_date: new Date().toISOString()
            }));
          break;

        case 'vendor':
          if (!vendorData.name || !vendorData.category) {
            throw new Error('Name and category are required');
          }
          ({ data, error } = await supabase
            .from('vendors')
            .insert({
              user_id: user.id,
              name: vendorData.name,
              business_name: vendorData.business_name || null,
              category: vendorData.category,
              phone: vendorData.phone || null,
              email: vendorData.email || null,
              website: vendorData.website || null,
              address: vendorData.address || null,
              notes: vendorData.notes || null,
              rating: vendorData.rating ? parseFloat(vendorData.rating) : null,
              is_preferred: vendorData.is_preferred
            }));
          break;

        case 'task':
          if (!taskData.title) {
            throw new Error('Title is required');
          }
          ({ data, error } = await supabase
            .from('tasks')
            .insert({
              user_id: user.id,
              title: taskData.title,
              description: taskData.description || null,
              due_date: taskData.due_date || null,
              priority: taskData.priority,
              completed: false
            }));
          break;
      }

      if (error) throw error;

      toast({
        title: "Success!",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} added successfully`,
      });

      resetForm();
      setIsOpen(false);
      onSuccess?.();

    } catch (error) {
      console.error('Error adding entry:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to add ${type}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderBuyerForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={buyerData.name}
            onChange={(e) => setBuyerData({ ...buyerData, name: e.target.value })}
            placeholder="John Smith"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={buyerData.email}
            onChange={(e) => setBuyerData({ ...buyerData, email: e.target.value })}
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={buyerData.phone}
            onChange={(e) => setBuyerData({ ...buyerData, phone: e.target.value })}
            placeholder="(555) 123-4567"
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={buyerData.status} onValueChange={(value) => setBuyerData({ ...buyerData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="under_contract">Under Contract</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="budget_min">Budget Min ($)</Label>
          <Input
            id="budget_min"
            type="number"
            value={buyerData.budget_min}
            onChange={(e) => setBuyerData({ ...buyerData, budget_min: e.target.value })}
            placeholder="500000"
          />
        </div>
        <div>
          <Label htmlFor="budget_max">Budget Max ($)</Label>
          <Input
            id="budget_max"
            type="number"
            value={buyerData.budget_max}
            onChange={(e) => setBuyerData({ ...buyerData, budget_max: e.target.value })}
            placeholder="800000"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="preferred_bedrooms">Preferred Bedrooms</Label>
          <Input
            id="preferred_bedrooms"
            type="number"
            value={buyerData.preferred_bedrooms}
            onChange={(e) => setBuyerData({ ...buyerData, preferred_bedrooms: e.target.value })}
            placeholder="3"
          />
        </div>
        <div>
          <Label htmlFor="preferred_bathrooms">Preferred Bathrooms</Label>
          <Input
            id="preferred_bathrooms"
            type="number"
            value={buyerData.preferred_bathrooms}
            onChange={(e) => setBuyerData({ ...buyerData, preferred_bathrooms: e.target.value })}
            placeholder="2"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="preferred_areas">Preferred Areas (comma-separated)</Label>
        <Input
          id="preferred_areas"
          value={buyerData.preferred_areas}
          onChange={(e) => setBuyerData({ ...buyerData, preferred_areas: e.target.value })}
          placeholder="Downtown, Beverly Hills, Santa Monica"
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={buyerData.notes}
          onChange={(e) => setBuyerData({ ...buyerData, notes: e.target.value })}
          placeholder="Additional notes about this buyer..."
          rows={3}
        />
      </div>
    </div>
  );

  const renderListingForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="address">Address *</Label>
        <Input
          id="address"
          value={listingData.address}
          onChange={(e) => setListingData({ ...listingData, address: e.target.value })}
          placeholder="123 Main St, City, State 12345"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price ($) *</Label>
          <Input
            id="price"
            type="number"
            value={listingData.price}
            onChange={(e) => setListingData({ ...listingData, price: e.target.value })}
            placeholder="500000"
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={listingData.status} onValueChange={(value) => setListingData({ ...listingData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input
            id="bedrooms"
            type="number"
            value={listingData.bedrooms}
            onChange={(e) => setListingData({ ...listingData, bedrooms: e.target.value })}
            placeholder="3"
          />
        </div>
        <div>
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input
            id="bathrooms"
            type="number"
            value={listingData.bathrooms}
            onChange={(e) => setListingData({ ...listingData, bathrooms: e.target.value })}
            placeholder="2"
          />
        </div>
        <div>
          <Label htmlFor="square_feet">Square Feet</Label>
          <Input
            id="square_feet"
            type="number"
            value={listingData.square_feet}
            onChange={(e) => setListingData({ ...listingData, square_feet: e.target.value })}
            placeholder="1800"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="mls_number">MLS Number</Label>
        <Input
          id="mls_number"
          value={listingData.mls_number}
          onChange={(e) => setListingData({ ...listingData, mls_number: e.target.value })}
          placeholder="MLS12345"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={listingData.description}
          onChange={(e) => setListingData({ ...listingData, description: e.target.value })}
          placeholder="Property description..."
          rows={3}
        />
      </div>
    </div>
  );

  const renderVendorForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Contact Name *</Label>
          <Input
            id="name"
            value={vendorData.name}
            onChange={(e) => setVendorData({ ...vendorData, name: e.target.value })}
            placeholder="John Smith"
          />
        </div>
        <div>
          <Label htmlFor="business_name">Business Name</Label>
          <Input
            id="business_name"
            value={vendorData.business_name}
            onChange={(e) => setVendorData({ ...vendorData, business_name: e.target.value })}
            placeholder="Smith Inspections LLC"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="category">Service Category *</Label>
        <Select value={vendorData.category} onValueChange={(value) => setVendorData({ ...vendorData, category: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select service type" />
          </SelectTrigger>
          <SelectContent>
            {vendorCategories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={vendorData.phone}
            onChange={(e) => setVendorData({ ...vendorData, phone: e.target.value })}
            placeholder="(555) 123-4567"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={vendorData.email}
            onChange={(e) => setVendorData({ ...vendorData, email: e.target.value })}
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          value={vendorData.website}
          onChange={(e) => setVendorData({ ...vendorData, website: e.target.value })}
          placeholder="https://example.com"
        />
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={vendorData.address}
          onChange={(e) => setVendorData({ ...vendorData, address: e.target.value })}
          placeholder="123 Main St, City, State 12345"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rating">Rating (1-5)</Label>
          <Input
            id="rating"
            type="number"
            min="1"
            max="5"
            step="0.1"
            value={vendorData.rating}
            onChange={(e) => setVendorData({ ...vendorData, rating: e.target.value })}
            placeholder="4.5"
          />
        </div>
        <div className="flex items-center space-x-2 mt-6">
          <Switch
            checked={vendorData.is_preferred}
            onCheckedChange={(checked) => setVendorData({ ...vendorData, is_preferred: checked })}
          />
          <Label>Preferred Vendor</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={vendorData.notes}
          onChange={(e) => setVendorData({ ...vendorData, notes: e.target.value })}
          placeholder="Additional notes about this vendor..."
          rows={3}
        />
      </div>
    </div>
  );

  const renderTaskForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={taskData.title}
          onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
          placeholder="Schedule showing for 123 Main St"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={taskData.description}
          onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
          placeholder="Additional details about this task..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="due_date">Due Date</Label>
          <Input
            id="due_date"
            type="date"
            value={taskData.due_date}
            onChange={(e) => setTaskData({ ...taskData, due_date: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={taskData.priority} onValueChange={(value) => setTaskData({ ...taskData, priority: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const getFormContent = () => {
    switch (type) {
      case 'buyer':
        return renderBuyerForm();
      case 'listing':
        return renderListingForm();
      case 'vendor':
        return renderVendorForm();
      case 'task':
        return renderTaskForm();
      default:
        return null;
    }
  };

  const getRequiredFieldsFilled = () => {
    switch (type) {
      case 'buyer':
        return !!buyerData.name;
      case 'listing':
        return !!listingData.address && !!listingData.price;
      case 'vendor':
        return !!vendorData.name && !!vendorData.category;
      case 'task':
        return !!taskData.title;
      default:
        return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add {type.charAt(0).toUpperCase() + type.slice(1)}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {getFormContent()}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isLoading || !getRequiredFieldsFilled()}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add {type.charAt(0).toUpperCase() + type.slice(1)}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};