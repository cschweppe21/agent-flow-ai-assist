import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { MetricsCard } from "@/components/MetricsCard"
import { ListingCard } from "@/components/ListingCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ListingsChart } from "./charts/ListingsChart"
import { CommissionChart } from "./charts/CommissionChart"
import { DaysOnMarketChart } from "./charts/DaysOnMarketChart"
import { BuyerChart } from "./charts/BuyerChart"
import { BuyerCard } from "@/components/BuyerCard"
import { SmartAddDialog } from "@/components/SmartAddDialog"
import { ManualAddDialog } from "@/components/ManualAddDialog"
import { SmartAIHelper } from "@/components/SmartAIHelper"
import { CommissionDashboard } from "@/components/CommissionDashboard"
import { useDashboardData } from "@/hooks/useDashboardData"
import { 
  Home, 
  DollarSign, 
  Calendar, 
  AlertTriangle, 
  Plus, 
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle,
  Clock,
  Bot,
  MessageSquare,
  Phone,
  Star
} from "lucide-react"
import { WeeklyTodoCalendar } from "@/components/WeeklyTodoCalendar"
import { AIModal } from "@/components/AIModal"
import { BuyerProfile } from "@/components/BuyerProfile"
import { VendorCard } from "@/components/VendorCard"
import { VendorProfile } from "@/components/VendorProfile"
import { useAuth } from "@/components/AuthProvider"
import { supabase } from "@/integrations/supabase/client"

export const Dashboard = () => {
  const { profile } = useAuth()
  const { listings, commissions, tasks, loading, error, metrics } = useDashboardData()
  const [activeChart, setActiveChart] = useState<'listings' | 'commissions' | 'buyers' | 'market' | null>(null)
  const [mainView, setMainView] = useState<'buyers' | 'listings'>('buyers')
  const [selectedBuyer, setSelectedBuyer] = useState<any>(null)
  const [selectedVendor, setSelectedVendor] = useState<any>(null)
  const [vendors, setVendors] = useState<any[]>([])
  const [loadingVendors, setLoadingVendors] = useState(true)
  const [buyers, setBuyers] = useState<any[]>([])
  
  const navigate = useNavigate()

  // Fetch vendors and buyers on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.user_id) return;

      try {
        // Fetch vendors
        const { data: vendorsData, error: vendorsError } = await supabase
          .from('vendors')
          .select('*')
          .eq('user_id', profile.user_id)
          .eq('is_preferred', true)
          .order('rating', { ascending: false, nullsFirst: false })
          .limit(5)

        if (vendorsError) throw vendorsError
        setVendors(vendorsData || [])

        // Fetch buyers
        const { data: buyersData, error: buyersError } = await supabase
          .from('buyers')
          .select('*')
          .eq('user_id', profile.user_id)
          .order('created_at', { ascending: false })

        if (buyersError) throw buyersError
        setBuyers(buyersData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoadingVendors(false)
      }
    }

    fetchData()
  }, [profile?.user_id])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-destructive">Error loading dashboard: {error}</p>
        </div>
      </div>
    )
  }

  // Convert real data to display format - only show active listings
  const displayListings = listings.filter(listing => listing.status === 'active').slice(0, 3).map(listing => ({
    id: listing.id,
    address: listing.address,
    price: listing.price,
    commissionRate: 3, // Default commission rate
    status: listing.status === 'withdrawn' ? 'expired' as const : listing.status,
    daysOnMarket: listing.listing_date ? Math.ceil((Date.now() - new Date(listing.listing_date).getTime()) / (1000 * 3600 * 24)) : 0,
    lastActivity: "Recently",
    clientName: "Client"
  }))

  const upcomingTasks = tasks.filter(task => !task.completed).slice(0, 4).map(task => ({
    id: task.id,
    title: task.title,
    client: "Client",
    dueDate: task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date",
    overdue: task.due_date ? new Date(task.due_date) < new Date() : false
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Conditionally render welcome message based on preferences */}
      <div className="mb-8" style={{ display: 'block' }} id="welcome-section">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {profile?.display_name?.split(' ')[0] || 'Agent'}!
        </h2>
        <p className="text-muted-foreground">Here's what's happening with your real estate business today.</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Buyers / Listings Toggle Section */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h3 className="text-2xl font-bold text-foreground">
                {mainView === 'buyers' ? 'Active Buyers' : 'Active Listings'}
              </h3>
              
              {/* Toggle Switch */}
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button
                  variant={mainView === 'buyers' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMainView('buyers')}
                  className="text-xs"
                >
                  <Users className="h-4 w-4 mr-1" />
                  Buyers
                </Button>
                <Button
                  variant={mainView === 'listings' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMainView('listings')}
                  className="text-xs"
                >
                  <Home className="h-4 w-4 mr-1" />
                  Listings
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {mainView === 'buyers' ? (
                <ManualAddDialog type="buyer" onSuccess={() => window.location.reload()}>
                  <Button variant="hero" className="shadow-elevated">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Buyer
                  </Button>
                </ManualAddDialog>
              ) : (
                <ManualAddDialog type="listing" onSuccess={() => window.location.reload()}>
                  <Button variant="hero" className="shadow-elevated">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Listing
                  </Button>
                </ManualAddDialog>
              )}
            </div>
          </div>
          
          {/* Content based on toggle */}
          {mainView === 'buyers' ? (
            <div className="space-y-6">
              {buyers.filter(b => b.status === 'active').length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {buyers.filter(b => b.status === 'active').slice(0, 4).map((buyer) => (
                    <BuyerCard 
                      key={buyer.id} 
                      buyer={buyer}
                      onViewProfile={(buyer) => setSelectedBuyer(buyer)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">No Active Buyers Yet</h4>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Start building your client base by adding buyer profiles. Track their preferences, budget, and communication history.
                    </p>
                    <ManualAddDialog type="buyer" onSuccess={() => window.location.reload()}>
                      <Button variant="hero" className="shadow-elevated">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Buyer
                      </Button>
                    </ManualAddDialog>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {displayListings.length > 0 ? (
                <div className="space-y-4">
                  {displayListings.map((listing) => (
                    <ListingCard key={listing.id} {...listing} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                    <Home className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">No Active Listings</h4>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Add your first property listing to start tracking market activity and managing your inventory.
                    </p>
                    <ManualAddDialog type="listing" onSuccess={() => window.location.reload()}>
                      <Button variant="hero" className="shadow-elevated">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Listing
                      </Button>
                    </ManualAddDialog>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Overview Tool */}
          <Card className="shadow-card bg-gradient-card border-border/50 cursor-pointer hover-scale" 
                onClick={() => navigate('/clients')}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-foreground text-lg">
                <Users className="h-4 w-4 mr-2 text-primary" />
                Client Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Clients</span>
                <span className="font-semibold text-foreground">{buyers.filter(b => b.status === 'active').length + metrics.activeListings}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">YTD Commission</span>
                <span className="font-semibold text-success">${metrics.thisYearCommission.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-center pt-2">
                <Badge variant="secondary" className="bg-success/10 text-success text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Click for details
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Todo Calendar */}
          <WeeklyTodoCalendar />

          {/* Vendors */}
          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground text-lg">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Preferred Vendors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loadingVendors ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="text-xs text-muted-foreground mt-2">Loading vendors...</p>
                  </div>
                ) : vendors.length > 0 ? (
                  <>
                    {vendors.slice(0, 3).map((vendor) => (
                      <div key={vendor.id} className="p-3 bg-background/50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-sm">{vendor.business_name || vendor.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{vendor.category}</p>
                          </div>
                          {vendor.rating && (
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-warning fill-current" />
                              <span className="text-xs ml-1">{vendor.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          {vendor.phone && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`tel:${vendor.phone}`, '_self')}
                              className="text-xs flex-1"
                            >
                              <Phone className="h-3 w-3 mr-1" />
                              Call
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedVendor(vendor)}
                            className="text-xs flex-1"
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="ghost" 
                      className="w-full mt-2 text-primary hover:bg-primary/10"
                      onClick={() => navigate('/vendors')}
                    >
                      View All Vendors
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">No vendors added yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/vendors')}
                      className="text-xs"
                    >
                      Add Your First Vendor
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chart Modals */}
      {activeChart === 'listings' && (
        <ListingsChart listings={listings} onClose={() => setActiveChart(null)} />
      )}
      {activeChart === 'commissions' && (
        <CommissionChart commissions={commissions} onClose={() => setActiveChart(null)} />
      )}
      {activeChart === 'buyers' && (
        <BuyerChart buyers={buyers} onClose={() => setActiveChart(null)} />
      )}
      {activeChart === 'market' && (
        <DaysOnMarketChart listings={listings} onClose={() => setActiveChart(null)} />
      )}

      {/* Buyer Profile */}
      {selectedBuyer && (
        <BuyerProfile
          buyer={selectedBuyer}
          isOpen={!!selectedBuyer}
          onClose={() => setSelectedBuyer(null)}
          onSave={(updatedBuyer) => {
            console.log('Save buyer:', updatedBuyer)
            // Don't close the profile - let user stay on it
          }}
          onContact={(buyer) => console.log('Contact buyer:', buyer.name)}
        />
      )}

      {/* Vendor Profile */}
      {selectedVendor && (
        <VendorProfile
          vendor={selectedVendor}
          isOpen={!!selectedVendor}
          onClose={() => setSelectedVendor(null)}
          onSave={(updatedVendor) => {
            // Update vendor in list
            setVendors(vendors.map(v => v.id === updatedVendor.id ? updatedVendor : v))
            setSelectedVendor(updatedVendor)
          }}
          onContact={(vendor) => {
            if (vendor.phone) {
              window.open(`tel:${vendor.phone}`, '_self')
            }
          }}
          onDelete={(vendorId) => {
            setVendors(vendors.filter(v => v.id !== vendorId))
            setSelectedVendor(null)
          }}
        />
      )}
    </div>
  )
}