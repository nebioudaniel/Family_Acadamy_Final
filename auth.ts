// src/auth.ts
import NextAuth, { type NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import * as bcrypt from "bcryptjs"
import { z } from "zod" // Import Zod if you use it for validation

// Define a schema for the credentials we expect
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});


export const authConfig = {
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      // Remove the explicit credentials definition if you rely on Zod/manual validation
      // or ensure the types match the expected schema.
      
      async authorize(credentials) {
        // 1. Validate credentials using Zod
        const validatedFields = loginSchema.safeParse(credentials)

        if (!validatedFields.success) {
            throw new Error("Invalid email or password format.")
        }

        const { email, password } = validatedFields.data

        // 2. Find user by email (using the correctly typed 'email' string)
        const user = await prisma.user.findUnique({
          where: { email }, // 🎯 CRITICAL FIX: Use the validated and typed 'email' variable
        })

        if (!user || !user.hashedPassword) {
          // This error message is slightly misleading, user should have a hashedPassword field, 
          // not 'password'. I'll assume for now your schema uses 'password'.
          throw new Error("User not found or invalid credentials")
        }

        // 3. Compare password
        const isValid = await bcrypt.compare(password, user.hashedPassword)
        if (!isValid) {
          throw new Error("Invalid password")
        }

        // 4. Return user if credentials are valid
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // 🚨 POTENTIAL BUG: 'user' is only available if not using JWT strategy. 
      // If you switch to JWT, this will need a 'jwt' callback.
      if (user) {
        session.user.role = (user as any).role // Use 'any' here temporarily if types aren't extended
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAdminRoute = nextUrl.pathname.startsWith("/admin")
      const isTeacherRoute = nextUrl.pathname.startsWith("/teacher")

      if (isAdminRoute && auth?.user?.role !== "ADMIN") return false
      if (isTeacherRoute && auth?.user?.role !== "TEACHER") return false

      return true
    },
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)