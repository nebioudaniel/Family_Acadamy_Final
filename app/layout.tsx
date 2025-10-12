// app/layout.tsx (Example integration)
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner" // Assuming you use Sonner for toasts

// 🎯 FIX: Remove unused 'Header' and 'Footer' imports
// import Header from "@/components/layout/Header" 
// import Footer from "@/components/layout/Footer" 

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Course Platform",
  description: "Learn and teach online courses.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Structure: Header -> Main Content -> Footer */}
        <div className="flex flex-col min-h-screen">
       
          {/* If you wanted to re-add them later, you'd place them here: */}
          {/* <Header /> */}
          
          <main className="flex-grow">
            {children}
          </main>
          
          {/* <Footer /> */}
        
        </div>
        
        {/* Toaster for notifications */}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}