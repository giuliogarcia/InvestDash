import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface HistoricalData {
  period: string;
  pl: number;
  pvp: number;
  roe: number;
  dividendYield: number;
}

interface IndicatorHistoryProps {
  data: HistoricalData[];
}

export default function IndicatorHistory({ data }: IndicatorHistoryProps) {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-foreground mb-6">
        Histórico de Indicadores
      </h3>

      <div className="space-y-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">P/L (Preço sobre Lucro)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="pl" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">P/VP (Preço sobre Valor Patrimonial)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="pvp" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">ROE (Return on Equity)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="roe" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Dividend Yield</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="dividendYield" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-muted-foreground">
        <p>* Dados históricos dos últimos 5 anos</p>
        <p>* Valores anualizados</p>
      </div>
    </Card>
  );
}
