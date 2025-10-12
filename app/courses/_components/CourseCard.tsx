// app/courses/_components/CourseCard.tsx (With Published Date)
import Link from "next/link";
import { BookOpen, User, Calendar } from "lucide-react"; // 👈 Import Calendar icon
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Define a simple type structure based on prisma query
interface Course {
    id: string;
    title: string;
    description: string | null;
    teacher: { name: string | null };
    publishedAt: Date | null; // 👈 Added publishedAt field
}

export default function CourseCard({ course }: { course: Course }) {
  const teacherName = course.teacher?.name || "Unknown Teacher";
  const displayDescription = course.description || "No description provided.";
  
  // Format the date
  const formattedDate = course.publishedAt
    ? course.publishedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'N/A';
  
  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-green-400">
      
      {/* Card Header: Title */}
      <CardHeader className="p-4 flex-grow">
        <CardTitle className="text-xl line-clamp-2 leading-tight text-gray-800">
          {course.title}
        </CardTitle>
      </CardHeader>
      
      {/* Card Content: Description + Teacher Name + Published Date */}
      <CardContent className="p-4 pt-0 flex-grow space-y-3">
        {/* 1. Description */}
        <p className="text-sm text-gray-500 line-clamp-3">
          {displayDescription}
        </p>
        
        {/* 2. Metadata (Teacher Name and Published Date) */}
        <div className="pt-3 mt-3 border-t">
          <div className="flex items-center text-sm font-medium text-gray-700 space-x-1 mb-1">
            <User className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span className="truncate">Taught by: {teacherName}</span>
          </div>
          
          {/* 🚨 NEW: Published Date */}
          <div className="flex items-center text-xs text-gray-500 space-x-1">
            <Calendar className="h-3 w-3 text-green-600 flex-shrink-0" />
            <span>Published: {formattedDate}</span>
          </div>
        </div>
      </CardContent>
      
      {/* Card Footer: Action Button */}
      <CardFooter className="p-4 border-t bg-gray-50">
        <Button 
          asChild 
          className="w-full bg-green-600 hover:bg-green-700 focus-visible:ring-green-500"
        >
          <Link href={`/courses/${course.id}`}>
            View Course <BookOpen className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}