import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ValuationProps {
  currentPrice: number;
  grahamPrice?: number;
  bazinPrice?: number;
  lpa?: number;
  vpa?: number;
  averageDividends?: number;
  assetName?: string;
}

export default function ValuationCalculator({
  currentPrice,
  grahamPrice,
  bazinPrice,
  lpa,
  vpa,
  averageDividends,
  assetName = "Ativo",
}: ValuationProps) {
  const calculateUpside = (fairPrice: number) => {
    if (!fairPrice || currentPrice <= 0) return 0;
    return ((fairPrice / currentPrice) - 1) * 100;
  };

  const grahamUpside = grahamPrice ? calculateUpside(grahamPrice) : 0;
  const bazinUpside = bazinPrice ? calculateUpside(bazinPrice) : 0;

  const getUpsideColor = (upside: number) => {
    if (upside > 20) return "text-green-600 dark:text-green-400";
    if (upside > 0) return "text-green-500 dark:text-green-300";
    if (upside > -10) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getUpsideBadge = (upside: number) => {
    if (upside > 20) return "Muito Barato";
    if (upside > 0) return "Barato";
    if (upside > -10) return "Justo";
    return "Caro";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Análise de Valuation</h2>
        <p className="text-sm text-muted-foreground">Preço Justo segundo fórmulas de Benjamin Graham e Décio Bazin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Preço Atual */}
        <Card className="p-6 bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground font-medium">Preço Atual</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Cotação atual do ativo no mercado</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="text-3xl font-bold text-foreground">
            R$ {currentPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </Card>

        {/* Preço Justo de Graham */}
        {grahamPrice !== undefined && (
          <Card className="p-6 border-2 border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground font-medium">Preço Justo (Graham)</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Fórmula de Benjamin Graham: √(22.5 × LPA × VPA)
                    <br />
                    LPA: {lpa?.toFixed(2)} | VPA: {vpa?.toFixed(2)}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-3">
              R$ {grahamPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`flex items-center gap-2 ${getUpsideColor(grahamUpside)}`}>
              {grahamUpside > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-semibold">
                {grahamUpside > 0 ? "+" : ""}{grahamUpside.toFixed(2)}% Upside
              </span>
            </div>
            <Badge className="mt-3" variant={grahamUpside > 0 ? "default" : "secondary"}>
              {getUpsideBadge(grahamUpside)}
            </Badge>
          </Card>
        )}

        {/* Preço Teto de Bazin */}
        {bazinPrice !== undefined && (
          <Card className="p-6 border-2 border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground font-medium">Preço Teto (Bazin)</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Fórmula de Décio Bazin: Dividendo Médio (5A) / 0.06
                    <br />
                    Dividendo Médio: R$ {averageDividends?.toFixed(2)}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-3">
              R$ {bazinPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`flex items-center gap-2 ${getUpsideColor(bazinUpside)}`}>
              {bazinUpside > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-semibold">
                {bazinUpside > 0 ? "+" : ""}{bazinUpside.toFixed(2)}% Upside
              </span>
            </div>
            <Badge className="mt-3" variant={bazinUpside > 0 ? "default" : "secondary"}>
              {getUpsideBadge(bazinUpside)}
            </Badge>
          </Card>
        )}
      </div>

      {/* Análise Comparativa */}
      {grahamPrice && bazinPrice && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Análise Comparativa</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <span className="text-sm font-medium text-foreground">Preço Médio (Graham + Bazin)</span>
              <span className="text-lg font-bold text-foreground">
                R$ {((grahamPrice + bazinPrice) / 2).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <span className="text-sm font-medium text-foreground">Diferença (Graham - Bazin)</span>
              <span className={`text-lg font-bold ${(grahamPrice - bazinPrice) > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                R$ {Math.abs(grahamPrice - bazinPrice).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Recomendação */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">Recomendação</h3>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          {grahamUpside > 20 || bazinUpside > 20
            ? "✅ Ativo apresenta potencial de valorização significativo. Considere adicionar à carteira."
            : grahamUpside > 0 || bazinUpside > 0
            ? "⚠️ Ativo está abaixo do preço justo. Pode ser uma oportunidade de compra."
            : "❌ Ativo está acima do preço justo. Considere aguardar uma melhor oportunidade."}
        </p>
        <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
          *Esta análise é baseada em fórmulas matemáticas e não constitui recomendação de investimento.
        </p>
      </Card>

      {/* CTA */}
      <div className="flex gap-2">
        <Button className="flex-1">Adicionar à Carteira</Button>
        <Button variant="outline" className="flex-1">Definir Alerta de Preço</Button>
      </div>
    </div>
  );
}
