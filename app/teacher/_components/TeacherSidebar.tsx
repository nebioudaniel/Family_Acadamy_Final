"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BookOpen, LogOut, Menu } from "lucide-react"
import { signOut } from "next-auth/react"

// Import shadcn/ui components
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils" // Utility for combining class names
// NOTE: Ensure you have this custom hook or an alternative
import { useMediaQuery } from "@/hooks/use-media-query" 

// --- Component Logic and Data ---
const navItems = [
  { href: "/teacher/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/teacher/courses", icon: BookOpen, label: "My Courses" },
]

// Separate the navigation links into a reusable component
function SidebarContent({ className }: { className?: string }) {
  const pathname = usePathname()

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = pathname.startsWith(item.href)
    return (
      <Link
        key={item.href}
        href={item.href}
        // Using cn for better class management, similar to the admin component
        className={cn(
          "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            : "text-muted-foreground hover:bg-muted",
          className
        )}
      >
        <item.icon className="h-4 w-4" />
        <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <div className="flex w-full h-full flex-col space-y-4 p-4">
      {/* Header */}
      <h2 className="text-xl font-bold text-primary mb-2 px-3">Teacher Portal</h2>
      <Separator className="mb-2" />

      {/* Navigation */}
      <nav className="flex flex-col space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Sign Out Button */}
      <div className="mt-auto pt-4 border-t">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}

// --- Main Component (FIXED FOR RESPONSIVENESS) ---
export default function TeacherSidebar() {
  const isDesktop = useMediaQuery("(min-width: 768px)") // md: breakpoint

  // Desktop Sidebar
  if (isDesktop) {
    return (
      // The original desktop container, but now explicitly blocked on desktop
      <div className="hidden md:block h-full flex-shrink-0 w-full border-r bg-card shadow-sm">
        <SidebarContent />
      </div>
    )
  }

  // Mobile Sidebar (Sheet)
  return (
    // Only renders the Sheet (menu icon) on mobile, which is the button/trigger
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      {/* SheetContent must have w-64 for the sidebar width */}
      <SheetContent side="left" className="w-64 p-0">
        <SidebarContent className="h-full" />
      </SheetContent>
    </Sheet>
  )
}
