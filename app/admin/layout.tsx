// app/admin/layout.tsx

import { auth } from "@/lib/auth" 
import { redirect } from "next/navigation"
import AdminSidebar from "./_components/AdminSidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // --- 1. Authorization Check ---
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    return redirect("/login?error=UnauthorizedAccess")
  }

  // --- 2. Layout Structure (FIXED FOR RESPONSIVENESS) ---
  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      
      {/* Sidebar: 
        1. On mobile (default), it's hidden (hidden).
        2. On medium screens (md:), it appears as a fixed 256px width (md:block w-64).
        3. flex-shrink-0 prevents it from shrinking on desktop.
      */}
      <div className="hidden md:block w-64 flex-shrink-0">
        <AdminSidebar />
      </div>

      {/* Main Content Area: Takes the remaining width
      */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        
        {/* Mobile Menu Trigger
          AdminSidebar is now responsible for displaying the Menu icon 
          on mobile, but it needs to be positioned. 
          A common pattern is to put the mobile trigger button 
          in the main content area or in a top-bar component.

          Since AdminSidebar.tsx already handles the mobile Sheet, 
          we need a small top bar on mobile to house the trigger.
          
          For simplicity, we'll place the trigger directly here on mobile
          and hide it on desktop.
        */}
        <div className="md:hidden mb-4">
            {/* The AdminSidebar component already handles the rendering logic 
              and displays the Sheet/Menu button on mobile (isDesktop=false)
            */}
            <AdminSidebar />
        </div>
        
        {/* All pages inside /admin will be rendered here */}
        {children}
      </main>
      
    </div>
  )
}