import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Listing } from '@/hooks/useDashboardData';

interface ListingsChartProps {
  listings: Listing[];
  onClose: () => void;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--warning))', 'hsl(var(--success))', 'hsl(var(--destructive))'];

export const ListingsChart = ({ listings, onClose }: ListingsChartProps) => {
  // Status distribution data
  const statusData = [
    { name: 'Active', value: listings.filter(l => l.status === 'active').length },
    { name: 'Pending', value: listings.filter(l => l.status === 'pending').length },
    { name: 'Sold', value: listings.filter(l => l.status === 'sold').length },
    { name: 'Withdrawn', value: listings.filter(l => l.status === 'withdrawn').length }
  ].filter(item => item.value > 0);

  // Monthly listings data
  const monthlyData = listings.reduce((acc, listing) => {
    const month = new Date(listing.listing_date).toLocaleString('default', { month: 'short' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ month, count: 1 });
    }
    return acc;
  }, [] as { month: string; count: number }[]);

  // Price range data
  const priceRanges = [
    { range: '< $500K', count: listings.filter(l => l.price < 500000).length },
    { range: '$500K - $1M', count: listings.filter(l => l.price >= 500000 && l.price < 1000000).length },
    { range: '$1M - $2M', count: listings.filter(l => l.price >= 1000000 && l.price < 2000000).length },
    { range: '> $2M', count: listings.filter(l => l.price >= 2000000).length }
  ].filter(item => item.count > 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl h-[600px] bg-card border-border shadow-elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Listings Analytics</CardTitle>
            <button 
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>
        </CardHeader>
        <CardContent className="h-full">
          <Tabs defaultValue="status" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="status">Status Distribution</TabsTrigger>
              <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
              <TabsTrigger value="price">Price Ranges</TabsTrigger>
            </TabsList>
            
            <TabsContent value="status" className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="monthly" className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="price" className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceRanges}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--success))" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};