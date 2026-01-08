import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  X, 
  Search,
  TrendingUp,
  TrendingDown,
  Save,
  Download
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface Asset {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  dy: number;
  pl: number;
  pvp: number;
  roe: number;
  roa: number;
  margemLiquida: number;
  dividaBrutaPatrimonio: number;
  liquidezCorrente: number;
  marketCap: number;
}

const mockAssets: Record<string, Asset> = {
  PETR4: {
    ticker: 'PETR4',
    name: 'Petrobras',
    price: 38.50,
    changePercent: 1.32,
    dy: 8.5,
    pl: 4.2,
    pvp: 1.1,
    roe: 25.3,
    roa: 12.5,
    margemLiquida: 18.5,
    dividaBrutaPatrimonio: 0.45,
    liquidezCorrente: 1.8,
    marketCap: 501000000000,
  },
  VALE3: {
    ticker: 'VALE3',
    name: 'Vale',
    price: 62.30,
    changePercent: -1.27,
    dy: 10.2,
    pl: 3.8,
    pvp: 0.9,
    roe: 22.1,
    roa: 15.2,
    margemLiquida: 22.3,
    dividaBrutaPatrimonio: 0.38,
    liquidezCorrente: 2.1,
    marketCap: 295000000000,
  },
  ITUB4: {
    ticker: 'ITUB4',
    name: 'Itaú Unibanco',
    price: 28.90,
    changePercent: 1.40,
    dy: 6.5,
    pl: 8.5,
    pvp: 1.8,
    roe: 18.7,
    roa: 1.2,
    margemLiquida: 28.5,
    dividaBrutaPatrimonio: 0,
    liquidezCorrente: 0,
    marketCap: 283000000000,
  },
};

export default function Comparator() {
  const [selectedAssets, setSelectedAssets] = useState<string[]>(['PETR4', 'VALE3']);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddAsset = (ticker: string) => {
    if (selectedAssets.length < 10 && !selectedAssets.includes(ticker)) {
      setSelectedAssets([...selectedAssets, ticker]);
      setSearchQuery('');
    }
  };

  const handleRemoveAsset = (ticker: string) => {
    setSelectedAssets(selectedAssets.filter(t => t !== ticker));
  };

  const comparisonData = selectedAssets.map(ticker => mockAssets[ticker]).filter(Boolean);

  // Prepare data for charts
  const valuationData = comparisonData.map(asset => ({
    name: asset.ticker,
    'P/L': asset.pl,
    'P/VP': asset.pvp,
    'DY': asset.dy,
  }));

  const profitabilityData = comparisonData.map(asset => ({
    name: asset.ticker,
    'ROE': asset.roe,
    'ROA': asset.roa,
    'Margem Líquida': asset.margemLiquida,
  }));

  const radarData = [
    {
      indicator: 'Rentabilidade',
      ...Object.fromEntries(comparisonData.map(a => [a.ticker, a.roe])),
    },
    {
      indicator: 'Dividendos',
      ...Object.fromEntries(comparisonData.map(a => [a.ticker, a.dy * 10])),
    },
    {
      indicator: 'Valuation',
      ...Object.fromEntries(comparisonData.map(a => [a.ticker, Math.max(0, 100 - a.pl * 5)])),
    },
    {
      indicator: 'Liquidez',
      ...Object.fromEntries(comparisonData.map(a => [a.ticker, a.liquidezCorrente * 30])),
    },
    {
      indicator: 'Margem',
      ...Object.fromEntries(comparisonData.map(a => [a.ticker, a.margemLiquida * 3])),
    },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Comparador de Ativos</h1>
          <p className="text-muted-foreground mt-2">Compare até 10 ativos simultaneamente</p>
        </div>

        {/* Asset Selection */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Digite o ticker do ativo (ex: PETR4, VALE3)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && searchQuery) {
                        handleAddAsset(searchQuery);
                      }
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button 
                onClick={() => searchQuery && handleAddAsset(searchQuery)}
                disabled={selectedAssets.length >= 10}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedAssets.map(ticker => (
                <Badge key={ticker} variant="outline" className="px-3 py-2 text-sm">
                  {ticker}
                  <button
                    onClick={() => handleRemoveAsset(ticker)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {selectedAssets.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum ativo selecionado</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {selectedAssets.length} de 10 ativos selecionados
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Comparação
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {comparisonData.length > 0 && (
          <>
            {/* Basic Info Comparison */}
            <Card className="overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">Informações Básicas</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Métrica</th>
                      {comparisonData.map(asset => (
                        <th key={asset.ticker} className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                          {asset.ticker}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border hover:bg-muted/20">
                      <td className="px-6 py-4 font-medium text-foreground">Nome</td>
                      {comparisonData.map(asset => (
                        <td key={asset.ticker} className="px-6 py-4 text-right text-foreground">
                          {asset.name}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/20">
                      <td className="px-6 py-4 font-medium text-foreground">Cotação</td>
                      {comparisonData.map(asset => (
                        <td key={asset.ticker} className="px-6 py-4 text-right text-foreground">
                          R$ {asset.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/20">
                      <td className="px-6 py-4 font-medium text-foreground">Variação</td>
                      {comparisonData.map(asset => {
                        const isPositive = asset.changePercent >= 0;
                        return (
                          <td key={asset.ticker} className={`px-6 py-4 text-right font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            <div className="flex items-center justify-end gap-1">
                              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                              <span>{isPositive ? '+' : ''}{asset.changePercent.toFixed(2)}%</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/20">
                      <td className="px-6 py-4 font-medium text-foreground">Valor de Mercado</td>
                      {comparisonData.map(asset => (
                        <td key={asset.ticker} className="px-6 py-4 text-right text-foreground">
                          R$ {(asset.marketCap / 1000000000).toFixed(2)}B
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Valuation Indicators */}
            <Card className="overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">Indicadores de Valuation</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Indicador</th>
                      {comparisonData.map(asset => (
                        <th key={asset.ticker} className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                          {asset.ticker}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border hover:bg-muted/20">
                      <td className="px-6 py-4 font-medium text-foreground">P/L</td>
                      {comparisonData.map(asset => (
                        <td key={asset.ticker} className="px-6 py-4 text-right text-foreground">
                          {asset.pl.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/20">
                      <td className="px-6 py-4 font-medium text-foreground">P/VP</td>
                      {comparisonData.map(asset => (
                        <td key={asset.ticker} className="px-6 py-4 text-right text-foreground">
                          {asset.pvp.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/20">
                      <td className="px-6 py-4 font-medium text-foreground">Dividend Yield</td>
                      {comparisonData.map(asset => (
                        <td key={asset.ticker} className="px-6 py-4 text-right text-foreground">
                          {asset.dy.toFixed(2)}%
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Profitability Indicators */}
            <Card className="overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">Indicadores de Rentabilidade</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Indicador</th>
                      {comparisonData.map(asset => (
                        <th key={asset.ticker} className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                          {asset.ticker}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border hover:bg-muted/20">
                      <td className="px-6 py-4 font-medium text-foreground">ROE</td>
                      {comparisonData.map(asset => (
                        <td key={asset.ticker} className="px-6 py-4 text-right text-foreground">
                          {asset.roe.toFixed(2)}%
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/20">
                      <td className="px-6 py-4 font-medium text-foreground">ROA</td>
                      {comparisonData.map(asset => (
                        <td key={asset.ticker} className="px-6 py-4 text-right text-foreground">
                          {asset.roa.toFixed(2)}%
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/20">
                      <td className="px-6 py-4 font-medium text-foreground">Margem Líquida</td>
                      {comparisonData.map(asset => (
                        <td key={asset.ticker} className="px-6 py-4 text-right text-foreground">
                          {asset.margemLiquida.toFixed(2)}%
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Valuation Chart */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Comparação de Valuation</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={valuationData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs text-muted-foreground" />
                      <YAxis className="text-xs text-muted-foreground" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="P/L" fill={COLORS[0]} />
                      <Bar dataKey="P/VP" fill={COLORS[1]} />
                      <Bar dataKey="DY" fill={COLORS[2]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Profitability Chart */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Comparação de Rentabilidade</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={profitabilityData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs text-muted-foreground" />
                      <YAxis className="text-xs text-muted-foreground" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="ROE" fill={COLORS[0]} />
                      <Bar dataKey="ROA" fill={COLORS[1]} />
                      <Bar dataKey="Margem Líquida" fill={COLORS[2]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Radar Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Análise Multidimensional</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid className="stroke-muted" />
                    <PolarAngleAxis dataKey="indicator" className="text-xs text-muted-foreground" />
                    <PolarRadiusAxis className="text-xs text-muted-foreground" />
                    {comparisonData.map((asset, index) => (
                      <Radar
                        key={asset.ticker}
                        name={asset.ticker}
                        dataKey={asset.ticker}
                        stroke={COLORS[index]}
                        fill={COLORS[index]}
                        fillOpacity={0.3}
                      />
                    ))}
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </>
        )}

        {comparisonData.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Adicione ativos para começar a comparação
              </p>
              <p className="text-sm text-muted-foreground">
                Você pode comparar até 10 ativos simultaneamente
              </p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
