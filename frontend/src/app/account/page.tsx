import { useAuth, useSol } from "@/hooks"

export function AccountPage() {
  const sol = useSol()
  const { user } = useAuth()
  return <div>Account {user?.email} {user?.name}</div>
}