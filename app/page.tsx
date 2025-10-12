// app/page.tsx
import Footer from "@/components/layout/Footer"
import Header from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (<>
  <Header/>
    <div className="flex flex-col items-center justify-center min-h-screen p-3 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
        Welcome to <span className="text-green-600">Family Academy</span>
      </h1>
      <p className="mt-4 text-xl text-gray-600">
        Start your learning journey with our curated courses.
      </p>
      <Link href="/courses" passHref>
        <Button size="lg" className="mt-8 shadow-lg transition-transform hover:scale-[1.02]">
          Browse Courses <ArrowRight />
        </Button>
      </Link>
    </div>
    <Footer/>
    </>
  )
}