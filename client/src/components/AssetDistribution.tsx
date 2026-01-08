import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Loader2 } from "lucide-react";

interface AssetDistributionProps {
  data?: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  loading?: boolean;
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export default function AssetDistribution({ data, loading }: AssetDistributionProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Distribuição por Tipo de Ativo</h2>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin w-8 h-8 text-primary" />
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Distribuição por Tipo de Ativo</h2>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Nenhum dado disponível</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-foreground mb-4">Distribuição por Tipo de Ativo</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percentage }) => `${percentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend with values */}
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="font-medium text-foreground">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="font-bold text-foreground">
                  R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">{item.percentage.toFixed(2)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
