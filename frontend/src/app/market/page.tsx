import { HashrateChart } from "@/components/charts/hashrate";
import { MarketChart, MarketChartType } from "@/components/charts/market-chart";
import { ScrollArea } from "@radix-ui/react-scroll-area";

const ActionPanel = () => {
  return (
    <div className="pt-4 flex flex-col gap-4">
      <ScrollArea className="h-[100vh]">
        <h1 className='text-4xl font-bold p-0 m-0'>Markets</h1>
        <HashrateChart />
        <MarketChart title="Price" type={MarketChartType.Price} />
      </ScrollArea>
    </div>
  )
}

export function MarketPage() {
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">

      <ScrollArea className="h-full">
        <ActionPanel />
      </ScrollArea>

    </div>

  )
}