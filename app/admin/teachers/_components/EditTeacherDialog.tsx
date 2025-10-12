// app/admin/teachers/_components/EditTeacherDialog.tsx
"use client"

import * as React from "react"
import { useFormStatus } from 'react-dom'
import { getTeacherDetails, updateTeacher } from "@/lib/actions/admin.actions"
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
// 🎯 FIX 1: Remove unused 'Edit' icon
import { Loader2 } from "lucide-react"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
    </Button>
  )
}

interface EditTeacherDialogProps {
  teacherId: string;
  children: React.ReactNode;
}

export default function EditTeacherDialog({ teacherId, children }: EditTeacherDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [teacher, setTeacher] = React.useState<Awaited<ReturnType<typeof getTeacherDetails>>>(null)

  // Fetch data when dialog opens
  React.useEffect(() => {
    if (open) {
      getTeacherDetails(teacherId).then(data => {
        setTeacher(data)
      // 🎯 FIX 2: Replace unused 'e' with '_e' in the catch block
      }).catch(_e => { 
        toast.error("Failed to load teacher data.")
      })
    }
  }, [open, teacherId])

  const formAction = async (formData: FormData) => {
    formData.append('id', teacherId);
    const result = await updateTeacher(formData)
    
    if (result.error) {
      toast.error(result.error)
    } else if (result.success) {
      toast.success("Teacher profile updated successfully!")
      setOpen(false) 
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Teacher: {teacher?.name}</DialogTitle>
          <DialogDescription>
            Update the teacher&apos;s name and email address.
          </DialogDescription>
        </DialogHeader>
        
        {teacher ? (
          <form action={formAction}>
            <div className="grid gap-4 py-4">
              
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={teacher.name || ''} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={teacher.email} required />
              </div>
              
              <div className="text-sm text-muted-foreground pt-2">
                Note: Password reset must be done separately.
              </div>

            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <SubmitButton />
            </DialogFooter>
          </form>
        ) : (
            <div className="text-center py-8 flex justify-center items-center"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading data...</div>
        )}
      </DialogContent>
    </Dialog>
  )
}