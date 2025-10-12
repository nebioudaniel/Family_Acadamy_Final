// app/admin/teachers/_components/CreateTeacherDialog.tsx
"use client"

import * as React from "react"
import { useFormStatus } from 'react-dom'
import { createTeacher } from "@/lib/actions/admin.actions"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

// Helper component for pending state
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Teacher'}
    </Button>
  )
}

export default function CreateTeacherDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const formRef = React.useRef<HTMLFormElement>(null)

  // Use the standard Server Action pattern here
  const formAction = async (formData: FormData) => {
    const result = await createTeacher(formData)
    
    if (result.error) {
      toast.error(result.error)
    } else if (result.success) {
      toast.success("Teacher account created successfully!")
      setOpen(false) // Close dialog on success
      formRef.current?.reset() // Clear form fields
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Teacher</DialogTitle>
          <DialogDescription>
            Enter the details for the new teacher account. They will be granted TEACHER access.
          </DialogDescription>
        </DialogHeader>
        
        {/* The form must use the Server Action */}
        <form action={formAction} ref={formRef}>
          <div className="grid gap-4 py-4">
            
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="John Smith" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="teacher@example.com" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Initial Password</Label>
              <Input id="password" name="password" type="password" placeholder="At least 8 characters" required />
            </div>

          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}