import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { ArrowUp, ArrowDown, TrendingUp, Download, Share2 } from "lucide-react";

interface AssetDetailsProps {
  params?: { ticker: string };
}

export default function AssetDetails({ params }: AssetDetailsProps) {
  const ticker = params?.ticker || "PETR4";

  const [selectedPeriod, setSelectedPeriod] = useState<"1d" | "7d" | "1mo" | "3mo" | "6mo" | "1y" | "5y" | "10y">("1y");
  const [currency, setCurrency] = useState<"BRL" | "USD" | "EUR">("BRL");
  const [chartType, setChartType] = useState<"line" | "area">("line");

  // Dados mock para exemplo
  const mockData = [
    { date: "2024-01-01", price: 25.5, volume: 1000000 },
    { date: "2024-01-02", price: 26.0, volume: 1100000 },
    { date: "2024-01-03", price: 25.8, volume: 950000 },
    { date: "2024-01-04", price: 27.0, volume: 1200000 },
    { date: "2024-01-05", price: 27.5, volume: 1300000 },
    { date: "2024-01-06", price: 28.0, volume: 1400000 },
  ];

  const currentPrice = 28.0;
  const previousClose = 27.5;
  const change = currentPrice - previousClose;
  const changePercent = (change / previousClose) * 100;

  const periods = [
    { label: "1D", value: "1d" as const },
    { label: "7D", value: "7d" as const },
    { label: "1M", value: "1mo" as const },
    { label: "3M", value: "3mo" as const },
    { label: "6M", value: "6mo" as const },
    { label: "1A", value: "1y" as const },
    { label: "5A", value: "5y" as const },
    { label: "10A", value: "10y" as const },
  ];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{ticker}</h1>
            <p className="text-muted-foreground">PETROBRAS PN</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Preço e Variação */}
        <Card className="p-6">
          <div className="flex items-baseline gap-4">
            <div className="text-4xl font-bold">R$ {currentPrice.toFixed(2)}</div>
            <div className={`flex items-center gap-1 text-lg font-semibold ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
              {change >= 0 ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
              {Math.abs(change).toFixed(2)} ({changePercent.toFixed(2)}%)
            </div>
            <div className="text-muted-foreground ml-auto">
              Fechamento anterior: R$ {previousClose.toFixed(2)}
            </div>
          </div>
        </Card>

        {/* Gráfico de Cotação */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gráfico de Cotação</h2>
              <div className="flex gap-2">
                <div className="flex gap-1 border rounded-lg p-1">
                  {periods.map(period => (
                    <Button
                      key={period.value}
                      variant={selectedPeriod === period.value ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedPeriod(period.value)}
                    >
                      {period.label}
                    </Button>
                  ))}
                </div>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value as "BRL" | "USD" | "EUR")}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value="BRL">BRL</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
                <select
                  value={chartType}
                  onChange={e => setChartType(e.target.value as "line" | "area")}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value="line">Linha</option>
                  <option value="area">Área</option>
                </select>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              {chartType === "line" ? (
                <LineChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="price" stroke="#3b82f6" name="Preço" />
                </LineChart>
              ) : (
                <AreaChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="price" fill="#3b82f6" stroke="#3b82f6" name="Preço" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Abas de Conteúdo */}
        <Tabs defaultValue="valuation" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="valuation">Valuation</TabsTrigger>
            <TabsTrigger value="indicators">Indicadores</TabsTrigger>
            <TabsTrigger value="dividends">Dividendos</TabsTrigger>
            <TabsTrigger value="company">Empresa</TabsTrigger>
          </TabsList>

          <TabsContent value="valuation" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Preço Justo - Benjamin Graham */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Preço Justo (Benjamin Graham)</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preço Atual:</span>
                    <span className="font-semibold">R$ 28.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preço Justo:</span>
                    <span className="font-semibold">R$ 32.50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Upside:</span>
                    <span className="font-semibold text-green-600">+16.1%</span>
                  </div>
                  <div className="pt-3 border-t text-sm text-muted-foreground">
                    <p>Fórmula: √(22.5 × LPA × VPA)</p>
                    <p className="mt-2">LPA: R$ 2.50 | VPA: R$ 18.00</p>
                  </div>
                </div>
              </Card>

              {/* Preço Teto - Método Bazin */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Preço Teto (Método Bazin)</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preço Atual:</span>
                    <span className="font-semibold">R$ 28.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preço Teto:</span>
                    <span className="font-semibold">R$ 35.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Upside:</span>
                    <span className="font-semibold text-green-600">+25.0%</span>
                  </div>
                  <div className="pt-3 border-t text-sm text-muted-foreground">
                    <p>Fórmula: (Dividendo Médio 5 anos) / 0.06</p>
                    <p className="mt-2">Dividendo Médio: R$ 2.10</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="indicators" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Indicadores Fundamentalistas</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  { label: "P/L", value: "12.5", tooltip: "Preço sobre Lucro" },
                  { label: "P/VP", value: "1.8", tooltip: "Preço sobre Valor Patrimonial" },
                  { label: "ROE", value: "15.2%", tooltip: "Retorno sobre Patrimônio" },
                  { label: "ROIC", value: "12.8%", tooltip: "Retorno sobre Capital Investido" },
                  { label: "DY", value: "7.5%", tooltip: "Dividend Yield" },
                  { label: "Payout", value: "65%", tooltip: "Percentual de Lucro Distribuído" },
                  { label: "Margem Líquida", value: "18.5%", tooltip: "Lucro Líquido / Receita" },
                  { label: "Dívida/Patrimônio", value: "0.45", tooltip: "Alavancagem" },
                ].map(indicator => (
                  <div key={indicator.label} className="p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground">{indicator.label}</p>
                    <p className="text-xl font-semibold">{indicator.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="dividends" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Histórico de Dividendos</h3>
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="volume" fill="#8b5cf6" name="Volume" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Data COM</th>
                        <th className="text-left py-2">Data Pagamento</th>
                        <th className="text-right py-2">Valor/Ação</th>
                        <th className="text-left py-2">Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { com: "2024-01-15", pag: "2024-01-25", valor: "R$ 0.50", tipo: "Dividendo" },
                        { com: "2023-10-15", pag: "2023-10-25", valor: "R$ 0.48", tipo: "Dividendo" },
                        { com: "2023-07-15", pag: "2023-07-25", valor: "R$ 0.45", tipo: "Dividendo" },
                      ].map((div, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-2">{div.com}</td>
                          <td className="py-2">{div.pag}</td>
                          <td className="text-right py-2 font-semibold">{div.valor}</td>
                          <td className="py-2">{div.tipo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="company" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Informações da Empresa</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Setor</p>
                  <p className="font-semibold">Energia - Petróleo</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Descrição</p>
                  <p className="text-sm">Petróleo Brasileiro S.A. - Petrobras é uma empresa brasileira de energia, atuando nos segmentos de exploração e produção de petróleo e gás natural.</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Website</p>
                  <a href="https://www.petrobras.com.br" className="text-blue-600 hover:underline">www.petrobras.com.br</a>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor de Mercado</p>
                  <p className="font-semibold">R$ 503 bilhões</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
