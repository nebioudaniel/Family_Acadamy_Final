// app/components/layout/Header.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Headset } from 'lucide-react'; 
import { Button } from "@/components/ui/button";

export default function Header() {
    
    return (
        <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
            {/* Increased height to h-16 for better padding and visibility */}
            <div className="container flex h-16 items-center justify-between mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* 1. Company Logo / Site Title */}
                <Link href="/" className="flex items-center space-x-2">
                    {/* FIX: Used appropriate width/height for header context (e.g., 40px/2.5rem). 
                      The path is maintained at /logo.png as requested.
                    */}
                    <Image 
                        src="/logo.png" 
                        alt="EduCore Company Logo"
                        width={40} // Required by Next.js Image
                        height={40} // Required by Next.js Image
                        className="h-10 w-10 object-contain" // Tailwind sizing
                    />
                </Link>

                {/* 2. Action Button (Support Button) */}
                <div className="flex items-center space-x-2">

                </div>
            </div>
        </header>
    );
}