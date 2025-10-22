// src/auth.ts
import NextAuth, { type NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import * as bcrypt from "bcryptjs"
import { z } from "zod"

// ✅ Zod schema for validating login credentials
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      async authorize(credentials) {
        // ✅ Validate input using Zod
        const validatedFields = loginSchema.safeParse(credentials)
        if (!validatedFields.success) {
          throw new Error("Invalid email or password format.")
        }

        const { email, password } = validatedFields.data

        // ✅ Check if user exists
        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.hashedPassword) {
          throw new Error("User not found or invalid credentials.")
        }

        // ✅ Compare passwords
        const isValid = await bcrypt.compare(password, user.hashedPassword)
        if (!isValid) {
          throw new Error("Invalid password.")
        }

        // ✅ Return safe user object
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
    // ✅ Store user role in JWT token
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },

    // ✅ Attach role to session from JWT token
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role
      }
      return session
    },

    // ✅ Role-based route protection
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAdminRoute = nextUrl.pathname.startsWith("/admin")
      const isTeacherRoute = nextUrl.pathname.startsWith("/teacher")

      if (isAdminRoute && auth?.user?.role !== "ADMIN") return false
      if (isTeacherRoute && auth?.user?.role !== "TEACHER") return false

      return isLoggedIn
    },
  },
} satisfies NextAuthConfig

// ✅ Export NextAuth utilities
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
