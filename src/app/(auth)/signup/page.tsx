import Link from "next/link"
import { SignupForm } from "@/features/auth/components/signup-form"

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <p className="text-center text-sm text-muted-foreground">
        Crie a conta da sua empresa
      </p>

      <SignupForm />

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
