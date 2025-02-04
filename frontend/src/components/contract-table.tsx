import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useSol } from "@/lib/hooks/useSol";
import { Contract, ContractFilter } from "@/lib/sol/contracts";
import { useEffect, useState } from "react";

export function ContractTable() {
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
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Contracts</h1>
      <Table>
        <TableCaption>Your contracts</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => (
            <TableRow key={contract.contract_id} onClick={() => alert("clicked")}>
              <TableCell className="font-medium">{contract.contract_id}</TableCell>
              <TableCell>{contract.state}</TableCell>
              <TableCell>Description</TableCell>
              <TableCell className="text-right">{contract.is_offer_party ? contract.offer_amount : contract.accept_amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        {/* <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$2,500.00</TableCell>
        </TableRow>
      </TableFooter> */}
      </Table>
    </div>
  )
}
