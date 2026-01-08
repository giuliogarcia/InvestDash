import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PortfolioEvolutionProps {
  data?: Array<{
    date: string;
    value: number;
    invested: number;
  }>;
  loading?: boolean;
}

type Period = '7D' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

export default function PortfolioEvolution({ data, loading }: PortfolioEvolutionProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('1M');

  const periods: Period[] = ['7D', '1M', '3M', '6M', '1Y', 'ALL'];

  if (loading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Evolução Patrimonial</h2>
        <div className="flex items-center justify-center h-80">
          <Loader2 className="animate-spin w-8 h-8 text-primary" />
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Evolução Patrimonial</h2>
        <div className="flex items-center justify-center h-80">
          <p className="text-muted-foreground">Nenhum dado disponível</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Evolução Patrimonial</h2>
        
        <div className="flex gap-2">
          {periods.map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className="min-w-[50px]"
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs text-muted-foreground"
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
            />
            <YAxis 
              className="text-xs text-muted-foreground"
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => [
                `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                ''
              ]}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString('pt-BR');
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Valor Atual"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="invested" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Total Investido"
              dot={false}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Valor Atual</p>
          <p className="text-lg font-bold text-foreground">
            R$ {data[data.length - 1]?.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Total Investido</p>
          <p className="text-lg font-bold text-foreground">
            R$ {data[data.length - 1]?.invested.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Rentabilidade</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            +{(((data[data.length - 1]?.value - data[data.length - 1]?.invested) / data[data.length - 1]?.invested) * 100).toFixed(2)}%
          </p>
        </div>
      </div>
    </Card>
  );
}
