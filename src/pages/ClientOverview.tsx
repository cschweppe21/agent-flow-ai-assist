import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "@/components/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionHistory } from "@/components/TransactionHistory"
import { RelationshipManagement } from "@/components/RelationshipManagement"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/components/AuthProvider"
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Phone, 
  Mail, 
  Calendar, 
  Star, 
  Heart,
  FileText,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from "lucide-react"

interface PastClient {
  id: string
  name: string
  email?: string
  phone?: string
  status: string
  notes?: string
  created_at: string
  updated_at: string
  total_commission: number
  total_transactions: number
  last_transaction_date?: string
}

const ClientOverview = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [pastClients, setPastClients] = useState<PastClient[]>([])
  const [activeClients, setActiveClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchClientData = async () => {
      try {
        // Fetch past clients (closed/inactive buyers)
        const { data: pastClientsData, error: pastError } = await supabase
          .from('past_clients')
          .select('*')
          .eq('user_id', user.id)
          .order('last_transaction_date', { ascending: false, nullsFirst: false })

        if (pastError) throw pastError

        // Fetch active clients  
        const { data: activeClientsData, error: activeError } = await supabase
          .from('buyers')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (activeError) throw activeError

        setPastClients(pastClientsData || [])
        setActiveClients(activeClientsData || [])
      } catch (error) {
        console.error('Error fetching client data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchClientData()
  }, [user])

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

  const totalCommissionEarned = pastClients.reduce((sum, client) => sum + client.total_commission, 0)
  const totalTransactions = pastClients.reduce((sum, client) => sum + client.total_transactions, 0)
  
  // Calculate additional metrics
  const avgCommissionPerClient = pastClients.length > 0 ? totalCommissionEarned / pastClients.length : 0
  const avgTransactionsPerClient = pastClients.length > 0 ? totalTransactions / pastClients.length : 0

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Client Overview</h1>
              <p className="text-muted-foreground">Manage your active and past clients</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="shadow-elevated"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Active Clients</p>
                  <p className="text-xl font-bold text-primary">{activeClients.length}</p>
                </div>
                <Users className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Past Clients</p>
                  <p className="text-xl font-bold text-success">{pastClients.length}</p>
                </div>
                <Star className="h-6 w-6 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Commission</p>
                  <p className="text-xl font-bold text-success">${totalCommissionEarned.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Estimated</p>
                </div>
                <DollarSign className="h-6 w-6 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Avg Per Client</p>
                  <p className="text-xl font-bold text-warning">${avgCommissionPerClient.toLocaleString()}</p>
                </div>
                <Target className="h-6 w-6 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Deals</p>
                  <p className="text-xl font-bold text-primary">{totalTransactions}</p>
                </div>
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Avg Deals</p>
                  <p className="text-xl font-bold text-warning">{avgTransactionsPerClient.toFixed(1)}</p>
                </div>
                <Activity className="h-6 w-6 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="relationships" className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Relationships</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Active Clients */}
              <Card className="shadow-card bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground text-lg">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    Active Clients ({activeClients.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeClients.length > 0 ? (
                    <div className="space-y-4">
                      {activeClients.slice(0, 8).map((client) => (
                        <div key={client.id} className="p-4 bg-background/50 rounded-lg border border-border/50 hover:bg-background/70 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-foreground">{client.name}</h4>
                              <Badge variant="secondary" className="text-xs mt-1">
                                {client.status.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              {new Date(client.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="space-y-1 text-sm">
                            {client.email && (
                              <div className="flex items-center text-muted-foreground">
                                <Mail className="h-3 w-3 mr-2" />
                                {client.email}
                              </div>
                            )}
                            {client.phone && (
                              <div className="flex items-center text-muted-foreground">
                                <Phone className="h-3 w-3 mr-2" />
                                {client.phone}
                              </div>
                            )}
                            {client.budget_max && (
                              <div className="text-success font-medium">
                                Budget: ${(client.budget_max / 1000).toFixed(0)}K
                              </div>
                            )}
                            {client.preferred_areas && client.preferred_areas.length > 0 && (
                              <div className="text-muted-foreground">
                                Areas: {client.preferred_areas.slice(0, 2).join(', ')}
                                {client.preferred_areas.length > 2 && ` +${client.preferred_areas.length - 2} more`}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {activeClients.length > 8 && (
                        <p className="text-sm text-muted-foreground text-center">
                          And {activeClients.length - 8} more active clients...
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No active clients yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Past Clients */}
              <Card className="shadow-card bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground text-lg">
                    <Star className="h-5 w-5 mr-2 text-success" />
                    Past Clients ({pastClients.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pastClients.length > 0 ? (
                    <div className="space-y-4">
                      {pastClients.slice(0, 8).map((client) => (
                        <div key={client.id} className="p-4 bg-background/50 rounded-lg border border-border/50 hover:bg-background/70 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-foreground">{client.name}</h4>
                              <Badge variant="outline" className="text-xs mt-1">
                                {client.status.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="text-right text-sm">
                              <div className="font-semibold text-success flex items-center">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                ${client.total_commission.toLocaleString()}
                              </div>
                              <div className="text-muted-foreground">
                                {client.total_transactions} deal{client.total_transactions !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-1 text-sm">
                            {client.email && (
                              <div className="flex items-center text-muted-foreground">
                                <Mail className="h-3 w-3 mr-2" />
                                {client.email}
                              </div>
                            )}
                            {client.phone && (
                              <div className="flex items-center text-muted-foreground">
                                <Phone className="h-3 w-3 mr-2" />
                                {client.phone}
                              </div>
                            )}
                            {client.last_transaction_date && (
                              <div className="text-muted-foreground flex items-center">
                                <Calendar className="h-3 w-3 mr-2" />
                                Last: {new Date(client.last_transaction_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          {client.notes && (
                            <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                              {client.notes.length > 80 
                                ? `${client.notes.substring(0, 80)}...` 
                                : client.notes
                              }
                            </div>
                          )}
                        </div>
                      ))}
                      {pastClients.length > 8 && (
                        <p className="text-sm text-muted-foreground text-center">
                          And {pastClients.length - 8} more past clients...
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">No completed transactions yet</p>
                      <p className="text-xs text-muted-foreground">
                        Use the Smart AI Helper to close client deals and they'll appear here
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionHistory />
          </TabsContent>

          <TabsContent value="relationships">
            <RelationshipManagement />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="shadow-card bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Commission Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">
                    ${totalCommissionEarned.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total estimated commission earned
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Client Retention</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {pastClients.length > 0 ? ((pastClients.filter(c => c.total_transactions > 1).length / pastClients.length) * 100).toFixed(0) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Clients with repeat business
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">
                    ${activeClients.reduce((sum, client) => sum + (client.budget_max || 0), 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total active client budgets
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-card bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-background/50 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Top Performing Areas</h4>
                    <div className="space-y-2">
                      {Object.entries(
                        activeClients
                          .flatMap(client => client.preferred_areas || [])
                          .reduce((acc: {[key: string]: number}, area) => {
                            acc[area] = (acc[area] || 0) + 1;
                            return acc;
                          }, {})
                      )
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .slice(0, 5)
                        .map(([area, count]) => (
                          <div key={area} className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">{area}</span>
                            <Badge variant="outline">{count as number} client{(count as number) !== 1 ? 's' : ''}</Badge>
                          </div>
                        ))
                      }
                    </div>
                  </div>

                  <div className="p-4 bg-background/50 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Budget Distribution</h4>
                    <div className="space-y-2">
                      {[
                        { range: 'Under $500K', count: activeClients.filter(c => (c.budget_max || 0) < 500000).length },
                        { range: '$500K - $1M', count: activeClients.filter(c => (c.budget_max || 0) >= 500000 && (c.budget_max || 0) < 1000000).length },
                        { range: '$1M+', count: activeClients.filter(c => (c.budget_max || 0) >= 1000000).length }
                      ].map(({ range, count }) => (
                        <div key={range} className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{range}</span>
                          <Badge variant="outline">{count} client{count !== 1 ? 's' : ''}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ClientOverview