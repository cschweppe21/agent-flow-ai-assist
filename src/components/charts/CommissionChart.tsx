import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Commission } from '@/hooks/useDashboardData';

interface CommissionChartProps {
  commissions: Commission[];
  onClose: () => void;
}

export const CommissionChart = ({ commissions, onClose }: CommissionChartProps) => {
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
        </CardHeader>
        <CardContent className="h-full">
          <Tabs defaultValue="monthly" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="monthly">Monthly ({currentYear})</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
              <TabsTrigger value="types">By Type</TabsTrigger>
            </TabsList>
            
            <TabsContent value="monthly" className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Commission']} />
                  <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="yearly" className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Commission']} />
                  <Bar dataKey="amount" fill="hsl(var(--success))" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="types" className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Commission']} />
                  <Bar dataKey="amount" fill="hsl(var(--warning))" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};