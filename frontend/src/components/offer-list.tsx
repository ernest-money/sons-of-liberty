import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSol } from "@/hooks";
import { Offer } from "../types";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ContractStateBadge } from "./contract-state-badge";

function TruncatedCell({ value, className = "" }: { value: string | number, className?: string }) {
  const stringValue = String(value);
  const shouldTruncate = stringValue.length > 15;

  return shouldTruncate ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <TableCell className={`max-w-[120px] truncate ${className}`}>
            {stringValue}
          </TableCell>
        </TooltipTrigger>
        <TooltipContent>
          <p>{stringValue}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    <TableCell className={`max-w-[120px] ${className}`}>{stringValue}</TableCell>
  );
}

function formatSats(sats: number): string {
  return sats.toLocaleString() + " sats";
}

export function OfferList() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const client = useSol();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const data = await client.getOffers();
        setOffers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch offers');
      }
    };

    fetchOffers();
  }, [client]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Offers</h1>
      </div>
      <Table>
        <TableCaption>Your DLC offers</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="max-w-[120px]">ID</TableHead>
            <TableHead className="max-w-[120px]">Counter Party</TableHead>
            <TableHead className="max-w-[120px]">Offer Collateral</TableHead>
            <TableHead className="max-w-[120px]">Accept Collateral</TableHead>
            <TableHead className="max-w-[120px]">Total Collateral</TableHead>
            <TableHead className="max-w-[120px]">Role</TableHead>
            <TableHead className="max-w-[120px]">State</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {offers.map((offer) => (
            <TableRow
              key={offer.id}
              onClick={() => {
                navigate({ to: '/offers/$offerId', params: { offerId: offer.id } });
              }}
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <TruncatedCell value={offer.id} className="font-medium" />
              <TruncatedCell value={offer.counter_party} />
              <TruncatedCell value={formatSats(offer.offer_collateral)} />
              <TruncatedCell value={formatSats(offer.accept_collateral)} />
              <TruncatedCell value={formatSats(offer.total_collateral)} />
              <TruncatedCell value={offer.is_offer_party ? 'Offering' : 'Accepting'} />
              <TableCell>
                <ContractStateBadge state={offer.state} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 