// lib/auth.ts (Option 1: Removing ExtendedUser interface)

import NextAuth, { type NextAuthConfig, type User } from "next-auth" 
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
// Keep the imports but we don't need the local interface
import { PrismaClient, User as PrismaUser, Role } from "@prisma/client" 
import * as bcrypt from "bcryptjs"
import { loginSchema } from "@/lib/validation/schemas" 

// Initialize Prisma Client (Make sure this is a singleton or imported correctly)
const prisma = new PrismaClient()

// Define a union type for the role
type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';


// 🎯 CRITICAL FIX: REMOVE THE CONFLICTING ExtendedUser INTERFACE
/*
interface ExtendedUser extends User, PrismaUser {
    // ...
}
*/

// Define the type we expect the 'user' object in JWT to be, for casting purposes
// This is your Prisma user type.
type JWTUser = PrismaUser & { id: string, role: Role };


export const authConfig = {
  // ... (rest of authConfig remains the same)
  // 5. Callbacks (to include custom fields like 'role' in the session)
  callbacks: {
    // This JWT callback runs first and populates the token
    async jwt({ token, user }) {
      if (user) {
        // 🎯 FIX: Cast the user object (which is PrismaUser) to the expected type
        token.role = (user as JWTUser).role
      }
      return token
    },
    // This Session callback runs second and uses the JWT token data
    async session({ session, token }) {
      if (token && session.user) {
        // Casting to the defined union type
        session.user.role = token.role as UserRole
        session.user.id = token.sub! // 'sub' is the user ID
      }
      return session
    },
  },
  providers: []
} satisfies NextAuthConfig

// Export handlers for Next.js Route Handlers
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

// Don't forget to extend the next-auth types to include 'role' and 'id' on the session user object!
// In a file like `types/next-auth.d.ts`