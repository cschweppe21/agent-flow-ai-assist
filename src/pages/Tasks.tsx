import { useState, useEffect } from "react"
import { Header } from "@/components/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Plus, Bot, Loader2, Check, X, Filter, Search, Clock, ChevronLeft, ChevronRight } from "lucide-react"
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
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [taskCounts, setTaskCounts] = useState<TaskCount[]>([])
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [dailyTasks, setDailyTasks] = useState<Task[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all')
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const { user } = useAuth()
  const { toast } = useToast()

  const getMonthDates = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const monthDates = []
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      monthDates.push(new Date(date))
    }
    return monthDates
  }

  const fetchTaskCounts = async () => {
    if (!user) return

    const monthDates = getMonthDates()
    const startDate = monthDates[0].toISOString().split('T')[0]
    const endDate = monthDates[monthDates.length - 1].toISOString().split('T')[0]

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('due_date')
        .eq('user_id', user.id)
        .gte('due_date', startDate)
        .lte('due_date', endDate)
        .not('completed', 'eq', true)

      if (error) throw error

      const counts: TaskCount[] = monthDates.map(date => {
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

  const fetchDailyTasks = async (date: string) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('due_date', date)
        .order('completed', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) throw error
      setDailyTasks(data || [])
    } catch (error) {
      console.error('Error fetching daily tasks:', error)
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
      setDailyTasks(tasks => 
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
      setDailyTasks(tasks => tasks.filter(task => task.id !== taskId))
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

  useEffect(() => {
    if (user) {
      fetchTaskCounts()
      fetchAllTasks()
      fetchDailyTasks(selectedDate)
    }
  }, [user, currentMonth, selectedDate])

  useEffect(() => {
    filterTasks()
  }, [allTasks, searchTerm, filterStatus, filterPriority])

  const monthDates = getMonthDates()
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const pendingTasks = allTasks.filter(t => !t.completed).length
  const completedTasks = allTasks.filter(t => t.completed).length

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1)
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1)
      }
      return newMonth
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Task Management</h1>
          <p className="text-muted-foreground">Organize and manage your real estate tasks</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Monthly Calendar */}
          <div className="lg:col-span-1">
            <Card className="shadow-card bg-gradient-card border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-foreground text-lg">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateMonth('prev')}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateMonth('next')}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map(day => (
                    <div key={day} className="text-center text-xs text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>
                {/* Month grid */}
                <div className="grid grid-cols-7 gap-1">
                  {monthDates.map((date) => {
                    const taskCount = getTaskCount(date)
                    const dateStr = date.toISOString().split('T')[0]
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
                    
                    return (
                      <div
                        key={dateStr}
                        className={`
                          aspect-square p-1 cursor-pointer rounded-lg transition-all duration-200 flex flex-col items-center justify-center text-xs
                          hover:bg-primary/10 hover:scale-105
                          ${isToday(date) ? 'bg-primary/20 border border-primary/30' : 'bg-background/50'}
                          ${!isCurrentMonth ? 'opacity-30' : ''}
                        `}
                        onClick={() => {
                          setSelectedDate(dateStr)
                          fetchDailyTasks(dateStr)
                        }}
                      >
                        <span className={`font-medium ${isToday(date) ? 'text-primary' : 'text-foreground'}`}>
                          {date.getDate()}
                        </span>
                        {taskCount > 0 && (
                          <div className="w-2 h-2 bg-primary rounded-full mt-1"></div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Tasks for Selected Date */}
          <div className="lg:col-span-2">
            <Card className="shadow-card bg-gradient-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-foreground text-lg">
                  <span>Tasks for {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
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
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading tasks...</p>
                    </div>
                  ) : dailyTasks.length > 0 ? (
                    dailyTasks.map((task) => (
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
                      <p className="text-muted-foreground">No tasks scheduled for this date</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* All Tasks Section */}
        <div className="mt-8">
          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground text-lg">
                All Tasks
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
                    <p className="text-muted-foreground">No tasks found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Tasks