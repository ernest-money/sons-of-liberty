import * as React from "react"

import { SearchForm } from "@/components/search-form"
import { VersionSwitcher } from "@/components/version-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Home, Wallet } from "lucide-react"

const main = [
  {
    title: "Home",
    url: "/dashboard",
    isActive: window.location.pathname === "/dashboard",
    icon: <Home />
  },
  {
    title: "Wallet",
    url: "/wallet",
    isActive: window.location.pathname === "/wallet",
    icon: <Wallet />
  },
]

const data = {
  versions: ["0.0.1",],
  navMain: [
    {
      title: "Contracts",
      url: "#",
      items: [
        {
          title: "Active",
          url: "/contracts/active",
          isActive: window.location.pathname === "/contracts/active",

        },
        {
          title: "Closed",
          url: "/contracts/closed",
          isActive: window.location.pathname === "/contracts/closed",
          icon: <Home />
        },
      ],
    },
    {
      title: "Market",
      url: "/offers",
      items: [
        {
          title: "Open Offers",
          url: "/offers",
          isActive: window.location.pathname === "/offers",
        }
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
        />
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {main.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={item.isActive}>
                <a href={item.url}>
                  {item.icon} {item.title}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        {data.navMain.map((item) => (
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
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
