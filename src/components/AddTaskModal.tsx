import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, CalendarIcon, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/components/AuthProvider"
import { useToast } from "@/hooks/use-toast"

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onTaskAdded: () => void
  selectedDate?: string
}

export const AddTaskModal = ({ isOpen, onClose, onTaskAdded, selectedDate }: AddTaskModalProps) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [dueDate, setDueDate] = useState<Date | undefined>(
    selectedDate ? new Date(selectedDate) : undefined
  )
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !title.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          priority,
          due_date: dueDate ? dueDate.toISOString().split('T')[0] : null,
          user_id: user.id,
          completed: false
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Task created successfully"
      })

      // Reset form
      setTitle("")
      setDescription("")
      setPriority('medium')
      setDueDate(selectedDate ? new Date(selectedDate) : undefined)
      
      onTaskAdded()
      onClose()
    } catch (error) {
      console.error('Error creating task:', error)
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priorityValue: string) => {
    switch (priorityValue) {
      case 'high': return 'border-red-500 bg-red-50 text-red-700'
      case 'medium': return 'border-yellow-500 bg-yellow-50 text-yellow-700'
      case 'low': return 'border-green-500 bg-green-50 text-green-700'
      default: return 'border-gray-500 bg-gray-50 text-gray-700'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Add New Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description..."
              className="mt-1 min-h-[80px]"
            />
          </div>

          <div>
            <Label>Priority</Label>
            <div className="flex gap-2 mt-2">
              {(['low', 'medium', 'high'] as const).map((priorityOption) => (
                <button
                  key={priorityOption}
                  type="button"
                  onClick={() => setPriority(priorityOption)}
                  className={cn(
                    "px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all capitalize flex-1",
                    priority === priorityOption 
                      ? getPriorityColor(priorityOption)
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  )}
                >
                  {priorityOption}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-2",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || !title.trim()}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                "Create Task"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}