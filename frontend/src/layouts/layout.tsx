import { Separator } from "@radix-ui/react-separator";
import { AppSidebar } from "../components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/breadcrumb";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger } from "../components/ui/drawer";
import { useMediaQuery } from "@/hooks";
import { MarketChart, MarketChartType } from "../components/charts/market-chart";
import { ScrollArea } from "../components/ui/scroll-area";
import { Fragment } from "react/jsx-runtime";
import { HashrateChart } from "../components/charts/hashrate";
import { useLocation } from "@tanstack/react-router";

const formatPathSegment = (segment: string): string => {
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getBreadcrumbItems = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  return segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/');
    return {
      text: formatPathSegment(segment),
      path
    };
  });
};

const ActionPanel = () => {
  return (
    <div className="pt-4 px-4 flex flex-col gap-4">
      <ScrollArea className="h-[100vh]">
        <h1 className='text-4xl font-bold p-0 m-0'>Markets</h1>
        <HashrateChart />
        <MarketChart title="Price" type={MarketChartType.Price} />
      </ScrollArea>
    </div>
  )
}

export const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDesktop = useMediaQuery("(min-width: 1100px)");
  const location = useLocation();
  const breadcrumbItems = getBreadcrumbItems(location.pathname);

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
                <BreadcrumbLink href="/">
                  Ernest Money
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbItems.map((item, index) => (
                <Fragment key={item.path}>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    {index === breadcrumbItems.length - 1 ? (
                      <BreadcrumbPage>{item.text}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={item.path}>
                        {item.text}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {isDesktop ? (
          <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
            <div className="flex-1 flex flex-row w-full relative">
              <div className="w-3/5 min-w-0 overflow-auto flex-shrink-0">
                {children}
              </div>
              <div className="w-2/5 min-w-0 flex-shrink-0">
                <ScrollArea className="h-full">
                  <ActionPanel />
                </ScrollArea>
              </div>
            </div>
          </div>
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