import { useState } from "react";
import { useSol } from "@/hooks/useSol";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useParlay } from "@/hooks/useParlay";
import { CounterpartySelect } from "@/components/counterparty-select";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModal } from "@/hooks/useModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export const CreateParlayModal = () => {
  const { close } = useModal();
  const sol = useSol();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [counterparty, setCounterparty] = useState("");
  const [maturityDate, setMaturityDate] = useState<Date | undefined>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week from now
  );
  const [maturity, setMaturity] = useState(Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60); // 1 week from now
  const [feeRate, setFeeRate] = useState(1);

  const {
    parameters,
    combinationMethod,
    totalCollateral,
    yourCollateral,
    counterpartyCollateral,
  } = useParlay();

  const validateForm = (): string | null => {
    if (!counterparty) return "Counterparty is required";
    if (parameters.length === 0) return "At least one parameter is required";
    if (yourCollateral <= 0 || counterpartyCollateral <= 0) return "Collateral must be greater than 0";
    if (maturity <= Math.floor(Date.now() / 1000)) return "Maturity must be in the future";
    return null;
  };

  const handleCreateContract = async () => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    setIsCreating(true);
    try {
      const response = await sol.createParlayContract({
        parlayParameters: parameters,
        combinationMethod: combinationMethod,
        eventMaturityEpoch: maturity,
        counterparty,
        offerCollateral: yourCollateral,
        acceptCollateral: counterpartyCollateral,
        feeRate: feeRate
      });

      toast.success("Parlay contract created successfully");
      navigate({ to: "/offers/$offerId", params: { offerId: response.id } });
      close();
    } catch (error: any) {
      toast.error("Failed to create parlay contract: " + error.error);
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Create Parlay Contract</h1>
          <p className="text-muted-foreground">Review and confirm the contract details before creating.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Contract Details</CardTitle>
              <CardDescription>Basic contract information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Counterparty</Label>
                <CounterpartySelect
                  value={counterparty}
                  onValueChange={setCounterparty}
                />
              </div>

              <div className="space-y-2">
                <Label>Fee Rate (sats/vB)</Label>
                <Input
                  type="number"
                  value={feeRate}
                  onChange={(e) => setFeeRate(Number(e.target.value))}
                  min={1}
                />
              </div>

              <div className="space-y-2">
                <DateTimePicker
                  date={maturityDate}
                  setDate={setMaturityDate}
                  label="Contract Maturity"
                  placeholder="Select maturity date and time"
                  onTimestampChange={setMaturity}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contract Summary</CardTitle>
              <CardDescription>Overview of contract parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Parameters</p>
                <p className="font-medium">{parameters.length}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Combination Method</p>
                <p className="font-medium">{combinationMethod}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Your Collateral</p>
                <p className="font-medium">{yourCollateral} sats</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Counterparty Collateral</p>
                <p className="font-medium">{counterpartyCollateral} sats</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Collateral</p>
                <p className="font-medium">{totalCollateral} sats</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button
            variant="outline"
            onClick={close}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateContract}
            disabled={isCreating || !!validateForm()}
          >
            {isCreating ? "Creating..." : "Create Contract"}
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}; 