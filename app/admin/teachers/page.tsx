// app/admin/teachers/page.tsx
import prisma from "@/lib/prisma"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit, Trash2, Mail, User, CalendarDays } from "lucide-react" // Added Mail, User, CalendarDays
import CreateTeacherDialog from "./_components/CreateTeacherDialog"
import DeleteTeacherAlert from "./_components/DeleteTeacherAlert"
import EditTeacherDialog from "./_components/EditTeacherDialog" 
import { cn } from "@/lib/utils" // Assuming you have this utility

interface Teacher {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: Date;
}

// --- Card Component for Mobile View ---
function TeacherCard({ teacher }: { teacher: Teacher }) {
    return (
        <Card key={teacher.id} className="w-full shadow-md">
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-5 w-5 text-green-600" />
                    <span className="truncate">{teacher.name || "Unknown Teacher"}</span>
                </CardTitle>
                <CardDescription className="flex items-center gap-2 pt-1 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{teacher.email || "N/A"}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" /> Joined:
                    </span>
                    <span className="text-muted-foreground">
                        {teacher.createdAt.toLocaleDateString()}
                    </span>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 p-4 pt-0 border-t">
                <EditTeacherDialog teacherId={teacher.id}> 
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit className="h-4 w-4" /> Edit
                    </Button>
                </EditTeacherDialog>
                
                <DeleteTeacherAlert teacherId={teacher.id} teacherName={teacher.name || "this teacher"}>
                    <Button variant="outline" size="sm" className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                </DeleteTeacherAlert>
            </CardFooter>
        </Card>
    );
}

// --- Main Page Component ---
export default async function TeachersPage() {
  const teachers: Teacher[] = await prisma.user.findMany({
    where: { role: "TEACHER" },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, createdAt: true },
  })
  
  const noTeachersFound = teachers.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Teachers</h1>
        <CreateTeacherDialog>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Add New Teacher</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </CreateTeacherDialog>
      </div>

      {/* --- Desktop Table View (md: and up) --- */}
      <div className="hidden md:block border rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-[150px]">Joined</TableHead>
              <TableHead className="text-right w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.map((teacher) => (
              <TableRow key={teacher.id}>
                <TableCell className="font-medium">{teacher.name}</TableCell>
                <TableCell>{teacher.email}</TableCell>
                <TableCell>{teacher.createdAt.toLocaleDateString()}</TableCell>
                <TableCell className="text-right space-x-2">
                  
                  <EditTeacherDialog teacherId={teacher.id}> 
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </EditTeacherDialog>
                  
                  <DeleteTeacherAlert teacherId={teacher.id} teacherName={teacher.name || "this teacher"}>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </DeleteTeacherAlert>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {noTeachersFound && (
            <div className="p-4 text-center text-gray-500">No teachers found.</div>
        )}
      </div>

      {/* --- Mobile Card List View (Below md:) --- */}
      <div className={cn(
          "md:hidden space-y-4",
          noTeachersFound && "border rounded-lg shadow-sm" // Add border for empty state clarity
      )}>
        {noTeachersFound ? (
            <div className="p-4 text-center text-gray-500">No teachers found.</div>
        ) : (
            teachers.map((teacher) => (
                <TeacherCard key={teacher.id} teacher={teacher} />
            ))
        )}
      </div>

    </div>
  )
}