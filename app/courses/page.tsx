// app/courses/page.tsx
import prisma from "@/lib/prisma"
import CourseCard from "./_components/CourseCard" 
import SearchBar from "./_components/SearchBar" // 👈 Import the client search component
import Footer from "@/components/layout/Footer"
import Header from "@/components/layout/Header"

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
  const searchQuery = searchParams.search || ""

  // Fetch only PUBLISHED courses
  const publishedCourses = await prisma.course.findMany({
    where: {
      status: "PUBLISHED",
      // Simple search filter
      OR: [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
      ],
    },
    include: {
        teacher: {
            select: { name: true } // Include teacher name
        }
    },
    orderBy: { publishedAt: "desc" },
  })

  return (<>
  <Header />
    <div className="container mx-auto py-8 px-4 sm:px-6 space-y-8">
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Browse Courses</h1>

      {/* Search Bar (Now a Client Component) */}
      <SearchBar />

      {/* Filter and Courses Grid (Mobile-First Layout) */}
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar/Filter Section */}
        <aside className="w-full md:w-1/4 p-4 md:p-0 border-b md:border-none pb-4 md:pb-0">
            <h3 className="text-xl font-bold mb-3 text-gray-800">Filters</h3>
            <div className="space-y-2">
                <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border">Filter options coming soon! (e.g., Category, Level)</p>
            </div>
        </aside>

        {/* Courses Grid */}
        <section className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}

            {publishedCourses.length === 0 && (
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center p-10 border border-dashed rounded-xl bg-gray-50 text-gray-500">
                <p className="font-semibold text-lg">😔 No courses found</p>
                <p className="text-sm mt-1">Try refining your search or check back later!</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
    <Footer />
    </>
  )
}