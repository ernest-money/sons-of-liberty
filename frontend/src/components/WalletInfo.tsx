import React, { useState } from 'react';
import { useSol } from '../lib/hooks/useSol';

export const WalletInfo: React.FC = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const client = useSol();

  const generateNewAddress = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await client.getNewAddress();
      setAddress(data.address);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={generateNewAddress}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate New Address'}
      </button>

      {error && <div>Error: {error}</div>}

      {address && (
        <div>
          <h4>Generated Address:</h4>
          <div>{address}</div>
        </div>
      )}
    </div>
  );
}; 