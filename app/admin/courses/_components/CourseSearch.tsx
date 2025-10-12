// app/admin/courses/_components/CourseSearch.tsx
"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface CourseSearchProps {
    currentSearch?: string;
    currentStatus?: string;
}

// Debounce hook (a simple implementation)
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};


export default function CourseSearch({ currentSearch = '', currentStatus }: CourseSearchProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = React.useState(currentSearch);
  
  const debouncedSearchValue = useDebounce(searchValue, 500);

  // --- Effect to handle debounced search input ---
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (debouncedSearchValue) {
      params.set('search', debouncedSearchValue)
    } else {
      params.delete('search')
    }
    
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [debouncedSearchValue, searchParams, pathname, router]);


  // --- Handler for Status Select ---
  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value && value !== 'ALL') {
      params.set('status', value)
    } else {
      params.delete('status')
    }
    
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }
  
  // --- Handler for clearing filters ---
  const handleClear = () => {
    router.replace(pathname, { scroll: false })
    setSearchValue('');
  }


  return (
    <div className="flex flex-col md:flex-row gap-4">
      
      {/* Search Input */}
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          type="text" 
          placeholder="Search by title or description..." 
          className="pl-9" 
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>

      {/* Status Filter */}
      <Select onValueChange={handleStatusChange} defaultValue={currentStatus || 'ALL'}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Statuses</SelectItem>
          <SelectItem value="PUBLISHED">Published</SelectItem>
          <SelectItem value="SCHEDULED">Scheduled</SelectItem>
          <SelectItem value="DRAFT">Draft</SelectItem>
        </SelectContent>
      </Select>
      
      {/* Clear Button */}
      {(currentSearch || currentStatus) && (
        <Button variant="outline" onClick={handleClear}>Clear Filters</Button>
      )}

    </div>
  )
}