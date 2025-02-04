import { Separator } from "@radix-ui/react-separator";
import { AppSidebar } from "./app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { MarketChart, MarketChartType } from "./market-chart";
import { ScrollArea } from "./ui/scroll-area";

const ActionPanel = () => {
  return (
    <div className="pt-4 px-4 flex flex-col gap-4">
      <ScrollArea className="h-[100vh]">
        <MarketChart title="Price" type={MarketChartType.Price} />
        <MarketChart title="Hashrate" type={MarketChartType.Hashrate} />
        <MarketChart title="Difficulty" type={MarketChartType.Difficulty} />
        <MarketChart title="Transaction Fee" type={MarketChartType.TransactionFee} />
        <MarketChart title="Block Subsidy" type={MarketChartType.BlockSubsidy} />
        <MarketChart title="Block Size" type={MarketChartType.BlockSize} />
        <MarketChart title="Mempool Transactions" type={MarketChartType.MempoolTransactions} />
        <MarketChart title="UTXO Set Size" type={MarketChartType.UtxoSetSize} />
      </ScrollArea>
    </div>
  )
}

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDesktop = useMediaQuery("(min-width: 1100px)");

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
            <ResizablePanel defaultSize={60}>{children}</ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={40}><ActionPanel /></ResizablePanel>
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