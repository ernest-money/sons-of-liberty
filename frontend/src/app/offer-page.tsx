import { useSol } from '@/hooks';
import { offerRoute } from '@/router';
import { useParams } from '@tanstack/react-router';
import { useEffect } from 'react';

export const OfferPage = () => {
  const { offerId } = useParams({ from: offerRoute.id });
  const client = useSol();

  useEffect(() => {
    const fetchOffer = async () => {
      const offer = await client.getOffers(offerId);
      console.log(offer);
    };
    fetchOffer();
  }, [offerId]);

  return <div>Offer Page {offerId}</div>;
};
