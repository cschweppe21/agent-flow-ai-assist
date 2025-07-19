import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Commission } from '@/hooks/useDashboardData';

interface CommissionChartProps {
  commissions: Commission[];
  onClose: () => void;
}

export const CommissionChart = ({ commissions, onClose }: CommissionChartProps) => {
  const [activeView, setActiveView] = useState<'monthly' | 'yearly' | 'types'>('monthly');
  const currentYear = new Date().getFullYear();
  
  // Monthly commission data for current year
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(currentYear, i).toLocaleString('default', { month: 'short' });
    const monthCommissions = commissions.filter(c => {
      const date = new Date(c.date_earned);
      return date.getFullYear() === currentYear && date.getMonth() === i;
    });
    return {
      month,
      amount: monthCommissions.reduce((sum, c) => sum + c.amount, 0)
    };
  });

  // Yearly commission data
  const yearlyData = commissions.reduce((acc, commission) => {
    const year = new Date(commission.date_earned).getFullYear();
    const existing = acc.find(item => item.year === year);
    if (existing) {
      existing.amount += commission.amount;
    } else {
      acc.push({ year, amount: commission.amount });
    }
    return acc;
  }, [] as { year: number; amount: number }[]).sort((a, b) => a.year - b.year);

  // Commission type data
  const typeData = [
    { type: 'Listing', amount: commissions.filter(c => c.commission_type === 'listing').reduce((sum, c) => sum + c.amount, 0) },
    { type: 'Buying', amount: commissions.filter(c => c.commission_type === 'buying').reduce((sum, c) => sum + c.amount, 0) },
    { type: 'Referral', amount: commissions.filter(c => c.commission_type === 'referral').reduce((sum, c) => sum + c.amount, 0) },
    { type: 'Other', amount: commissions.filter(c => c.commission_type === 'other').reduce((sum, c) => sum + c.amount, 0) }
  ].filter(item => item.amount > 0);

  const renderChart = () => {
    switch (activeView) {
      case 'monthly':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Commission']} />
              <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'yearly':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Commission']} />
              <Bar dataKey="amount" fill="hsl(var(--success))" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'types':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Commission']} />
              <Bar dataKey="amount" fill="hsl(var(--warning))" />
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl h-[600px] bg-card border-border shadow-elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Commission Analytics</CardTitle>
            <button 
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="flex space-x-2 mt-4">
            <Button
              variant={activeView === 'monthly' ? 'default' : 'outline'}
              onClick={() => setActiveView('monthly')}
              size="sm"
            >
              Monthly ({currentYear})
            </Button>
            <Button
              variant={activeView === 'yearly' ? 'default' : 'outline'}
              onClick={() => setActiveView('yearly')}
              size="sm"
            >
              Yearly
            </Button>
            <Button
              variant={activeView === 'types' ? 'default' : 'outline'}
              onClick={() => setActiveView('types')}
              size="sm"
            >
              By Type
            </Button>
          </div>
        </CardHeader>
        <CardContent className="h-[450px]">
          {renderChart()}
        </CardContent>
      </Card>
    </div>
  );
};