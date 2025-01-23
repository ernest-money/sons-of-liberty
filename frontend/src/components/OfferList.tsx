import React, { useEffect, useState } from 'react';
import { Offer } from '../types';
import { useSol } from '../lib/hooks/useSol';

export const OfferList: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const client = useSol();

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

  if (!offers.length) {
    return <div>No offers found</div>;
  }

  return (
    <div>
      {offers.map((offer) => (
        <div key={offer.contract_id}>
          <h3>Offer {offer.contract_id}</h3>
          <div>State: {offer.state}</div>
          <div>Counter Party: {offer.counter_party}</div>
          <div>Collateral: {offer.collateral}</div>
          <div>Offer Amount: {offer.offer_amount}</div>
          <div>Is Offer Party: {offer.is_offer_party ? 'Yes' : 'No'}</div>
          {offer.event_ids && (
            <div>Event IDs: {offer.event_ids.join(', ')}</div>
          )}
        </div>
      ))}
    </div>
  );
}; 