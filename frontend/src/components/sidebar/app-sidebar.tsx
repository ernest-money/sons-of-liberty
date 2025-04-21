import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { ChartCandlestick, HandCoins, Home, Landmark, Plus, ReceiptText, Users, Wallet } from "lucide-react"
import { NavUser } from "@/components/sidebar/nav-user"
import { useAuth } from "@/hooks"
import { useLocation, useNavigate } from "@tanstack/react-router"

const main = [
  {
    title: "Home",
    url: "/",
    isActive: (pathname: string) => pathname === "/",
    icon: <Home className="size-6" />
  },
  {
    title: "Create Contract",
    url: "/create",
    isActive: (pathname: string) => pathname === "/create-contract",
    icon: <Plus className="size-6" />
  },
  {
    title: "Wallet",
    url: "/wallet",
    isActive: (pathname: string) => pathname === "/wallet",
    icon: <Wallet className="size-6" />
  },
  {
    title: "Counterparties",
    url: "/counterparties",
    isActive: (pathname: string) => pathname === "/counterparties",
    icon: <Users className="size-6" />
  },
  {
    title: "Market",
    url: "/market",
    isActive: (pathname: string) => pathname === "/market",
    icon: <ChartCandlestick className="size-6" />
  },
  {
    title: "Offers",
    url: "/offers",
    isActive: (pathname: string) => pathname === "/offers",
    icon: <HandCoins className="size-6" />
  },
  {
    title: "Contracts",
    url: "/contracts",
    isActive: (pathname: string) => pathname === "/contracts",
    icon: <ReceiptText className="size-6" />
  }
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          onClick={() => {
            navigate({ to: "/" })
          }}
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Landmark className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold">Ernest Money</span>
          </div>
        </SidebarMenuButton>
        {/* <SearchForm /> */}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="space-y-4 px-4">
          {main.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className="px-4 py-3 text-base font-xl"
                isActive={item.isActive(pathname)}
              >
                <a href={item.url} className="flex items-center gap-2">
                  {item.icon} {item.title}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: user?.name ?? "anon", email: user?.email ?? "anon@example.com", avatar: "/avatars/shadcn.jpg" }} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
