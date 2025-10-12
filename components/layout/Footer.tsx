// app/components/layout/Footer.tsx
import Link from 'next/link';
import { BookOpen, GraduationCap } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t bg-gray-50 mt-12">
            <div className="container py-8 max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center sm:items-start space-y-4 sm:space-y-0 text-sm text-gray-600">
                
                {/* Brand and Copyright */}
                <div className="flex flex-col items-center sm:items-start space-y-1">
                    <Link href="/" className="flex items-center space-x-2 font-bold text-lg text-primary">
                        <GraduationCap className="h-5 w-5" />
                        <span>Family Acadamy</span>
                    </Link>
                    <p>&copy; {currentYear} All rights reserved.</p>
                </div>

                {/* Quick Links */}
             
            </div>
        </footer>
    );
}