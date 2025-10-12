// app/admin/teachers/_components/DeleteTeacherAlert.tsx
"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteTeacher } from "@/lib/actions/admin.actions" // Import the new action
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface DeleteTeacherAlertProps {
  teacherId: string
  teacherName: string
  children: React.ReactNode // The trigger button passed from the server component
}

export default function DeleteTeacherAlert({ teacherId, teacherName, children }: DeleteTeacherAlertProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  // This is the client-side event handler
  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteTeacher(teacherId) // Call the Server Action
    
    if (result.success) {
      toast.success(`Teacher "${teacherName}" deleted successfully.`)
    } else {
      toast.error(result.error || "Failed to delete teacher.")
    }
    setIsDeleting(false)
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the teacher: 
            <span className="font-semibold text-foreground block mt-2">-{teacherName}</span> 
            and their associated user data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            // The onClick is local to this Client Component, so it's correct
            onClick={handleDelete} 
            className="bg-red-600 hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Delete Teacher'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}