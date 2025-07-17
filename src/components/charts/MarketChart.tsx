import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Listing } from '@/hooks/useDashboardData';

interface MarketChartProps {
  listings: Listing[];
  onClose: () => void;
}

export const MarketChart = ({ listings, onClose }: MarketChartProps) => {
  const soldListings = listings.filter(l => l.status === 'sold' && l.sale_date);
  
  // Days on market distribution
  const daysOnMarketData = soldListings.map(listing => {
    const listingDate = new Date(listing.listing_date);
    const saleDate = new Date(listing.sale_date!);
    const days = Math.ceil((saleDate.getTime() - listingDate.getTime()) / (1000 * 3600 * 24));
    return { address: listing.address, days };
  });

  // Average days on market by month
  const monthlyMarketData = () => {
    const months = soldListings.reduce((acc, listing) => {
      const month = new Date(listing.sale_date!).toLocaleString('default', { month: 'short' });
      const listingDate = new Date(listing.listing_date);
      const saleDate = new Date(listing.sale_date!);
      const days = Math.ceil((saleDate.getTime() - listingDate.getTime()) / (1000 * 3600 * 24));
      
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(days);
      return acc;
    }, {} as Record<string, number[]>);

    return Object.entries(months).map(([month, days]) => ({
      month,
      avgDays: Math.round(days.reduce((sum, d) => sum + d, 0) / days.length)
    }));
  };

  // Price trends
  const priceData = soldListings
    .sort((a, b) => new Date(a.sale_date!).getTime() - new Date(b.sale_date!).getTime())
    .map(listing => ({
      date: new Date(listing.sale_date!).toLocaleDateString(),
      price: listing.price
    }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl h-[600px] bg-card border-border shadow-elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Market Performance</CardTitle>
            <button 
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>
        </CardHeader>
        <CardContent className="h-full">
          <Tabs defaultValue="days" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="days">Days on Market</TabsTrigger>
              <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
              <TabsTrigger value="prices">Price Trends</TabsTrigger>
            </TabsList>
            
            <TabsContent value="days" className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={daysOnMarketData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="address" tick={false} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} days`, 'Days on Market']} />
                  <Bar dataKey="days" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="monthly" className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyMarketData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} days`, 'Avg Days on Market']} />
                  <Line type="monotone" dataKey="avgDays" stroke="hsl(var(--warning))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="prices" className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Sale Price']} />
                  <Line type="monotone" dataKey="price" stroke="hsl(var(--success))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};