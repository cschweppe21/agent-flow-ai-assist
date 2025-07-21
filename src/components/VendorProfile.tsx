import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Phone, Mail, Globe, Star, MapPin, Edit, Save, X } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Vendor {
  id: string
  name: string
  business_name?: string
  category: string
  phone?: string
  email?: string
  website?: string
  address?: string
  notes?: string
  rating?: number
  is_preferred: boolean
  user_id: string
  created_at: string
  updated_at: string
}

interface VendorProfileProps {
  vendor: Vendor
  isOpen: boolean
  onClose: () => void
  onSave: (vendor: Vendor) => void
  onContact: (vendor: Vendor) => void
}

const vendorCategories = [
  'inspector',
  'appraiser', 
  'lender',
  'contractor',
  'photographer',
  'stager',
  'attorney',
  'insurance',
  'other'
]

export const VendorProfile = ({ vendor, isOpen, onClose, onSave, onContact }: VendorProfileProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedVendor, setEditedVendor] = useState<Vendor>(vendor)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('vendors')
        .update({
          name: editedVendor.name,
          business_name: editedVendor.business_name,
          category: editedVendor.category,
          phone: editedVendor.phone,
          email: editedVendor.email,
          website: editedVendor.website,
          address: editedVendor.address,
          notes: editedVendor.notes,
          rating: editedVendor.rating,
          is_preferred: editedVendor.is_preferred
        })
        .eq('id', vendor.id)

      if (error) throw error

      onSave(editedVendor)
      setIsEditing(false)
      toast({
        title: "Vendor Updated",
        description: "Vendor profile has been updated successfully.",
      })
    } catch (error) {
      console.error('Error updating vendor:', error)
      toast({
        title: "Error",
        description: "Failed to update vendor profile.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedVendor(vendor)
    setIsEditing(false)
  }

  const displayName = editedVendor.business_name || editedVendor.name

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center text-xl">
              <span className="mr-2">👤</span>
              {isEditing ? "Edit Vendor Profile" : "Vendor Profile"}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name">Contact Name</Label>
                    <Input
                      id="name"
                      value={editedVendor.name}
                      onChange={(e) => setEditedVendor({...editedVendor, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="business_name">Business Name (Optional)</Label>
                    <Input
                      id="business_name"
                      value={editedVendor.business_name || ''}
                      onChange={(e) => setEditedVendor({...editedVendor, business_name: e.target.value})}
                      placeholder="Leave blank if same as contact name"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold">{displayName}</h2>
                  {editedVendor.business_name && editedVendor.name !== editedVendor.business_name && (
                    <p className="text-muted-foreground">Contact: {editedVendor.name}</p>
                  )}
                </>
              )}
              
              <div className="flex items-center mt-2 space-x-2">
                {isEditing ? (
                  <Select 
                    value={editedVendor.category} 
                    onValueChange={(value) => setEditedVendor({...editedVendor, category: value})}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {vendorCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {editedVendor.category.charAt(0).toUpperCase() + editedVendor.category.slice(1)}
                  </Badge>
                )}
                
                {editedVendor.is_preferred && (
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    Preferred Vendor
                  </Badge>
                )}
                
                {editedVendor.rating && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="ml-1 font-medium">{editedVendor.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editedVendor.phone || ''}
                    onChange={(e) => setEditedVendor({...editedVendor, phone: e.target.value})}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedVendor.email || ''}
                    onChange={(e) => setEditedVendor({...editedVendor, email: e.target.value})}
                    placeholder="vendor@example.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={editedVendor.website || ''}
                    onChange={(e) => setEditedVendor({...editedVendor, website: e.target.value})}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={editedVendor.address || ''}
                    onChange={(e) => setEditedVendor({...editedVendor, address: e.target.value})}
                    placeholder="123 Main St, City, State 12345"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {editedVendor.phone && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{editedVendor.phone}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onContact(editedVendor)}>
                      Call
                    </Button>
                  </div>
                )}
                
                {editedVendor.email && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{editedVendor.email}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open(`mailto:${editedVendor.email}`, '_blank')}
                    >
                      Email
                    </Button>
                  </div>
                )}
                
                {editedVendor.website && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="truncate">{editedVendor.website}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open(editedVendor.website, '_blank')}
                    >
                      Visit
                    </Button>
                  </div>
                )}
                
                {editedVendor.address && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{editedVendor.address}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rating & Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Rating & Preferences</h3>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rating">Rating (1-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={editedVendor.rating || ''}
                    onChange={(e) => setEditedVendor({...editedVendor, rating: parseFloat(e.target.value) || undefined})}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editedVendor.is_preferred}
                    onCheckedChange={(checked) => setEditedVendor({...editedVendor, is_preferred: checked})}
                  />
                  <Label>Preferred Vendor</Label>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {editedVendor.rating && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                    <span className="font-medium">{editedVendor.rating.toFixed(1)} / 5.0</span>
                  </div>
                )}
                {editedVendor.is_preferred && (
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    ⭐ Preferred Vendor
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notes</h3>
            
            {isEditing ? (
              <Textarea
                value={editedVendor.notes || ''}
                onChange={(e) => setEditedVendor({...editedVendor, notes: e.target.value})}
                placeholder="Add notes about this vendor..."
                rows={4}
              />
            ) : (
              <div className="bg-muted/50 p-3 rounded-lg min-h-[100px]">
                {editedVendor.notes ? (
                  <p className="text-sm">{editedVendor.notes}</p>
                ) : (
                  <p className="text-muted-foreground italic">No notes added yet.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-1" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}