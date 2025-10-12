"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useDebounce } from "use-debounce" // You might need to install 'use-debounce' (npm install use-debounce)

interface SearchInputProps {
  placeholder: string
}

const SearchInput: React.FC<SearchInputProps> = ({ placeholder }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get initial value from URL
  const initialValue = searchParams.get("title") || ""
  const [value, setValue] = useState(initialValue)
  const [debouncedValue] = useDebounce(value, 500) // Debounce search input

  // Effect to handle the search logic on debounced value change
  useEffect(() => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))

    if (debouncedValue) {
      current.set("title", debouncedValue)
    } else {
      current.delete("title")
    }

    const search = current.toString()
    const query = search ? `?${search}` : ""

    // Update the URL without reloading the page
    router.push(`${pathname}${query}`)
  }, [debouncedValue, router, pathname, searchParams])

  // Optional: Update local state if URL changes (e.g., back/forward buttons)
  useEffect(() => {
    const titleParam = searchParams.get("title") || ""
    if (value !== titleParam) {
      setValue(titleParam);
    }
  }, [searchParams]);

  return (
    <div className="relative">
      <Search className="h-4 w-4 absolute top-3 left-3 text-muted-foreground" />
      <Input
        onChange={(e) => setValue(e.target.value)}
        value={value}
        className="w-full md:w-[300px] pl-9 bg-slate-100/50 focus-visible:ring-slate-200"
        placeholder={placeholder}
      />
    </div>
  )
}

export default SearchInput