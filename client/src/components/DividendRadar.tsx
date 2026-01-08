import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DividendMonth {
  month: string; // "Jan", "Fev", etc
  probability: number; // 0-100
  hasHistorical: boolean;
  averageValue?: number;
}

interface DividendRadarProps {
  assetName: string;
  months: DividendMonth[];
  lastPaymentDate?: string;
  nextExpectedDate?: string;
  averageFrequency?: string; // "Mensal", "Trimestral", etc
}

function getMonthColor(probability: number): string {
  if (probability >= 80) return "bg-green-500 dark:bg-green-600";
  if (probability >= 60) return "bg-green-400 dark:bg-green-500";
  if (probability >= 40) return "bg-yellow-400 dark:bg-yellow-500";
  if (probability >= 20) return "bg-orange-400 dark:bg-orange-500";
  return "bg-gray-300 dark:bg-gray-600";
}

function getMonthTextColor(probability: number): string {
  if (probability >= 60) return "text-white";
  return "text-foreground";
}

export default function DividendRadar({
  assetName,
  months,
  lastPaymentDate,
  nextExpectedDate,
  averageFrequency = "Mensal",
}: DividendRadarProps) {
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-2xl font-bold text-foreground">Radar de Dividendos Inteligente</h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-5 h-5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Com base no histórico de proventos, o Radar projeta quais os possíveis meses de pagamentos de dividendos no futuro.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="text-sm text-muted-foreground">Projeção de pagamentos de dividendos para {assetName}</p>
      </div>

      {/* Informações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Último Pagamento</p>
          <p className="text-lg font-bold text-foreground">{lastPaymentDate || "N/A"}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Próximo Esperado</p>
          <p className="text-lg font-bold text-foreground">{nextExpectedDate || "N/A"}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Frequência Média</p>
          <p className="text-lg font-bold text-foreground">{averageFrequency}</p>
        </Card>
      </div>

      {/* Calendário de Probabilidade */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Probabilidade por Mês</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {monthNames.map((monthName, idx) => {
            const month = months.find((m) => m.month === monthName) || {
              month: monthName,
              probability: 0,
              hasHistorical: false,
            };

            return (
              <div key={monthName} className="flex flex-col items-center gap-2">
                <div
                  className={`w-full aspect-square rounded-lg flex items-center justify-center font-bold transition-all hover:shadow-md ${
                    getMonthColor(month.probability)
                  } ${getMonthTextColor(month.probability)}`}
                >
                  {month.probability}%
                </div>
                <p className="text-xs font-medium text-foreground">{monthName}</p>
                {month.hasHistorical && (
                  <Badge variant="outline" className="text-xs">
                    Histórico
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span>Muito Provável (80%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-400" />
          <span>Provável (60-80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-400" />
          <span>Possível (40-60%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-400" />
          <span>Improvável (20-40%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-300" />
          <span>Muito Improvável (&lt;20%)</span>
        </div>
      </div>

      {/* Nota */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          💡 <strong>Dica:</strong> O Radar de Dividendos é baseado no histórico de pagamentos. Padrões podem mudar conforme a situação financeira da empresa.
        </p>
      </Card>
    </div>
  );
}
