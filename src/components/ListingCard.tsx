import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, DollarSign, MapPin, MoreHorizontal, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"

interface ListingCardProps {
  id: string
  address: string
  price: number
  commissionRate: number
  status: 'active' | 'pending' | 'sold' | 'expired'
  daysOnMarket: number
  lastActivity: string
  clientName: string
}

export const ListingCard = ({
  id,
  address,
  price,
  commissionRate,
  status,
  daysOnMarket,
  lastActivity,
  clientName
}: ListingCardProps) => {
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

  const calculatedCommission = (price * commissionRate) / 100

  return (
    <Card className="shadow-card hover:shadow-elevated transition-all duration-300 hover:scale-105 bg-gradient-card border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground line-clamp-1">
              {address}
            </CardTitle>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>Client: {clientName}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={cn(statusStyles[status])}>
              {statusLabels[status]}
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-primary mr-2" />
            <div>
              <p className="text-sm text-muted-foreground">List Price</p>
              <p className="font-semibold text-foreground">
                ${price.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-primary mr-2" />
            <div>
              <p className="text-sm text-muted-foreground">Days on Market</p>
              <p className="font-semibold text-foreground">{daysOnMarket}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-primary/5 rounded-lg p-3 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Commission ({commissionRate}%)</span>
            <span className="font-bold text-primary text-lg">
              ${calculatedCommission.toLocaleString()}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Last activity: {lastActivity}</span>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground">
              View Details
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-secondary" asChild>
              <Link to={`/ai-assistant?listing=${id}`}>
                <Bot className="h-4 w-4 mr-1" />
                Ask AI
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}