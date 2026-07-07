import Link from "next/link"
import { SignupForm } from "@/features/auth/components/signup-form"

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Agenda<span className="text-primary">Pro</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie a conta da sua empresa
          </p>
        </div>

        <SignupForm />

        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
