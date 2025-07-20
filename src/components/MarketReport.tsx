import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
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
  Building,
  MapPin,
  RefreshCw
} from "lucide-react"
import { useMarketData } from "@/hooks/useMarketData"
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
  const [dataScope, setDataScope] = useState<'regional' | 'national'>('regional')
  const [cityInput, setCityInput] = useState('San Francisco, CA')
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [priceTimeframe, setPriceTimeframe] = useState<'1m' | '6m' | '1y' | '5y' | '10y'>('6m')
  
  // Parse city and state from input
  const parseLocation = (input: string) => {
    const parts = input.split(', ')
    return {
      city: parts[0]?.trim() || '',
      state: parts[1]?.trim() || ''
    }
  }
  
  const { city, state } = parseLocation(cityInput)
  const { data: marketData, loading, error, refreshStatus, fetchMarketData } = useMarketData(city, state)

  // Cities with automatically updated market data
  const availableCities = [
    'San Francisco, CA',
    'New York, NY', 
    'Los Angeles, CA',
    'Chicago, IL',
    'Houston, TX',
    'Boston, MA',
    'Seattle, WA',
    'Denver, CO',
    'Austin, TX',
    'Miami, FL',
    'Atlanta, GA',
    'Dallas, TX',
    'Phoenix, AZ',
    'San Diego, CA',
    'Portland, OR'
  ]

  const filteredCities = availableCities.filter(city =>
    city.toLowerCase().includes(cityInput.toLowerCase())
  ).slice(0, 12) // Show top 12 suggestions

  // Generate dynamic market data based on city input
  const generateCityData = (cityName: string) => {
    // Simple hash function to generate consistent data for same city
    const hash = cityName.toLowerCase().split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const abs = Math.abs(hash);
    const basePrice = 200000 + (abs % 1500000); // Price range 200K - 1.7M
    const priceChange = ((abs % 200) - 100) / 10; // Change range -10% to +10%
    const daysOnMarket = 15 + (abs % 50); // Days range 15-65
    const marketChange = ((abs % 100) - 50) / 5; // Change range -10% to +10%
    const activeListings = 100 + (abs % 2000); // Listings range 100-2100
    const listingsChange = ((abs % 60) - 30) / 3; // Change range -10% to +10%
    const salesVolume = Math.floor(activeListings * 0.7); // Sales volume based on listings
    const salesChange = ((abs % 80) - 40) / 2; // Change range -20% to +20%
    const pricePerSqFt = Math.floor(basePrice / 1000); // Rough calculation
    const sqftChange = ((abs % 120) - 60) / 10; // Change range -6% to +6%
    const inventory = 1.5 + ((abs % 30) / 10); // Inventory range 1.5-4.5 months
    
    let inventoryTrend = 'Balanced Market';
    if (inventory < 2.5) inventoryTrend = 'Seller\'s Market';
    if (inventory < 1.8) inventoryTrend = 'Hot Market';
    if (inventory > 3.5) inventoryTrend = 'Buyer\'s Market';

    return {
      medianPrice: `$${(basePrice / 1000).toFixed(0)}K`,
      priceChange: `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(1)}%`,
      daysOnMarket: daysOnMarket.toString(),
      marketChange: `${marketChange >= 0 ? '+' : ''}${marketChange.toFixed(1)}%`,
      activeListings: activeListings.toLocaleString(),
      listingsChange: `${listingsChange >= 0 ? '+' : ''}${listingsChange.toFixed(1)}%`,
      salesVolume: salesVolume.toLocaleString(),
      salesChange: `${salesChange >= 0 ? '+' : ''}${salesChange.toFixed(1)}%`,
      interestRate: '6.8%',
      rateChange: '+0.2%',
      pricePerSqFt: `$${pricePerSqFt}`,
      sqftChange: `${sqftChange >= 0 ? '+' : ''}${sqftChange.toFixed(1)}%`,
      inventory: inventory.toFixed(1),
      inventoryTrend
    };
  }

  // Mock data for different timeframes
  const priceData = {
    '1m': {
      data: [
        { period: 'Week 1', avgPrice: 1340000 },
        { period: 'Week 2', avgPrice: 1350000 },
        { period: 'Week 3', avgPrice: 1360000 },
        { period: 'Week 4', avgPrice: 1370000 }
      ],
      change: '+2.2%'
    },
    '6m': {
      data: [
        { period: 'Jan', avgPrice: 1240000 },
        { period: 'Feb', avgPrice: 1270000 },
        { period: 'Mar', avgPrice: 1290000 },
        { period: 'Apr', avgPrice: 1310000 },
        { period: 'May', avgPrice: 1340000 },
        { period: 'Jun', avgPrice: 1370000 }
      ],
      change: '+10.5%'
    },
    '1y': {
      data: [
        { period: 'Q1 2023', avgPrice: 1180000 },
        { period: 'Q2 2023', avgPrice: 1220000 },
        { period: 'Q3 2023', avgPrice: 1260000 },
        { period: 'Q4 2023', avgPrice: 1300000 },
        { period: 'Q1 2024', avgPrice: 1330000 },
        { period: 'Q2 2024', avgPrice: 1370000 }
      ],
      change: '+16.1%'
    },
    '5y': {
      data: [
        { period: '2020', avgPrice: 980000 },
        { period: '2021', avgPrice: 1100000 },
        { period: '2022', avgPrice: 1250000 },
        { period: '2023', avgPrice: 1300000 },
        { period: '2024', avgPrice: 1370000 }
      ],
      change: '+39.8%'
    },
    '10y': {
      data: [
        { period: '2015', avgPrice: 650000 },
        { period: '2016', avgPrice: 690000 },
        { period: '2017', avgPrice: 750000 },
        { period: '2018', avgPrice: 820000 },
        { period: '2019', avgPrice: 890000 },
        { period: '2020', avgPrice: 980000 },
        { period: '2021', avgPrice: 1100000 },
        { period: '2022', avgPrice: 1250000 },
        { period: '2023', avgPrice: 1300000 },
        { period: '2024', avgPrice: 1370000 }
      ],
      change: '+110.8%'
    }
  }

  const nationalPriceData = {
    '1m': {
      data: [
        { period: 'Week 1', avgPrice: 415000 },
        { period: 'Week 2', avgPrice: 418000 },
        { period: 'Week 3', avgPrice: 419000 },
        { period: 'Week 4', avgPrice: 420000 }
      ],
      change: '+1.2%'
    },
    '6m': {
      data: [
        { period: 'Jan', avgPrice: 405000 },
        { period: 'Feb', avgPrice: 408000 },
        { period: 'Mar', avgPrice: 412000 },
        { period: 'Apr', avgPrice: 415000 },
        { period: 'May', avgPrice: 418000 },
        { period: 'Jun', avgPrice: 420000 }
      ],
      change: '+3.7%'
    },
    '1y': {
      data: [
        { period: 'Q1 2023', avgPrice: 385000 },
        { period: 'Q2 2023', avgPrice: 392000 },
        { period: 'Q3 2023', avgPrice: 398000 },
        { period: 'Q4 2023', avgPrice: 405000 },
        { period: 'Q1 2024', avgPrice: 412000 },
        { period: 'Q2 2024', avgPrice: 420000 }
      ],
      change: '+9.1%'
    },
    '5y': {
      data: [
        { period: '2020', avgPrice: 350000 },
        { period: '2021', avgPrice: 375000 },
        { period: '2022', avgPrice: 395000 },
        { period: '2023', avgPrice: 405000 },
        { period: '2024', avgPrice: 420000 }
      ],
      change: '+20.0%'
    },
    '10y': {
      data: [
        { period: '2015', avgPrice: 280000 },
        { period: '2016', avgPrice: 295000 },
        { period: '2017', avgPrice: 310000 },
        { period: '2018', avgPrice: 325000 },
        { period: '2019', avgPrice: 340000 },
        { period: '2020', avgPrice: 350000 },
        { period: '2021', avgPrice: 375000 },
        { period: '2022', avgPrice: 395000 },
        { period: '2023', avgPrice: 405000 },
        { period: '2024', avgPrice: 420000 }
      ],
      change: '+50.0%'
    }
  }

  const currentPriceData = dataScope === 'regional' ? priceData : nationalPriceData

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

  const economicIndicators = dataScope === 'regional' ? [
    { metric: 'Interest Rates', current: '6.8%', change: '+0.2%', trend: 'up' },
    { metric: 'Unemployment', current: '3.2%', change: '-0.1%', trend: 'down' },
    { metric: 'Population Growth', current: '2.1%', change: '+0.3%', trend: 'up' },
    { metric: 'New Construction', current: '1,240', change: '+15%', trend: 'up' }
  ] : [
    { metric: 'Interest Rates', current: '6.9%', change: '+0.3%', trend: 'up' },
    { metric: 'Unemployment', current: '3.7%', change: '+0.1%', trend: 'up' },
    { metric: 'Population Growth', current: '0.8%', change: '+0.1%', trend: 'up' },
    { metric: 'New Construction', current: '1.4M', change: '+8%', trend: 'up' }
  ]

  // Use real data from the hook when available, fallback to generated data
  const displayData = marketData ? {
    medianPrice: marketData.median_home_price ? `$${(marketData.median_home_price / 1000).toFixed(0)}K` : 'N/A',
    priceChange: marketData.price_change_percent ? `${marketData.price_change_percent >= 0 ? '+' : ''}${marketData.price_change_percent.toFixed(1)}%` : 'N/A',
    daysOnMarket: marketData.days_on_market?.toString() || 'N/A',
    marketChange: '+5.2%', // Placeholder for market change calculation
    activeListings: marketData.active_listings?.toLocaleString() || 'N/A',
    listingsChange: '+2.1%', // Placeholder for listings change calculation  
    salesVolume: marketData.sales_volume?.toLocaleString() || 'N/A',
    salesChange: '+8.5%', // Placeholder for sales change calculation
    interestRate: '6.8%',
    rateChange: '+0.2%',
    pricePerSqFt: marketData.price_per_sqft ? `$${marketData.price_per_sqft}` : 'N/A',
    sqftChange: '+3.1%', // Placeholder for sqft change calculation
    inventory: marketData.inventory_months?.toFixed(1) || 'N/A',
    inventoryTrend: marketData.inventory_months ? 
      (marketData.inventory_months < 2.5 ? 'Seller\'s Market' : 
       marketData.inventory_months > 3.5 ? 'Buyer\'s Market' : 'Balanced Market') : 'N/A'
  } : (dataScope === 'regional' ? generateCityData(cityInput) : {
    medianPrice: '$420K',
    priceChange: '+3.8%',
    daysOnMarket: '35',
    marketChange: '-8%',
    activeListings: '1.2M',
    listingsChange: '-5%',
    salesVolume: '5.8M',
    salesChange: '+12%',
    interestRate: '6.9%',
    rateChange: '+0.3%',
    pricePerSqFt: '$185',
    sqftChange: '+2.9%',
    inventory: '3.1',
    inventoryTrend: 'Balanced Market'
  })

  const handleRefresh = () => {
    if (city && state) {
      fetchMarketData(city, state, true)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center text-2xl">
              <BarChart3 className="h-6 w-6 mr-2 text-primary" />
              Market Analysis Report
            </DialogTitle>
            <div className="flex items-center space-x-2">
              {dataScope === 'regional' && (
                <div className="flex items-center space-x-2 relative">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div className="relative">
                    <Input
                      placeholder="Enter city name..."
                      value={cityInput}
                      onChange={(e) => {
                        setCityInput(e.target.value)
                        setShowCitySuggestions(true)
                      }}
                      onFocus={() => setShowCitySuggestions(true)}
                      onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                      className="w-48"
                    />
                    {showCitySuggestions && filteredCities.length > 0 && cityInput.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
                        {filteredCities.map((city, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 hover:bg-muted cursor-pointer"
                            onClick={() => {
                              setCityInput(city)
                              setShowCitySuggestions(false)
                            }}
                          >
                            <span className="font-medium">{city}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <Button 
                onClick={handleRefresh} 
                disabled={loading}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button
                  variant={dataScope === 'regional' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDataScope('regional')}
                  className="text-xs"
                >
                  Regional
                </Button>
                <Button
                  variant={dataScope === 'national' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDataScope('national')}
                  className="text-xs"
                >
                  National
                </Button>
              </div>
            </div>
          </div>
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
                      <p className="text-2xl font-bold">{displayData.medianPrice}</p>
                      <Badge variant="secondary" className="bg-success/10 text-success mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {displayData.priceChange}
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
                      <p className="text-2xl font-bold">{displayData.daysOnMarket}</p>
                      <Badge variant="secondary" className="bg-destructive/10 text-destructive mt-1">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        {displayData.marketChange}
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
                      <p className="text-2xl font-bold">{displayData.activeListings}</p>
                      <Badge variant="secondary" className="bg-warning/10 text-warning mt-1">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        {displayData.listingsChange}
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
                      <p className="text-2xl font-bold">{displayData.salesVolume}</p>
                      <Badge variant="secondary" className="bg-success/10 text-success mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {displayData.salesChange}
                      </Badge>
                    </div>
                    <Activity className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6">
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
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                    Average Home Price Trends
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="secondary" 
                      className={`
                        ${currentPriceData[priceTimeframe].change.startsWith('+') 
                          ? 'bg-success/10 text-success' 
                          : 'bg-destructive/10 text-destructive'
                        }
                      `}
                    >
                      {currentPriceData[priceTimeframe].change.startsWith('+') ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {currentPriceData[priceTimeframe].change} change
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center bg-muted rounded-lg p-1 mt-4">
                  {['1m', '6m', '1y', '5y', '10y'].map((period) => (
                    <Button
                      key={period}
                      variant={priceTimeframe === period ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPriceTimeframe(period as any)}
                      className="text-xs flex-1"
                    >
                      {period === '1m' ? '1 Month' : 
                       period === '6m' ? '6 Months' :
                       period === '1y' ? '1 Year' :
                       period === '5y' ? '5 Years' : '10 Years'}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={500}>
                  <LineChart data={currentPriceData[priceTimeframe].data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis 
                      tickFormatter={(value) => 
                        dataScope === 'regional' 
                          ? `$${(value / 1000000).toFixed(1)}M`
                          : `$${(value / 1000).toFixed(0)}K`
                      } 
                    />
                    <Tooltip 
                      formatter={(value: number) => [
                        `$${value.toLocaleString()}`, 
                        'Average Home Price'
                      ]}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgPrice" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={4}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, fill: 'hsl(var(--primary))' }}
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
                        <span className="text-2xl font-bold">{dataScope === 'regional' ? '6.8%' : '6.9%'}</span>
                      </div>
                      <Badge variant="secondary" className="bg-warning/10 text-warning">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {dataScope === 'regional' ? '+0.2%' : '+0.3%'} from last month
                      </Badge>
                    </div>
                    <div className="p-4 bg-background/50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">15-Year Fixed</span>
                        <span className="text-2xl font-bold">{dataScope === 'regional' ? '6.1%' : '6.2%'}</span>
                      </div>
                      <Badge variant="secondary" className="bg-warning/10 text-warning">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {dataScope === 'regional' ? '+0.1%' : '+0.2%'} from last month
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
                        <span className="font-semibold">{dataScope === 'regional' ? '2.1%' : '0.8%'}</span>
                        <Badge variant="secondary" className="bg-success/10 text-success ml-2">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {dataScope === 'regional' ? 'Strong' : 'Moderate'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Job Growth</span>
                      <div className="text-right">
                        <span className="font-semibold">{dataScope === 'regional' ? '3.4%' : '2.1%'}</span>
                        <Badge variant="secondary" className="bg-success/10 text-success ml-2">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {dataScope === 'regional' ? 'Excellent' : 'Good'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Median Income</span>
                      <div className="text-right">
                        <span className="font-semibold">{dataScope === 'regional' ? '$89,500' : '$70,200'}</span>
                        <Badge variant="secondary" className="bg-success/10 text-success ml-2">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {dataScope === 'regional' ? '+4.2%' : '+3.1%'}
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