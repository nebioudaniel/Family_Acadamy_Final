// app/teacher/courses/_actions/course.actions.ts
"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
// import { CourseFormSchema } from "@/lib/validation/schemas" // No longer needed for this fix
import { auth } from "@/lib/auth"
import * as fs from 'fs/promises' // 👈 For file system operations
import * as path from 'path'     // 👈 For path manipulation

// Define the directory where videos will be stored
// process.cwd() is the project root (where the 'public' folder resides)
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'videos') 

// Helper to ensure the public/videos directory exists
async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
  } catch (error) {
    // This often fails during initial setup or permissions issues
    console.error("Failed to ensure upload directory exists:", error)
    throw new Error("Server configuration error: Cannot access file system.")
  }
}

export async function createCourse(formData: FormData) {
  const session = await auth()
  const teacherId = session?.user?.id

  if (!teacherId) {
    return { success: false, message: "Authentication failed." }
  }

  // 1. EXTRACT DATA: Get the File object and other fields
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  // 🚨 FIXED: Retrieve 'videoFile' as a File (matching the frontend change)
  const videoFile = formData.get('videoFile') as File | null 
  const notes = formData.get('notes') as string
  const statusChoice = formData.get('statusChoice') as 'draft' | 'publish' | 'schedule'
  const scheduledDate = formData.get('scheduledDate') as string

  let finalVideoUrl: string | null = null

  // 2. HANDLE VIDEO FILE UPLOAD
  if (videoFile && videoFile.size > 0) {
    try {
      await ensureUploadDir()

      // Convert File to a Buffer for writing
      const bytes = await videoFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Create a unique filename (e.g., timestamp-originalName.ext)
      const fileExtension = path.extname(videoFile.name)
      // Sanitize the base name for security and unique ID
      const baseName = path.basename(videoFile.name, fileExtension).replace(/[^a-z0-9]/gi, '_').toLowerCase()
      const fileName = `${Date.now()}-${baseName}${fileExtension}`
      const filePath = path.join(UPLOAD_DIR, fileName)
      
      // Write the file to the public/videos directory
      await fs.writeFile(filePath, buffer)

      // Set the public URL/path for database storage (accessible via /videos/...)
      finalVideoUrl = `/videos/${fileName}`

    } catch (error: unknown) { // 🌟 FIX 1: Changed 'error' type from 'any' to 'unknown' (best practice)
      console.error("Video file saving failed:", error)
      return { success: false, message: "Failed to upload and save video file." }
    }
  } else {
     // Video file is mandatory
     return { success: false, message: "Video file is required." }
  }

  // 3. DETERMINE PUBLISHING STATUS
  let status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' = 'DRAFT'
  let publishedAt: Date | undefined = undefined
  let scheduledAt: Date | undefined = undefined

  if (statusChoice === 'publish') {
    status = 'PUBLISHED'
    publishedAt = new Date()
  } else if (statusChoice === 'schedule' && scheduledDate) {
    status = 'SCHEDULED'
    scheduledAt = new Date(scheduledDate)
  }

  // 4. SAVE COURSE TO DATABASE
  try {
    await prisma.course.create({
      data: {
        title,
        description,
        // 🚨 FIXED: Use the saved public path
        videoUrl: finalVideoUrl, 
        notes,
        teacherId,
        status,
        publishedAt,
        scheduledAt,
      },
    })

    revalidatePath("/teacher/courses")
    return { success: true, message: `Course saved as ${status.toLowerCase()}.` }
  } catch (error: unknown) { // 🌟 FIX 2: Changed 'error' type from 'any' to 'unknown' (best practice)
    console.error("Database Save Error:", error)
    // NOTE: In a production app, if DB save fails, you would add logic here 
    // to delete the file you just saved to disk to prevent orphaned files.
    return { success: false, message: "Failed to create course. Database error." }
  }
}

// 5. DELETE COURSE (Added cleanup for video file)
export async function deleteCourse(courseId: string) {
  const session = await auth()
  const teacherId = session?.user?.id

  if (!teacherId) {
    return { success: false, message: "Authentication failed." }
  }

  try {
    // 1. Find the course to get the video path
    const courseToDelete = await prisma.course.findUnique({
        where: { id: courseId, teacherId: teacherId },
        select: { videoUrl: true, title: true }
    });

    if (!courseToDelete) {
        return { success: false, message: "Course not found or unauthorized." }
    }

    const deletedCourse = await prisma.course.delete({
      where: { id: courseId, teacherId: teacherId }, // IMPORTANT: Ensure the teacher owns the course
    })
    
    // 2. Delete the physical video file from the server
    if (courseToDelete.videoUrl && courseToDelete.videoUrl.startsWith('/videos/')) {
        try {
            const relativePath = courseToDelete.videoUrl.replace('/videos/', '');
            const filePath = path.join(UPLOAD_DIR, relativePath);
            await fs.unlink(filePath); // Delete the file
            console.log(`Successfully deleted file: ${filePath}`);
        } catch (fileError: unknown) { // 🌟 FIX 3: Replaced 'any' with 'unknown'
             // Use a type guard to access the 'code' property if needed
            if (fileError && typeof fileError === 'object' && 'code' in fileError && fileError.code !== 'ENOENT') {
                console.error("Failed to delete video file during course deletion:", fileError);
            }
        }
    }
    
    revalidatePath("/teacher/courses")
    return { success: true, message: `Course "${deletedCourse.title}" deleted.` }

  } catch (error: unknown) { // 🌟 FIX 4: Changed 'error' type from 'any' to 'unknown'
    console.error("Delete error:", error)
    return { success: false, message: "Failed to delete course. Course may not exist or an error occurred." }
  }
}