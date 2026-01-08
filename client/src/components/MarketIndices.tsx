import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface IndexCardProps {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  loading?: boolean;
}

function IndexCard({ name, value, change, changePercent, loading }: IndexCardProps) {
  if (loading) {
    return (
      <Card className="p-4 flex items-center justify-center">
        <Loader2 className="animate-spin w-5 h-5 text-muted-foreground" />
      </Card>
    );
  }

  const isPositive = changePercent >= 0;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{name}</p>
        <p className="text-2xl font-bold text-foreground">
          {value.toLocaleString('pt-BR', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}
        </p>
        <div className={`flex items-center gap-1 text-sm font-medium ${
          isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{isPositive ? '+' : ''}{changePercent.toFixed(2)}%</span>
        </div>
      </div>
    </Card>
  );
}

export default function MarketIndices() {
  // TODO: Implement real API call
  // const { data: indices, isLoading } = trpc.marketData.indices.useQuery();

  // Mock data for now
  const indices = {
    IBOV: { name: 'Ibovespa', value: 126543.21, change: 1234.56, changePercent: 0.98 },
    IFIX: { name: 'IFIX', value: 3254.87, change: 12.34, changePercent: 0.38 },
    CDI: { name: 'CDI', value: 13.75, change: 0, changePercent: 0 },
    USD: { name: 'Dólar', value: 5.38, change: -0.03, changePercent: -0.56 },
    EUR: { name: 'Euro', value: 6.29, change: -0.07, changePercent: -1.10 },
    BTC: { name: 'Bitcoin', value: 504000, change: -1870, changePercent: -0.37 },
  };

  const isLoading = false;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Índices de Mercado</h2>
        <p className="text-sm text-muted-foreground">Atualizado em tempo real</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(indices).map(([key, data]) => (
          <IndexCard
            key={key}
            name={data.name}
            value={data.value}
            change={data.change}
            changePercent={data.changePercent}
            loading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}
