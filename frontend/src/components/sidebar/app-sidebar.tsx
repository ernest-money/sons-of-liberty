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
    icon: <Home />
  },
  {
    title: "Create Contract",
    url: "/create",
    isActive: (pathname: string) => pathname === "/create-contract",
    icon: <Plus />
  },
  {
    title: "Wallet",
    url: "/wallet",
    isActive: (pathname: string) => pathname === "/wallet",
    icon: <Wallet />
  },
  {
    title: "Counterparties",
    url: "/counterparties",
    isActive: (pathname: string) => pathname === "/counterparties",
    icon: <Users />
  },
  {
    title: "Market",
    url: "/market",
    isActive: (pathname: string) => pathname === "/market",
    icon: <ChartCandlestick />
  },
  {
    title: "Offers",
    url: "/offers",
    isActive: (pathname: string) => pathname === "/offers",
    icon: <HandCoins />
  },
  {
    title: "Contracts",
    url: "/contracts",
    isActive: (pathname: string) => pathname === "/contracts",
    icon: <ReceiptText />
  }
]

// const data = {
//   versions: ["0.0.1",],
//   navMain: [
//     {
//       title: "Market",
//       url: "/offers",
//       items: [
//         {
//           title: "Open Offers",
//           url: "/offers",
//           isActive: window.location.pathname === "/offers",
//         }
//       ],
//     },
//     {
//       title: "Contracts",
//       url: "#",
//       items: [
//         {
//           title: "Active",
//           url: "/contracts/active",
//           isActive: window.location.pathname === "/contracts/active",

//         },
//         {
//           title: "Closed",
//           url: "/contracts/closed",
//           isActive: window.location.pathname === "/contracts/closed",
//           icon: <Home />
//         },
//       ],
//     },
//   ],
// }

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
        <SidebarMenu>
          {main.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild className="px-4" isActive={item.isActive(pathname)}>
                <a href={item.url}>
                  {item.icon} {item.title}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        {/* {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <a href={item.url}>{item.title}</a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))} */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: user?.name ?? "anon", email: user?.email ?? "anon@example.com", avatar: "/avatars/shadcn.jpg" }} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
