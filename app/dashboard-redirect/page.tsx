// app/dashboard-redirect/page.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardRedirectPage() {
  const session = await auth()

  if (!session || !session.user) {
    // Safety check for unauthenticated users
    return redirect("/login")
  }

  // NOTE: This requires your session callback (Step 1, Fix A) to properly inject 'role'.
  const { role } = session.user 

  if (role === "ADMIN") {
    return redirect("/admin")
  }

  if (role === "TEACHER") {
    return redirect("/teacher/courses") // Redirect to the teacher dashboard entry point
  }

  // Default redirect (e.g., Student/Public user)
  return redirect("/courses")
}