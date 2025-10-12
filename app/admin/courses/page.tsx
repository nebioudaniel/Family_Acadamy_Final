// app/admin/courses/page.tsx
import prisma from "@/lib/prisma"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// 🎯 FIX 1: Remove 'CardFooter'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card" 
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, BookOpen, User, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import CourseSearch from "./_components/CourseSearch" // Client component for search
// 🎯 FIX 2: Remove 'Separator'
// import { Separator } from "@/components/ui/separator" 
import { cn } from "@/lib/utils" // Assuming you have this utility

interface CourseWithTeacher {
    id: string;
    title: string;
    status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
    createdAt: Date;
    teacher: { name: string | null };
}

// Helper for status badges
const getStatusBadge = (status: CourseWithTeacher['status']) => {
  switch (status) {
    case 'PUBLISHED':
      return <Badge className="bg-green-600 hover:bg-green-700">Published</Badge>;
    case 'SCHEDULED':
      return <Badge className="bg-amber-500 hover:bg-amber-600">Scheduled</Badge>;
    case 'DRAFT':
    default:
      return <Badge variant="secondary">Draft</Badge>;
  }
}

// Reusable component for the Course Card view (Mobile)
function CourseCard({ course }: { course: CourseWithTeacher }) {
    return (
        <Card key={course.id} className="w-full shadow-md">
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    <span className="truncate">{course.title}</span>
                </CardTitle>
                <CardDescription className="flex items-center gap-2 pt-1 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    {course.teacher.name || "N/A"}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    {getStatusBadge(course.status)}
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" /> Created:
                    </span>
                    <span className="text-muted-foreground">
                        {course.createdAt.toLocaleDateString()}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

// --- Main Page Component ---
export default async function AdminCoursesPage({
    searchParams,
}: {
    searchParams: { search?: string, status?: string }
}) {
    const searchQuery = searchParams.search || "";
    const statusFilter = searchParams.status || undefined;

    // ... (Your existing data fetching logic)
    const courses: CourseWithTeacher[] = await prisma.course.findMany({
        where: {
            status: statusFilter ? statusFilter as ('DRAFT' | 'PUBLISHED' | 'SCHEDULED') : undefined,
            OR: [
                { title: { contains: searchQuery, mode: 'insensitive' } },
                { description: { contains: searchQuery, mode: 'insensitive' } },
            ],
        },
        include: {
            teacher: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
    });
    // ...

    const noCoursesFound = courses.length === 0;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">All Course Oversight</h1>
            
            {/* Search and Filter UI */}
            <CourseSearch currentSearch={searchQuery} currentStatus={statusFilter} />

            {/* --- Desktop Table View (md: and up) --- */}
            <div className="hidden md:block border rounded-lg shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead className="w-[180px]">Teacher</TableHead>
                            <TableHead className="w-[120px]">Status</TableHead>
                            <TableHead className="w-[120px]">Created</TableHead>
                            <TableHead className="text-right w-[150px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {courses.map((course) => (
                            <TableRow key={course.id}>
                                <TableCell className="font-medium max-w-xs truncate">{course.title}</TableCell>
                                <TableCell>{course.teacher.name || "N/A"}</TableCell>
                                <TableCell>{getStatusBadge(course.status)}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">{course.createdAt.toLocaleDateString()}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    {/* Action Buttons (placeholders for Admin-specific components) */}
                                    {/* <AdminEditCourseDialog courseId={course.id}> */}
                                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                    {/* </AdminEditCourseDialog> */}
                                    {/* <AdminDeleteCourseAlert courseId={course.id} courseTitle={course.title}> */}
                                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-600" /></Button>
                                    {/* </AdminDeleteCourseAlert> */}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {noCoursesFound && (
                    <div className="p-4 text-center text-gray-500">No courses found matching criteria.</div>
                )}
            </div>

            {/* --- Mobile Card List View (Below md:) --- */}
            <div className={cn(
                "md:hidden space-y-4",
                noCoursesFound && "border rounded-lg shadow-sm" // Only show border if no results
            )}>
                {noCoursesFound ? (
                    <div className="p-4 text-center text-gray-500">No courses found matching criteria.</div>
                ) : (
                    courses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                    ))
                )}
            </div>
        </div>
    )
}