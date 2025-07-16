import { MetricsCard } from "@/components/MetricsCard"
import { ListingCard } from "@/components/ListingCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  MessageSquare
} from "lucide-react"
import { AIModal } from "@/components/AIModal"

export const Dashboard = () => {
  // Mock data - in real app this would come from state/API
  const mockListings = [
    {
      id: "1",
      address: "123 Oak Street, Beverly Hills",
      price: 1250000,
      commissionRate: 3,
      status: "active" as const,
      daysOnMarket: 14,
      lastActivity: "2 hours ago",
      clientName: "John Smith"
    },
    {
      id: "2",
      address: "456 Maple Avenue, Hollywood",
      price: 850000,
      commissionRate: 2.5,
      status: "pending" as const,
      daysOnMarket: 28,
      lastActivity: "1 day ago",
      clientName: "Sarah Johnson"
    },
    {
      id: "3",
      address: "789 Pine Boulevard, Malibu",
      price: 2100000,
      commissionRate: 3.5,
      status: "sold" as const,
      daysOnMarket: 45,
      lastActivity: "3 days ago",
      clientName: "Mike Wilson"
    }
  ]

  const mockTasks = [
    { id: "1", title: "Follow up with potential buyer", client: "John Smith", dueDate: "Today", overdue: false },
    { id: "2", title: "Schedule property inspection", client: "Sarah Johnson", dueDate: "Tomorrow", overdue: false },
    { id: "3", title: "Prepare listing presentation", client: "Mike Wilson", dueDate: "Yesterday", overdue: true },
    { id: "4", title: "Review contract terms", client: "Lisa Brown", dueDate: "Nov 20", overdue: true }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back, Agent!</h2>
        <p className="text-muted-foreground">Here's what's happening with your real estate business today.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricsCard
          title="Active Listings"
          value="12"
          icon={<Home />}
          trend={{ value: 8, isPositive: true }}
        />
        <MetricsCard
          title="Total Commission"
          value="$48,750"
          icon={<DollarSign />}
          trend={{ value: 15, isPositive: true }}
          variant="success"
        />
        <MetricsCard
          title="Avg. Days on Market"
          value="28"
          icon={<Calendar />}
          trend={{ value: -5, isPositive: true }}
        />
        <MetricsCard
          title="Overdue Tasks"
          value="3"
          icon={<AlertTriangle />}
          variant="warning"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Listings */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-foreground">Recent Listings</h3>
            <Button variant="hero" className="shadow-elevated">
              <Plus className="h-4 w-4 mr-2" />
              Add Listing
            </Button>
          </div>
          <div className="space-y-4">
            {mockListings.map((listing) => (
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
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Viewing
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
                {mockTasks.map((task) => (
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
    </div>
  )
}