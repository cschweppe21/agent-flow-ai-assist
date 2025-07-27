import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Home, 
  FileText, 
  Clock,
  Eye,
  ChevronRight
} from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  commission_type: string;
  description: string;
  date_earned: string;
  buyer_id?: string;
  listing_id?: string;
  buyer?: {
    name: string;
    email?: string;
  };
  listing?: {
    address: string;
    price: number;
  };
}

interface TransactionHistoryProps {
  clientId?: string;
}

export const TransactionHistory = ({ clientId }: TransactionHistoryProps) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      try {
        let query = supabase
          .from('commissions')
          .select(`
            *,
            buyers!left (name, email),
            listings!left (address, price)
          `)
          .eq('user_id', user.id)
          .order('date_earned', { ascending: false });

        if (clientId) {
          query = query.eq('buyer_id', clientId);
        }

        const { data, error } = await query;

        if (error) throw error;
        setTransactions(data || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user, clientId]);

  const formatCommissionType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getCommissionColor = (type: string) => {
    switch (type) {
      case 'listing':
        return 'bg-success text-success-foreground';
      case 'buying':
        return 'bg-primary text-primary-foreground';
      case 'referral':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const calculateEstimatedCommissions = () => {
    const thisYear = new Date().getFullYear();
    const lastYear = thisYear - 1;
    
    const thisYearTransactions = transactions.filter(t => 
      new Date(t.date_earned).getFullYear() === thisYear
    );
    const lastYearTransactions = transactions.filter(t => 
      new Date(t.date_earned).getFullYear() === lastYear
    );
    
    const thisYearTotal = thisYearTransactions.reduce((sum, t) => sum + t.amount, 0);
    const lastYearTotal = lastYearTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Simple projection: assume same pace for rest of year
    const monthsPassed = new Date().getMonth() + 1;
    const projectedAnnual = monthsPassed > 0 ? (thisYearTotal / monthsPassed) * 12 : 0;
    
    return {
      thisYear: thisYearTotal,
      lastYear: lastYearTotal,
      projected: projectedAnnual,
      monthlyAverage: thisYearTotal / Math.max(monthsPassed, 1)
    };
  };

  const estimates = calculateEstimatedCommissions();

  if (loading) {
    return (
      <Card className="shadow-card bg-gradient-card border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading transactions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Commission Estimates */}
      <Card className="shadow-card bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-success" />
            Commission Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-success/10 rounded-lg border border-success/20">
              <div className="text-2xl font-bold text-success">
                ${estimates.thisYear.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Year to Date</div>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="text-2xl font-bold text-primary">
                ${estimates.projected.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Projected Annual</div>
            </div>
            <div className="text-center p-4 bg-warning/10 rounded-lg border border-warning/20">
              <div className="text-2xl font-bold text-warning">
                ${estimates.monthlyAverage.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Monthly Average</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg border">
              <div className="text-2xl font-bold text-foreground">
                ${estimates.lastYear.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Last Year</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="shadow-card bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Transaction History ({transactions.length})
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="p-4 bg-background/50 rounded-lg border border-border/50 hover:bg-background/70 transition-colors cursor-pointer"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-success/10 p-2 rounded-lg">
                        <DollarSign className="h-4 w-4 text-success" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-foreground">
                            ${transaction.amount.toLocaleString()}
                          </span>
                          <Badge className={`text-xs ${getCommissionColor(transaction.commission_type)}`}>
                            {formatCommissionType(transaction.commission_type)}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.description}
                        </div>
                        {transaction.buyer && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Client: {transaction.buyer.name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(transaction.date_earned).toLocaleDateString()}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground mt-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No transactions recorded yet</p>
              <p className="text-xs text-muted-foreground">
                Completed deals will appear here automatically
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <Card className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Transaction Details</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedTransaction(null)}
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Amount</label>
                  <div className="text-lg font-bold text-success">
                    ${selectedTransaction.amount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <div>
                    <Badge className={`${getCommissionColor(selectedTransaction.commission_type)}`}>
                      {formatCommissionType(selectedTransaction.commission_type)}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date</label>
                <div className="text-foreground">
                  {new Date(selectedTransaction.date_earned).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <div className="text-foreground">{selectedTransaction.description}</div>
              </div>

              {selectedTransaction.buyer && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Client</label>
                  <div className="text-foreground">
                    {selectedTransaction.buyer.name}
                    {selectedTransaction.buyer.email && (
                      <div className="text-sm text-muted-foreground">
                        {selectedTransaction.buyer.email}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedTransaction.listing && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Property</label>
                  <div className="text-foreground">
                    {selectedTransaction.listing.address}
                    <div className="text-sm text-muted-foreground">
                      Sale Price: ${selectedTransaction.listing.price?.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </div>
        </Card>
      )}
    </div>
  );
};