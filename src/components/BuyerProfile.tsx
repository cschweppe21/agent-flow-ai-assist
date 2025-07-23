import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
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
  Target,
  TrendingUp,
  Building,
  CheckCircle,
  XCircle
} from "lucide-react"
import { Buyer } from "./BuyerCard"

// Mock property data interface
interface Property {
  id: string
  address: string
  price: number
  bedrooms: number
  bathrooms: number
  sqft: number
  area: string
  listingDate: string
  images?: string[]
}

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
  const [activeTab, setActiveTab] = useState("profile")
  const [showCloseDialog, setShowCloseDialog] = useState(false)
  const [closeFormData, setCloseFormData] = useState({
    finalCommission: '',
    dealCompleted: true,
    transactionDate: new Date().toISOString().split('T')[0],
    finalNotes: ''
  })
  const { toast } = useToast()

  // Generate recommended properties based on buyer preferences
  const recommendedProperties = useMemo(() => {
    const mockProperties: Property[] = [
      {
        id: "1",
        address: "456 Ocean View Dr, Santa Monica, CA",
        price: 1150000,
        bedrooms: 3,
        bathrooms: 2.5,
        sqft: 1850,
        area: "Santa Monica",
        listingDate: "2024-01-15"
      },
      {
        id: "2", 
        address: "789 Beverly Hills Blvd, Beverly Hills, CA",
        price: 2200000,
        bedrooms: 4,
        bathrooms: 3,
        sqft: 2400,
        area: "Beverly Hills",
        listingDate: "2024-01-10"
      },
      {
        id: "3",
        address: "321 Venice Beach Way, Venice, CA", 
        price: 980000,
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1400,
        area: "Venice",
        listingDate: "2024-01-20"
      },
      {
        id: "4",
        address: "654 Malibu Coast Hwy, Malibu, CA",
        price: 3500000,
        bedrooms: 5,
        bathrooms: 4.5,
        sqft: 3200,
        area: "Malibu",
        listingDate: "2024-01-08"
      },
      {
        id: "5",
        address: "147 Manhattan Beach Blvd, Manhattan Beach, CA",
        price: 1650000,
        bedrooms: 3,
        bathrooms: 2.5,
        sqft: 2000,
        area: "Manhattan Beach",
        listingDate: "2024-01-18"
      }
    ]

    return mockProperties.filter(property => {
      // Filter by preferred areas
      const matchesArea = formData.preferred_areas?.some(area => 
        property.area.toLowerCase().includes(area.toLowerCase())
      ) || false

      // Filter by budget
      const withinBudget = (!formData.budget_min || property.price >= formData.budget_min) &&
                          (!formData.budget_max || property.price <= formData.budget_max)

      // Filter by bedrooms
      const matchesBedrooms = !formData.preferred_bedrooms || property.bedrooms >= formData.preferred_bedrooms

      // Filter by bathrooms  
      const matchesBathrooms = !formData.preferred_bathrooms || property.bathrooms >= formData.preferred_bathrooms

      return matchesArea && withinBudget && matchesBedrooms && matchesBathrooms
    }).slice(0, 8) // Limit to 8 recommendations
  }, [formData])

  const handleSave = () => {
    onSave?.(formData)
    setIsEditing(false)
    toast({
      title: "Profile Updated",
      description: "Buyer profile has been successfully updated.",
    })
    // Don't close the modal - keep it open
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

  const handleCloseBuyer = () => {
    const updatedBuyer = { 
      ...formData, 
      status: closeFormData.dealCompleted ? 'closed' as const : 'inactive' as const,
      notes: `${formData.notes || ''}\n\nClosed ${new Date().toLocaleDateString()}: ${closeFormData.finalNotes}`.trim()
    }
    
    setFormData(updatedBuyer)
    onSave?.(updatedBuyer)
    setShowCloseDialog(false)
    
    toast({
      title: closeFormData.dealCompleted ? "Buyer Closed Successfully" : "Buyer Profile Closed",
      description: `Profile has been moved to previous clients with ${closeFormData.dealCompleted ? 'successful transaction' : 'no transaction'}.`,
    })
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="profile">Profile Details</TabsTrigger>
            <TabsTrigger value="recommendations">
              Property Recommendations
              {recommendedProperties.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                  {recommendedProperties.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[60vh] pr-2">
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
        </TabsContent>

        <TabsContent value="recommendations" className="overflow-y-auto max-h-[60vh] pr-2">
          <div className="space-y-6">
            {/* Recommendations Header */}
            <Card className="shadow-card bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 mr-2 text-primary" />
                    Property Recommendations
                  </div>
                  <Badge variant="secondary">
                    {recommendedProperties.length} matches
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget Range:</span>
                    <span className="font-medium">{formatBudget()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preferred Areas:</span>
                    <span className="font-medium">
                      {formData.preferred_areas?.slice(0, 2).join(', ') || 'Any'}
                      {formData.preferred_areas && formData.preferred_areas.length > 2 && ` +${formData.preferred_areas.length - 2} more`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Min Bedrooms:</span>
                    <span className="font-medium">{formData.preferred_bedrooms || 'Any'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Min Bathrooms:</span>
                    <span className="font-medium">{formData.preferred_bathrooms || 'Any'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Listings */}
            {recommendedProperties.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {recommendedProperties.map((property) => (
                  <Card key={property.id} className="shadow-card bg-gradient-card border-border/50 hover:shadow-elevated transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg text-foreground line-clamp-1">
                            {property.address}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {property.area}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Listed {new Date(property.listingDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-2xl font-bold text-success">
                        ${property.price.toLocaleString()}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center space-x-1">
                          <Home className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{property.bedrooms}</span>
                          <span className="text-muted-foreground">bed</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Home className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{property.bathrooms}</span>
                          <span className="text-muted-foreground">bath</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">{property.sqft.toLocaleString()}</span>
                          <span className="text-muted-foreground">sqft</span>
                        </div>
                      </div>

                      {/* Match indicators */}
                      <div className="flex flex-wrap gap-1 pt-2">
                        {property.price >= (formData.budget_min || 0) && 
                         property.price <= (formData.budget_max || Infinity) && (
                          <Badge variant="secondary" className="bg-success/10 text-success text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            In Budget
                          </Badge>
                        )}
                        {formData.preferred_bedrooms && property.bedrooms >= formData.preferred_bedrooms && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                            ✓ Bedrooms
                          </Badge>
                        )}
                        {formData.preferred_bathrooms && property.bathrooms >= formData.preferred_bathrooms && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                            ✓ Bathrooms
                          </Badge>
                        )}
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" className="flex-1">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Schedule Tour
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="shadow-card bg-gradient-card border-border/50">
                <CardContent className="text-center py-8">
                  <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Matching Properties</h3>
                  <p className="text-muted-foreground mb-4">
                    We couldn't find any properties matching the current criteria.
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <p>• Try expanding the budget range</p>
                    <p>• Consider additional areas</p>
                    <p>• Adjust bedroom/bathroom requirements</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Close Profile Button - Always at bottom */}
      {formData.status === 'active' && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex justify-center">
            <Button 
              variant="destructive" 
              onClick={() => setShowCloseDialog(true)}
              className="px-8"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Close Profile
            </Button>
          </div>
        </div>
      )}
      </DialogContent>

      {/* Close Profile Dialog */}
      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-primary" />
              Close Buyer Profile
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Closing <strong>{formData.name}</strong>'s profile. This will move them to your previous clients list.
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="dealCompleted"
                  checked={closeFormData.dealCompleted}
                  onCheckedChange={(checked) => 
                    setCloseFormData(prev => ({ ...prev, dealCompleted: !!checked }))
                  }
                />
                <Label htmlFor="dealCompleted" className="text-sm font-medium">
                  Deal completed successfully
                </Label>
              </div>

              {closeFormData.dealCompleted && (
                <div>
                  <Label htmlFor="finalCommission">Final Commission Amount</Label>
                  <Input
                    id="finalCommission"
                    type="number"
                    placeholder="e.g., 15000"
                    value={closeFormData.finalCommission}
                    onChange={(e) => setCloseFormData(prev => ({ 
                      ...prev, 
                      finalCommission: e.target.value 
                    }))}
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="transactionDate">
                  {closeFormData.dealCompleted ? 'Transaction Date' : 'Date Closed'}
                </Label>
                <Input
                  id="transactionDate"
                  type="date"
                  value={closeFormData.transactionDate}
                  onChange={(e) => setCloseFormData(prev => ({ 
                    ...prev, 
                    transactionDate: e.target.value 
                  }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="finalNotes">Final Notes</Label>
                <Textarea
                  id="finalNotes"
                  placeholder="Add any final notes about this client..."
                  value={closeFormData.finalNotes}
                  onChange={(e) => setCloseFormData(prev => ({ 
                    ...prev, 
                    finalNotes: e.target.value 
                  }))}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowCloseDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCloseBuyer}
                className="bg-destructive hover:bg-destructive/90"
              >
                {closeFormData.dealCompleted ? 'Complete & Close' : 'Close Profile'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}