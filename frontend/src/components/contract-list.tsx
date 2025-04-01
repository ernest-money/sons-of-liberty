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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSol, useModal } from "@/hooks";
import { Contract } from "../types";
import { ContractFilter } from "../lib/sol/contracts";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ContractStateBadge } from "./contract-state-badge";

interface ContractListProps {
  defaultFilter?: ContractFilter;
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

export function ContractList({ defaultFilter = ContractFilter.All }: ContractListProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ContractFilter>(defaultFilter);
  const client = useSol();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const data = await client.getContracts(filter);
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
        <Select value={filter} onValueChange={(value: ContractFilter) => setFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select filter" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(ContractFilter).map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableCaption>Your DLC contracts</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="max-w-[120px]">Contract ID</TableHead>
            <TableHead className="max-w-[120px]">Counterparty</TableHead>
            <TableHead className="max-w-[120px]">Collateral</TableHead>
            <TableHead className="max-w-[120px]">Amount</TableHead>
            <TableHead className="max-w-[120px]">PnL</TableHead>
            <TableHead className="max-w-[120px]">State</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract, index) => (
            <TableRow
              key={contract.id}
              onClick={() => {
                navigate({ to: "/contracts/$contractId", params: { contractId: contract.id } });
              }}
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <TruncatedCell value={contract.id} className="font-medium" />
              <TruncatedCell value={contract.counter_party} />
              <TruncatedCell value={contract.total_collateral} />
              <TruncatedCell
                value={contract.is_offer_party ? contract.offer_collateral : contract.accept_collateral}
              />
              <TruncatedCell value={contract.pnl !== null ? contract.pnl : '-'} />
              <TableCell>
                <ContractStateBadge state={contract.state} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 