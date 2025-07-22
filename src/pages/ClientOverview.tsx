import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/components/AuthProvider"
import { useToast } from "@/hooks/use-toast"
import { 
  Users, 
  DollarSign, 
  Search, 
  Filter,
  TrendingUp,
  Calendar,
  Home,
  CheckCircle,
  Target
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

interface PreviousClient {
  id: string
  name: string
  email?: string
  phone?: string
  client_type: 'buyer' | 'seller'
  property_address?: string
  transaction_date: string
  commission_amount?: number
  status: 'closed' | 'canceled'
  notes?: string
}

const ClientOverview = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState("overview")
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [previousClients, setPreviousClients] = useState<PreviousClient[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<'all' | 'buyer' | 'seller'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchCommissions()
      fetchPreviousClients()
    }
  }, [user])

  const fetchCommissions = async () => {
    try {
      const { data, error } = await supabase
        .from('commissions')
        .select('*')
        .order('date_earned', { ascending: false })

      if (error) throw error
      setCommissions(data?.map(commission => ({
        ...commission,
        commission_type: commission.commission_type as 'listing' | 'buying' | 'referral' | 'other'
      })) || [])
    } catch (error) {
      console.error('Error fetching commissions:', error)
      toast({
        title: "Error",
        description: "Failed to load commission data.",
        variant: "destructive"
      })
    }
  }

  const fetchPreviousClients = async () => {
    try {
      // Create mock data for previous clients based on closed listings and buyers
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .in('status', ['sold', 'withdrawn'])

      const { data: buyers, error: buyersError } = await supabase
        .from('buyers')
        .select('*')
        .in('status', ['closed', 'inactive'])

      if (listingsError) throw listingsError
      if (buyersError) throw buyersError

      // Convert to previous clients format
      const sellerClients: PreviousClient[] = (listings || []).map(listing => ({
        id: `listing-${listing.id}`,
        name: "Property Seller", // In real app, this would come from a client table
        client_type: 'seller' as const,
        property_address: listing.address,
        transaction_date: listing.sale_date || listing.updated_at,
        commission_amount: Math.round(listing.price * 0.03), // 3% commission estimate
        status: listing.status === 'sold' ? 'closed' as const : 'canceled' as const,
        notes: listing.description
      }))

      const buyerClients: PreviousClient[] = (buyers || []).map(buyer => ({
        id: `buyer-${buyer.id}`,
        name: buyer.name,
        email: buyer.email,
        phone: buyer.phone,
        client_type: 'buyer' as const,
        transaction_date: buyer.updated_at,
        status: buyer.status === 'closed' ? 'closed' as const : 'canceled' as const,
        notes: buyer.notes
      }))

      setPreviousClients([...sellerClients, ...buyerClients])
    } catch (error) {
      console.error('Error fetching previous clients:', error)
      toast({
        title: "Error",
        description: "Failed to load client data.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Calculate commission metrics
  const currentYear = new Date().getFullYear()
  const ytdCommissions = commissions.filter(c => 
    new Date(c.date_earned).getFullYear() === currentYear
  )

  const listingCommissions = ytdCommissions.filter(c => c.commission_type === 'listing')
  const buyingCommissions = ytdCommissions.filter(c => c.commission_type === 'buying')
  
  const listingTotal = listingCommissions.reduce((sum, c) => sum + c.amount, 0)
  const buyingTotal = buyingCommissions.reduce((sum, c) => sum + c.amount, 0)
  const totalCommissions = listingTotal + buyingTotal

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

  // Filter previous clients
  const filteredClients = previousClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.property_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || client.client_type === filterType
    return matchesSearch && matchesType
  })

  const closedClients = filteredClients.filter(c => c.status === 'closed')
  const canceledClients = filteredClients.filter(c => c.status === 'canceled')

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading client overview...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Client Overview</h1>
              <p className="text-muted-foreground">Commission tracking and previous client management</p>
            </div>
            <div className="flex items-center space-x-4">
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

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4 mr-2 text-primary" />
                YTD Commission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ${totalCommissions.toLocaleString()}
              </div>
              <Badge variant="secondary" className="bg-success/10 text-success mt-2 text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                +18% vs last year
              </Badge>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-2 text-primary" />
                Closed Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {closedClients.length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Total completed transactions
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm text-muted-foreground">
                <Home className="h-4 w-4 mr-2 text-primary" />
                Listing Sales
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

          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                Buyer Sales
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

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Commission Analytics</TabsTrigger>
            <TabsTrigger value="clients">Previous Clients</TabsTrigger>
            <TabsTrigger value="breakdown">Transaction History</TabsTrigger>
          </TabsList>

          {/* Commission Analytics Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-card bg-gradient-card border-border/50">
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

              <Card className="shadow-card bg-gradient-card border-border/50">
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

          {/* Previous Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            {/* Search and Filter */}
            <Card className="shadow-card bg-gradient-card border-border/50">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search clients, properties, or emails..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Clients</SelectItem>
                        <SelectItem value="buyer">Buyers Only</SelectItem>
                        <SelectItem value="seller">Sellers Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-card bg-gradient-card border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                      <p className="text-2xl font-bold text-foreground">{filteredClients.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-primary/60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card bg-gradient-card border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Successful Closings</p>
                      <p className="text-2xl font-bold text-success">{closedClients.length}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-success/60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card bg-gradient-card border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Canceled/Withdrawn</p>
                      <p className="text-2xl font-bold text-destructive">{canceledClients.length}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-destructive/60" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Client List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <Card key={client.id} className="shadow-card bg-gradient-card border-border/50 hover-scale">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{client.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge 
                              variant={client.client_type === 'buyer' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {client.client_type === 'buyer' ? '👥 Buyer' : '🏠 Seller'}
                            </Badge>
                            <Badge 
                              variant={client.status === 'closed' ? 'success' : 'destructive'}
                              className="text-xs"
                            >
                              {client.status === 'closed' ? '✅ Closed' : '❌ Canceled'}
                            </Badge>
                          </div>
                        </div>
                        {client.commission_amount && (
                          <div className="text-right">
                            <p className="text-sm font-semibold text-success">
                              ${client.commission_amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">Commission</p>
                          </div>
                        )}
                      </div>
                      
                      {client.property_address && (
                        <p className="text-sm text-muted-foreground mb-2">
                          📍 {client.property_address}
                        </p>
                      )}
                      
                      {(client.email || client.phone) && (
                        <div className="flex space-x-4 text-xs text-muted-foreground mb-2">
                          {client.email && <span>✉️ {client.email}</span>}
                          {client.phone && <span>📞 {client.phone}</span>}
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        Transaction Date: {new Date(client.transaction_date).toLocaleDateString()}
                      </p>
                      
                      {client.notes && (
                        <p className="text-sm text-muted-foreground mt-2 p-2 bg-background/50 rounded">
                          {client.notes.length > 100 ? `${client.notes.substring(0, 100)}...` : client.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Previous Clients Found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || filterType !== 'all' 
                      ? 'Try adjusting your search or filter criteria.' 
                      : 'Complete some transactions to see previous clients here.'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Transaction History Tab */}
          <TabsContent value="breakdown" className="space-y-6">
            <Card className="shadow-card bg-gradient-card border-border/50">
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
              <Card className="shadow-card bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                    Recent Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                  {ytdCommissions.slice(0, 8).map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {commission.commission_type === 'listing' ? 'Listing Sale' : 'Buyer Purchase'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(commission.date_earned).toLocaleDateString()}
                        </p>
                        {commission.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {commission.description}
                          </p>
                        )}
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
                  {ytdCommissions.length === 0 && (
                    <div className="text-center py-8">
                      <DollarSign className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No transactions yet this year</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-card bg-gradient-card border-border/50">
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
                      ${Math.round(totalCommissions / ytdCommissions.length || 0).toLocaleString()}
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
                    <span className="text-sm text-muted-foreground">Closed Deals</span>
                    <span className="font-semibold text-foreground">
                      {closedClients.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Success Rate</span>
                    <span className="font-semibold text-success">
                      {previousClients.length > 0 
                        ? Math.round((closedClients.length / previousClients.length) * 100)
                        : 0}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ClientOverview