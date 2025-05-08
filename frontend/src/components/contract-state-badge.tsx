import { Badge } from "@/components/ui/badge"
import { convertState } from "@/types/sol"

interface ContractStateBadgeProps {
  state: number;
}

export function ContractStateBadge({ state }: ContractStateBadgeProps) {
  const stateText = convertState(state);

  // Map states to colors
  let variant: "yellow" | "green" | "orange" | "red" = "yellow";

  if (state >= 4 && state <= 6) {
    variant = "green"; // Confirmed, Pre-Closed, Closed
  } else if (state === 9) {
    variant = "orange"; // Refunded
  } else if (state >= 7) {
    variant = "red"; // Failed states
  }
  // Default to yellow for Offer, Accept, Signed states

  return (
    <Badge variant={variant}>
      {stateText}
    </Badge>
  );
} 