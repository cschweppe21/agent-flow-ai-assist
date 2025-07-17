import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Task } from '@/hooks/useDashboardData';

interface TaskChartProps {
  tasks: Task[];
  onClose: () => void;
}

const COLORS = ['hsl(var(--destructive))', 'hsl(var(--warning))', 'hsl(var(--primary))', 'hsl(var(--success))'];

export const TaskChart = ({ tasks, onClose }: TaskChartProps) => {
  // Priority distribution
  const priorityData = [
    { name: 'Urgent', value: tasks.filter(t => t.priority === 'urgent').length },
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length }
  ].filter(item => item.value > 0);

  // Status distribution
  const statusData = [
    { name: 'Completed', value: tasks.filter(t => t.completed).length },
    { name: 'Pending', value: tasks.filter(t => !t.completed).length },
    { name: 'Overdue', value: tasks.filter(t => 
      !t.completed && t.due_date && new Date(t.due_date) < new Date()
    ).length }
  ].filter(item => item.value > 0);

  // Weekly task completion
  const weeklyData = () => {
    const weeks = [];
    const currentDate = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const completedThisWeek = tasks.filter(t => 
        t.completed && 
        t.due_date &&
        new Date(t.due_date) >= weekStart && 
        new Date(t.due_date) <= weekEnd
      ).length;
      
      weeks.push({
        week: `Week ${7 - i}`,
        completed: completedThisWeek
      });
    }
    
    return weeks;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl h-[600px] bg-card border-border shadow-elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Task Analytics</CardTitle>
            <button 
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>
        </CardHeader>
        <CardContent className="h-full">
          <Tabs defaultValue="priority" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="priority">Priority</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="weekly">Weekly Progress</TabsTrigger>
            </TabsList>
            
            <TabsContent value="priority" className="h-[450px]">
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
            </TabsContent>
            
            <TabsContent value="status" className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="weekly" className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="hsl(var(--success))" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};