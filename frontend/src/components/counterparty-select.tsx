import { useEffect, useState } from "react";
import { useSol } from "@/hooks/useSol";
import { NostrCounterparty } from "@/types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CounterpartySelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const CounterpartySelect = ({ value, onValueChange }: CounterpartySelectProps) => {
  const { getCounterparties } = useSol();
  const [counterparties, setCounterparties] = useState<NostrCounterparty[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounterparties = async () => {
      try {
        const data = await getCounterparties();
        setCounterparties(data);
      } catch (error) {
        console.error("Failed to fetch counterparties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounterparties();
  }, [getCounterparties]);

  const selectedCounterparty = counterparties.find((c) => c.pubkey === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-14 text-lg"
        >
          {selectedCounterparty ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={selectedCounterparty.picture} alt={selectedCounterparty.name} />
                <AvatarFallback>{selectedCounterparty.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="truncate">{selectedCounterparty.name}</span>
                <span className="text-muted-foreground text-sm truncate">
                  ({selectedCounterparty.pubkey.slice(0, 8)}...)
                </span>
              </div>
            </div>
          ) : (
            "Select counterparty..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search counterparties..." />
          <CommandEmpty>No counterparty found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {counterparties.map((counterparty) => (
              <CommandItem
                key={counterparty.pubkey}
                value={counterparty.pubkey}
                onSelect={() => {
                  onValueChange(counterparty.pubkey);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === counterparty.pubkey ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={counterparty.picture} alt={counterparty.name} />
                    <AvatarFallback>{counterparty.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span>{counterparty.name}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {counterparty.pubkey}
                    </span>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}; 