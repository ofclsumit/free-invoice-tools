import { Suspense } from "react"
import { AuthForm } from "@/components/auth/auth-form"

export const metadata = {
  title: "Login or Sign Up",
  description: "Login or create your free QuoteFlow account to manage business documents.",
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm />
    </Suspense>
  )
}
