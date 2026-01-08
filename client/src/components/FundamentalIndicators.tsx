import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface IndicatorProps {
  label: string;
  value: string | number;
  unit?: string;
  description?: string;
  isPositive?: boolean;
  isNegative?: boolean;
  benchmark?: number;
}

interface FundamentalIndicatorsProps {
  indicators: IndicatorProps[];
  title?: string;
}

function IndicatorCard({ label, value, unit, description, isPositive, isNegative, benchmark }: IndicatorProps) {
  const getColor = () => {
    if (isPositive) return "text-green-600 dark:text-green-400";
    if (isNegative) return "text-red-600 dark:text-red-400";
    return "text-foreground";
  };

  return (
    <div className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
        {description && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{description}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className={`text-2xl font-bold ${getColor()}`}>
        {value}
        {unit && <span className="text-sm ml-1">{unit}</span>}
      </div>
      {benchmark !== undefined && (
        <div className="text-xs text-muted-foreground mt-2">
          Benchmark: {benchmark}
        </div>
      )}
    </div>
  );
}

export default function FundamentalIndicators({ indicators, title = "Indicadores Fundamentalistas" }: FundamentalIndicatorsProps) {
  // Group indicators by category
  const categories = {
    valuation: indicators.filter(i => ["P/L", "P/VP", "P/SR", "EV/EBITDA", "EV/EBIT", "P/EBITDA", "P/EBIT"].includes(i.label)),
    profitability: indicators.filter(i => ["ROE", "ROA", "ROIC", "Margem Bruta", "Margem EBIT", "Margem EBITDA", "Margem Líquida"].includes(i.label)),
    debt: indicators.filter(i => ["Dívida Líquida/Patrimônio", "Dívida Bruta/Patrimônio", "Dívida Líquida/EBITDA", "Liquidez Corrente"].includes(i.label)),
    growth: indicators.filter(i => ["CAGR Receitas (5A)", "CAGR Lucros (5A)"].includes(i.label)),
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">{title}</h2>
        <p className="text-sm text-muted-foreground">Análise completa dos indicadores fundamentalistas</p>
      </div>

      {/* Valuation */}
      {categories.valuation.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Badge variant="outline">Valuation</Badge>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.valuation.map((indicator) => (
              <IndicatorCard key={indicator.label} {...indicator} />
            ))}
          </div>
        </Card>
      )}

      {/* Profitability */}
      {categories.profitability.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Badge variant="outline">Rentabilidade</Badge>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.profitability.map((indicator) => (
              <IndicatorCard key={indicator.label} {...indicator} />
            ))}
          </div>
        </Card>
      )}

      {/* Debt */}
      {categories.debt.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Badge variant="outline">Endividamento</Badge>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.debt.map((indicator) => (
              <IndicatorCard key={indicator.label} {...indicator} />
            ))}
          </div>
        </Card>
      )}

      {/* Growth */}
      {categories.growth.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Badge variant="outline">Crescimento</Badge>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.growth.map((indicator) => (
              <IndicatorCard key={indicator.label} {...indicator} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
