// app/dashboard/teacher/page.tsx
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, CheckCircle, Clock, Users } from "lucide-react"
import StatsCard from "@/app/teacher/_components/StatusCard"

// 🎯 CRITICAL FIX: Change the expected type to strictly 'string'
async function getDashboardData(teacherId: string) {
  try {
    // Count data concurrently for this specific teacher
    const [totalCourses, publishedCourses, scheduledCourses] = await Promise.all([
      // 'teacherId' is now guaranteed to be a string, fixing the type error
      prisma.course.count({ where: { teacherId } }),
      prisma.course.count({ where: { teacherId, status: "PUBLISHED" } }),
      prisma.course.count({ where: { teacherId, status: "SCHEDULED" } }),
      // ❌ Removed enrollment count — not in schema yet
    ]);

    console.log("[DEBUG] Dashboard counts:", {
      teacherId,
      totalCourses,
      publishedCourses,
      scheduledCourses,
    });

    return { totalCourses, publishedCourses, scheduledCourses };
  } catch (error) {
    console.error("❌ Prisma query failed in Teacher Dashboard:", error);
    return { totalCourses: 0, publishedCourses: 0, scheduledCourses: 0 };
  }
}

export default async function TeacherDashboardPage() {
  const session = await auth();

  // 🔒 Access Control
  if (!session || !session.user || session.user.role !== "TEACHER") {
    return redirect("/login");
  }

  const teacherId = session.user.id;
  if (!teacherId) {
    console.error("❌ Session user ID is missing.");
    return redirect("/error");
  }

  // teacherId is definitely a string here, matching the corrected function signature.
  const data = await getDashboardData(teacherId);

  return (
    <div className="container mx-auto py-8 px-4 space-y-10">
      <div className="space-y-2 border-b pb-4">
        <p className="text-xl font-medium text-green-700">
          Welcome, {session.user.name || "Teacher"}!
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Your Teaching Hub
        </h1>
        <p className="text-md text-gray-500">
          A snapshot of your content and student engagement.
        </p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Your Total Courses"
          value={data.totalCourses}
          description="Your full course portfolio"
          icon={BookOpen}
          colorClass="text-green-600"
        />
        <StatsCard
          title="Published Courses"
          value={data.publishedCourses}
          description="Currently visible to students"
          icon={CheckCircle}
          colorClass="text-indigo-600"
        />
        <StatsCard
          title="Drafts & Pending"
          value={data.scheduledCourses}
          description="Courses not yet published"
          icon={Clock}
          colorClass="text-amber-600"
        />
      </div>

     <div className="pt-300 text-center">
      <p className="text-gray-400">Powered By <a className="text-orange-500">Mesob Ai</a>!</p>
     </div>
    </div>
  );
}