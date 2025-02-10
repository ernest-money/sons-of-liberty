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
import { useSol, useModal } from "@/hooks";
import { Offer } from "../types";
import { useEffect, useState } from "react";
import { Modal, OfferModal } from "@/components/modals";

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

export function OfferList() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const client = useSol();
  const { isOpen, open, close } = useModal();
  const [selectedOffer, setSelectedOffer] = useState<number>(0);

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
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Offers</h1>
      <Table>
        <TableCaption>Your DLC offers</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="max-w-[120px]">Contract ID</TableHead>
            <TableHead className="max-w-[120px]">State</TableHead>
            <TableHead className="max-w-[120px]">Counter Party</TableHead>
            <TableHead className="max-w-[120px]">Collateral</TableHead>
            <TableHead className="max-w-[120px]">Offer Amount</TableHead>
            <TableHead className="max-w-[120px]">Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {offers.map((offer, index) => (
            <TableRow
              key={offer.contract_id}
              onClick={() => {
                setSelectedOffer(index);
                open();
              }}
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <TruncatedCell value={offer.contract_id} className="font-medium" />
              <TruncatedCell value={offer.state} />
              <TruncatedCell value={offer.counter_party} />
              <TruncatedCell value={offer.collateral} />
              <TruncatedCell value={offer.offer_amount} />
              <TruncatedCell value={offer.is_offer_party ? 'Offering' : 'Accepting'} />
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Modal isOpen={isOpen} onClose={close}>
        <OfferModal offer={offers[selectedOffer]} />
      </Modal>
    </div>
  );
} 