"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

// Import the Cloudinary SDK for file DELETION/Cleanup
import { v2 as cloudinary } from 'cloudinary'; 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// 🚨 CRITICAL FIX: The file system imports are NO LONGER NEEDED
// import * as fs from 'fs/promises' 
// import * as path from 'path'     
// const UPLOAD_DIR = path.join(process.cwd(), 'public', 'videos') 
// async function ensureUploadDir() { ... } 
// 👆 DELETE ALL OF THESE! 👆

export async function createCourse(formData: FormData) {
  const session = await auth()
  const teacherId = session?.user?.id

  if (!teacherId) {
    return { success: false, message: "Authentication failed." }
  }

  // 1. EXTRACT DATA: 
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  // 🚨 NEW: Retrieve 'videoUrl' (the final, small link) instead of 'videoFile'
  const finalVideoUrl = formData.get('videoUrl') as string | null 
  const notes = formData.get('notes') as string
  const statusChoice = formData.get('statusChoice') as 'draft' | 'publish' | 'schedule'
  const scheduledDate = formData.get('scheduledDate') as string


  // 2. 🚨 FIX: Check for the uploaded URL instead of the local file
  if (!finalVideoUrl) {
     return { success: false, message: "Video file is required, but the upload URL was not provided." }
  }


  // 3. DETERMINE PUBLISHING STATUS (Unchanged)
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

  // 4. SAVE COURSE TO DATABASE (Unchanged, uses finalVideoUrl)
  try {
    await prisma.course.create({
      data: {
        title,
        description,
        videoUrl: finalVideoUrl, // Use the Cloudinary URL
        notes,
        teacherId,
        status,
        publishedAt,
        scheduledAt,
      },
    })

    revalidatePath("/teacher/courses")
    return { success: true, message: `Course saved as ${status.toLowerCase()}.` }
  } catch (error: unknown) { 
    console.error("Database Save Error:", error)
    return { success: false, message: "Failed to create course. Database error." }
  }
}

// 5. DELETE COURSE (Updated for Cloudinary cleanup)
export async function deleteCourse(courseId: string) {
  const session = await auth()
  const teacherId = session?.user?.id

  if (!teacherId) {
    return { success: false, message: "Authentication failed." }
  }

  try {
    // 1. Find the course to get the video URL/Public ID
    const courseToDelete = await prisma.course.findUnique({
        where: { id: courseId, teacherId: teacherId },
        select: { videoUrl: true, title: true }
    });

    if (!courseToDelete) {
        return { success: false, message: "Course not found or unauthorized." }
    }
    
    // 2. Extract the Cloudinary Public ID from the videoUrl
    if (courseToDelete.videoUrl) {
        try {
            // Cloudinary URLs look like: .../course_videos/name-timestamp.mp4
            // We need the part after 'upload/' and before the final extension
            const urlParts = courseToDelete.videoUrl.split('/upload/');
            if (urlParts.length > 1) {
                // Get the final path, excluding version number if present
                const assetPath = urlParts[1].split('/').slice(1).join('/'); 
                const publicId = assetPath.substring(0, assetPath.lastIndexOf('.'));

                // 🚨 FIX: Use Cloudinary's destroy method to delete the remote file
                await cloudinary.uploader.destroy(publicId, { resource_type: 'video' }); 
                console.log(`Successfully deleted Cloudinary asset: ${publicId}`);
            }
        } catch (fileError: unknown) { 
             console.error("Failed to delete Cloudinary asset during course deletion:", fileError);
        }
    }
    
    // 3. Delete the course from the database
    const deletedCourse = await prisma.course.delete({
      where: { id: courseId, teacherId: teacherId }, 
    })
    
    revalidatePath("/teacher/courses")
    return { success: true, message: `Course "${deletedCourse.title}" deleted.` }

  } catch (error: unknown) { 
    console.error("Delete error:", error)
    return { success: false, message: "Failed to delete course. Database error." }
  }
}