import { trpc } from "@/lib/trpc";
import ModernDashboardLayout from "@/components/ModernDashboardLayout";
import { Card } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

export default function Analise() {
  const { data: summary, isLoading: summaryLoading } = trpc.portfolio.getSummary.useQuery();
  const { data: holdings } = trpc.portfolio.getHoldings.useQuery();
  const { data: history } = trpc.history.getPortfolioHistory.useQuery({ days: 30 });

  if (summaryLoading) {
    return (
      <ModernDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin w-8 h-8 text-primary" />
        </div>
      </ModernDashboardLayout>
    );
  }

  // Prepare data for pie chart (distribution by type)
  const typeDistribution = summary?.byType
    ? Object.entries(summary.byType).map(([typeId, data]) => ({
        name: `Tipo ${typeId}`,
        value: Number(data.value),
      }))
    : [];

  // Prepare data for bar chart (top holdings)
  const topHoldings = holdings
    ?.sort((a, b) => Number(b.currentValue) - Number(a.currentValue))
    .slice(0, 10)
    .map(h => ({
      name: h.ticker,
      value: Number(h.currentValue),
      gain: Number(h.gain),
    })) || [];

  // Prepare data for line chart (portfolio history)
  const portfolioHistory = history
    ?.map(h => ({
      date: new Date(h.snapshotDate).toLocaleDateString("pt-BR"),
      value: Number(h.totalValue),
      invested: Number(h.totalInvested),
    }))
    .reverse() || [];

  const COLORS = [
    "oklch(0.65 0.15 240)",
    "oklch(0.72 0.12 10)",
    "oklch(0.68 0.14 200)",
    "oklch(0.70 0.13 250)",
    "oklch(0.75 0.10 30)",
  ];

  return (
    <ModernDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Análise da Carteira</h1>
          <p className="text-muted-foreground mt-2">
            Visualize a performance e distribuição de seus investimentos
          </p>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <p className="text-sm text-muted-foreground font-medium mb-2">Patrimônio Total</p>
              <p className="text-3xl font-bold text-foreground">
                R$ {Number(summary.totalValue).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </p>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-muted-foreground font-medium mb-2">Total Investido</p>
              <p className="text-3xl font-bold text-foreground">
                R$ {Number(summary.totalInvested).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </p>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-muted-foreground font-medium mb-2">Rentabilidade</p>
              <div className="flex items-baseline gap-2">
                <p className={`text-3xl font-bold ${Number(summary.gainPercentage) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {Number(summary.gainPercentage).toFixed(2)}%
                </p>
                {Number(summary.gainPercentage) >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribution by Type */}
          {typeDistribution.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Distribuição por Tipo</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) =>
                      `${name}: R$ ${(value / 1000).toFixed(0)}k`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) =>
                      `R$ ${Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Top Holdings */}
          {topHoldings.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Top 10 Ativos</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topHoldings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--foreground)" />
                  <YAxis stroke="var(--foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                    }}
                    formatter={(value) =>
                      `R$ ${Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`
                    }
                  />
                  <Bar dataKey="value" fill="oklch(0.65 0.15 240)" name="Valor Atual" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>

        {/* Portfolio Evolution */}
        {portfolioHistory.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Evolução da Carteira</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={portfolioHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--foreground)" />
                <YAxis stroke="var(--foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                  formatter={(value) =>
                    `R$ ${Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="oklch(0.65 0.15 240)"
                  name="Valor Total"
                  dot={{ fill: "oklch(0.65 0.15 240)" }}
                />
                <Line
                  type="monotone"
                  dataKey="invested"
                  stroke="oklch(0.72 0.12 10)"
                  name="Total Investido"
                  dot={{ fill: "oklch(0.72 0.12 10)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Holdings Details */}
        {holdings && holdings.length > 0 && (
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Detalhes dos Ativos</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Ativo
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                      Quantidade
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                      Valor Atual
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                      % da Carteira
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                      Rentabilidade
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding) => {
                    const percentage = summary
                      ? (Number(holding.currentValue) / Number(summary.totalValue)) * 100
                      : 0;
                    const gainPercentage = Number(holding.gainPercentage);
                    const isPositive = gainPercentage >= 0;

                    return (
                      <tr
                        key={holding.id}
                        className="border-b border-border hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-foreground">{holding.ticker}</p>
                        </td>
                        <td className="px-6 py-4 text-right text-foreground">
                          {Number(holding.quantity).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-4 text-right text-foreground">
                          R${" "}
                          {Number(holding.currentValue).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-4 text-right text-foreground">
                          {percentage.toFixed(2)}%
                        </td>
                        <td
                          className={`px-6 py-4 text-right font-medium ${
                            isPositive
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {gainPercentage.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </ModernDashboardLayout>
  );
}
