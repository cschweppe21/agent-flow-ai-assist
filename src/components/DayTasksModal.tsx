import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Check, X, Bot, Loader2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "./AuthProvider"
import { useToast } from "@/hooks/use-toast"

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: string
  created_at?: string
  updated_at?: string
  user_id?: string
  due_date?: string
  listing_id?: string
}

interface AIRecommendation {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
}

interface DayTasksModalProps {
  date: string
  isOpen: boolean
  onClose: () => void
  onTasksUpdated: () => void
}

export const DayTasksModal = ({ date, isOpen, onClose, onTasksUpdated }: DayTasksModalProps) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const fetchTasks = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('due_date', date)
        .order('created_at', { ascending: true })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive"
      })
    }
  }

  const addTask = async () => {
    if (!user || !newTaskTitle.trim()) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: newTaskTitle.trim(),
          due_date: date,
          user_id: user.id,
          priority: 'medium'
        })
        .select()
        .single()

      if (error) throw error

      setTasks([...tasks, data])
      setNewTaskTitle("")
      onTasksUpdated()
      
      toast({
        title: "Success",
        description: "Task added successfully"
      })
    } catch (error) {
      console.error('Error adding task:', error)
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive"
      })
    }
  }

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId)

      if (error) throw error

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed } : task
      ))
      onTasksUpdated()
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

      setTasks(tasks.filter(task => task.id !== taskId))
      onTasksUpdated()
      
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

  const getAIRecommendations = async () => {
    setIsLoadingRecommendations(true)
    setShowRecommendations(true)
    
    try {
      const existingTasks = tasks.map(t => t.title).join(', ')
      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' })
      
      const response = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [
            {
              role: 'system',
              content: `You are a productivity assistant for real estate agents. Generate 3-5 specific, actionable task recommendations for ${dayOfWeek}, ${formatDate(date)}. Consider real estate activities like client follow-ups, property research, marketing tasks, administrative work, etc. Existing tasks: ${existingTasks || 'none'}. Return as JSON array with objects containing: title, description, priority (low/medium/high).`
            },
            {
              role: 'user',
              content: `Generate task recommendations for a real estate agent for ${dayOfWeek}. Make them specific and actionable.`
            }
          ]
        }
      })

      if (response.error) throw response.error

      const aiResponse = response.data?.response
      if (aiResponse) {
        // Try to parse JSON from AI response
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const parsedRecommendations = JSON.parse(jsonMatch[0])
          setRecommendations(parsedRecommendations.map((rec: any, index: number) => ({
            id: `rec-${index}`,
            title: rec.title,
            description: rec.description,
            priority: rec.priority || 'medium'
          })))
        } else {
          // Fallback to manual recommendations
          setRecommendations([
            {
              id: 'rec-1',
              title: 'Follow up with recent leads',
              description: 'Contact potential buyers from this week',
              priority: 'high'
            },
            {
              id: 'rec-2', 
              title: 'Update property listings',
              description: 'Review and update active listings with new photos or price changes',
              priority: 'medium'
            },
            {
              id: 'rec-3',
              title: 'Schedule property showings',
              description: 'Coordinate showing appointments for the week',
              priority: 'medium'
            }
          ])
        }
      }
    } catch (error) {
      console.error('Error getting AI recommendations:', error)
      // Fallback recommendations
      setRecommendations([
        {
          id: 'rec-1',
          title: 'Review market trends',
          description: 'Check latest market data and trends',
          priority: 'medium'
        },
        {
          id: 'rec-2',
          title: 'Contact existing clients',
          description: 'Follow up on current transactions',
          priority: 'high'
        }
      ])
    } finally {
      setIsLoadingRecommendations(false)
    }
  }

  const addRecommendation = async (recommendation: AIRecommendation) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: recommendation.title,
          description: recommendation.description,
          due_date: date,
          user_id: user.id,
          priority: recommendation.priority
        })
        .select()
        .single()

      if (error) throw error

      setTasks([...tasks, data])
      setRecommendations(recommendations.filter(rec => rec.id !== recommendation.id))
      onTasksUpdated()
      
      toast({
        title: "Success",
        description: "Task added from AI recommendation"
      })
    } catch (error) {
      console.error('Error adding recommendation:', error)
      toast({
        title: "Error",
        description: "Failed to add recommended task",
        variant: "destructive"
      })
    }
  }

  const removeRecommendation = (recommendationId: string) => {
    setRecommendations(recommendations.filter(rec => rec.id !== recommendationId))
  }

  useEffect(() => {
    if (isOpen) {
      fetchTasks()
      setShowRecommendations(false)
      setRecommendations([])
    }
  }, [isOpen, date])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Tasks for {formatDate(date)}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={getAIRecommendations}
              disabled={isLoadingRecommendations}
            >
              <Bot className="h-4 w-4 mr-2" />
              {isLoadingRecommendations ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Getting AI Suggestions...
                </>
              ) : (
                'Get AI Suggestions'
              )}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Task */}
          <div className="flex gap-2">
            <Input
              placeholder="Add a new task..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              className="flex-1"
            />
            <Button onClick={addTask} disabled={!newTaskTitle.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* AI Recommendations */}
          {showRecommendations && (
            <div className="border rounded-lg p-4 bg-muted/20">
              <h3 className="font-medium mb-3 flex items-center">
                <Bot className="h-4 w-4 mr-2 text-primary" />
                AI Task Recommendations
              </h3>
              {isLoadingRecommendations ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Getting personalized recommendations...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="flex items-start gap-3 p-3 bg-background rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{rec.title}</span>
                          <Badge className={`text-xs ${getPriorityColor(rec.priority)}`}>
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{rec.description}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addRecommendation(rec)}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="h-3 w-3 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeRecommendation(rec.id)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Existing Tasks */}
          <div className="space-y-2">
            <h3 className="font-medium">Tasks ({tasks.length})</h3>
            {tasks.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                No tasks for this day. Add one above or get AI suggestions!
              </p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={(checked) => toggleTask(task.id, !!checked)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </span>
                      <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className={`text-xs ${task.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                        {task.description}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteTask(task.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
