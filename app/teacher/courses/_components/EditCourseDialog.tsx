// app/teacher/courses/_components/EditCourseDialog.tsx
"use client"

import * as React from "react"
import { useFormStatus } from 'react-dom'
import { getCourseDetails, updateCourse } from "@/lib/actions/teacher.actions"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Edit } from "lucide-react"
import { type ReactNode } from "react" // 🌟 FIX 1: Import ReactNode type

// Helper component for pending state
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
    </Button>
  )
}

interface EditCourseDialogProps {
  courseId: string;
  children: ReactNode; // 🌟 FIX 2: Add children to the props interface
}

// Define the Course Status Type for clear casting
type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';

// Ensure this component uses "export default"
export default function EditCourseDialog({ courseId, children }: EditCourseDialogProps) { // 🌟 FIX 3: Destructure children
  const [open, setOpen] = React.useState(false)
  const [course, setCourse] = React.useState<Awaited<ReturnType<typeof getCourseDetails>>>(null)
  // Explicitly type the status state for safety
  const [status, setStatus] = React.useState<CourseStatus>(course?.status as CourseStatus || 'DRAFT');

  // --- 1. Fetch data when dialog opens ---
  React.useEffect(() => {
    if (open) {
      getCourseDetails(courseId).then(data => {
        setCourse(data)
        if (data) setStatus(data.status as CourseStatus)
      }).catch(e => {
        toast.error("Failed to load course data.")
        console.error(e)
      })
    }
  }, [open, courseId])

  // --- 2. Handle Form Submission (Server Action Wrapper) ---
  const formAction = async (formData: FormData) => {
    formData.append('id', courseId); // Ensure the ID is always included
    formData.append('status', status); // Append the state-managed status

    const result = await updateCourse(formData)
    
    if (result.error) {
      toast.error(result.error)
    } else if (result.success) {
      toast.success("Course updated successfully!")
      setOpen(false) // Close dialog on success
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* 🌟 FIX 4: Use the passed children as the trigger */}
        {children} 
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Course: {course?.title}</DialogTitle>
          <DialogDescription>
            Update course details, notes, and publishing status.
          </DialogDescription>
        </DialogHeader>
        
        {course ? (
          <form action={formAction} className="grid gap-6 py-4">
            
            {/* Hidden ID field */}
            <input type="hidden" name="id" value={courseId} />

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={course.title} required />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={course.description} required rows={3} />
            </div>

            {/* Video URL */}
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL (YouTube/Vimeo)</Label>
              <Input id="videoUrl" name="videoUrl" defaultValue={course.videoUrl || ''} placeholder="https://www.youtube.com/watch?v=..." />
            </div>

            {/* Status Select */}
            <div className="space-y-2">
                <Label htmlFor="status">Publishing Status</Label>
                <Select 
                  onValueChange={(value) => setStatus(value as CourseStatus)} 
                  value={status}
                >
                    <SelectTrigger id="status">
                        <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Course Notes/Transcription</Label>
              <Textarea id="notes" name="notes" defaultValue={course.notes || ''} rows={6} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <SubmitButton />
            </DialogFooter>
          </form>
        ) : (
            <div className="text-center py-8 flex justify-center items-center"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading course details...</div>
        )}
      </DialogContent>
    </Dialog>
  )
}