import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Listing } from '@/hooks/useDashboardData';

interface DaysOnMarketChartProps {
  listings: Listing[];
  onClose: () => void;
}

export const DaysOnMarketChart = ({ listings, onClose }: DaysOnMarketChartProps) => {
  const [activeView, setActiveView] = useState<'trend' | 'distribution' | 'comparison'>('trend');

  // Calculate days on market for each listing
  const getListingDaysOnMarket = (listing: Listing) => {
    const listingDate = new Date(listing.listing_date);
    const endDate = listing.sale_date ? new Date(listing.sale_date) : new Date();
    return Math.ceil((endDate.getTime() - listingDate.getTime()) / (1000 * 3600 * 24));
  };

  // Generate monthly trend data (last 12 months)
  const trendData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (11 - i));
    const monthName = month.toLocaleString('default', { month: 'short' });
    
    // Filter listings for this month
    const monthListings = listings.filter(listing => {
      const listingDate = new Date(listing.listing_date);
      return listingDate.getMonth() === month.getMonth() && 
             listingDate.getFullYear() === month.getFullYear();
    });

    // Calculate average days on market for this month
    const avgDays = monthListings.length > 0 
      ? monthListings.reduce((sum, listing) => sum + getListingDaysOnMarket(listing), 0) / monthListings.length
      : 0;

    return {
      month: monthName,
      avgDays: Math.round(avgDays)
    };
  });

  // Distribution data - group active listings by days on market
  const activeListings = listings.filter(l => l.status === 'active');
  const distributionData = [
    { 
      range: '0-30 days', 
      count: activeListings.filter(l => {
        const days = getListingDaysOnMarket(l);
        return days >= 0 && days <= 30;
      }).length 
    },
    { 
      range: '31-60 days', 
      count: activeListings.filter(l => {
        const days = getListingDaysOnMarket(l);
        return days >= 31 && days <= 60;
      }).length 
    },
    { 
      range: '61-90 days', 
      count: activeListings.filter(l => {
        const days = getListingDaysOnMarket(l);
        return days >= 61 && days <= 90;
      }).length 
    },
    { 
      range: '90+ days', 
      count: activeListings.filter(l => {
        const days = getListingDaysOnMarket(l);
        return days > 90;
      }).length 
    }
  ].filter(item => item.count > 0);

  // Comparison data - your average vs market average (mock market data)
  const currentAvg = activeListings.length > 0 
    ? Math.round(activeListings.reduce((sum, listing) => sum + getListingDaysOnMarket(listing), 0) / activeListings.length)
    : 0;
  
  const comparisonData = [
    { category: 'Your Average', days: currentAvg },
    { category: 'Market Average', days: 42 }, // Mock market average
    { category: 'Optimal Range', days: 28 }   // Mock optimal range
  ];

  const renderChart = () => {
    switch (activeView) {
      case 'trend':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} days`, 'Avg. Days on Market']} />
              <Line type="monotone" dataKey="avgDays" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'distribution':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} listings`, 'Count']} />
              <Bar dataKey="count" fill="hsl(var(--warning))" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'comparison':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} days`, 'Days']} />
              <Bar dataKey="days" fill="hsl(var(--success))" />
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
            <CardTitle>Days on Market Analytics</CardTitle>
            <button 
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="flex space-x-2 mt-4">
            <Button
              variant={activeView === 'trend' ? 'default' : 'outline'}
              onClick={() => setActiveView('trend')}
              size="sm"
            >
              Trend (12 months)
            </Button>
            <Button
              variant={activeView === 'distribution' ? 'default' : 'outline'}
              onClick={() => setActiveView('distribution')}
              size="sm"
            >
              Current Distribution
            </Button>
            <Button
              variant={activeView === 'comparison' ? 'default' : 'outline'}
              onClick={() => setActiveView('comparison')}
              size="sm"
            >
              Market Comparison
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