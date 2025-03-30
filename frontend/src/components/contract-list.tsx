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
import { Contract } from "../types";
import { ContractFilter } from "../lib/sol/contracts";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

interface ContractListProps {
  defaultFilter?: ContractFilter;
  showFilter?: boolean;
}

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

export function ContractList({ defaultFilter = ContractFilter.All, showFilter = true }: ContractListProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ContractFilter>(defaultFilter);
  const client = useSol();
  const navigate = useNavigate();

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
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Contracts</h1>
        {showFilter && (
          <select
            className="rounded-md border p-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value as ContractFilter)}
          >
            {Object.values(ContractFilter).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        )}
      </div>
      <Table>
        <TableCaption>Your DLC contracts</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="max-w-[120px]">Contract ID</TableHead>
            <TableHead className="max-w-[120px]">State</TableHead>
            <TableHead className="max-w-[120px]">Counterparty</TableHead>
            <TableHead className="max-w-[120px]">Collateral</TableHead>
            <TableHead className="max-w-[120px]">Amount</TableHead>
            <TableHead className="max-w-[120px]">PnL</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract, index) => (
            <TableRow
              key={contract.contract_id}
              onClick={() => {
                navigate({ to: "/contracts/$contractId", params: { contractId: contract.contract_id } });
              }}
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <TruncatedCell value={contract.contract_id} className="font-medium" />
              <TruncatedCell value={contract.state} />
              <TruncatedCell value={contract.counterparty} />
              <TruncatedCell value={contract.collateral} />
              <TruncatedCell
                value={contract.is_offer_party ? contract.offer_amount || '-' : contract.accept_amount || '-'}
              />
              <TruncatedCell value={contract.pnl !== undefined ? contract.pnl : '-'} />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 