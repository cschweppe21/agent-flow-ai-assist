import { useState, useEffect } from 'react';
import { Listing, Commission, Task } from './useDashboardData';
import { Buyer } from '@/components/BuyerCard';

// Generate realistic mock data
const generateMockListings = (): Listing[] => {
  const addresses = [
    "123 Oak Street, Beverly Hills, CA",
    "456 Maple Avenue, Santa Monica, CA", 
    "789 Pine Drive, Malibu, CA",
    "321 Elm Court, West Hollywood, CA",
    "654 Cedar Lane, Brentwood, CA",
    "987 Birch Road, Venice, CA",
    "147 Willow Way, Manhattan Beach, CA",
    "258 Spruce Street, Culver City, CA",
    "369 Cypress Avenue, Redondo Beach, CA",
    "741 Aspen Circle, El Segundo, CA",
    "852 Redwood Drive, Hermosa Beach, CA",
    "963 Magnolia Boulevard, Torrance, CA",
    "159 Sycamore Place, Hawthorne, CA",
    "357 Poplar Street, Inglewood, CA",
    "486 Hickory Lane, Gardena, CA",
    "571 Walnut Avenue, Lawndale, CA",
    "628 Chestnut Court, Lomita, CA",
    "739 Juniper Drive, Palos Verdes, CA"
  ];

  const statuses: Array<'active' | 'pending' | 'sold' | 'withdrawn'> = ['active', 'pending', 'sold', 'withdrawn'];
  const listings: Listing[] = [];

  for (let i = 0; i < 18; i++) {
    const listingDate = new Date();
    listingDate.setDate(listingDate.getDate() - Math.random() * 180); // Last 6 months
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const price = Math.floor(Math.random() * 2000000) + 400000; // $400k - $2.4M
    
    let saleDate = undefined;
    if (status === 'sold') {
      saleDate = new Date(listingDate);
      saleDate.setDate(saleDate.getDate() + Math.random() * 90); // Sold within 90 days
    }

    listings.push({
      id: `listing-${i + 1}`,
      address: addresses[i],
      price,
      status,
      listing_date: listingDate.toISOString().split('T')[0],
      sale_date: saleDate?.toISOString().split('T')[0],
      bedrooms: Math.floor(Math.random() * 5) + 2, // 2-6 bedrooms
      bathrooms: Math.floor(Math.random() * 3) + 1.5, // 1.5-4.5 bathrooms
      square_feet: Math.floor(Math.random() * 2000) + 1200, // 1200-3200 sq ft
      description: `Beautiful ${Math.floor(Math.random() * 5) + 2} bedroom home in prime location.`,
      mls_number: `MLS${Math.floor(Math.random() * 900000) + 100000}`
    });
  }

  return listings;
};

const generateMockCommissions = (): Commission[] => {
  const commissionTypes: Array<'listing' | 'buying' | 'referral' | 'other'> = ['listing', 'buying', 'referral', 'other'];
  const commissions: Commission[] = [];

  for (let i = 0; i < 24; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - Math.floor(Math.random() * 12)); // Last 12 months
    
    const type = commissionTypes[Math.floor(Math.random() * commissionTypes.length)];
    const amount = Math.floor(Math.random() * 25000) + 2000; // $2k - $27k

    commissions.push({
      id: `commission-${i + 1}`,
      amount,
      date_earned: date.toISOString().split('T')[0],
      commission_type: type,
      description: `Commission from ${type} transaction`,
      listing_id: Math.random() > 0.5 ? `listing-${Math.floor(Math.random() * 18) + 1}` : undefined
    });
  }

  return commissions;
};

const generateMockTasks = (): Task[] => {
  const taskTitles = [
    "Schedule property showing",
    "Prepare listing presentation",
    "Follow up with potential buyers",
    "Complete CMA report",
    "Review purchase agreement",
    "Coordinate home inspection",
    "Update MLS listing",
    "Call mortgage broker",
    "Prepare closing documents",
    "Take professional photos",
    "Research market comparables",
    "Meet with new clients",
    "Submit offer to seller",
    "Schedule appraisal",
    "Review HOA documents",
    "Prepare marketing materials",
    "Update website listings",
    "Follow up on escrow",
    "Coordinate repairs",
    "Schedule final walkthrough"
  ];

  const priorities: Array<'low' | 'medium' | 'high' | 'urgent'> = ['low', 'medium', 'high', 'urgent'];
  const tasks: Task[] = [];

  for (let i = 0; i < 20; i++) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) - 10); // -10 to +20 days
    
    const completed = Math.random() > 0.7; // 30% completed
    const priority = priorities[Math.floor(Math.random() * priorities.length)];

    tasks.push({
      id: `task-${i + 1}`,
      title: taskTitles[i],
      description: `Task description for ${taskTitles[i].toLowerCase()}`,
      due_date: dueDate.toISOString().split('T')[0],
      completed,
      priority,
      listing_id: Math.random() > 0.6 ? `listing-${Math.floor(Math.random() * 18) + 1}` : undefined
    });
  }

  return tasks;
};

const generateMockBuyers = (): Buyer[] => {
  const names = [
    "Sarah Johnson", "Michael Chen", "Emily Rodriguez", "David Kim",
    "Jessica Williams", "Robert Anderson", "Maria Garcia", "James Wilson",
    "Ashley Brown", "Christopher Lee", "Amanda Martinez", "Daniel Taylor",
    "Jennifer Davis", "Matthew Thompson", "Lisa Jackson", "Kevin White"
  ];

  const areas = [
    ["Beverly Hills", "West Hollywood"], 
    ["Santa Monica", "Venice", "Marina del Rey"],
    ["Manhattan Beach", "Hermosa Beach", "Redondo Beach"],
    ["Brentwood", "Westwood", "Culver City"],
    ["Malibu", "Pacific Palisades"],
    ["Downtown LA", "Silver Lake", "Echo Park"]
  ];

  const statuses: Array<'active' | 'under_contract' | 'closed' | 'inactive'> = 
    ['active', 'under_contract', 'closed', 'inactive'];

  const buyers: Buyer[] = [];

  for (let i = 0; i < 16; i++) {
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.random() * 120); // Last 4 months
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const budgetMin = Math.floor(Math.random() * 500000) + 300000; // $300k - $800k
    const budgetMax = budgetMin + Math.floor(Math.random() * 800000) + 200000; // +$200k - $1M more
    
    const preferredAreaGroup = areas[Math.floor(Math.random() * areas.length)];
    const bedrooms = Math.floor(Math.random() * 4) + 2; // 2-5 bedrooms
    const bathrooms = Math.floor(Math.random() * 3) + 1.5; // 1.5-4.5 bathrooms

    buyers.push({
      id: `buyer-${i + 1}`,
      name: names[i],
      email: `${names[i].toLowerCase().replace(' ', '.')}@email.com`,
      phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      budget_min: budgetMin,
      budget_max: budgetMax,
      preferred_bedrooms: bedrooms,
      preferred_bathrooms: bathrooms,
      preferred_areas: preferredAreaGroup,
      status,
      notes: status === 'active' ? 
        `Looking for ${bedrooms} bed/${bathrooms} bath home. Prefers modern finishes and good schools.` :
        status === 'under_contract' ? 
        'Currently in escrow on property in preferred area.' :
        status === 'closed' ?
        'Successfully closed on dream home!' :
        'Taking a break from house hunting.',
      created_at: createdDate.toISOString(),
      updated_at: createdDate.toISOString()
    });
  }

  return buyers;
};

export const useMockDashboardData = () => {
  const [listings] = useState<Listing[]>(generateMockListings());
  const [commissions] = useState<Commission[]>(generateMockCommissions());
  const [tasks] = useState<Task[]>(generateMockTasks());
  const [buyers] = useState<Buyer[]>(generateMockBuyers());
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Calculate metrics (same logic as real hook)
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

  // Buyer metrics
  const activeBuyers = buyers.filter(b => b.status === 'active').length;
  const buyersUnderContract = buyers.filter(b => b.status === 'under_contract').length;
  const closedBuyers = buyers.filter(b => b.status === 'closed').length;

  return {
    listings,
    commissions,
    tasks,
    buyers,
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
      overdueTasks,
      activeBuyers,
      buyersUnderContract,
      closedBuyers
    }
  };
};