import { useParams } from '@tanstack/react-router';
import { createContractTypeRoute } from '@/router';
import { Parlay } from './parlay';
import { PriceFeed } from './price-feed';
import { Enumeration } from './enumeration';
import { ParlayProvider } from '@/hooks/useParlay';

export const CreateContractType: React.FC = () => {
  const { contractType } = useParams({ from: createContractTypeRoute.id });

  const payoutComponent = () => {
    switch (contractType) {
      case "parlay":
        return <ParlayProvider><Parlay /></ParlayProvider>;
      case "price-feed":
        return <PriceFeed />;
      case "enumeration":
        return <Enumeration />;
    }
  }

  return (
    <div className='w-full'>
      {payoutComponent()}
    </div>
  );
};
