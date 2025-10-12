// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: 'ADMIN' | 'TEACHER' | 'STUDENT'  // ✅ include STUDENT
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: 'ADMIN' | 'TEACHER' | 'STUDENT'
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: 'ADMIN' | 'TEACHER' | 'STUDENT'
  }
}
