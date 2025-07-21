import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, Mail, Globe, Star, MapPin } from "lucide-react"

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

interface VendorCardProps {
  vendor: Vendor
  onViewProfile: (vendor: Vendor) => void
  onContact: (vendor: Vendor) => void
}

const getCategoryColor = (category: string) => {
  const colors = {
    inspector: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    appraiser: "bg-green-500/10 text-green-700 dark:text-green-300",
    lender: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
    contractor: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
    photographer: "bg-pink-500/10 text-pink-700 dark:text-pink-300",
    stager: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
    attorney: "bg-red-500/10 text-red-700 dark:text-red-300",
    insurance: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
    other: "bg-purple-500/10 text-purple-700 dark:text-purple-300"
  }
  return colors[category as keyof typeof colors] || "bg-muted/50 text-muted-foreground"
}

const getCategoryIcon = (category: string) => {
  // Return appropriate icons for each category
  switch (category) {
    case 'inspector': return '🔍'
    case 'appraiser': return '📊'
    case 'lender': return '🏦'
    case 'contractor': return '🔨'
    case 'photographer': return '📸'
    case 'stager': return '🏠'
    case 'attorney': return '⚖️'
    case 'insurance': return '🛡️'
    case 'other': return '🔧'
    default: return '👤'
  }
}

export const VendorCard = ({ vendor, onViewProfile, onContact }: VendorCardProps) => {
  const displayName = vendor.business_name || vendor.name

  return (
    <Card className="shadow-card bg-gradient-card border-border/50 hover-scale">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center text-foreground text-lg">
              <span className="mr-2">{getCategoryIcon(vendor.category)}</span>
              {displayName}
              {vendor.is_preferred && (
                <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">
                  Preferred
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center mt-1">
              <Badge 
                variant="secondary" 
                className={`text-xs ${getCategoryColor(vendor.category)}`}
              >
                {vendor.category.charAt(0).toUpperCase() + vendor.category.slice(1)}
              </Badge>
              {vendor.rating && (
                <div className="flex items-center ml-2">
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium ml-1">{vendor.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {vendor.business_name && vendor.name !== vendor.business_name && (
          <div className="text-sm text-muted-foreground">
            Contact: {vendor.name}
          </div>
        )}
        
        {vendor.address && (
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1" />
            {vendor.address}
          </div>
        )}

        <div className="flex items-center space-x-2">
          {vendor.phone && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onContact(vendor)}
              className="flex-1"
            >
              <Phone className="h-3 w-3 mr-1" />
              Call
            </Button>
          )}
          {vendor.email && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`mailto:${vendor.email}`, '_blank')}
              className="flex-1"
            >
              <Mail className="h-3 w-3 mr-1" />
              Email
            </Button>
          )}
          {vendor.website && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(vendor.website, '_blank')}
              className="flex-1"
            >
              <Globe className="h-3 w-3 mr-1" />
              Web
            </Button>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewProfile(vendor)}
          className="w-full text-primary hover:bg-primary/10"
        >
          View Full Profile
        </Button>
      </CardContent>
    </Card>
  )
}