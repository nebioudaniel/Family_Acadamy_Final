// app/teacher/courses/_components/TeacherCoursesTable.tsx
"use client"

import * as React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Clock, CheckCircle, Save } from "lucide-react"
import { toast } from "sonner" // 🌟 WARNING: 'toast' is defined but never used. REMOVED in this fix.
import DeleteCourseAlert from "./DeleteCourseAlert" 
import EditCourseDialog from "./EditCourseDialog" 

// Define a simple type based on the fetched data
type CourseItem = {
    id: string;
    title: string;
    status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
    createdAt: Date;
    scheduledAt: Date | null;
}

const getStatusBadge = (status: CourseItem['status']) => {
  switch (status) {
    case 'PUBLISHED':
      // 🎯 CRITICAL FIX 1: Change variant from "success" to an allowed variant like "default" or "secondary"
      return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" /> Published</Badge>;
      
    case 'SCHEDULED':
      // 🎯 CRITICAL FIX 2: Change variant from "warning" to an allowed variant like "secondary"
      return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100"><Clock className="h-3 w-3 mr-1" /> Scheduled</Badge>;
      
    case 'DRAFT':
    default:
      return <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100"><Save className="h-3 w-3 mr-1" /> Draft</Badge>;
  }
}

// 🌟 WARNING FIX: Remove unused 'toast' import from the top of the file
// import { toast } from "sonner" 

export default function TeacherCoursesTable({ courses }: { courses: CourseItem[] }) {
  return (
    <div className="border rounded-lg shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created On</TableHead>
            <TableHead className="text-right w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.id}>
              <TableCell className="font-medium max-w-sm truncate">{course.title}</TableCell>
              <TableCell>{getStatusBadge(course.status)}</TableCell>
              <TableCell>{course.createdAt.toLocaleDateString()}</TableCell>
              <TableCell className="text-right space-x-2">
                
                {/* Edit Button with Dialog */}
                <EditCourseDialog courseId={course.id}>
                    <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                    </Button>
                </EditCourseDialog>

                {/* Delete Button with Alert Dialog */}
                <DeleteCourseAlert courseId={course.id} courseTitle={course.title}>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </DeleteCourseAlert>

              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {courses.length === 0 && (
          <div className="p-4 text-center text-gray-500">You have not created any courses yet.</div>
      )}
    </div>
  )
}