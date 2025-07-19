import { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { cn } from "@/lib/utils"

interface MetricsCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  data?: Array<{ value: number }>
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'destructive'
}

export const MetricsCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  data,
  className,
  variant = 'default'
}: MetricsCardProps) => {
  const variantStyles = {
    default: "bg-gradient-card border-border/50",
    success: "bg-gradient-success border-success/20",
    warning: "bg-warning/5 border-warning/20",
    destructive: "bg-destructive/5 border-destructive/20"
  }

  const iconStyles = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive"
  }

  return (
    <Card className={cn(
      "shadow-card hover:shadow-elevated transition-all duration-300 hover:scale-105",
      variantStyles[variant],
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("h-5 w-5", iconStyles[variant])}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-foreground">{value}</div>
          {data && (
            <div className="h-8 w-16">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={cn(
                      variant === 'success' ? 'hsl(var(--success))' :
                      variant === 'warning' ? 'hsl(var(--warning))' :
                      variant === 'destructive' ? 'hsl(var(--destructive))' :
                      'hsl(var(--primary))'
                    )}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        {trend && (
          <div className="flex items-center mt-1">
            <span className={cn(
              "text-xs font-medium",
              trend.isPositive ? "text-success" : "text-destructive"
            )}>
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}