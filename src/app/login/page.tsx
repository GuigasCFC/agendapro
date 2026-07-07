import Link from "next/link"
import { LoginForm } from "@/features/auth/components/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Agenda<span className="text-primary">Pro</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Entre na sua conta
          </p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}
