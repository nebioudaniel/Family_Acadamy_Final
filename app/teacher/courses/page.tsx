import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import TeacherCoursesTable from "./_components/TeacherCoursesTable"
// --- New Import ---
import SearchInput from "@/components/SearchInput" // Assuming a reusable SearchInput component

// Add 'searchParams' to the component signature
export default async function TeacherCoursesPage({
  searchParams,
}: {
  searchParams: { title?: string }
}) {
  const session = await auth()
  const teacherId = session?.user?.id

  if (!teacherId) return redirect("/login")

  // Extract the search term from searchParams
  const title = searchParams.title || ""

  // Update the Prisma query to include filtering by title
  const courses = await prisma.course.findMany({
    where: {
      teacherId,
      // Add a filter for the course title (case-insensitive search)
      title: {
        contains: title,
        mode: "insensitive", // For case-insensitive search in PostgreSQL/MySQL
      },
    },
    select: { id: true, title: true, status: true, createdAt: true, scheduledAt: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <Link href="/teacher/courses/create" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> New Course
          </Button>
        </Link>
      </div>

      {/* --- Add Search Input --- */}
      <SearchInput placeholder="Search courses by title..." />

      <TeacherCoursesTable courses={courses} />
    </div>
  )
}