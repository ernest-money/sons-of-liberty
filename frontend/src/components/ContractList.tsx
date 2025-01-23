import React, { useEffect, useState } from 'react';
import { Contract } from '../types';
import { useSol } from '../lib/hooks/useSol';
import { ContractFilter } from '../lib/sol/contracts';

export const ContractList: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ContractFilter>(ContractFilter.All);
  const client = useSol();

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const data = await client.getContracts({ filter });
        setContracts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch contracts');
      }
    };

    fetchContracts();
  }, [client, filter]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as ContractFilter)}
        >
          {Object.values(ContractFilter).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      {!contracts.length ? (
        <div>No contracts found</div>
      ) : (
        contracts.map((contract) => (
          <div key={contract.contract_id}>
            <h3>Contract {contract.contract_id}</h3>
            <div>State: {contract.state}</div>
            <div>Counterparty: {contract.counterparty}</div>
            <div>Collateral: {contract.collateral}</div>
            {contract.funding_txid && (
              <div>Funding Transaction: {contract.funding_txid}</div>
            )}
            {contract.pnl !== undefined && <div>PnL: {contract.pnl}</div>}
            {contract.event_ids && (
              <div>Event IDs: {contract.event_ids.join(', ')}</div>
            )}
            {contract.error_message && (
              <div>Error: {contract.error_message}</div>
            )}
          </div>
        ))
      )}
    </div>
  );
}; 