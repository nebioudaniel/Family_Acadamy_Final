// app/admin/page.tsx
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, Clock, CheckCircle } from "lucide-react"

// Function to fetch all counts concurrently
async function getDashboardData() {
  const [totalTeachers, totalCourses, publishedCourses, scheduledCourses] = await Promise.all([
    // Total Teachers
    prisma.user.count({ where: { role: 'TEACHER' } }),
    // Total Courses
    prisma.course.count(),
    // Published Courses
    prisma.course.count({ where: { status: 'PUBLISHED' } }),
    // Scheduled Courses
    prisma.course.count({ where: { status: 'SCHEDULED' } }),
  ]);

  return { totalTeachers, totalCourses, publishedCourses, scheduledCourses };
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: Total Teachers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">Accounts with TEACHER role</p>
          </CardContent>
        </Card>

        {/* Card 2: Total Courses (All Statuses) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCourses}</div>
            <p className="text-xs text-muted-foreground">Total records in database</p>
          </CardContent>
        </Card>

        {/* Card 3: Published Courses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Courses</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.publishedCourses}</div>
            <p className="text-xs text-muted-foreground">Currently visible to students</p>
          </CardContent>
        </Card>

        {/* Card 4: Scheduled Courses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Schedules</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.scheduledCourses}</div>
            <p className="text-xs text-muted-foreground">Courses waiting to publish</p>
          </CardContent>
        </Card>

      </div>
      
      {/* You would link the sections here */}
      <div className="pt-200 text-center">
        <p className="text-gray-500">Powerd By <a className="text-orange-500">Mesob Ai</a> !</p>
        {/* Example quick links */}
      </div>
    </div>
  )
}