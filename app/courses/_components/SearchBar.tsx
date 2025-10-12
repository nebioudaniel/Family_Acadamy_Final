// app/courses/_components/SearchBar.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from 'use-debounce'; // You'll need to install this: npm install use-debounce

export default function SearchBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  // Debounce the function to avoid hitting the server on every keystroke
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    // Update URL, which triggers a navigation and new server render
    replace(`${pathname}?${params.toString()}`); 
  }, 300); // Wait 300ms after user stops typing

  return (
    <div className="relative w-full max-w-lg md:max-w-xl">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input 
          type="text" 
          placeholder="Search courses by title or description..." 
          className="pl-9 h-12 text-base border-gray-300 focus-visible:ring-green-500 transition-shadow" 
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('search')?.toString()}
      />
    </div>
  );
}