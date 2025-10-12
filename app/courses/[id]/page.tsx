// app/courses/[id]/page.tsx (Final Mobile Spacing Fix)
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link" 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, User, Calendar, FileText, NotebookPen, ChevronLeft } from "lucide-react"

// Define the component props
interface CourseDetailPageProps {
  params: {
    id: string
  }
}

// Function to determine the correct video rendering method (Unchanged)
const getVideoSource = (url: string | null | undefined): { type: 'iframe' | 'video' | null, src: string | null } => {
  if (!url) return { type: null, src: null };

  // 1. Check for Direct Public Path
  if (url.startsWith('/videos/')) {
    return { type: 'video', src: url }; 
  }

  // 2. Check for External Embed (YouTube, Vimeo, etc.)
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      let videoId = urlObj.searchParams.get('v');
      if (!videoId && urlObj.pathname.length > 1) {
          // .pop() returns string | undefined. We must check for it.
          const potentialVideoId = urlObj.pathname.split('/').pop(); 
          
          // 🎯 CRITICAL FIX: Only assign if potentialVideoId is not undefined/empty
          if (potentialVideoId) {
             videoId = potentialVideoId;
          }
      }
      const embedSrc = videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      return { type: 'iframe', src: embedSrc };
    }
    // Fallback for other external URLs that might work in an iframe
    if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
        return { type: 'iframe', src: url };
    }
    
    return { type: null, src: null };
  } catch (_e) { // 🌟 WARNING FIX: Replaced 'e' with '_e' since it is unused
    if (url.startsWith('/')) {
        return { type: 'video', src: url };
    }
    return { type: null, src: null };
  }
};


export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = params

  // 1. Fetch the course, ensuring it is PUBLISHED and include the teacher's name
  const course = await prisma.course.findUnique({
    where: {
      id: id,
      status: 'PUBLISHED',
    },
    include: {
      teacher: {
        select: { name: true },
      },
    },
  })

  // 2. Handle 404 Not Found
  if (!course) {
    return notFound()
  }

  const videoContent = getVideoSource(course.videoUrl);

  return (
  
    <div className="container mx-auto py-15 md:py-10 max-w-5xl px-4 sm:px-6 space-y-8">
      
      {/* Back to Courses Link */}
      <Link 
        href="/courses" 
        className="inline-flex items-center text-base md:text-lg font-medium text-green-600 hover:text-green-800 transition-colors mb-2"
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        Back to all courses
      </Link>
      
      {/* Title and Metadata */}
      <div className="border-b pb-4 space-y-3">
        {/* Title: Adjusted size for mobile */}
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            {course.title}
        </h1>

        {/* Metadata Section - Stack vertically on mobile, wrap on larger screens */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1 text-green-600" />
            <span>Taught by: {course.teacher.name || "Family Academy"}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1 text-green-600" />
            <span>Published: {course.publishedAt?.toLocaleDateString() || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Video Section */}
      {videoContent.src && (
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
                <BookOpen className="h-5 w-5 mr-2 text-green-600" /> Course Video
            </CardTitle>
          </CardHeader>
          <CardContent 
            className="relative aspect-video max-h-[500px] overflow-hidden p-0"
          > 
            
            {/* Renders a standard iframe for embeds (e.g., YouTube) */}
            {videoContent.type === 'iframe' && (
                <iframe
                  className="w-full h-full rounded-lg absolute top-0 left-0" 
                  src={videoContent.src}
                  title={course.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
            )}

            {/* Renders an HTML5 video player for our uploaded files */}
            {videoContent.type === 'video' && (
                <video
                    className="w-full h-full rounded-lg absolute top-0 left-0 object-cover" 
                    src={videoContent.src}
                    controls
                    preload="metadata"
                    poster="/images/video-poster.jpg" 
                >
                    Your browser does not support the video tag.
                </video>
            )}

          </CardContent>
        </Card>
      )}

      {/* Description */}
      <div className="space-y-4">
        
        <h2 className="text-xl md:text-2xl font-semibold border-b pb-2 flex items-center"> 
          <NotebookPen className="h-5 w-5 mr-2 text-green-600"  /> Description
        </h2>
        <p className="text-gray-700 whitespace-pre-wrap">{course.description}</p>
      </div>

      {/* Notes Section */}
      {course.notes && (
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold border-b pb-2 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-green-600" /> Course Notes
          </h2>
          <Card>
            <CardContent 
                className="p-4 md:p-6 bg-gray-50" 
                // 🌟 FIX: Use dangerouslySetInnerHTML to render the rich text HTML content
                dangerouslySetInnerHTML={{ __html: course.notes }} 
            />
          </Card>
        </div>
      )}
      
    </div>
  )
}