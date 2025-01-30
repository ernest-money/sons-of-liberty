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
import { Home } from "lucide-react"

const main = [
  {
    title: "Home",
    url: "/dashboard",
    isActive: window.location.pathname === "/dashboard",
  }
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
    {
      title: "Wallet",
      url: "/wallet",
      items: [
        {
          title: "Transactions",
          url: "/wallet/transactions",
          isActive: window.location.pathname === "/wallet/transactions",
        },
        {
          title: "UTXOs",
          url: "/wallet/utxos",
          isActive: window.location.pathname === "/wallet/utxos",
        },
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
                  <Home /> Home
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
