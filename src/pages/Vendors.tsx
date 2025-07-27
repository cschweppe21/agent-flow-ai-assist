import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "@/components/Header"
import { VendorCard } from "@/components/VendorCard"
import { VendorProfile } from "@/components/VendorProfile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/components/AuthProvider"
import { useToast } from "@/hooks/use-toast"
import { 
  Plus, 
  Search, 
  Filter,
  Users,
  Building,
  Gavel,
  Camera,
  Hammer,
  FileText,
  Shield,
  Calculator,
  Home,
  Star,
  ArrowLeft,
  Sparkles
} from "lucide-react"
import { ManualAddDialog } from "@/components/ManualAddDialog"

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

const vendorCategories = [
  {
    id: 'transaction',
    name: 'Transaction Services',
    icon: FileText,
    color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    types: [
      { value: 'attorney', label: 'Real Estate Attorney', icon: '⚖️' },
      { value: 'appraiser', label: 'Appraiser', icon: '📊' },
      { value: 'inspector', label: 'Home Inspector', icon: '🔍' },
      { value: 'insurance', label: 'Insurance Agent', icon: '🛡️' }
    ]
  },
  {
    id: 'financing',
    name: 'Financing & Lending',
    icon: Building,
    color: 'bg-green-500/10 text-green-700 dark:text-green-300',
    types: [
      { value: 'lender', label: 'Mortgage Lender', icon: '🏦' }
    ]
  },
  {
    id: 'improvement',
    name: 'Property Services',
    icon: Hammer,
    color: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
    types: [
      { value: 'contractor', label: 'General Contractor', icon: '🔨' },
      { value: 'stager', label: 'Home Stager', icon: '🏠' },
      { value: 'photographer', label: 'Real Estate Photographer', icon: '📸' }
    ]
  },
  {
    id: 'other',
    name: 'Other Services',
    icon: Users,
    color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
    types: [
      { value: 'other', label: 'Other Service Provider', icon: '🔧' }
    ]
  }
]

const Vendors = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showPreferredOnly, setShowPreferredOnly] = useState(false)
  const { toast } = useToast()

  // New vendor form state
  const [newVendor, setNewVendor] = useState({
    name: "",
    business_name: "",
    category: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    notes: "",
    rating: "",
    is_preferred: false
  })

  useEffect(() => {
    fetchVendors()
  }, [])

  useEffect(() => {
    filterVendors()
  }, [vendors, searchTerm, selectedCategory, showPreferredOnly])

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      setVendors(data || [])
    } catch (error) {
      console.error('Error fetching vendors:', error)
      toast({
        title: "Error",
        description: "Failed to load vendors.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filterVendors = () => {
    let filtered = vendors

    if (searchTerm) {
      filtered = filtered.filter(vendor => 
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vendor.business_name && vendor.business_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        vendor.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(vendor => vendor.category === selectedCategory)
    }

    if (showPreferredOnly) {
      filtered = filtered.filter(vendor => vendor.is_preferred)
    }

    setFilteredVendors(filtered)
  }

  const handleAddVendor = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add vendors.",
        variant: "destructive"
      })
      return
    }

    try {
      const vendorData = {
        user_id: user.id,
        name: newVendor.name,
        business_name: newVendor.business_name || null,
        category: newVendor.category,
        phone: newVendor.phone || null,
        email: newVendor.email || null,
        website: newVendor.website || null,
        address: newVendor.address || null,
        notes: newVendor.notes || null,
        rating: newVendor.rating ? parseFloat(newVendor.rating) : null,
        is_preferred: newVendor.is_preferred
      }

      const { data, error } = await supabase
        .from('vendors')
        .insert(vendorData)
        .select()
        .single()

      if (error) throw error

      setVendors([...vendors, data])
      setShowAddDialog(false)
      setNewVendor({
        name: "",
        business_name: "",
        category: "",
        phone: "",
        email: "",
        website: "",
        address: "",
        notes: "",
        rating: "",
        is_preferred: false
      })

      toast({
        title: "Vendor Added",
        description: "New vendor has been added successfully.",
      })
    } catch (error) {
      console.error('Error adding vendor:', error)
      toast({
        title: "Error",
        description: "Failed to add vendor.",
        variant: "destructive"
      })
    }
  }

  const getVendorsByCategory = (categoryId: string) => {
    const category = vendorCategories.find(cat => cat.id === categoryId)
    if (!category) return []
    
    const categoryTypes = category.types.map(type => type.value)
    return filteredVendors.filter(vendor => categoryTypes.includes(vendor.category))
  }

  const getVendorTypeLabel = (categoryValue: string) => {
    for (const category of vendorCategories) {
      const type = category.types.find(t => t.value === categoryValue)
      if (type) return type.label
    }
    return categoryValue.charAt(0).toUpperCase() + categoryValue.slice(1)
  }

  const getVendorStats = () => {
    const total = vendors.length
    const preferred = vendors.filter(v => v.is_preferred).length
    const categories = [...new Set(vendors.map(v => v.category))].length
    const avgRating = vendors.filter(v => v.rating).reduce((acc, v) => acc + (v.rating || 0), 0) / vendors.filter(v => v.rating).length
    
    return { total, preferred, categories, avgRating: avgRating || 0 }
  }

  const stats = getVendorStats()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Professional Vendors</h1>
              <p className="text-muted-foreground">Manage your trusted network of real estate professionals</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <ManualAddDialog type="vendor" onSuccess={fetchVendors}>
                <Button variant="hero" className="shadow-elevated">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vendor
                </Button>
              </ManualAddDialog>
              
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="shadow-elevated"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-card bg-gradient-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Vendors</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Preferred</p>
                  <p className="text-2xl font-bold">{stats.preferred}</p>
                </div>
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Categories</p>
                  <p className="text-2xl font-bold">{stats.categories}</p>
                </div>
                <Filter className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8 shadow-card bg-gradient-card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search vendors by name, business, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {vendorCategories.map(category => (
                    <div key={category.id}>
                      {category.types.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <span className="flex items-center">
                            <span className="mr-2">{type.icon}</span>
                            {type.label}
                          </span>
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showPreferredOnly}
                  onCheckedChange={setShowPreferredOnly}
                />
                <Label>Preferred Only</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vendors by Category */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading vendors...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {vendorCategories.map(category => {
              const categoryVendors = getVendorsByCategory(category.id)
              if (categoryVendors.length === 0 && (selectedCategory !== "all" && !category.types.some(t => t.value === selectedCategory))) {
                return null
              }

              return (
                <Card key={category.id} className="shadow-card bg-gradient-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <category.icon className="h-5 w-5 mr-2 text-primary" />
                      {category.name}
                      <Badge variant="secondary" className={`ml-2 ${category.color}`}>
                        {categoryVendors.length} vendors
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {categoryVendors.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categoryVendors.map(vendor => (
                          <VendorCard
                            key={vendor.id}
                            vendor={vendor}
                            onViewProfile={(vendor) => setSelectedVendor(vendor)}
                            onContact={(vendor) => {
                              if (vendor.phone) {
                                window.open(`tel:${vendor.phone}`, '_self')
                              }
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <category.icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">No {category.name.toLowerCase()} vendors yet</p>
                        <ManualAddDialog type="vendor" onSuccess={fetchVendors}>
                          <Button
                            variant="outline"
                            className="text-xs"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add {category.name} Vendor
                          </Button>
                        </ManualAddDialog>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}

            {filteredVendors.length === 0 && !loading && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No vendors found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedCategory !== "all" || showPreferredOnly
                    ? "Try adjusting your filters or search terms"
                    : "Start building your professional network by adding your first vendor"}
                </p>
                <ManualAddDialog type="vendor" onSuccess={fetchVendors}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Vendor
                  </Button>
                </ManualAddDialog>
              </div>
            )}
          </div>
        )}

        {/* Vendor Profile Modal */}
        {selectedVendor && (
          <VendorProfile
            vendor={selectedVendor}
            isOpen={!!selectedVendor}
            onClose={() => setSelectedVendor(null)}
            onSave={(updatedVendor) => {
              setVendors(prev => prev.map(v => v.id === updatedVendor.id ? updatedVendor : v))
              setSelectedVendor(updatedVendor)
              toast({
                title: "Vendor Updated",
                description: "Vendor information has been updated successfully.",
              })
            }}
            onContact={(vendor) => {
              if (vendor.phone) {
                window.open(`tel:${vendor.phone}`, '_self')
              }
            }}
            onDelete={(vendorId) => {
              setVendors(prev => prev.filter(v => v.id !== vendorId))
              setSelectedVendor(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default Vendors