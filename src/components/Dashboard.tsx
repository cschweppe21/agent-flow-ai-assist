import { useState } from "react"
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
import { CommissionDashboard } from "@/components/CommissionDashboard"
import { useMockDashboardData as useDashboardData } from "@/hooks/useMockDashboardData"
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
  Phone
} from "lucide-react"
import { AIModal } from "@/components/AIModal"
import { BuyerProfile } from "@/components/BuyerProfile"
import { MarketReport } from "@/components/MarketReport"

export const Dashboard = () => {
  const { listings, commissions, tasks, buyers, loading, error, metrics } = useDashboardData()
  const [activeChart, setActiveChart] = useState<'listings' | 'commissions' | 'buyers' | 'market' | null>(null)
  const [mainView, setMainView] = useState<'buyers' | 'listings'>('buyers')
  const [showCommissionDashboard, setShowCommissionDashboard] = useState(false)
  const [selectedBuyer, setSelectedBuyer] = useState<any>(null)
  const [showMarketReport, setShowMarketReport] = useState(false)
  const navigate = useNavigate()

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
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back, Agent!</h2>
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
                <>
                  <AIModal initialMessage="I'd like help managing my buyer clients. Can you suggest strategies for finding properties that match their criteria?">
                    <Button variant="outline" className="shadow-elevated">
                      <Bot className="h-4 w-4 mr-2" />
                      AI Buyer Assistant
                    </Button>
                  </AIModal>
                  <SmartAddDialog type="buyer" onSuccess={() => window.location.reload()}>
                    <Button variant="hero" className="shadow-elevated">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Buyer
                    </Button>
                  </SmartAddDialog>
                </>
              ) : (
                <>
                  <AIModal initialMessage="I'd like help managing my active listings. Can you provide insights and suggestions for improving my current active listings performance?">
                    <Button variant="outline" className="shadow-elevated">
                      <Bot className="h-4 w-4 mr-2" />
                      AI Listing Assistant
                    </Button>
                  </AIModal>
                  <SmartAddDialog type="listing" onSuccess={() => window.location.reload()}>
                    <Button variant="hero" className="shadow-elevated">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Listing
                    </Button>
                  </SmartAddDialog>
                </>
              )}
            </div>
          </div>
          
          {/* Content based on toggle */}
          {mainView === 'buyers' ? (
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
            <div className="space-y-4">
              {displayListings.map((listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Overview Tool */}
          <Card className="shadow-card bg-gradient-card border-border/50 cursor-pointer hover-scale" 
                onClick={() => setShowCommissionDashboard(true)}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-foreground text-lg">
                <Users className="h-4 w-4 mr-2 text-primary" />
                Client Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Clients</span>
                <span className="font-semibold text-foreground">{metrics.activeBuyers + metrics.activeListings}</span>
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

          {/* Market Insights */}
          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                Market Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-background/50 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted-foreground">Median Price</span>
                      <Badge variant="secondary" className="bg-success/10 text-success text-xs">
                        <TrendingUp className="h-2 w-2 mr-1" />
                        +5.2%
                      </Badge>
                    </div>
                    <span className="font-bold text-lg text-foreground">$1.28M</span>
                  </div>
                  <div className="p-3 bg-background/50 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted-foreground">Days on Market</span>
                      <Badge variant="secondary" className="bg-success/10 text-success text-xs">
                        <TrendingDown className="h-2 w-2 mr-1" />
                        -12%
                      </Badge>
                    </div>
                    <span className="font-bold text-lg text-foreground">28 days</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Listings</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-foreground">470</span>
                      <Badge variant="secondary" className="bg-warning/10 text-warning text-xs">
                        <TrendingDown className="h-2 w-2 mr-1" />
                        -8%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Sales Volume</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-foreground">410</span>
                      <Badge variant="secondary" className="bg-success/10 text-success text-xs">
                        <TrendingUp className="h-2 w-2 mr-1" />
                        +18%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Interest Rates</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-foreground">6.8%</span>
                      <Badge variant="secondary" className="bg-warning/10 text-warning text-xs">
                        <TrendingUp className="h-2 w-2 mr-1" />
                        +0.2%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Price per Sq Ft</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-foreground">$850</span>
                      <Badge variant="secondary" className="bg-success/10 text-success text-xs">
                        <TrendingUp className="h-2 w-2 mr-1" />
                        +3.1%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Inventory (Months)</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-foreground">2.2</span>
                      <Badge variant="secondary" className="bg-success/10 text-success text-xs">
                        <TrendingDown className="h-2 w-2 mr-1" />
                        Seller's Market
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                className="w-full mt-4 text-primary hover:bg-primary/10"
                onClick={() => setShowMarketReport(true)}
              >
                View Full Report
              </Button>
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

      {/* Commission Dashboard */}
      <CommissionDashboard 
        isOpen={showCommissionDashboard}
        onClose={() => setShowCommissionDashboard(false)}
        commissions={commissions}
        listings={listings}
        buyers={buyers}
        metrics={metrics}
      />

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

      {/* Market Report */}
      <MarketReport 
        isOpen={showMarketReport}
        onClose={() => setShowMarketReport(false)}
      />
    </div>
  )
}