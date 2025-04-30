import { useState, useEffect } from "react";
import { HelpCircle } from "lucide-react";
import { ParlayComposer } from "@/components/charts/ParlayComposer";
import {
  CombinationMethod,
  COMBINATION_METHODS
} from "@/types/chart-data-types";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const Parlay = () => {
  const [combinationMethod, setCombinationMethod] = useState<CombinationMethod>("multiply");
  const [yourCollateral, setYourCollateral] = useState<number>(100000);
  const [counterpartyCollateral, setCounterpartyCollateral] = useState<number>(100000);
  const [totalCollateral, setTotalCollateral] = useState<number>(200000);

  // Update total whenever individual collateral amounts change
  useEffect(() => {
    setTotalCollateral(yourCollateral + counterpartyCollateral);
  }, [yourCollateral, counterpartyCollateral]);

  const handleYourCollateralChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setYourCollateral(numValue);
    }
  };

  const handleCounterpartyCollateralChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setCounterpartyCollateral(numValue);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Create Parlay Contract</h1>

      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">Heat Map Overview</h2>
        <div className="h-48 bg-muted rounded flex items-center justify-center">
          Heat Map Chart (Coming Soon)
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">Contract Settings</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="combination-method">Combination Method</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">
                          <HelpCircle size={14} />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Determines how individual parameter values are combined into the final payout value.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select
                  value={combinationMethod}
                  onValueChange={(value) => setCombinationMethod(value as CombinationMethod)}
                >
                  <SelectTrigger id="combination-method">
                    <SelectValue placeholder="Select combination method" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMBINATION_METHODS.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  {COMBINATION_METHODS.find(method => method.id === combinationMethod)?.description}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="your-collateral">Your Collateral (sats)</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">
                            <HelpCircle size={14} />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            The amount of collateral you're offering for this contract
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="your-collateral"
                    type="number"
                    value={yourCollateral}
                    onChange={(e) => handleYourCollateralChange(e.target.value)}
                    min={0}
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="counterparty-collateral">Counterparty Collateral (sats)</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">
                            <HelpCircle size={14} />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            The amount of collateral the counterparty must provide
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="counterparty-collateral"
                    type="number"
                    value={counterpartyCollateral}
                    onChange={(e) => handleCounterpartyCollateralChange(e.target.value)}
                    min={0}
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="total-collateral">Total Collateral (sats)</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">
                            <HelpCircle size={14} />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            The total amount of collateral in the contract
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="total-collateral"
                    type="number"
                    value={totalCollateral}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-medium mb-4">Contract Parameters</h2>
        <ParlayComposer totalCollateral={totalCollateral} />
      </div>
    </div>
  );
};