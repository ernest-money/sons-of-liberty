import { useEffect, useState } from "react";
import { useSol } from "@/hooks/useSol";
import { NostrCounterparty } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink } from "lucide-react";

export const CounterpartiesPage = () => {
  const { getCounterparties } = useSol();
  const [counterparties, setCounterparties] = useState<NostrCounterparty[]>([]);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Available Counterparties</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {counterparties.map((counterparty) => (
          <Card key={counterparty.pubkey} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={counterparty.picture} alt={counterparty.name} />
                <AvatarFallback>{counterparty.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl truncate">{counterparty.name}</CardTitle>
                  {counterparty.website && (
                    <a href={counterparty.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary flex-shrink-0" />
                    </a>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1 truncate">{counterparty.pubkey}</p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{counterparty.about}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
