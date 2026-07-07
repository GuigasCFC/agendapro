import Link from "next/link"
import { LoginForm } from "@/features/auth/components/login-form"

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <p className="text-center text-sm text-muted-foreground">
        Entre na sua conta
      </p>

      <LoginForm />

      <p className="text-center text-sm text-muted-foreground">
        Não tem conta?{" "}
        <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  )
}
