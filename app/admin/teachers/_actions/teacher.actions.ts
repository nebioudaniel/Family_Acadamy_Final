// app/admin/teachers/_actions/teacher.actions.ts
"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { hash } from "bcryptjs"
import { TeacherFormSchema } from "@/lib/validation/schemas" // Define this later (Zod)
import * as z from 'zod' 
// --- 1. CREATE Teacher ---
export async function createTeacher(data: z.infer<typeof TeacherFormSchema>) {
  try {
    // Hash the password securely
    const hashedPassword = await hash(data.password, 10)

    await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        hashedPassword: hashedPassword,
        role: "TEACHER", // Explicitly set role
      },
    })

    revalidatePath("/admin/teachers")
    return { success: true, message: "Teacher created successfully." }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Failed to create teacher." }
  }
}

// --- 2. DELETE Teacher ---
export async function deleteTeacher(teacherId: string) {
  try {
    await prisma.user.delete({
      where: { id: teacherId, role: "TEACHER" },
    })

    revalidatePath("/admin/teachers")
    return { success: true, message: "Teacher deleted." }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Failed to delete teacher." }
  }
}

// NOTE: You would add an `updateTeacher` function here as well.