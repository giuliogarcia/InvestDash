import { Card } from "@/components/ui/card";
import { Calendar, DollarSign, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Dividend {
  id: number;
  ticker: string;
  assetName: string;
  type: string;
  amount: number;
  perShare: number;
  exDate: string;
  paymentDate: string;
}

interface UpcomingDividendsProps {
  data?: Dividend[];
  loading?: boolean;
}

export default function UpcomingDividends({ data, loading }: UpcomingDividendsProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Próximos Dividendos</h2>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin w-8 h-8 text-primary" />
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Próximos Dividendos</h2>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Nenhum dividendo previsto</p>
        </div>
      </Card>
    );
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      dividend: 'Dividendo',
      jcp: 'JCP',
      rendimento: 'Rendimento',
      amortizacao: 'Amortização',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      dividend: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      jcp: 'bg-green-500/10 text-green-600 dark:text-green-400',
      rendimento: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      amortizacao: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    };
    return colors[type] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Próximos Dividendos</h2>
        <Badge variant="outline" className="text-sm">
          {data.length} {data.length === 1 ? 'pagamento' : 'pagamentos'}
        </Badge>
      </div>

      <div className="space-y-3">
        {data.map((dividend) => (
          <div 
            key={dividend.id} 
            className="p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-bold text-foreground">{dividend.ticker}</p>
                  <Badge className={getTypeColor(dividend.type)}>
                    {getTypeLabel(dividend.type)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{dividend.assetName}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Data Com: {new Date(dividend.exDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    <span>Pagamento: {new Date(dividend.paymentDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Valor a Receber</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  R$ {dividend.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  R$ {dividend.perShare.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} / cota
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">Total Previsto</p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            R$ {data.reduce((sum, d) => sum + d.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </Card>
  );
}
