// lib/actions/teacher.actions.ts
"use server"

import prisma from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"
// import { auth } from "@/lib/auth" // Optional: if you want to check teacher ownership

// ======================
// 🧩 Validation Schema
// ======================
const updateCourseSchema = z.object({
  id: z.string(),
  title: z.string().min(5, "Title must be at least 5 characters."),
  description: z.string().min(20, "Description must be at least 20 characters."),
  videoUrl: z
    .string()
    .refine(
      (val) =>
        !val || // allow empty string
        val.startsWith("/videos/") || // allow internal uploads
        /^https?:\/\/.+/.test(val), // allow full URLs
      { message: "Must be a valid URL or internal video path." }
    )
    .optional(),
  // 🚨 FIX: status field removed from the schema
  notes: z.string().optional(),
})

// ======================
// 🔍 Get Course Details
// ======================
export async function getCourseDetails(courseId: string) {
  // Optionally check auth:
  // const session = await auth()
  // const teacherId = session?.user?.id
  // return prisma.course.findUnique({ where: { id: courseId, teacherId } })

  return prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      description: true,
      videoUrl: true,
      notes: true,
      // 🚨 FIX: status is still needed for read-only display or other actions
      status: true, 
    },
  })
}

// ======================
// ✏️ Update Course
// ======================
export async function updateCourse(formData: FormData) {
  const data = Object.fromEntries(formData.entries())

  const validated = updateCourseSchema.safeParse(data)

  if (!validated.success) {
    console.error("Validation Error:", validated.error.format())
    return { error: "Validation failed: Check required fields." }
  }

  // 🚨 FIX: Remove 'status' from destructuring since it's removed from the form
  const { id, title, description, videoUrl, notes } = validated.data

  try {
    await prisma.course.update({
      where: { id },
      data: {
        title,
        description,
        videoUrl: videoUrl || null,
        notes,
        // 🚨 FIX: Remove status and publishedAt update to preserve existing status
        // status, 
        // publishedAt: status === "PUBLISHED" ? new Date() : undefined,
      },
    })

    // Refresh pages
    revalidatePath("/teacher/courses")
    revalidatePath(`/courses/${id}`)

    return { success: true }
  } catch (error) {
    console.error("Database error during update:", error)
    return { error: "Failed to update course. Check database connection." }
  }
}