import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, DollarSign, Home, MapPin } from 'lucide-react';
import { Buyer } from '@/components/BuyerCard';

interface BuyerChartProps {
  buyers: Buyer[];
  onClose: () => void;
}

export const BuyerChart = ({ buyers, onClose }: BuyerChartProps) => {
  const [activeView, setActiveView] = useState<'overview' | 'analysis' | 'trends'>('overview');

  // Calculate key metrics
  const activeBuyers = buyers.filter(b => b.status === 'active').length;
  const underContract = buyers.filter(b => b.status === 'under_contract').length;
  const closedDeals = buyers.filter(b => b.status === 'closed').length;
  const conversionRate = buyers.length > 0 ? ((underContract + closedDeals) / buyers.length * 100) : 0;

  const avgBudget = buyers.length > 0 ? 
    buyers.filter(b => b.budget_max).reduce((sum, b) => sum + (b.budget_max || 0), 0) / 
    buyers.filter(b => b.budget_max).length : 0;

  // Status distribution
  const statusData = [
    { 
      name: 'Active', 
      value: activeBuyers, 
      color: 'hsl(var(--listing-active))' 
    },
    { 
      name: 'Under Contract', 
      value: underContract, 
      color: 'hsl(var(--listing-pending))' 
    },
    { 
      name: 'Closed', 
      value: closedDeals, 
      color: 'hsl(var(--listing-sold))' 
    },
    { 
      name: 'Inactive', 
      value: buyers.filter(b => b.status === 'inactive').length, 
      color: 'hsl(var(--muted-foreground))' 
    }
  ].filter(item => item.value > 0);

  // Budget range analysis
  const budgetRanges = [
    { 
      range: 'Under $500K', 
      count: buyers.filter(b => (b.budget_max || 0) < 500000).length,
      color: 'hsl(var(--success))'
    },
    { 
      range: '$500K - $1M', 
      count: buyers.filter(b => (b.budget_max || 0) >= 500000 && (b.budget_max || 0) < 1000000).length,
      color: 'hsl(var(--primary))'
    },
    { 
      range: '$1M - $2M', 
      count: buyers.filter(b => (b.budget_max || 0) >= 1000000 && (b.budget_max || 0) < 2000000).length,
      color: 'hsl(var(--warning))'
    },
    { 
      range: 'Over $2M', 
      count: buyers.filter(b => (b.budget_max || 0) >= 2000000).length,
      color: 'hsl(var(--destructive))'
    }
  ].filter(item => item.count > 0);

  // Monthly trends (last 6 months)
  const trendData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const month = date.toLocaleString('default', { month: 'short' });
    
    // Simulate monthly buyer acquisition (in real app, track created_at)
    const newBuyers = Math.floor(Math.random() * 8) + 2;
    const closedDeals = Math.floor(Math.random() * 3) + 1;
    
    return {
      month,
      new: newBuyers,
      closed: closedDeals,
      active: newBuyers - closedDeals + Math.floor(Math.random() * 5)
    };
  });

  // Preferred areas analysis
  const areaPreferences = buyers
    .flatMap(b => b.preferred_areas || [])
    .reduce((acc, area) => {
      acc[area] = (acc[area] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topAreas = Object.entries(areaPreferences)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([area, count]) => ({ area, count }));

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-card p-4 rounded-lg border border-border">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active Buyers</p>
                    <p className="text-2xl font-bold text-foreground">{activeBuyers}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-card p-4 rounded-lg border border-border">
                <div className="flex items-center space-x-2">
                  <Home className="h-5 w-5 text-warning" />
                  <div>
                    <p className="text-sm text-muted-foreground">Under Contract</p>
                    <p className="text-2xl font-bold text-foreground">{underContract}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-card p-4 rounded-lg border border-border">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Budget</p>
                    <p className="text-2xl font-bold text-foreground">${(avgBudget / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-card p-4 rounded-lg border border-border">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Conversion</p>
                    <p className="text-2xl font-bold text-foreground">{conversionRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Buyer Status Distribution */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Buyer Status Distribution</h3>
                <div className="flex space-x-2">
                  {statusData.map((item) => (
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
                    <Tooltip formatter={(value) => [`${value} buyers`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case 'analysis':
        return (
          <div className="space-y-6">
            {/* Budget Range Analysis */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Budget Range Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetRanges}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [`${value} buyers`, 'Count']}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {budgetRanges.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Preferred Areas */}
            {topAreas.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Most Requested Areas</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topAreas}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="area" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value) => [`${value} buyers`, 'Interest']}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        );

      case 'trends':
        return (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">6-Month Buyer Activity Trends</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
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
                      name="New Buyers"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="closed" 
                      stroke="hsl(var(--success))" 
                      strokeWidth={3}
                      name="Closed Deals"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="active" 
                      stroke="hsl(var(--warning))" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Active Pipeline"
                    />
                  </LineChart>
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
              <CardTitle className="text-xl text-foreground">Buyer Representation Analytics</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Monitor your buyer clients and market opportunities</p>
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
              <Users className="h-4 w-4 mr-1" />
              Overview
            </Button>
            <Button
              variant={activeView === 'analysis' ? 'default' : 'outline'}
              onClick={() => setActiveView('analysis')}
              size="sm"
              className="text-xs"
            >
              <DollarSign className="h-4 w-4 mr-1" />
              Analysis
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
          </div>
        </CardHeader>
        <CardContent className="p-6 h-[580px] overflow-y-auto">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};