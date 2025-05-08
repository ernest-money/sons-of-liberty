import { useSol } from '@/hooks';
import { offerRoute, contractRoute } from '@/router';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Offer } from '@/types/sol';
import { Skeleton } from "@/components/ui/skeleton";
import { ContractDetails } from "@/components/contract-details";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const OfferPage = () => {
  const { offerId } = useParams({ from: offerRoute.id });
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const client = useSol();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const data = await client.getOffers();
        const foundOffer = data.find((o: Offer) => o.id === offerId);
        setOffer(foundOffer || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch offer');
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [client, offerId]);

  const handleAcceptOffer = async () => {
    if (!offer) return;

    try {
      setAccepting(true);
      const response = await client.acceptOffer({
        offer_id: offer.id,
      });

      toast.success("Offer accepted successfully");
      navigate({ to: '/contracts/$contractId', params: { contractId: response.contract_id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to accept offer");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[200px]" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-destructive/15 p-4 text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-muted p-4">
          Offer not found
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ContractDetails
        contract={offer}
        title="Offer Details"
        description="View and manage your DLC offer"
      />

      {!offer.is_offer_party && (
        <div className="pb-6 flex justify-center">
          <Button
            onClick={handleAcceptOffer}
            disabled={accepting}
            className="w-full max-w-md"
          >
            {accepting ? "Accepting..." : "Accept Offer"}
          </Button>
        </div>
      )}
    </div>
  );
};
