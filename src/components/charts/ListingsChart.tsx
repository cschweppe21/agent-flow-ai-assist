import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { Listing } from '@/hooks/useDashboardData';

interface ListingsChartProps {
  listings: Listing[];
  onClose: () => void;
}

const STATUS_COLORS = {
  'active': 'hsl(var(--listing-active))',
  'pending': 'hsl(var(--listing-pending))',
  'sold': 'hsl(var(--listing-sold))',
  'withdrawn': 'hsl(var(--listing-expired))'
};

export const ListingsChart = ({ listings, onClose }: ListingsChartProps) => {
  const [activeView, setActiveView] = useState<'overview' | 'trends' | 'performance'>('overview');

  // Calculate key metrics
  const totalValue = listings.reduce((sum, l) => sum + l.price, 0);
  const avgPrice = totalValue / listings.length || 0;
  const activeListings = listings.filter(l => l.status === 'active').length;
  const soldListings = listings.filter(l => l.status === 'sold').length;
  const conversionRate = listings.length > 0 ? (soldListings / listings.length * 100) : 0;

  // Status distribution data
  const statusData = [
    { name: 'Active', value: listings.filter(l => l.status === 'active').length, color: STATUS_COLORS.active },
    { name: 'Pending', value: listings.filter(l => l.status === 'pending').length, color: STATUS_COLORS.pending },
    { name: 'Sold', value: listings.filter(l => l.status === 'sold').length, color: STATUS_COLORS.sold },
    { name: 'Withdrawn', value: listings.filter(l => l.status === 'withdrawn').length, color: STATUS_COLORS.withdrawn }
  ].filter(item => item.value > 0);

  // Monthly trends with cumulative data
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const month = date.toLocaleString('default', { month: 'short' });
    
    const monthListings = listings.filter(l => {
      const listingDate = new Date(l.listing_date);
      return listingDate.getMonth() === date.getMonth() && 
             listingDate.getFullYear() === date.getFullYear();
    });
    
    return {
      month,
      new: monthListings.length,
      sold: monthListings.filter(l => l.status === 'sold').length,
      avgPrice: monthListings.length > 0 ? 
        monthListings.reduce((sum, l) => sum + l.price, 0) / monthListings.length : 0
    };
  });

  // Price performance data
  const priceRanges = [
    { range: 'Under $500K', count: listings.filter(l => l.price < 500000).length, 
      avg: listings.filter(l => l.price < 500000).reduce((sum, l) => sum + l.price, 0) / listings.filter(l => l.price < 500000).length || 0 },
    { range: '$500K - $1M', count: listings.filter(l => l.price >= 500000 && l.price < 1000000).length,
      avg: listings.filter(l => l.price >= 500000 && l.price < 1000000).reduce((sum, l) => sum + l.price, 0) / listings.filter(l => l.price >= 500000 && l.price < 1000000).length || 0 },
    { range: '$1M - $2M', count: listings.filter(l => l.price >= 1000000 && l.price < 2000000).length,
      avg: listings.filter(l => l.price >= 1000000 && l.price < 2000000).reduce((sum, l) => sum + l.price, 0) / listings.filter(l => l.price >= 1000000 && l.price < 2000000).length || 0 },
    { range: 'Over $2M', count: listings.filter(l => l.price >= 2000000).length,
      avg: listings.filter(l => l.price >= 2000000).reduce((sum, l) => sum + l.price, 0) / listings.filter(l => l.price >= 2000000).length || 0 }
  ].filter(item => item.count > 0);

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-card p-4 rounded-lg border border-border">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Listings</p>
                    <p className="text-2xl font-bold text-foreground">{listings.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-card p-4 rounded-lg border border-border">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Price</p>
                    <p className="text-2xl font-bold text-foreground">${(avgPrice / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-card p-4 rounded-lg border border-border">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-warning" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold text-foreground">{activeListings}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-card p-4 rounded-lg border border-border">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold text-foreground">{conversionRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Distribution Chart */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Listing Status Distribution</h3>
                <div className="flex space-x-2">
                  {statusData.map((item, index) => (
                    <Badge key={item.name} variant="outline" className="text-xs">
                      <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: item.color }}></div>
                      {item.name}: {item.value}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} listings`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case 'trends':
        return (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">6-Month Listing Trends</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="new" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      name="New Listings"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sold" 
                      stroke="hsl(var(--success))" 
                      strokeWidth={3}
                      name="Sold"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Price Range Performance</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priceRanges}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value, name) => [
                        name === 'count' ? `${value} listings` : `$${(Number(value) / 1000).toFixed(0)}K avg`,
                        name === 'count' ? 'Listings' : 'Avg Price'
                      ]}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-5xl h-[700px] bg-card border-border shadow-elevated">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-foreground">Active Listings Analytics</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Comprehensive insights into your property portfolio</p>
            </div>
            <button 
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-2"
            >
              ✕
            </button>
          </div>
          <div className="flex space-x-2 mt-4">
            <Button
              variant={activeView === 'overview' ? 'default' : 'outline'}
              onClick={() => setActiveView('overview')}
              size="sm"
              className="text-xs"
            >
              <PieChartIcon className="h-4 w-4 mr-1" />
              Overview
            </Button>
            <Button
              variant={activeView === 'trends' ? 'default' : 'outline'}
              onClick={() => setActiveView('trends')}
              size="sm"
              className="text-xs"
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Trends
            </Button>
            <Button
              variant={activeView === 'performance' ? 'default' : 'outline'}
              onClick={() => setActiveView('performance')}
              size="sm"
              className="text-xs"
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Performance
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 h-[580px] overflow-y-auto">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};