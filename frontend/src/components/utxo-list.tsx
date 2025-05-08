import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useSol, useModal } from "@/hooks";
import { LocalOutput } from "../types/sol";
import { useEffect, useState } from "react";
import { Modal, UtxoModal } from "@/components/modals";

export function UtxoList() {
  const [utxos, setUtxos] = useState<LocalOutput[]>([]);
  const [error, setError] = useState<string | null>(null);
  const client = useSol();
  const { isOpen, open, close } = useModal();
  const [selectedUtxo, setSelectedUtxo] = useState<number>(0);

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
          {utxos.map((utxo, index) => (
            <TableRow
              key={utxo.outpoint}
              onClick={() => {
                setSelectedUtxo(index);
                open();
              }}
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <TableCell className="font-medium">{utxo.outpoint.split(':')[0]}</TableCell>
              <TableCell>{utxo.outpoint.split(':')[1]}</TableCell>
              <TableCell>{utxo.keychain}</TableCell>
              <TableCell>{utxo.is_spent ? 'Spent' : 'Unspent'}</TableCell>
              <TableCell>{utxo.derivation_index}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Modal isOpen={isOpen} onClose={close}>
        <UtxoModal utxo={utxos[selectedUtxo]} />
      </Modal>
    </div>
  );
}

