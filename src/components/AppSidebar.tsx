import { useState } from "react"
import { Home, Users, CheckSquare, Wrench, MessageSquare, TrendingUp } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Client Overview", url: "/clients", icon: Users },
  { title: "Task Checklist", url: "/tasks", icon: CheckSquare },
  { title: "Vendors", url: "/vendors", icon: Wrench },
  { title: "AI Assistant", url: "/ai-assistant", icon: MessageSquare },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"

  return (
    <Sidebar
      className={`fixed lg:relative z-50 animate-slide-in-right transition-all duration-300 ease-out ${
        state === "collapsed" ? "w-14" : "w-64"
      } border-r bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-2xl`}
      collapsible="icon"
    >
      <SidebarContent className="animate-fade-in">
        <SidebarGroup className="animate-scale-in">
          <SidebarGroupLabel className="text-sm font-semibold text-muted-foreground px-2 py-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item, index) => (
                <SidebarMenuItem key={item.title} className="animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                  <SidebarMenuButton asChild className="hover-scale">
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-3 h-5 w-5 transition-colors" />
                      {state !== "collapsed" && (
                        <span className="transition-opacity duration-300">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}