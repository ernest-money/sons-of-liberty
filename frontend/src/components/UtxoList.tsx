import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useSol } from "@/lib/hooks/useSol";
import { LocalOutput } from "../types";
import { useEffect, useState } from "react";

export function UtxoList() {
  const [utxos, setUtxos] = useState<LocalOutput[]>([]);
  const [error, setError] = useState<string | null>(null);
  const client = useSol();

  useEffect(() => {
    const fetchUtxos = async () => {
      try {
        const data = await client.getUtxos();
        setUtxos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch UTXOs');
      }
    };

    fetchUtxos();
  }, [client]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">UTXOs</h1>
      <Table>
        <TableCaption>Your unspent transaction outputs</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Output Index</TableHead>
            <TableHead>Keychain</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Derivation Index</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {utxos.map((utxo) => (
            <TableRow key={`${utxo.outpoint.txid}-${utxo.outpoint.vout}`}>
              <TableCell className="font-medium">{utxo.outpoint.txid}</TableCell>
              <TableCell>{utxo.outpoint.vout}</TableCell>
              <TableCell>{utxo.keychain}</TableCell>
              <TableCell>{utxo.is_spent ? 'Spent' : 'Unspent'}</TableCell>
              <TableCell>{utxo.derivation_index}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

