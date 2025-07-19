import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Calendar, PieChart as PieChartIcon, Target } from 'lucide-react';
import { Commission } from '@/hooks/useDashboardData';

interface CommissionChartProps {
  commissions: Commission[];
  onClose: () => void;
}

export const CommissionChart = ({ commissions, onClose }: CommissionChartProps) => {
  const [activeView, setActiveView] = useState<'overview' | 'trends' | 'breakdown'>('overview');
  const currentYear = new Date().getFullYear();
  
  // Calculate key metrics
  const totalCommission = commissions.reduce((sum, c) => sum + c.amount, 0);
  const monthlyAvg = totalCommission / 12;
  const thisMonth = commissions.filter(c => {
    const date = new Date(c.date_earned);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).reduce((sum, c) => sum + c.amount, 0);
  
  const lastMonth = commissions.filter(c => {
    const date = new Date(c.date_earned);
    const now = new Date();
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
    return date.getMonth() === lastMonthDate.getMonth() && date.getFullYear() === lastMonthDate.getFullYear();
  }).reduce((sum, c) => sum + c.amount, 0);
  
  const monthlyGrowth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth * 100) : 0;

  // Enhanced monthly commission data
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(currentYear, i).toLocaleString('default', { month: 'short' });
    const monthCommissions = commissions.filter(c => {
      const date = new Date(c.date_earned);
      return date.getFullYear() === currentYear && date.getMonth() === i;
    });
    
    return {
      month,
      amount: monthCommissions.reduce((sum, c) => sum + c.amount, 0),
      count: monthCommissions.length,
      listing: monthCommissions.filter(c => c.commission_type === 'listing').reduce((sum, c) => sum + c.amount, 0),
      buying: monthCommissions.filter(c => c.commission_type === 'buying').reduce((sum, c) => sum + c.amount, 0),
      referral: monthCommissions.filter(c => c.commission_type === 'referral').reduce((sum, c) => sum + c.amount, 0)
    };
  });

  // Yearly commission data with growth
  const yearlyData = commissions.reduce((acc, commission) => {
    const year = new Date(commission.date_earned).getFullYear();
    const existing = acc.find(item => item.year === year);
    if (existing) {
      existing.amount += commission.amount;
      existing.count += 1;
    } else {
      acc.push({ year, amount: commission.amount, count: 1 });
    }
    return acc;
  }, [] as { year: number; amount: number; count: number }[]).sort((a, b) => a.year - b.year);

  // Commission type breakdown with colors
  const typeData = [
    { 
      type: 'Listing', 
      amount: commissions.filter(c => c.commission_type === 'listing').reduce((sum, c) => sum + c.amount, 0),
      color: 'hsl(var(--primary))',
      count: commissions.filter(c => c.commission_type === 'listing').length
    },
    { 
      type: 'Buying', 
      amount: commissions.filter(c => c.commission_type === 'buying').reduce((sum, c) => sum + c.amount, 0),
      color: 'hsl(var(--success))',
      count: commissions.filter(c => c.commission_type === 'buying').length
    },
    { 
      type: 'Referral', 
      amount: commissions.filter(c => c.commission_type === 'referral').reduce((sum, c) => sum + c.amount, 0),
      color: 'hsl(var(--warning))',
      count: commissions.filter(c => c.commission_type === 'referral').length
    },
    { 
      type: 'Other', 
      amount: commissions.filter(c => c.commission_type === 'other').reduce((sum, c) => sum + c.amount, 0),
      color: 'hsl(var(--muted-foreground))',
      count: commissions.filter(c => c.commission_type === 'other').length
    }
  ].filter(item => item.amount > 0);

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-card p-4 rounded-lg border border-border">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total YTD</p>
                    <p className="text-2xl font-bold text-foreground">${(totalCommission / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-card p-4 rounded-lg border border-border">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold text-foreground">${(thisMonth / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-card p-4 rounded-lg border border-border">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-warning" />
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Avg</p>
                    <p className="text-2xl font-bold text-foreground">${(monthlyAvg / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-card p-4 rounded-lg border border-border">
                <div className="flex items-center space-x-2">
                  <TrendingUp className={`h-5 w-5 ${monthlyGrowth >= 0 ? 'text-success' : 'text-destructive'}`} />
                  <div>
                    <p className="text-sm text-muted-foreground">Growth</p>
                    <p className={`text-2xl font-bold ${monthlyGrowth >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {monthlyGrowth >= 0 ? '+' : ''}{monthlyGrowth.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Commission Type Distribution */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Commission Breakdown</h3>
                <div className="flex space-x-2">
                  {typeData.map((item) => (
                    <Badge key={item.type} variant="outline" className="text-xs">
                      <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: item.color }}></div>
                      {item.type}: ${(item.amount / 1000).toFixed(0)}K
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="amount"
                      label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Commission']} />
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
              <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Commission Trends ({currentYear})</h3>
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
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Commission']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Yearly Comparison */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Year-over-Year Performance</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value, name) => [
                        name === 'amount' ? `$${Number(value).toLocaleString()}` : `${value} deals`,
                        name === 'amount' ? 'Total Commission' : 'Deal Count'
                      ]}
                    />
                    <Bar dataKey="amount" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case 'breakdown':
        return (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Commission Type Analysis</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="type" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Commission']}
                    />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
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
              <CardTitle className="text-xl text-foreground">Commission Analytics</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Track your earnings and performance metrics</p>
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
              <DollarSign className="h-4 w-4 mr-1" />
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
              variant={activeView === 'breakdown' ? 'default' : 'outline'}
              onClick={() => setActiveView('breakdown')}
              size="sm"
              className="text-xs"
            >
              <PieChartIcon className="h-4 w-4 mr-1" />
              Breakdown
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