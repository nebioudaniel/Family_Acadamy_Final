// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth" 

// The 'handlers' object exports GET and POST functions 
export const { GET, POST } = handlers