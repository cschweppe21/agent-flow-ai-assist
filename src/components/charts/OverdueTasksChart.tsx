import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Task } from '@/hooks/useDashboardData';

interface OverdueTasksChartProps {
  tasks: Task[];
  onClose: () => void;
}

const COLORS = ['hsl(var(--destructive))', 'hsl(var(--warning))', 'hsl(var(--primary))', 'hsl(var(--success))'];

export const OverdueTasksChart = ({ tasks, onClose }: OverdueTasksChartProps) => {
  const [activeView, setActiveView] = useState<'trend' | 'priority' | 'category'>('trend');

  // Filter overdue tasks
  const overdueTasks = tasks.filter(task => 
    !task.completed && 
    task.due_date && 
    new Date(task.due_date) < new Date()
  );

  // Generate overdue trend data (last 8 weeks)
  const trendData = Array.from({ length: 8 }, (_, i) => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (7 * (7 - i)));
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Count tasks that became overdue during this week
    const weekOverdue = tasks.filter(task => {
      if (!task.due_date || task.completed) return false;
      const dueDate = new Date(task.due_date);
      return dueDate >= weekStart && dueDate <= weekEnd && dueDate < new Date();
    }).length;

    return {
      week: `Week ${i + 1}`,
      count: weekOverdue
    };
  });

  // Priority breakdown of currently overdue tasks
  const priorityData = [
    { 
      name: 'Urgent', 
      value: overdueTasks.filter(t => t.priority === 'urgent').length 
    },
    { 
      name: 'High', 
      value: overdueTasks.filter(t => t.priority === 'high').length 
    },
    { 
      name: 'Medium', 
      value: overdueTasks.filter(t => t.priority === 'medium').length 
    },
    { 
      name: 'Low', 
      value: overdueTasks.filter(t => t.priority === 'low').length 
    }
  ].filter(item => item.value > 0);

  // Category breakdown (based on task titles/descriptions)
  const getCategoryFromTask = (task: Task): string => {
    const title = task.title.toLowerCase();
    const description = task.description?.toLowerCase() || '';
    
    if (title.includes('listing') || title.includes('property') || description.includes('listing')) {
      return 'Listings';
    }
    if (title.includes('client') || title.includes('call') || title.includes('meeting') || description.includes('client')) {
      return 'Client Management';
    }
    if (title.includes('market') || title.includes('research') || title.includes('analysis')) {
      return 'Market Research';
    }
    if (title.includes('document') || title.includes('contract') || title.includes('paperwork')) {
      return 'Documentation';
    }
    return 'Other';
  };

  const categoryData = overdueTasks.reduce((acc, task) => {
    const category = getCategoryFromTask(task);
    const existing = acc.find(item => item.category === category);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ category, count: 1 });
    }
    return acc;
  }, [] as { category: string; count: number }[]);

  const renderChart = () => {
    switch (activeView) {
      case 'trend':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} tasks`, 'Became Overdue']} />
              <Line type="monotone" dataKey="count" stroke="hsl(var(--destructive))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'priority':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'category':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} tasks`, 'Overdue Tasks']} />
              <Bar dataKey="count" fill="hsl(var(--warning))" />
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
            <CardTitle>Overdue Tasks Analytics</CardTitle>
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
              Overdue Trend
            </Button>
            <Button
              variant={activeView === 'priority' ? 'default' : 'outline'}
              onClick={() => setActiveView('priority')}
              size="sm"
            >
              By Priority
            </Button>
            <Button
              variant={activeView === 'category' ? 'default' : 'outline'}
              onClick={() => setActiveView('category')}
              size="sm"
            >
              By Category
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