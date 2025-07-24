import { useSidebar } from "@/components/ui/sidebar"

export function SidebarOverlay() {
  const { state, setOpen } = useSidebar()
  
  if (state !== "expanded") return null

  return (
    <div 
      className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm animate-fade-in lg:hidden"
      onClick={() => setOpen(false)}
    />
  )
}