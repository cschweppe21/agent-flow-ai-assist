import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BuyerCard } from "@/components/BuyerCard"
import { ListingCard } from "@/components/ListingCard"
import { 
  Users, 
  Home, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Target,
  CheckCircle
} from "lucide-react"
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from "recharts"

interface Commission {
  id: string
  amount: number
  date_earned: string
  commission_type: 'listing' | 'buying' | 'referral' | 'other'
  description?: string
  listing_id?: string
}

interface Listing {
  id: string
  address: string
  price: number
  status: 'active' | 'pending' | 'sold' | 'withdrawn'
  listing_date: string
  sale_date?: string
}

interface Buyer {
  id: string
  name: string
  email?: string
  phone?: string
  budget_min?: number
  budget_max?: number
  preferred_bedrooms?: number
  preferred_bathrooms?: number
  preferred_areas?: string[]
  status: 'active' | 'under_contract' | 'closed' | 'inactive'
  notes?: string
  created_at: string
  updated_at: string
}

interface CommissionDashboardProps {
  isOpen: boolean
  onClose: () => void
  commissions: Commission[]
  listings: Listing[]
  buyers: Buyer[]
  metrics: {
    activeBuyers: number
    activeListings: number
    thisYearCommission: number
  }
}

export const CommissionDashboard = ({ 
  isOpen, 
  onClose, 
  commissions, 
  listings, 
  buyers, 
  metrics 
}: CommissionDashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview")

  // Calculate commission data
  const currentYear = new Date().getFullYear()
  const ytdCommissions = commissions.filter(c => 
    new Date(c.date_earned).getFullYear() === currentYear
  )

  const listingCommissions = ytdCommissions.filter(c => c.commission_type === 'listing')
  const buyingCommissions = ytdCommissions.filter(c => c.commission_type === 'buying')
  
  const listingTotal = listingCommissions.reduce((sum, c) => sum + c.amount, 0)
  const buyingTotal = buyingCommissions.reduce((sum, c) => sum + c.amount, 0)

  // Monthly chart data for past 12 months
  const monthlyData = []
  for (let i = 11; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthCommissions = commissions.filter(c => {
      const commDate = new Date(c.date_earned)
      return commDate.getMonth() === date.getMonth() && 
             commDate.getFullYear() === date.getFullYear()
    })
    
    monthlyData.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      total: monthCommissions.reduce((sum, c) => sum + c.amount, 0),
      listing: monthCommissions.filter(c => c.commission_type === 'listing').reduce((sum, c) => sum + c.amount, 0),
      buying: monthCommissions.filter(c => c.commission_type === 'buying').reduce((sum, c) => sum + c.amount, 0)
    })
  }

  // Pie chart data
  const pieData = [
    { name: 'Listing Commissions', value: listingTotal, color: '#8B5CF6' },
    { name: 'Buying Commissions', value: buyingTotal, color: '#06B6D4' },
  ]

  // Active clients data
  const activeListings = listings.filter(l => l.status === 'active')
  const activeBuyerClients = buyers.filter(b => b.status === 'active')

  // Convert listings to display format
  const displayListings = activeListings.slice(0, 6).map(listing => ({
    id: listing.id,
    address: listing.address,
    price: listing.price,
    commissionRate: 3,
    status: listing.status === 'withdrawn' ? 'expired' as const : listing.status,
    daysOnMarket: listing.listing_date ? Math.ceil((Date.now() - new Date(listing.listing_date).getTime()) / (1000 * 3600 * 24)) : 0,
    lastActivity: "Recently",
    clientName: "Client"
  }))

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <DollarSign className="h-6 w-6 mr-2 text-primary" />
            Commission & Client Dashboard
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Commission Overview</TabsTrigger>
            <TabsTrigger value="clients">Active Clients</TabsTrigger>
            <TabsTrigger value="breakdown">Detailed Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 overflow-y-auto max-h-[70vh]">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-sm">
                    <DollarSign className="h-4 w-4 mr-2 text-primary" />
                    YTD Commission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    ${metrics.thisYearCommission.toLocaleString()}
                  </div>
                  <Badge variant="secondary" className="bg-success/10 text-success mt-2">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +18% vs last year
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-sm">
                    <Home className="h-4 w-4 mr-2 text-primary" />
                    Listing Commissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    ${listingTotal.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {listingCommissions.length} transactions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-primary" />
                    Buying Commissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    ${buyingTotal.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {buyingCommissions.length} transactions
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                    12-Month Commission Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#8B5CF6" 
                        strokeWidth={3}
                        dot={{ fill: '#8B5CF6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-primary" />
                    Commission Split
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6 overflow-y-auto max-h-[70vh]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Buyers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-primary" />
                      Active Buyers
                    </div>
                    <Badge variant="secondary">{metrics.activeBuyers}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {activeBuyerClients.slice(0, 6).map((buyer) => (
                    <BuyerCard 
                      key={buyer.id} 
                      buyer={buyer}
                      onViewProfile={() => {}}
                    />
                  ))}
                  {activeBuyerClients.length > 6 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{activeBuyerClients.length - 6} more buyers
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Active Listings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Home className="h-5 w-5 mr-2 text-primary" />
                      Active Listings
                    </div>
                    <Badge variant="secondary">{metrics.activeListings}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {displayListings.map((listing) => (
                    <ListingCard key={listing.id} {...listing} />
                  ))}
                  {activeListings.length > 6 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{activeListings.length - 6} more listings
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-6 overflow-y-auto max-h-[70vh]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Monthly Commission Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={monthlyData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                    <Bar dataKey="listing" stackId="a" fill="#8B5CF6" name="Listing" />
                    <Bar dataKey="buying" stackId="a" fill="#06B6D4" name="Buying" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                    Recent Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-64 overflow-y-auto">
                  {ytdCommissions.slice(0, 8).map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {commission.commission_type === 'listing' ? 'Listing Sale' : 'Buyer Purchase'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(commission.date_earned).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-success">
                          ${commission.amount.toLocaleString()}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {commission.commission_type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-primary" />
                    Performance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Transactions</span>
                    <span className="font-semibold text-foreground">{ytdCommissions.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Commission</span>
                    <span className="font-semibold text-foreground">
                      ${Math.round(metrics.thisYearCommission / ytdCommissions.length || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Best Month</span>
                    <span className="font-semibold text-foreground">
                      {monthlyData.reduce((best, month) => 
                        month.total > best.total ? month : best, monthlyData[0]
                      )?.month || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Commission Rate</span>
                    <span className="font-semibold text-foreground">
                      {((listingTotal + buyingTotal) / (listings.filter(l => l.status === 'sold').reduce((sum, l) => sum + l.price, 0) || 1) * 100).toFixed(2)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}