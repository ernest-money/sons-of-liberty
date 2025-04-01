import { Landmark } from "lucide-react"

import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form";

export default function AuthPage() {
  const path = window.location.pathname;
  const isLogin = path === '/login';
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Landmark className="size-4" />
          </div>
          Ernest
        </a>
        {isLogin ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  )
}
