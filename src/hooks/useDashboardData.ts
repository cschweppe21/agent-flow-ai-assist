import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

export interface Listing {
  id: string;
  address: string;
  price: number;
  status: 'active' | 'pending' | 'sold' | 'withdrawn';
  listing_date: string;
  sale_date?: string;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  description?: string;
  mls_number?: string;
}

export interface Commission {
  id: string;
  amount: number;
  date_earned: string;
  commission_type: 'listing' | 'buying' | 'referral' | 'other';
  description?: string;
  listing_id?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  listing_id?: string;
}

export const useDashboardData = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch listings
        const { data: listingsData, error: listingsError } = await supabase
          .from('listings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (listingsError) throw listingsError;

        // Fetch commissions
        const { data: commissionsData, error: commissionsError } = await supabase
          .from('commissions')
          .select('*')
          .eq('user_id', user.id)
          .order('date_earned', { ascending: false });

        if (commissionsError) throw commissionsError;

        // Fetch tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('due_date', { ascending: true });

        if (tasksError) throw tasksError;

        setListings(listingsData as Listing[] || []);
        setCommissions(commissionsData as Commission[] || []);
        setTasks(tasksData as Task[] || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Set up real-time subscriptions
    const listingsChannel = supabase
      .channel('listings-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'listings',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setListings(prev => [payload.new as Listing, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setListings(prev => prev.map(item => 
            item.id === payload.new.id ? payload.new as Listing : item
          ));
        } else if (payload.eventType === 'DELETE') {
          setListings(prev => prev.filter(item => item.id !== payload.old.id));
        }
      })
      .subscribe();

    const commissionsChannel = supabase
      .channel('commissions-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'commissions',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setCommissions(prev => [payload.new as Commission, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setCommissions(prev => prev.map(item => 
            item.id === payload.new.id ? payload.new as Commission : item
          ));
        } else if (payload.eventType === 'DELETE') {
          setCommissions(prev => prev.filter(item => item.id !== payload.old.id));
        }
      })
      .subscribe();

    const tasksChannel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTasks(prev => [...prev, payload.new as Task].sort((a, b) => 
            (a.due_date || '').localeCompare(b.due_date || '')
          ));
        } else if (payload.eventType === 'UPDATE') {
          setTasks(prev => prev.map(item => 
            item.id === payload.new.id ? payload.new as Task : item
          ));
        } else if (payload.eventType === 'DELETE') {
          setTasks(prev => prev.filter(item => item.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(listingsChannel);
      supabase.removeChannel(commissionsChannel);
      supabase.removeChannel(tasksChannel);
    };
  }, [user]);

  // Calculate metrics
  const activeListings = listings.filter(l => l.status === 'active').length;
  const pendingListings = listings.filter(l => l.status === 'pending').length;
  const soldListings = listings.filter(l => l.status === 'sold').length;
  
  const totalCommission = commissions.reduce((sum, c) => sum + c.amount, 0);
  const thisMonthCommission = commissions
    .filter(c => new Date(c.date_earned).getMonth() === new Date().getMonth())
    .reduce((sum, c) => sum + c.amount, 0);
  const thisYearCommission = commissions
    .filter(c => new Date(c.date_earned).getFullYear() === new Date().getFullYear())
    .reduce((sum, c) => sum + c.amount, 0);

  const soldListingsWithDates = listings.filter(l => l.status === 'sold' && l.sale_date);
  const avgDaysOnMarket = soldListingsWithDates.length > 0 
    ? Math.round(soldListingsWithDates.reduce((sum, l) => {
        const listingDate = new Date(l.listing_date);
        const saleDate = new Date(l.sale_date!);
        const days = Math.ceil((saleDate.getTime() - listingDate.getTime()) / (1000 * 3600 * 24));
        return sum + days;
      }, 0) / soldListingsWithDates.length)
    : 0;

  const overdueTasks = tasks.filter(t => 
    !t.completed && 
    t.due_date && 
    new Date(t.due_date) < new Date()
  ).length;

  return {
    listings,
    commissions,
    tasks,
    loading,
    error,
    metrics: {
      activeListings,
      pendingListings,
      soldListings,
      totalCommission,
      thisMonthCommission,
      thisYearCommission,
      avgDaysOnMarket,
      overdueTasks
    }
  };
};