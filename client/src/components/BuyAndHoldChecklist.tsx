import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  passed: boolean;
  value: string;
}

interface BuyAndHoldChecklistProps {
  assetName: string;
  items: ChecklistItem[];
  score: number;
}

export default function BuyAndHoldChecklist({
  assetName,
  items,
  score,
}: BuyAndHoldChecklistProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excelente";
    if (score >= 60) return "Bom";
    if (score >= 40) return "Regular";
    return "Ruim";
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Checklist do Investidor Buy and Hold
        </h3>
        <p className="text-muted-foreground">
          Análise de {assetName} segundo critérios de investimento de longo prazo
        </p>
      </div>

      <div className="mb-6 p-6 bg-muted/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Pontuação Geral</p>
            <p className={`text-4xl font-bold ${getScoreColor(score)}`}>
              {score}/100
            </p>
          </div>
          <div className="text-right">
            <Badge
              variant="outline"
              className={`text-lg px-4 py-2 ${getScoreColor(score)}`}
            >
              {getScoreLabel(score)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="mt-1">
              {item.passed ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground mb-1">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <div>
              <Badge variant={item.passed ? "default" : "destructive"}>
                {item.value}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Nota:</strong> Este checklist é baseado em critérios de investimento de longo prazo (Buy and Hold). Uma pontuação alta indica que o ativo possui características favoráveis para este tipo de estratégia.
        </p>
      </div>
    </Card>
  );
}
