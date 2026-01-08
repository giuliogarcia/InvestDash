import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Star, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RankingAsset {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  value: number; // For the specific ranking metric
  metricLabel: string;
}

const mockRankings: Record<string, RankingAsset[]> = {
  dividendYield: [
    { ticker: 'TAEE11', name: 'Taesa', price: 38.50, change: 0.50, changePercent: 1.32, value: 12.5, metricLabel: 'DY' },
    { ticker: 'CPLE6', name: 'Copel', price: 9.85, change: -0.15, changePercent: -1.50, value: 11.8, metricLabel: 'DY' },
    { ticker: 'TRPL4', name: 'Transmissão Paulista', price: 24.30, change: 0.30, changePercent: 1.25, value: 10.9, metricLabel: 'DY' },
  ],
  marketCap: [
    { ticker: 'PETR4', name: 'Petrobras', price: 38.50, change: 0.50, changePercent: 1.32, value: 501000000000, metricLabel: 'Val. Mercado' },
    { ticker: 'VALE3', name: 'Vale', price: 62.30, change: -0.80, changePercent: -1.27, value: 295000000000, metricLabel: 'Val. Mercado' },
    { ticker: 'ITUB4', name: 'Itaú Unibanco', price: 28.90, change: 0.40, changePercent: 1.40, value: 283000000000, metricLabel: 'Val. Mercado' },
  ],
  roe: [
    { ticker: 'WEGE3', name: 'WEG', price: 45.20, change: 0.90, changePercent: 2.03, value: 28.5, metricLabel: 'ROE' },
    { ticker: 'RENT3', name: 'Localiza', price: 52.80, change: -0.60, changePercent: -1.12, value: 25.3, metricLabel: 'ROE' },
    { ticker: 'LREN3', name: 'Lojas Renner', price: 18.40, change: 0.20, changePercent: 1.10, value: 23.7, metricLabel: 'ROE' },
  ],
  fiis: [
    { ticker: 'HGLG11', name: 'CSHG Logística', price: 152.50, change: 0.80, changePercent: 0.53, value: 0.95, metricLabel: 'DY' },
    { ticker: 'MXRF11', name: 'Maxi Renda', price: 10.25, change: -0.05, changePercent: -0.49, value: 0.92, metricLabel: 'DY' },
    { ticker: 'KNRI11', name: 'Kinea Renda Imobiliária', price: 98.70, change: 0.30, changePercent: 0.30, value: 0.89, metricLabel: 'DY' },
  ],
};

interface RankingTableProps {
  data: RankingAsset[];
  loading?: boolean;
}

function RankingTable({ data, loading }: RankingTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  const formatValue = (value: number, label: string) => {
    if (label === 'Val. Mercado') {
      return `R$ ${(value / 1000000000).toFixed(2)}B`;
    }
    if (label === 'DY' || label === 'ROE') {
      return `${value.toFixed(2)}%`;
    }
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Posição</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Ativo</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Cotação</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Variação</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Métrica</th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Ações</th>
          </tr>
        </thead>
        <tbody>
          {data.map((asset, index) => {
            const isPositive = asset.changePercent >= 0;
            
            return (
              <tr key={asset.ticker} className="border-b border-border hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground">{index + 1}</span>
                    {index < 3 && (
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                        Top {index + 1}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-bold text-foreground">{asset.ticker}</p>
                    <p className="text-sm text-muted-foreground">{asset.name}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-foreground font-medium">
                  R$ {asset.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className={`px-6 py-4 text-right font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  <div className="flex items-center justify-end gap-1">
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{isPositive ? '+' : ''}{asset.changePercent.toFixed(2)}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div>
                    <p className="font-bold text-foreground">{formatValue(asset.value, asset.metricLabel)}</p>
                    <p className="text-xs text-muted-foreground">{asset.metricLabel}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Star className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Rankings() {
  const [selectedCategory, setSelectedCategory] = useState<'acoes' | 'fiis'>('acoes');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rankings de Ativos</h1>
          <p className="text-muted-foreground mt-2">Descubra os melhores ativos do mercado</p>
        </div>

        <Tabs defaultValue="dividendYield" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="dividendYield">Maiores Dividendos</TabsTrigger>
              <TabsTrigger value="marketCap">Valor de Mercado</TabsTrigger>
              <TabsTrigger value="roe">Maior ROE</TabsTrigger>
              <TabsTrigger value="fiis">FIIs</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Button 
                variant={selectedCategory === 'acoes' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('acoes')}
              >
                Ações
              </Button>
              <Button 
                variant={selectedCategory === 'fiis' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('fiis')}
              >
                FIIs
              </Button>
            </div>
          </div>

          <TabsContent value="dividendYield">
            <Card className="overflow-hidden">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Maiores Pagadores de Dividendos</h2>
                    <p className="text-sm text-muted-foreground mt-1">Ações com maior Dividend Yield nos últimos 12 meses</p>
                  </div>
                  <Badge variant="outline">Top 20</Badge>
                </div>
              </div>
              <RankingTable data={mockRankings.dividendYield} />
            </Card>
          </TabsContent>

          <TabsContent value="marketCap">
            <Card className="overflow-hidden">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Maiores Valores de Mercado</h2>
                    <p className="text-sm text-muted-foreground mt-1">Empresas com maior capitalização de mercado</p>
                  </div>
                  <Badge variant="outline">Top 20</Badge>
                </div>
              </div>
              <RankingTable data={mockRankings.marketCap} />
            </Card>
          </TabsContent>

          <TabsContent value="roe">
            <Card className="overflow-hidden">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Maiores ROE</h2>
                    <p className="text-sm text-muted-foreground mt-1">Empresas com maior retorno sobre patrimônio líquido</p>
                  </div>
                  <Badge variant="outline">Top 20</Badge>
                </div>
              </div>
              <RankingTable data={mockRankings.roe} />
            </Card>
          </TabsContent>

          <TabsContent value="fiis">
            <Card className="overflow-hidden">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Melhores FIIs</h2>
                    <p className="text-sm text-muted-foreground mt-1">Fundos imobiliários com maior Dividend Yield</p>
                  </div>
                  <Badge variant="outline">Top 20</Badge>
                </div>
              </div>
              <RankingTable data={mockRankings.fiis} />
            </Card>
          </TabsContent>
        </Tabs>

        {/* Additional Rankings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="font-bold text-foreground mb-2">Maiores Altas do Dia</h3>
            <p className="text-sm text-muted-foreground mb-4">Ações com maior valorização hoje</p>
            <Button variant="outline" size="sm" className="w-full">Ver Ranking</Button>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="font-bold text-foreground mb-2">Maiores Baixas do Dia</h3>
            <p className="text-sm text-muted-foreground mb-4">Ações com maior desvalorização hoje</p>
            <Button variant="outline" size="sm" className="w-full">Ver Ranking</Button>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="font-bold text-foreground mb-2">Maiores Lucros</h3>
            <p className="text-sm text-muted-foreground mb-4">Empresas mais lucrativas</p>
            <Button variant="outline" size="sm" className="w-full">Ver Ranking</Button>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="font-bold text-foreground mb-2">Maiores Receitas</h3>
            <p className="text-sm text-muted-foreground mb-4">Empresas com maior faturamento</p>
            <Button variant="outline" size="sm" className="w-full">Ver Ranking</Button>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="font-bold text-foreground mb-2">Menor P/L</h3>
            <p className="text-sm text-muted-foreground mb-4">Ações mais baratas pelo P/L</p>
            <Button variant="outline" size="sm" className="w-full">Ver Ranking</Button>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="font-bold text-foreground mb-2">Menor P/VP</h3>
            <p className="text-sm text-muted-foreground mb-4">Ações mais baratas pelo P/VP</p>
            <Button variant="outline" size="sm" className="w-full">Ver Ranking</Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
