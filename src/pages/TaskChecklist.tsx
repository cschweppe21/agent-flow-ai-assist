import { useState } from "react"
import { Header } from "@/components/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useMockDashboardData } from "@/hooks/useMockDashboardData"
import { ArrowLeft, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { SidebarOverlay } from "@/components/SidebarOverlay"

const TaskChecklist = () => {
  const { tasks } = useMockDashboardData()
  const navigate = useNavigate()
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set())

  const handleTaskToggle = (taskId: string) => {
    setCheckedTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive'
      case 'high':
        return 'warning'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-3 w-3" />
      case 'high':
        return <Clock className="h-3 w-3" />
      default:
        return null
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  const sortedTasks = [...tasks]
    .filter(task => !task.completed)
    .sort((a, b) => {
      // Sort by overdue first, then by priority, then by due date
      const aOverdue = a.due_date ? isOverdue(a.due_date) : false
      const bOverdue = b.due_date ? isOverdue(b.due_date) : false
      
      if (aOverdue && !bOverdue) return -1
      if (!aOverdue && bOverdue) return 1
      
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2
      
      if (aPriority !== bPriority) return aPriority - bPriority
      
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      }
      
      return 0
    })

  const overdueCount = sortedTasks.filter(task => task.due_date && isOverdue(task.due_date)).length
  const completedCount = checkedTasks.size

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background relative">
        <AppSidebar />
        <SidebarOverlay />
        <div className="flex-1 transition-all duration-300">
          <Header />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/')}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Task Checklist</h1>
              <p className="text-muted-foreground mt-1">
                Manage your pending tasks and stay on top of your workflow
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="text-sm text-foreground">
                <span className="font-semibold">{overdueCount}</span> overdue tasks
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-sm text-foreground">
                <span className="font-semibold">{completedCount}</span> completed this session
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm text-foreground">
                <span className="font-semibold">{sortedTasks.length}</span> total pending
              </span>
            </div>
          </div>
        </div>

        <Card className="shadow-card bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <CheckCircle className="h-5 w-5 mr-2 text-primary" />
              Your Task List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedTasks.map((task) => {
                const overdue = task.due_date ? isOverdue(task.due_date) : false
                const isChecked = checkedTasks.has(task.id)
                
                return (
                  <div 
                    key={task.id}
                    className={`flex items-center space-x-4 p-4 rounded-lg border transition-all ${
                      isChecked 
                        ? 'bg-success/10 border-success/20 opacity-70' 
                        : overdue 
                          ? 'bg-destructive/10 border-destructive/20' 
                          : 'bg-background/50 border-border/20'
                    }`}
                  >
                    <Checkbox
                      id={task.id}
                      checked={isChecked}
                      onCheckedChange={() => handleTaskToggle(task.id)}
                      className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                    />
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <label 
                          htmlFor={task.id}
                          className={`font-medium cursor-pointer ${
                            isChecked ? 'line-through text-muted-foreground' : 'text-foreground'
                          }`}
                        >
                          {task.title}
                        </label>
                        <Badge 
                          variant={getPriorityColor(task.priority) as any}
                          className="text-xs"
                        >
                          {getPriorityIcon(task.priority)}
                          {task.priority}
                        </Badge>
                      </div>
                      
                      {task.description && (
                        <p className={`text-sm ${
                          isChecked ? 'text-muted-foreground' : 'text-muted-foreground'
                        }`}>
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        {task.due_date && (
                          <span className={overdue ? 'text-destructive font-medium' : ''}>
                            Due: {new Date(task.due_date).toLocaleDateString()}
                            {overdue && ' (Overdue)'}
                          </span>
                        )}
                        {task.listing_id && (
                          <span>Related to listing</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {sortedTasks.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    All caught up!
                  </h3>
                  <p className="text-muted-foreground">
                    You have no pending tasks at the moment.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {completedCount > 0 && (
          <div className="mt-6 text-center">
            <Button 
              variant="hero" 
              className="shadow-elevated"
              onClick={() => {
                // In a real app, this would sync with the backend
                alert(`Great job! You've completed ${completedCount} tasks.`)
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Progress ({completedCount} completed)
            </Button>
          </div>
        )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default TaskChecklist