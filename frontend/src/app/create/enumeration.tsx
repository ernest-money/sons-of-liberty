"use client"

import { useSol } from "@/hooks/useSol";
import { EnumerationChart } from "@/components/charts/enumeration-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { EnumerationContractParams, OutcomePayout } from "@/types";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export const Enumeration = () => {
  const sol = useSol();
  const navigate = useNavigate();
  const [counterparty, setCounterparty] = useState("");
  const [offerCollateral, setOfferCollateral] = useState(10000);
  const [acceptCollateral, setAcceptCollateral] = useState(10000);
  const [totalCollateral, setTotalCollateral] = useState(20000);
  const [feeRate, setFeeRate] = useState(1);
  const [maturity, setMaturity] = useState(Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60); // 1 week from now
  const [outcomePayouts, setOutcomePayouts] = useState<OutcomePayout[]>([]);
  const [newOutcome, setNewOutcome] = useState("");
  const [newOfferPayout, setNewOfferPayout] = useState(0);
  const [newAcceptPayout, setNewAcceptPayout] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleTotalCollateralChange = (value: number) => {
    setTotalCollateral(value);
    setOfferCollateral(value / 2);
    setAcceptCollateral(value / 2);
  };

  const resetOutcomeForm = () => {
    setNewOutcome("");
    setNewOfferPayout(0);
    setNewAcceptPayout(0);
    setEditingIndex(null);
    setIsEditing(false);
  };

  const addOutcome = () => {
    if (!newOutcome) {
      toast.error("Please enter an outcome name");
      return;
    }

    if (newOfferPayout + newAcceptPayout !== totalCollateral) {
      toast.error(`Total payout must equal total collateral (${totalCollateral} sats)`);
      return;
    }

    if (!isEditing && outcomePayouts.some(op => op.outcome === newOutcome)) {
      toast.error("An outcome with this name already exists");
      return;
    }

    if (isEditing && editingIndex !== null) {
      // Update existing outcome
      const updatedOutcomes = [...outcomePayouts];
      updatedOutcomes[editingIndex] = {
        outcome: newOutcome,
        payout: {
          offer: newOfferPayout,
          accept: newAcceptPayout
        }
      };
      setOutcomePayouts(updatedOutcomes);
      toast.success("Outcome updated");
    } else {
      // Add new outcome
      setOutcomePayouts([
        ...outcomePayouts,
        {
          outcome: newOutcome,
          payout: {
            offer: newOfferPayout,
            accept: newAcceptPayout
          }
        }
      ]);
      toast.success("Outcome added");
    }

    // Reset form
    resetOutcomeForm();
  };

  const startEditOutcome = (index: number) => {
    const outcome = outcomePayouts[index];
    setNewOutcome(outcome.outcome);
    setNewOfferPayout(outcome.payout.offer);
    setNewAcceptPayout(outcome.payout.accept);
    setEditingIndex(index);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    resetOutcomeForm();
  };

  const removeOutcome = (index: number) => {
    setOutcomePayouts(outcomePayouts.filter((_, i) => i !== index));
    // If we're editing this outcome, reset the form
    if (editingIndex === index) {
      resetOutcomeForm();
    }
  };

  const validateForm = (): string | null => {
    if (!counterparty) return "Counterparty is required";
    if (outcomePayouts.length === 0) return "At least one outcome is required";
    if (offerCollateral <= 0 || acceptCollateral <= 0) return "Collateral must be greater than 0";
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
      const params: EnumerationContractParams = {
        counterparty,
        offer_collateral: offerCollateral,
        accept_collateral: acceptCollateral,
        fee_rate: feeRate,
        descriptor: {
          outcomePayouts
        },
        maturity
      };

      const response = await sol.createEnumerationContract(params);
      toast.success("Enumeration contract created successfully");

      // Navigate to the offer page
      navigate({ to: "/offers/$offerId", params: { offerId: response.id } });

      // Reset form
      setCounterparty("");
      setOfferCollateral(10000);
      setAcceptCollateral(10000);
      setTotalCollateral(20000);
      setFeeRate(1);
      setMaturity(Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60);
      setOutcomePayouts([]);
    } catch (error) {
      toast.error("Failed to create enumeration contract");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left side - Contract details and chart */}
        <div className="flex-1 space-y-6">
          {/* Chart section */}
          <Card className="relative">
            <CardHeader>
              <CardTitle>Payout Visualization</CardTitle>
              <CardDescription>Stacked bar chart showing outcome payouts</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <EnumerationChart outcomePayouts={outcomePayouts.length > 0 ? outcomePayouts : [
                { outcome: "Example 1", payout: { offer: totalCollateral / 2, accept: totalCollateral / 2 } },
                { outcome: "Example 2", payout: { offer: totalCollateral, accept: 0 } },
                { outcome: "Example 3", payout: { offer: 0, accept: totalCollateral } },
              ]} />

              {outcomePayouts.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-lg z-10">
                  <div className="bg-white dark:bg-black p-6 rounded-lg shadow-lg text-center max-w-md">
                    <h3 className="text-xl font-semibold mb-2">No Outcomes Defined</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Add outcomes below to visualize possible payouts for each scenario.
                      This chart will show how funds are distributed between you and your counterparty.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Counterparty section */}
          <Card>
            <CardHeader>
              <CardTitle>Counterparty</CardTitle>
              <CardDescription>Enter the public key of your counterparty</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                id="counterparty"
                value={counterparty}
                onChange={(e) => setCounterparty(e.target.value)}
                placeholder="02b6..."
                className="text-lg h-14"
              />
            </CardContent>
          </Card>

          {/* Contract parameters */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Parameters</CardTitle>
              <CardDescription>Set the basic parameters for your contract</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="totalCollateral">Total Collateral (Sats)</Label>
                <Input
                  id="totalCollateral"
                  type="number"
                  value={totalCollateral}
                  onChange={(e) => handleTotalCollateralChange(Number(e.target.value))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="offerCollateral">Your Collateral</Label>
                  <Input
                    id="offerCollateral"
                    type="number"
                    value={offerCollateral}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setOfferCollateral(value);
                      setTotalCollateral(value + acceptCollateral);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acceptCollateral">Their Collateral</Label>
                  <Input
                    id="acceptCollateral"
                    type="number"
                    value={acceptCollateral}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setAcceptCollateral(value);
                      setTotalCollateral(offerCollateral + value);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feeRate">Fee Rate (sats/vB)</Label>
                <Input
                  id="feeRate"
                  type="number"
                  value={feeRate}
                  onChange={(e) => setFeeRate(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maturity">Maturity (Unix timestamp)</Label>
                <Input
                  id="maturity"
                  type="number"
                  value={maturity}
                  onChange={(e) => setMaturity(Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Outcomes */}
        <div className="lg:w-96 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? "Edit Outcome" : "Add Outcome"}</CardTitle>
              <CardDescription>
                {isEditing ? "Modify existing outcome and payout values" : "Define possible outcomes and their payouts"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newOutcome">Outcome Name</Label>
                <Input
                  id="newOutcome"
                  value={newOutcome}
                  onChange={(e) => setNewOutcome(e.target.value)}
                  placeholder="e.g., Team A Wins"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newOfferPayout">Your Payout</Label>
                  <Input
                    id="newOfferPayout"
                    type="number"
                    value={newOfferPayout}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setNewOfferPayout(value);
                      setNewAcceptPayout(totalCollateral - value);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newAcceptPayout">Their Payout</Label>
                  <Input
                    id="newAcceptPayout"
                    type="number"
                    value={newAcceptPayout}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setNewAcceptPayout(value);
                      setNewOfferPayout(totalCollateral - value);
                    }}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                onClick={addOutcome}
                className="flex-1"
              >
                {isEditing ? "Update Outcome" : "Add Outcome"}
              </Button>
              {isEditing && (
                <Button
                  onClick={cancelEdit}
                  variant="outline"
                >
                  Cancel
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Defined Outcomes</CardTitle>
              <CardDescription>List of all possible outcomes and payouts</CardDescription>
            </CardHeader>
            <CardContent>
              {outcomePayouts.length > 0 ? (
                <div className="space-y-3">
                  {outcomePayouts.map((outcome, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{outcome.outcome}</p>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            You: {outcome.payout.offer} sats
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                            They: {outcome.payout.accept} sats
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="ghost" size="icon" onClick={() => startEditOutcome(index)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => removeOutcome(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                  No outcomes defined yet. Add your first outcome above.
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            onClick={handleCreateContract}
            className="w-full h-12 text-lg"
            disabled={isCreating || !!validateForm()}
          >
            {isCreating ? "Creating..." : "Create Contract"}
          </Button>
        </div>
      </div>
    </div>
  );
};