import { Separator } from "@radix-ui/react-separator";
import { AppSidebar } from "./app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "./ui/button";
import { PanelRightOpen, Plus } from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";

const ActionPanel = () => {
  return <div className="p-4">this is where you can create an offer</div>
}

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  Ernest Money
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>This can come from the url</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {isDesktop ? (
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            <ResizablePanel defaultSize={75}>{children}</ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={25}><ActionPanel /></ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <>
            <div className="relative flex-1">
              {children}
            </div>
            <Drawer>
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/80"
                >
                  <Plus className="h-6 w-6 text-secondary" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="h-[80vh]">
                <ActionPanel />
              </DrawerContent>
            </Drawer>
          </>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
};