import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle, Clock, Plus } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "./AuthProvider"

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: string
  due_date?: string
}

export const WeeklyTodoCalendar = () => {
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  const today = new Date().toISOString().split('T')[0]
  const todayFormatted = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  })

  const fetchTodayTasks = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('due_date', today)
        .order('completed', { ascending: true })
        .order('created_at', { ascending: true })
        .limit(3)

      if (error) throw error
      setTodayTasks(data || [])
    } catch (error) {
      console.error('Error fetching today tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId)

      if (error) throw error

      setTodayTasks(tasks => 
        tasks.map(task => 
          task.id === taskId ? { ...task, completed } : task
        )
      )
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-warning/10 text-warning border-warning/20'  
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  useEffect(() => {
    fetchTodayTasks()
  }, [user])

  return (
    <Card className="shadow-card bg-gradient-card border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-foreground text-lg">
          <Calendar className="h-4 w-4 mr-2 text-primary" />
          Today's Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <span>{todayFormatted}</span>
            <span>{todayTasks.filter(t => !t.completed).length} pending</span>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-xs text-muted-foreground mt-2">Loading tasks...</p>
            </div>
          ) : todayTasks.length > 0 ? (
            <>
              {todayTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={(checked) => toggleTask(task.id, !!checked)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-medium truncate ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </span>
                      <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className={`text-xs truncate ${task.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <Button 
                variant="ghost" 
                className="w-full mt-2 text-primary hover:bg-primary/10"
                onClick={() => navigate('/tasks')}
              >
                View All Tasks
              </Button>
            </>
          ) : (
            <div className="text-center py-6">
              <CheckCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">No tasks for today</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/tasks')}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Manage Tasks
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}