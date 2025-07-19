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
import { OverdueTasksChart } from "./charts/OverdueTasksChart"
import { useMockDashboardData as useDashboardData } from "@/hooks/useMockDashboardData"
import { 
  Home, 
  DollarSign, 
  Calendar, 
  AlertTriangle, 
  Plus, 
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  Bot,
  MessageSquare,
  Phone
} from "lucide-react"
import { AIModal } from "@/components/AIModal"

export const Dashboard = () => {
  const { listings, commissions, tasks, loading, error, metrics } = useDashboardData()
  const [activeChart, setActiveChart] = useState<'listings' | 'commissions' | 'tasks' | 'market' | null>(null)
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div onClick={() => setActiveChart('listings')} className="cursor-pointer">
          <MetricsCard
            title="Active Listings"
            value={metrics.activeListings}
            icon={<Home />}
            trend={{ value: 8, isPositive: true }}
          />
        </div>
        <div onClick={() => setActiveChart('commissions')} className="cursor-pointer">
          <MetricsCard
            title="Total Commission"
            value={`$${metrics.thisYearCommission.toLocaleString()}`}
            icon={<DollarSign />}
            trend={{ value: 15, isPositive: true }}
          />
        </div>
        <div onClick={() => setActiveChart('market')} className="cursor-pointer">
          <MetricsCard
            title="Avg. Days on Market"
            value={metrics.avgDaysOnMarket || 'N/A'}
            icon={<Calendar />}
            trend={{ value: -5, isPositive: true }}
          />
        </div>
        <div onClick={() => setActiveChart('tasks')} className="cursor-pointer">
          <MetricsCard
            title="Overdue Tasks"
            value={metrics.overdueTasks}
            icon={<AlertTriangle />}
            variant={metrics.overdueTasks > 0 ? "warning" : "default"}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Listings */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-foreground">Active Listings</h3>
            <div className="flex items-center space-x-3">
              <AIModal initialMessage="I'd like help managing my active listings. Can you provide insights and suggestions for improving my current active listings performance?">
                <Button variant="outline" className="shadow-elevated">
                  <Bot className="h-4 w-4 mr-2" />
                  AI Listing Assistant
                </Button>
              </AIModal>
              <Button variant="hero" className="shadow-elevated">
                <Plus className="h-4 w-4 mr-2" />
                Add Listing
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            {displayListings.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Manage Clients
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Phone className="h-4 w-4 mr-2" />
                Contact Vendor
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="h-4 w-4 mr-2" />
                Track Commission
              </Button>
              <AIModal>
                <Button variant="outline" className="w-full justify-start">
                  <Bot className="h-4 w-4 mr-2" />
                  AI Assistant
                </Button>
              </AIModal>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                Upcoming Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">{task.title}</p>
                      <p className="text-xs text-muted-foreground">Client: {task.client}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={task.overdue ? "destructive" : "secondary"} className="text-xs">
                        {task.overdue ? <Clock className="h-3 w-3 mr-1" /> : null}
                        {task.dueDate}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-primary hover:bg-primary/10">
                View All Tasks
              </Button>
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
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg. Home Price</span>
                  <span className="font-semibold text-foreground">$1.2M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Market Trend</span>
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +5.2%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Days on Market</span>
                  <span className="font-semibold text-foreground">32 days</span>
                </div>
              </div>
              <Button variant="ghost" className="w-full mt-4 text-primary hover:bg-primary/10">
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
      {activeChart === 'tasks' && (
        <OverdueTasksChart tasks={tasks} onClose={() => setActiveChart(null)} />
      )}
      {activeChart === 'market' && (
        <DaysOnMarketChart listings={listings} onClose={() => setActiveChart(null)} />
      )}
    </div>
  )
}