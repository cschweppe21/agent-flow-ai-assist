import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus } from "lucide-react"
import { DayTasksModal } from "./DayTasksModal"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "./AuthProvider"

interface TaskCount {
  date: string
  count: number
}

export const WeeklyTodoCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [taskCounts, setTaskCounts] = useState<TaskCount[]>([])
  const { user } = useAuth()

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

  useEffect(() => {
    fetchTaskCounts()
  }, [user])

  const weekDates = getWeekDates()
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getTaskCount = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return taskCounts.find(tc => tc.date === dateStr)?.count || 0
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <>
      <Card className="shadow-card bg-gradient-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-foreground text-lg">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            Weekly Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-7 gap-1">
            {weekDates.map((date, index) => {
              const taskCount = getTaskCount(date)
              const dateStr = date.toISOString().split('T')[0]
              
              return (
                <div
                  key={dateStr}
                  className={`
                    p-2 text-center cursor-pointer rounded-lg transition-all duration-200
                    hover:bg-primary/10 hover:scale-105
                    ${isToday(date) ? 'bg-primary/20 border border-primary/30' : 'bg-background/50'}
                  `}
                  onClick={() => setSelectedDate(dateStr)}
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    {dayNames[index]}
                  </div>
                  <div className="text-sm font-medium text-foreground mb-1">
                    {date.getDate()}
                  </div>
                  {taskCount > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-1 py-0 bg-primary/10 text-primary"
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

      {selectedDate && (
        <DayTasksModal
          date={selectedDate}
          isOpen={!!selectedDate}
          onClose={() => setSelectedDate(null)}
          onTasksUpdated={fetchTaskCounts}
        />
      )}
    </>
  )
}