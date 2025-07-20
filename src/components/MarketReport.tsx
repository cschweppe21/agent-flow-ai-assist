import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Home, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Users,
  Building
} from "lucide-react"
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie,
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts"

interface MarketReportProps {
  isOpen: boolean
  onClose: () => void
}

export const MarketReport = ({ isOpen, onClose }: MarketReportProps) => {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data for charts
  const priceHistoryData = [
    { month: 'Jan', medianPrice: 1150000, avgPrice: 1240000 },
    { month: 'Feb', medianPrice: 1180000, avgPrice: 1270000 },
    { month: 'Mar', medianPrice: 1200000, avgPrice: 1290000 },
    { month: 'Apr', medianPrice: 1220000, avgPrice: 1310000 },
    { month: 'May', medianPrice: 1250000, avgPrice: 1340000 },
    { month: 'Jun', medianPrice: 1280000, avgPrice: 1370000 }
  ]

  const inventoryData = [
    { month: 'Jan', listings: 450, sales: 320, inventory: 2.8 },
    { month: 'Feb', listings: 480, sales: 340, inventory: 2.9 },
    { month: 'Mar', listings: 520, sales: 380, inventory: 2.7 },
    { month: 'Apr', listings: 490, sales: 360, inventory: 2.6 },
    { month: 'May', listings: 510, sales: 390, inventory: 2.4 },
    { month: 'Jun', listings: 470, sales: 410, inventory: 2.2 }
  ]

  const marketShareData = [
    { name: 'Single Family', value: 65, color: 'hsl(var(--primary))' },
    { name: 'Condos', value: 25, color: 'hsl(var(--secondary))' },
    { name: 'Townhomes', value: 8, color: 'hsl(var(--accent))' },
    { name: 'Multi-Family', value: 2, color: 'hsl(var(--muted))' }
  ]

  const economicIndicators = [
    { metric: 'Interest Rates', current: '6.8%', change: '+0.2%', trend: 'up' },
    { metric: 'Unemployment', current: '3.2%', change: '-0.1%', trend: 'down' },
    { metric: 'Population Growth', current: '2.1%', change: '+0.3%', trend: 'up' },
    { metric: 'New Construction', current: '1,240', change: '+15%', trend: 'up' }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <BarChart3 className="h-6 w-6 mr-2 text-primary" />
            Market Analysis Report
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="prices">Price Trends</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="economic">Economic Data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-card bg-gradient-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Median Price</p>
                      <p className="text-2xl font-bold">$1.28M</p>
                      <Badge variant="secondary" className="bg-success/10 text-success mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +5.2%
                      </Badge>
                    </div>
                    <Home className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card bg-gradient-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Days on Market</p>
                      <p className="text-2xl font-bold">28</p>
                      <Badge variant="secondary" className="bg-destructive/10 text-destructive mt-1">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        -12%
                      </Badge>
                    </div>
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card bg-gradient-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Listings</p>
                      <p className="text-2xl font-bold">470</p>
                      <Badge variant="secondary" className="bg-warning/10 text-warning mt-1">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        -8%
                      </Badge>
                    </div>
                    <Building className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card bg-gradient-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Sales Volume</p>
                      <p className="text-2xl font-bold">410</p>
                      <Badge variant="secondary" className="bg-success/10 text-success mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +18%
                      </Badge>
                    </div>
                    <Activity className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-card bg-gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-primary" />
                    Property Type Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPieChart>
                      <Pie
                        dataKey="value"
                        data={marketShareData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {marketShareData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-card bg-gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-primary" />
                    Key Economic Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {economicIndicators.map((indicator, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{indicator.metric}</p>
                        <p className="text-lg font-bold">{indicator.current}</p>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`
                          ${indicator.trend === 'up' 
                            ? 'bg-success/10 text-success' 
                            : 'bg-destructive/10 text-destructive'
                          }
                        `}
                      >
                        {indicator.trend === 'up' ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {indicator.change}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="prices" className="space-y-6">
            <Card className="shadow-card bg-gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Price History - Last 6 Months
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={priceHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="medianPrice" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      name="Median Price"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgPrice" 
                      stroke="hsl(var(--secondary))" 
                      strokeWidth={3}
                      name="Average Price"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <Card className="shadow-card bg-gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-primary" />
                  Inventory & Sales Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={inventoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend />
                    <Bar dataKey="listings" fill="hsl(var(--primary))" name="New Listings" />
                    <Bar dataKey="sales" fill="hsl(var(--secondary))" name="Sales" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-card bg-gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-primary" />
                  Months of Inventory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={inventoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value} months`, '']}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="inventory" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="economic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-card bg-gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-primary" />
                    Interest Rate Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-background/50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">30-Year Fixed</span>
                        <span className="text-2xl font-bold">6.8%</span>
                      </div>
                      <Badge variant="secondary" className="bg-warning/10 text-warning">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +0.2% from last month
                      </Badge>
                    </div>
                    <div className="p-4 bg-background/50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">15-Year Fixed</span>
                        <span className="text-2xl font-bold">6.1%</span>
                      </div>
                      <Badge variant="secondary" className="bg-warning/10 text-warning">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +0.1% from last month
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card bg-gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    Demographics & Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Population Growth</span>
                      <div className="text-right">
                        <span className="font-semibold">2.1%</span>
                        <Badge variant="secondary" className="bg-success/10 text-success ml-2">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Strong
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Job Growth</span>
                      <div className="text-right">
                        <span className="font-semibold">3.4%</span>
                        <Badge variant="secondary" className="bg-success/10 text-success ml-2">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Excellent
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Median Income</span>
                      <div className="text-right">
                        <span className="font-semibold">$89,500</span>
                        <Badge variant="secondary" className="bg-success/10 text-success ml-2">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +4.2%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Close Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}