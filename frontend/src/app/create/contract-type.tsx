import { useParams } from '@tanstack/react-router';
import { createContractTypeRoute } from '@/router';
import { Parlay } from './parlay';
import { PriceFeed } from './price-feed';
import { Enumeration } from './enumeration';

export const CreateContractType: React.FC = () => {
  const { contractType } = useParams({ from: createContractTypeRoute.id });

  const payoutComponent = () => {
    switch (contractType) {
      case "parlay":
        return <Parlay />;
      case "price-feed":
        return <PriceFeed />;
      case "enumeration":
        return <Enumeration />;
    }
  }

  return (
    <div style={{ padding: '20px', width: '100%' }}>
      <h1 className='text-4xl font-bold'>{contractType?.charAt(0).toUpperCase() + contractType?.slice(1)}</h1>
      {payoutComponent()}
    </div>
  );
};
