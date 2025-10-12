// app/teacher/layout.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import TeacherSidebar from "./_components/TeacherSidebar"

// Define the sidebar width (w-64 is 256px) for use in margin calculation
const SIDEBAR_WIDTH_CLASS = "w-64";
const SIDEBAR_WIDTH_PX = "256px"; 

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  // 1. Check Login Status & Role (Authorization)
  if (!session || !session.user) {
    return redirect("/login?callbackUrl=/teacher")
  }
  if (session.user.role !== "TEACHER") {
    if (session.user.role === "ADMIN") {
        return redirect("/admin")
    }
    return redirect("/unauthorized") 
  }

  // 2. Layout Structure (FIXED FOR RESPONSIVENESS)
  return (
    // Use `relative` to position the fixed header correctly
    <div className="relative flex min-h-screen bg-gray-50"> 
      
      {/* A. DESKTOP SIDEBAR (Static, Fixed Width)
        - hidden: Hides it completely on mobile.
        - md:block: Makes it visible on tablet/desktop.
        - flex-shrink-0: Ensures it keeps its width.
      */}
      <aside 
        className={`hidden md:flex flex-col flex-shrink-0 ${SIDEBAR_WIDTH_CLASS} h-screen fixed top-0 left-0 border-r bg-card shadow-lg z-20`}
      >
        <TeacherSidebar />
      </aside>

      {/* B. FIXED HEADER (Top Bar)
        - The margin-left (md:ml) shifts the header over to clear the sidebar on desktop.
      */}
      <header 
        className={`fixed top-0 left-0 w-full bg-white border-b z-10 p-4 transition-all duration-300 md:ml-${SIDEBAR_WIDTH_PX}`}
        style={{ transitionProperty: 'margin-left' }} // Ensures smooth margin adjustment
      >
        <div className="flex items-center justify-between">
            
            {/* MOBILE NAV BAR ICON: Where the sidebar component is rendered on mobile */}
            {/* It displays the Menu icon because the media query in TeacherSidebar.tsx is false */}
            <div className="md:hidden mr-4">
                <TeacherSidebar />
            </div>

            <h1 className="text-xl font-bold text-gray-800">Teacher Portal</h1>
            {/* Placeholder for user info/notifications if needed */}
            <div className="md:block hidden">
                <span className="text-sm text-muted-foreground">Welcome, {session.user.name || "Teacher"}</span>
            </div>
        </div>
      </header>

      {/* C. MAIN CONTENT AREA
        - pt-20: Adds space below the fixed header (adjust as needed).
        - md:ml-64: Pushes the content over to clear the sidebar on tablet/desktop.
      */}
      <main 
        className={`flex-1 p-6 pt-20 transition-all duration-300 md:ml-64`}
        style={{ transitionProperty: 'margin-left' }}
      >
        {children}
      </main>
      
    </div>
  )
}