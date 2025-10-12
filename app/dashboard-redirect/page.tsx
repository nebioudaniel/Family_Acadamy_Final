// app/dashboard-redirect/page.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardRedirectPage() {
  const session = await auth()

  if (!session || !session.user) {
    // Should not happen after a successful signIn, but safety first
    return redirect("/login")
  }

  const { role } = session.user

  if (role === "ADMIN") {
    return redirect("/admin")
  }

  if (role === "TEACHER") {
    return redirect("/teacher/courses")
  }

  // Default redirect for STUDENTS (if you implement that role fully) or other users
  return redirect("/courses")
}