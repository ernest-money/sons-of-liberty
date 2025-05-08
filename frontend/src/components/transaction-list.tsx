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
import { Transaction } from "@/types/sol";
import { useEffect, useState } from "react";
import { Modal, TransactionModal } from "@/components/modals";

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

export function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const client = useSol();
  const { isOpen, open, close } = useModal()
  const [selectedTransaction, setSelectedTransaction] = useState<number>(0);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await client.getTransactions();
        setTransactions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      }
    };

    fetchTransactions();
  }, [client]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Transactions</h1>
      <Table>
        <TableCaption>Your transaction history</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="max-w-[120px]">Version</TableHead>
            <TableHead className="max-w-[120px]">Lock Time</TableHead>
            <TableHead className="max-w-[120px]">Inputs</TableHead>
            <TableHead className="max-w-[120px]">Outputs</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx, index) => (
            <TableRow key={index} onClick={() => {
              setSelectedTransaction(index)
              open()
            }}>
              <TruncatedCell value={tx.version} className="font-medium" />
              <TruncatedCell value={tx.lock_time} />
              <TruncatedCell value={tx.input.length} />
              <TruncatedCell value={tx.output.length} />
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Modal isOpen={isOpen} onClose={close}>
        <TransactionModal transaction={transactions[selectedTransaction]} />
      </Modal>
    </div>
  );
}