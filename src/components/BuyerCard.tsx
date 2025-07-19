import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Phone, Mail, DollarSign, Home, MapPin } from 'lucide-react';

export interface Buyer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  budget_min?: number;
  budget_max?: number;
  preferred_bedrooms?: number;
  preferred_bathrooms?: number;
  preferred_areas?: string[];
  status: 'active' | 'under_contract' | 'closed' | 'inactive';
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface BuyerCardProps {
  buyer: Buyer;
  onContact?: (buyer: Buyer) => void;
  onEdit?: (buyer: Buyer) => void;
}

export const BuyerCard = ({ buyer, onContact, onEdit }: BuyerCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-listing-active text-white';
      case 'under_contract':
        return 'bg-listing-pending text-white';
      case 'closed':
        return 'bg-listing-sold text-white';
      case 'inactive':
        return 'bg-muted-foreground text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatBudget = () => {
    if (buyer.budget_min && buyer.budget_max) {
      return `$${(buyer.budget_min / 1000).toFixed(0)}K - $${(buyer.budget_max / 1000).toFixed(0)}K`;
    }
    if (buyer.budget_max) {
      return `Up to $${(buyer.budget_max / 1000).toFixed(0)}K`;
    }
    return 'Budget not specified';
  };

  const formatPreferences = () => {
    const prefs = [];
    if (buyer.preferred_bedrooms) {
      prefs.push(`${buyer.preferred_bedrooms} bed`);
    }
    if (buyer.preferred_bathrooms) {
      prefs.push(`${buyer.preferred_bathrooms} bath`);
    }
    return prefs.length > 0 ? prefs.join(', ') : 'No preferences set';
  };

  return (
    <Card className="bg-card border-border shadow-card hover:shadow-elevated transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg text-foreground">{buyer.name}</CardTitle>
              <Badge className={`text-xs ${getStatusColor(buyer.status)}`}>
                {buyer.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="space-y-2">
          {buyer.email && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{buyer.email}</span>
            </div>
          )}
          {buyer.phone && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{buyer.phone}</span>
            </div>
          )}
        </div>

        {/* Budget */}
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-success" />
          <span className="text-sm font-medium text-foreground">{formatBudget()}</span>
        </div>

        {/* Preferences */}
        <div className="flex items-center space-x-2">
          <Home className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">{formatPreferences()}</span>
        </div>

        {/* Preferred Areas */}
        {buyer.preferred_areas && buyer.preferred_areas.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-foreground">Preferred Areas:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {buyer.preferred_areas.slice(0, 3).map((area, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {area}
                </Badge>
              ))}
              {buyer.preferred_areas.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{buyer.preferred_areas.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {buyer.notes && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
            <p className="line-clamp-2">{buyer.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          <Button
            size="sm"
            onClick={() => onContact?.(buyer)}
            className="flex-1"
          >
            Contact
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit?.(buyer)}
            className="flex-1"
          >
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};