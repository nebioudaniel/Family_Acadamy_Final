// lib/actions/admin.actions.ts
"use server"

import prisma from "@/lib/prisma"
import { z } from "zod"
import * as bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

// =========================================================
// Schemas
// =========================================================

const createTeacherSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Invalid email format."),
  password: z.string().min(8, "Password must be at least 8 characters."),
})

const updateTeacherSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Invalid email format."),
})

// =========================================================
// Create Teacher
// =========================================================

export async function createTeacher(formData: FormData) {
  // ... (existing implementation)
  const data = Object.fromEntries(formData.entries())
  const validatedFields = createTeacherSchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: "Validation failed: Check inputs." } 
  }

  try {
    const { name, email, password } = validatedFields.data
    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role: "TEACHER",
      },
    })
    
    revalidatePath('/admin/teachers'); 
    return { success: true }
  } catch (error) {
    return { error: "Email already in use or database error." }
  }
}

// =========================================================
// Edit Teacher
// =========================================================

export async function getTeacherDetails(teacherId: string) {
    return prisma.user.findUnique({
        where: { id: teacherId, role: "TEACHER" },
        select: { id: true, name: true, email: true, role: true },
    })
}

export async function updateTeacher(formData: FormData) {
    const data = Object.fromEntries(formData.entries())
    const validatedFields = updateTeacherSchema.safeParse(data)

    if (!validatedFields.success) {
        return { error: "Validation failed: Name and valid email are required." }
    }
    
    try {
        const { id, name, email } = validatedFields.data
        
        await prisma.user.update({
            where: { id, role: "TEACHER" },
            data: { name, email },
        })

        revalidatePath('/admin/teachers')
        return { success: true }
    } catch (error) {
        console.error("Database error during update:", error)
        return { error: "Failed to update teacher. Email may already be in use." }
    }
}

// =========================================================
// Delete Teacher
// =========================================================

export async function deleteTeacher(teacherId: string) {
    // ... (existing implementation)
    try {
        await prisma.user.delete({
            where: { id: teacherId, role: "TEACHER" },
        })

        revalidatePath('/admin/teachers')
        return { success: true }
    } catch (error) {
        console.error("Database error during deletion:", error)
        // P2025 often occurs here, fixed by schema update below.
        return { error: "Failed to delete teacher. Ensure they have no associated records." }
    }
}