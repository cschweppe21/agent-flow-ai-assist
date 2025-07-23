import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/Header"
import { FloatingAIButton } from "@/components/FloatingAIButton"
import { useMockDashboardData } from "@/hooks/useMockDashboardData"
import { 
  ArrowLeft, 
  MapPin, 
  DollarSign, 
  Calendar, 
  User, 
  FileText, 
  Heart, 
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus
} from "lucide-react"

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { listings, tasks } = useMockDashboardData()
  
  const [listingNotes, setListingNotes] = useState("Property has great natural light and needs minor cosmetic updates. Seller is motivated.")
  const [clientNotes, setClientNotes] = useState("Client wants to close within 30 days. Prefers weekday showings between 10am-4pm. Has backup offer ready.")
  const [taskStates, setTaskStates] = useState<Record<string, boolean>>({
    "photos": true,
    "staging": false,
    "marketing": true,
    "showing": false,
    "repairs": false,
    "inspection": false,
    "appraisal": false,
    "disclosure": true
  })

  const listing = listings.find(l => l.id === id)
  const listingTasks = tasks.filter(task => task.listing_id === id)

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Listing Not Found</h1>
            <Button onClick={() => navigate("/")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const statusStyles = {
    active: "bg-listing-active text-white",
    pending: "bg-listing-pending text-white",
    sold: "bg-listing-sold text-white",
    expired: "bg-listing-expired text-white"
  }

  const statusLabels = {
    active: "Active",
    pending: "Pending", 
    sold: "Sold",
    expired: "Expired"
  }

  const calculatedCommission = (listing.price * 3) / 100

  const recommendedTasks = [
    { id: "photos", label: "Professional Photos", completed: taskStates.photos },
    { id: "staging", label: "Home Staging", completed: taskStates.staging },
    { id: "marketing", label: "Marketing Materials", completed: taskStates.marketing },
    { id: "showing", label: "Schedule Showings", completed: taskStates.showing },
    { id: "repairs", label: "Complete Repairs", completed: taskStates.repairs },
    { id: "inspection", label: "Pre-Inspection", completed: taskStates.inspection },
    { id: "appraisal", label: "Market Appraisal", completed: taskStates.appraisal },
    { id: "disclosure", label: "Disclosure Documents", completed: taskStates.disclosure }
  ]

  const toggleTask = (taskId: string) => {
    setTaskStates(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }))
  }

  const completedTasks = Object.values(taskStates).filter(Boolean).length
  const totalTasks = Object.keys(taskStates).length
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button onClick={() => navigate("/")} variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{listing.address}</h1>
              <div className="flex items-center space-x-4 text-muted-foreground">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>MLS: {listing.mls_number || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Listed: {new Date(listing.listing_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={statusStyles[listing.status]}>
                {statusLabels[listing.status]}
              </Badge>
              {listing.status === 'active' && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    // Update listing status to closed/sold
                    // This would need to be connected to your data update function
                    navigate('/clients')
                  }}
                >
                  Close Listing
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Overview */}
            <Card className="shadow-card bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <DollarSign className="h-5 w-5 mr-2 text-primary" />
                  Property Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">List Price</p>
                    <p className="text-xl font-bold text-foreground">${listing.price.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bedrooms</p>
                    <p className="text-xl font-bold text-foreground">{listing.bedrooms || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bathrooms</p>
                    <p className="text-xl font-bold text-foreground">{listing.bathrooms || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sq Ft</p>
                    <p className="text-xl font-bold text-foreground">{listing.square_feet?.toLocaleString() || 'N/A'}</p>
                  </div>
                </div>
                <div className="bg-primary/5 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Estimated Commission (3%)</span>
                    <span className="text-2xl font-bold text-primary">${calculatedCommission.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Listing Notes */}
            <Card className="shadow-card bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Listing Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={listingNotes}
                  onChange={(e) => setListingNotes(e.target.value)}
                  placeholder="Add notes about the property..."
                  className="min-h-[120px]"
                />
              </CardContent>
            </Card>

            {/* Client Notes */}
            <Card className="shadow-card bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Heart className="h-5 w-5 mr-2 text-primary" />
                  Client Notes & Wants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  placeholder="Add notes about client preferences, requirements, and wants..."
                  className="min-h-[120px]"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Overview */}
            <Card className="shadow-card bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-primary" />
                  Progress Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-primary mb-1">{progressPercentage}%</div>
                  <div className="text-sm text-muted-foreground">
                    {completedTasks} of {totalTasks} tasks completed
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recommended Tasks */}
            <Card className="shadow-card bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-foreground">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-primary" />
                    Recommended Tasks
                  </div>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendedTasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-background/50">
                      <Checkbox
                        id={task.id}
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                      />
                      <label 
                        htmlFor={task.id} 
                        className={`flex-1 text-sm cursor-pointer ${
                          task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                        }`}
                      >
                        {task.label}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Listing Tasks */}
            {listingTasks.length > 0 && (
              <Card className="shadow-card bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground">
                    <Clock className="h-5 w-5 mr-2 text-primary" />
                    Listing Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {listingTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-foreground">{task.title}</p>
                          {task.due_date && (
                            <p className="text-xs text-muted-foreground">
                              Due: {new Date(task.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : 'outline'}>
                            {task.priority}
                          </Badge>
                          {task.due_date && new Date(task.due_date) < new Date() && (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <FloatingAIButton />
    </div>
  )
}

export default ListingDetail