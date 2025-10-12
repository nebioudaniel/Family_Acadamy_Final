// lib/auth.ts

import NextAuth, { type NextAuthConfig, type User } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient, User as PrismaUser, Role } from "@prisma/client"
import * as bcrypt from "bcryptjs"
import { loginSchema } from "@/lib/validation/schemas" // Assuming this Zod schema is correctly defined

// Initialize Prisma Client (Make sure this is a singleton or imported correctly)
const prisma = new PrismaClient()

// Define a union type for the role
type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

// Define the type we expect the 'user' object in JWT to be, for casting purposes
// It combines the actual Prisma model structure with the properties we know are there.
type JWTUser = PrismaUser & { id: string, role: Role };

// --- CRITICAL FIX 1: The conflicting ExtendedUser interface is removed ---

export const authConfig = {
  // 1. Adapter (for database persistence)
  adapter: PrismaAdapter(prisma),

  // 2. Session Strategy
  session: {
    strategy: "jwt", // Required for Credentials provider
  },

  // 3. Pages
  pages: {
    signIn: "/login",
    error: "/login",
  },

  // 4. Providers
  providers: [
    Credentials({
      name: "Credentials",
      async authorize(credentials) {
        // Zod validation on credentials
        const validatedFields = loginSchema.safeParse(credentials)

        if (validatedFields.success) {
          const { email, password } = validatedFields.data

          // Check if user exists
          const user = await prisma.user.findUnique({ where: { email } })

          if (!user || !user.hashedPassword) return null

          // Compare submitted password with hashed password
          const passwordsMatch = await bcrypt.compare(
            password,
            user.hashedPassword // Assuming your schema uses 'hashedPassword'
          )

          if (passwordsMatch) {
            // Return full PrismaUser object, which is now type-safe
            return user
          }
        }
        
        // Return null on failure
        return null
      },
    }),
  ],

  // 5. Callbacks (to include custom fields like 'role' in the session)
  callbacks: {
    // This JWT callback runs first and populates the token
    async jwt({ token, user }) {
      if (user) {
        // CRITICAL FIX 2: Correctly cast the user object to extract the role
        token.role = (user as JWTUser).role 
        token.id = user.id; // Ensure ID is passed to the token
      }
      return token
    },
    // This Session callback runs second and uses the JWT token data
    async session({ session, token }) {
      if (token && session.user) {
        // Casting to the defined union type
        session.user.role = token.role as UserRole
        session.user.id = token.sub! // 'sub' is the user ID from the JWT
      }
      return session
    },
    
    // CRITICAL FIX 3: AUTHORIZED CALLBACK TO BREAK LOGIN LOOP
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = nextUrl

      // 1. Always allow access to login/API routes
      if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
        return true
      }
      
      // 2. Allow logged-in users to access the redirect page (must run this once)
      if (pathname === "/dashboard-redirect" && isLoggedIn) {
          return true
      }
      
      // 3. Apply role checks for protected routes
      const isAdminRoute = pathname.startsWith("/admin")
      const isTeacherRoute = pathname.startsWith("/teacher")

      if (isAdminRoute && auth?.user?.role !== "ADMIN") return false
      if (isTeacherRoute && auth?.user?.role !== "TEACHER") return false
      
      // 4. All other routes require a logged-in session
      return isLoggedIn
    },
  },
} satisfies NextAuthConfig

// Export handlers for Next.js Route Handlers
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)