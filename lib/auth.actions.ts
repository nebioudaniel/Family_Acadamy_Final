// lib/actions/auth.actions.ts
"use server"

import { signIn } from "@/lib/auth"
import { AuthError } from "next-auth"
import { loginSchema } from "@/lib/validation/schemas" // The Zod schema we defined earlier

// Define a type guard for the expected redirect error object structure
// This is cleaner than inline casting.
type RedirectError = { digest: string };

function isRedirectError(error: unknown): error is RedirectError {
  return (
    error != null &&
    typeof error === 'object' &&
    'digest' in error &&
    typeof (error as RedirectError).digest === 'string'
  );
}

export async function authenticate(formData: FormData) {
  // 1. Get and Validate Data
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  
  const validatedFields = loginSchema.safeParse({ email, password })

  if (!validatedFields.success) {
    return { error: "Invalid email or password format provided." }
  }

  try {
    // 2. Call the Auth.js signIn function
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard-redirect", // Use a temporary route to handle role-based redirection
    })
    
    // Note: If signIn succeeds, it redirects, so the code below should not be reached.
    return { success: true }
    
  } catch (error) {
    // 3. Handle Errors
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials. Please check your email and password." }
        default:
          return { error: "An unexpected error occurred during login. Please try again." }
      }
    }
    
    // 🎯 CRITICAL FIX: Use the type guard to narrow the type and check for NEXT_REDIRECT
    if (isRedirectError(error) && error.digest.includes('NEXT_REDIRECT')) {
        throw error;
    }
    
    return { error: "Login failed unexpectedly." }
  }
}