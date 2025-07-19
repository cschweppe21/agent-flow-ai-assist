import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { 
  User, 
  Phone, 
  Mail, 
  DollarSign, 
  Home, 
  MapPin, 
  Edit3,
  Save,
  MessageSquare,
  Calendar,
  Target
} from "lucide-react"
import { Buyer } from "./BuyerCard"

interface BuyerProfileProps {
  buyer: Buyer
  isOpen: boolean
  onClose: () => void
  onSave?: (updatedBuyer: Buyer) => void
  onContact?: (buyer: Buyer) => void
}

export const BuyerProfile = ({ buyer, isOpen, onClose, onSave, onContact }: BuyerProfileProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Buyer>(buyer)
  const { toast } = useToast()

  const handleSave = () => {
    onSave?.(formData)
    setIsEditing(false)
    toast({
      title: "Profile Updated",
      description: "Buyer profile has been successfully updated.",
    })
  }

  const handleCancel = () => {
    setFormData(buyer)
    setIsEditing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-listing-active text-white'
      case 'under_contract':
        return 'bg-listing-pending text-white'
      case 'closed':
        return 'bg-listing-sold text-white'
      case 'inactive':
        return 'bg-muted-foreground text-white'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const formatBudget = () => {
    if (formData.budget_min && formData.budget_max) {
      return `$${(formData.budget_min / 1000).toFixed(0)}K - $${(formData.budget_max / 1000).toFixed(0)}K`
    }
    if (formData.budget_max) {
      return `Up to $${(formData.budget_max / 1000).toFixed(0)}K`
    }
    return 'Budget not specified'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="h-6 w-6 mr-2 text-primary" />
              {formData.name} - Profile
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`${getStatusColor(formData.status)}`}>
                {formData.status.replace('_', ' ').toUpperCase()}
              </Badge>
              {!isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[70vh] pr-2">
          {/* Main Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-card bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-background/50 rounded-md">{formData.name}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    {isEditing ? (
                      <Select 
                        value={formData.status} 
                        onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="under_contract">Under Contract</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="mt-1 p-2 bg-background/50 rounded-md capitalize">
                        {formData.status.replace('_', ' ')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 p-2 bg-background/50 rounded-md flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        {formData.email || 'Not provided'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 p-2 bg-background/50 rounded-md flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        {formData.phone || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-success" />
                  Budget & Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget_min">Minimum Budget</Label>
                    {isEditing ? (
                      <Input
                        id="budget_min"
                        type="number"
                        value={formData.budget_min || ''}
                        onChange={(e) => setFormData({ ...formData, budget_min: Number(e.target.value) })}
                        placeholder="e.g., 500000"
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-background/50 rounded-md">
                        {formData.budget_min ? `$${formData.budget_min.toLocaleString()}` : 'Not specified'}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="budget_max">Maximum Budget</Label>
                    {isEditing ? (
                      <Input
                        id="budget_max"
                        type="number"
                        value={formData.budget_max || ''}
                        onChange={(e) => setFormData({ ...formData, budget_max: Number(e.target.value) })}
                        placeholder="e.g., 1200000"
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-background/50 rounded-md">
                        {formData.budget_max ? `$${formData.budget_max.toLocaleString()}` : 'Not specified'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bedrooms">Preferred Bedrooms</Label>
                    {isEditing ? (
                      <Input
                        id="bedrooms"
                        type="number"
                        value={formData.preferred_bedrooms || ''}
                        onChange={(e) => setFormData({ ...formData, preferred_bedrooms: Number(e.target.value) })}
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 p-2 bg-background/50 rounded-md flex items-center">
                        <Home className="h-4 w-4 mr-2 text-muted-foreground" />
                        {formData.preferred_bedrooms || 'Not specified'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="bathrooms">Preferred Bathrooms</Label>
                    {isEditing ? (
                      <Input
                        id="bathrooms"
                        type="number"
                        step="0.5"
                        value={formData.preferred_bathrooms || ''}
                        onChange={(e) => setFormData({ ...formData, preferred_bathrooms: Number(e.target.value) })}
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 p-2 bg-background/50 rounded-md flex items-center">
                        <Home className="h-4 w-4 mr-2 text-muted-foreground" />
                        {formData.preferred_bathrooms || 'Not specified'}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="areas">Preferred Areas</Label>
                  {isEditing ? (
                    <Input
                      id="areas"
                      value={formData.preferred_areas?.join(', ') || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        preferred_areas: e.target.value.split(',').map(area => area.trim()).filter(Boolean)
                      })}
                      placeholder="e.g., Beverly Hills, Santa Monica, Venice"
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1 p-2 bg-background/50 rounded-md">
                      <div className="flex items-center mb-2">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm font-medium">Areas of Interest:</span>
                      </div>
                      {formData.preferred_areas && formData.preferred_areas.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {formData.preferred_areas.map((area, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No areas specified</span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  {isEditing ? (
                    <Textarea
                      id="notes"
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="mt-1"
                      placeholder="Add any notes about this buyer..."
                    />
                  ) : (
                    <div className="mt-1 p-2 bg-background/50 rounded-md min-h-[80px]">
                      {formData.notes || 'No notes added'}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-card bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start"
                  onClick={() => onContact?.(formData)}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Buyer
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Showing
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Home className="h-4 w-4 mr-2" />
                  Find Properties
                </Button>
              </CardContent>
            </Card>

            {/* Budget Summary */}
            <Card className="shadow-card bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-success" />
                  Budget Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {formatBudget()}
                  </div>
                  {formData.budget_min && formData.budget_max && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Range: ${(formData.budget_max - formData.budget_min).toLocaleString()} spread
                    </p>
                  )}
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Down Payment (20%)</span>
                    <span className="font-medium">
                      ${formData.budget_max ? Math.round(formData.budget_max * 0.2).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Monthly Payment</span>
                    <span className="font-medium">
                      ${formData.budget_max ? Math.round(formData.budget_max * 0.8 * 0.005).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Timeline */}
            <Card className="shadow-card bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">
                      {new Date(formData.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="font-medium">
                      {new Date(formData.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="text-xs text-muted-foreground">
                  <p>• Profile created {Math.ceil((Date.now() - new Date(formData.created_at).getTime()) / (1000 * 3600 * 24))} days ago</p>
                  <p>• Last activity today</p>
                  <p>• 0 properties viewed</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}