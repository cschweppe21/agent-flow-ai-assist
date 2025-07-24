import { useState, useEffect } from "react"
import { Header } from "@/components/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Plus, Bot, Loader2, Check, X, Filter, Search, Clock } from "lucide-react"
import { DayTasksModal } from "@/components/DayTasksModal"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/components/AuthProvider"
import { useToast } from "@/hooks/use-toast"

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: string
  due_date?: string
  created_at?: string
}

interface TaskCount {
  date: string
  count: number
}

const Tasks = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [taskCounts, setTaskCounts] = useState<TaskCount[]>([])
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all')
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const getWeekDates = () => {
    const today = new Date()
    const currentDay = today.getDay()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - currentDay)
    
    const weekDates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      weekDates.push(date)
    }
    return weekDates
  }

  const fetchTaskCounts = async () => {
    if (!user) return

    const weekDates = getWeekDates()
    const startDate = weekDates[0].toISOString().split('T')[0]
    const endDate = weekDates[6].toISOString().split('T')[0]

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('due_date')
        .eq('user_id', user.id)
        .gte('due_date', startDate)
        .lte('due_date', endDate)
        .not('completed', 'eq', true)

      if (error) throw error

      const counts: TaskCount[] = weekDates.map(date => {
        const dateStr = date.toISOString().split('T')[0]
        const count = data?.filter(task => task.due_date === dateStr).length || 0
        return { date: dateStr, count }
      })

      setTaskCounts(counts)
    } catch (error) {
      console.error('Error fetching task counts:', error)
    }
  }

  const fetchAllTasks = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setAllTasks(data || [])
    } catch (error) {
      console.error('Error fetching all tasks:', error)
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive"
      })
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

      setAllTasks(tasks => 
        tasks.map(task => 
          task.id === taskId ? { ...task, completed } : task
        )
      )
      fetchTaskCounts()
    } catch (error) {
      console.error('Error updating task:', error)
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      })
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      setAllTasks(tasks => tasks.filter(task => task.id !== taskId))
      fetchTaskCounts()
      
      toast({
        title: "Success",
        description: "Task deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting task:', error)
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'  
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTaskCount = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return taskCounts.find(tc => tc.date === dateStr)?.count || 0
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const filterTasks = () => {
    let filtered = allTasks

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => 
        filterStatus === 'completed' ? task.completed : !task.completed
      )
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority)
    }

    setFilteredTasks(filtered)
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'No due date'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  }

  const isOverdue = (dateStr: string | undefined) => {
    if (!dateStr) return false
    const taskDate = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return taskDate < today
  }

  useEffect(() => {
    if (user) {
      fetchTaskCounts()
      fetchAllTasks()
    }
  }, [user])

  useEffect(() => {
    filterTasks()
  }, [allTasks, searchTerm, filterStatus, filterPriority])

  const weekDates = getWeekDates()
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const pendingTasks = allTasks.filter(t => !t.completed).length
  const completedTasks = allTasks.filter(t => t.completed).length
  const overdueTasks = allTasks.filter(t => !t.completed && isOverdue(t.due_date)).length

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Task Management</h1>
          <p className="text-muted-foreground">Organize and manage your real estate tasks</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold text-foreground">{allTasks.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingTasks}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
                </div>
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{overdueTasks}</p>
                </div>
                <X className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Weekly Calendar */}
          <div className="lg:col-span-1">
            <Card className="shadow-card bg-gradient-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-foreground text-lg">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 gap-2">
                  {weekDates.map((date, index) => {
                    const taskCount = getTaskCount(date)
                    const dateStr = date.toISOString().split('T')[0]
                    
                    return (
                      <div
                        key={dateStr}
                        className={`
                          p-3 cursor-pointer rounded-lg transition-all duration-200 flex items-center justify-between
                          hover:bg-primary/10 hover:scale-[1.02]
                          ${isToday(date) ? 'bg-primary/20 border border-primary/30' : 'bg-background/50'}
                        `}
                        onClick={() => setSelectedDate(dateStr)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">
                              {dayNames[index]}
                            </div>
                            <div className="text-sm font-medium text-foreground">
                              {date.getDate()}
                            </div>
                          </div>
                          <div className="text-sm text-foreground">
                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {isToday(date) && <span className="text-primary ml-1">(Today)</span>}
                          </div>
                        </div>
                        {taskCount > 0 && (
                          <Badge 
                            variant="secondary" 
                            className="text-xs bg-primary/10 text-primary"
                          >
                            {taskCount}
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* All Tasks */}
          <div className="lg:col-span-2">
            <Card className="shadow-card bg-gradient-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-foreground text-lg">
                  <span>All Tasks</span>
                  <Button
                    onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                    className="ml-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value as any)}
                      className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                    >
                      <option value="all">All Priority</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                {/* Task List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading tasks...</p>
                    </div>
                  ) : filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <div key={task.id} className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-border/50">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={(checked) => toggleTask(task.id, !!checked)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`font-medium truncate ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </span>
                            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </Badge>
                            {task.due_date && isOverdue(task.due_date) && !task.completed && (
                              <Badge variant="destructive" className="text-xs">
                                Overdue
                              </Badge>
                            )}
                          </div>
                          {task.description && (
                            <p className={`text-sm mb-2 ${task.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Due: {formatDate(task.due_date)}</span>
                            <span>Created: {formatDate(task.created_at)}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteTask(task.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">No tasks found</p>
                      <p className="text-sm text-muted-foreground">
                        {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' 
                          ? 'Try adjusting your filters or search term'
                          : 'Click "Add Task" to create your first task'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Day Tasks Modal */}
      {selectedDate && (
        <DayTasksModal
          date={selectedDate}
          isOpen={!!selectedDate}
          onClose={() => setSelectedDate(null)}
          onTasksUpdated={() => {
            fetchTaskCounts()
            fetchAllTasks()
          }}
        />
      )}
    </div>
  )
}

export default Tasks