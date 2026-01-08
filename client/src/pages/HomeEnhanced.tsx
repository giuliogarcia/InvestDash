import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown, PlusCircle, BarChart3, Shield } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import ModernDashboardLayout from "@/components/ModernDashboardLayout";
import MarketIndices from "@/components/MarketIndices";
import AssetDistribution from "@/components/AssetDistribution";
import PortfolioEvolution from "@/components/PortfolioEvolution";
import UpcomingDividends from "@/components/UpcomingDividends";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

function PortfolioSummary() {
  const { data: summary, isLoading } = trpc.portfolio.getSummary.useQuery();
  const { data: holdings } = trpc.portfolio.getHoldings.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  // Show empty state if no holdings
  if (!holdings || holdings.length === 0) {
    return (
      <div className="text-center py-16 bg-muted/30 rounded-lg border border-dashed">
        <PlusCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-4 text-lg">Nenhum ativo cadastrado na sua carteira</p>
        <Button className="bg-primary text-primary-foreground hover:bg-accent">
          <PlusCircle className="w-4 h-4 mr-2" />
          Adicionar Primeiro Ativo
        </Button>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const gainPercentage = Number(summary.gainPercentage);
  const isPositive = gainPercentage >= 0;

  // Distribution data from actual holdings
  const distributionData = holdings.reduce((acc, holding) => {
    const type = holding.ticker.endsWith('11') ? 'FIIs' : 'Ações';
    const existing = acc.find(d => d.name === type);
    const value = Number(holding.currentValue) || 0;
    
    if (existing) {
      existing.value += value;
    } else {
      acc.push({ name: type, value, percentage: 0 });
    }
    return acc;
  }, [] as any[]);

  // Calculate percentages
  const totalValue = distributionData.reduce((sum, d) => sum + d.value, 0);
  distributionData.forEach(d => {
    d.percentage = totalValue > 0 ? Math.round((d.value / totalValue) * 100) : 0;
  });

  // Evolution data (simplified - would come from real data in production)
  const evolutionData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const baseValue = Number(summary.totalValue);
    return {
      date: date.toISOString(),
      value: baseValue + (Math.random() * 5000 - 2500),
      invested: Number(summary.totalInvested),
    };
  });

  // Upcoming dividends from mock data (in production, would be real)
  const upcomingDividends = [
    {
      id: 1,
      ticker: 'ITUB4',
      assetName: 'Itaú Unibanco',
      type: 'jcp',
      amount: 125.50,
      perShare: 0.0251,
      exDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      paymentDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      ticker: 'HGLG11',
      assetName: 'CSHG Logística',
      type: 'rendimento',
      amount: 89.30,
      perShare: 0.8930,
      exDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      paymentDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground font-medium mb-2">Patrimônio Total</p>
          <p className="text-3xl font-bold text-foreground">
            R$ {Number(summary.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground font-medium mb-2">Total Investido</p>
          <p className="text-3xl font-bold text-foreground">
            R$ {Number(summary.totalInvested).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground font-medium mb-2">Ganho/Perda</p>
          <div className="flex items-baseline gap-2">
            <p className={`text-3xl font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              R$ {Number(summary.totalGain).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="text-sm font-medium">{gainPercentage.toFixed(2)}%</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground font-medium mb-2">Ativos</p>
          <p className="text-3xl font-bold text-foreground">{summary.holdingCount}</p>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PortfolioEvolution data={evolutionData} />
        <AssetDistribution data={distributionData} />
      </div>

      {/* Dividends and Holdings Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingDividends data={upcomingDividends} />

        {/* Quick Holdings Summary */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Principais Ativos</h2>
            <Button variant="outline" size="sm">
              Ver Todos
            </Button>
          </div>

          <div className="space-y-3">
            {holdings?.slice(0, 5).map((holding) => {
              const holdingGainPercentage = Number(holding.gainPercentage);
              const isHoldingPositive = holdingGainPercentage >= 0;

              return (
                <div 
                  key={holding.id} 
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <p className="font-bold text-foreground">{holding.ticker}</p>
                    <p className="text-sm text-muted-foreground">{holding.assetName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">
                      R$ {Number(holding.currentValue).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className={`text-sm font-medium ${isHoldingPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {isHoldingPositive ? '+' : ''}{holdingGainPercentage.toFixed(2)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Full Holdings Table */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Minha Carteira Completa</h2>
            <Button className="bg-primary text-primary-foreground hover:bg-accent">
              <PlusCircle className="w-4 h-4 mr-2" />
              Novo Ativo
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Ativo</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Quantidade</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Preço Médio</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Preço Atual</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Total Investido</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Valor Atual</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Ganho/Perda</th>
              </tr>
            </thead>
            <tbody>
              {holdings?.map((holding) => {
                const holdingGainPercentage = Number(holding.gainPercentage);
                const isHoldingPositive = holdingGainPercentage >= 0;

                return (
                  <tr key={holding.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-foreground">{holding.ticker}</p>
                        <p className="text-sm text-muted-foreground">{holding.assetName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-foreground">
                      {Number(holding.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-foreground">
                      R$ {Number(holding.averageBuyPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-foreground">
                      R$ {Number(holding.currentPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-foreground">
                      R$ {Number(holding.totalInvested).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-foreground">
                      R$ {Number(holding.currentValue).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`px-6 py-4 text-right font-medium ${isHoldingPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      <div className="flex items-center justify-end gap-1">
                        {isHoldingPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span>
                          R$ {Number(holding.gain).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <p className="text-xs">({holdingGainPercentage.toFixed(2)}%)</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default function Home() {
  const { user, loading, isAuthenticated, refresh } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    console.log("[HomeEnhanced] Current state:", {
      isAuthenticated,
      user: user?.email,
      loading,
      location,
    });
  }, [isAuthenticated, user, loading, location]);

  // Aggressive auth polling after OAuth redirect
  useEffect(() => {
    const hasLoggedIn = location.includes("?loggedin=");
    if (!hasLoggedIn) return;

    console.log("[HomeEnhanced] OAuth callback detected, starting aggressive polling");
    console.log("[HomeEnhanced] Current auth state:", { isAuthenticated, user, loading });
    
    // Immediate refetch
    refresh();
    
    // Cascade refetches with exponential backoff
    const timings = [50, 100, 200, 400, 800, 1200, 2000, 3000, 5000];
    const timeouts = timings.map((ms) =>
      setTimeout(() => {
        console.log(`[HomeEnhanced] Refetch at ${ms}ms, state:`, { isAuthenticated, user });
        refresh();
      }, ms)
    );

    return () => timeouts.forEach(clearTimeout);
  }, [location, refresh, isAuthenticated, user]);

  // Refetch auth status quando a página monta
  useEffect(() => {
    const handleFocus = () => {
      console.log("[HomeEnhanced] Window focused, refreshing auth");
      refresh();
    };

    window.addEventListener("focus", handleFocus);

    // Se voltou do OAuth (URL tem query params)
    if (location.includes("?loggedin=")) {
      console.log("[HomeEnhanced] OAuth callback detected!");
      
      // Força refetch IMEDIATO e múltiplas vezes
      const refetchAttempts = [
        { delay: 0, label: "immediate" },
        { delay: 25, label: "25ms" },
        { delay: 75, label: "75ms" },
        { delay: 150, label: "150ms" },
        { delay: 300, label: "300ms" },
        { delay: 500, label: "500ms" },
        { delay: 800, label: "800ms" },
        { delay: 1200, label: "1200ms" },
      ];

      const timers = refetchAttempts.map((attempt) =>
        setTimeout(() => {
          console.log(`[HomeEnhanced] Refetch attempt (${attempt.label})`);
          refresh();
        }, attempt.delay)
      );

      // Remove query params
      setTimeout(() => {
        window.history.replaceState({}, "", "/dashboard");
      }, 100);

      return () => {
        window.removeEventListener("focus", handleFocus);
        timers.forEach((timer) => clearTimeout(timer));
      };
    } else {
      // Normal mount - refetch anyway
      console.log("[HomeEnhanced] Normal mount, refreshing auth");
      refresh();
    }

    return () => window.removeEventListener("focus", handleFocus);
  }, [refresh, location]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  // Versão Pública - Permite exploração sem login obrigatório
  if (!isAuthenticated) {
    return (
      <ModernDashboardLayout isPublic={true}>
        <div className="space-y-8">
          {/* Seção de Boas-vindas */}
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold text-foreground mb-3">InvestDash</h1>
            <p className="text-xl text-muted-foreground mb-8">Plataforma de Análise de Investimentos Profissional</p>
            <Button
              onClick={() => {
                window.location.href = `http://localhost:3000/api/google/login`;
              }}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Entrar / Criar Conta
            </Button>
          </div>

          {/* Funcionalidades Principais */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Funcionalidades Principais</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-8 hover:shadow-lg transition-shadow border-0 bg-muted/30">
                <TrendingUp className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">Análise Fundamentalista</h3>
                <p className="text-sm text-muted-foreground">20+ indicadores técnicos com histórico completo para análise profissional</p>
              </Card>
              <Card className="p-8 hover:shadow-lg transition-shadow border-0 bg-muted/30">
                <BarChart3 className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">Fórmulas de Valuation</h3>
                <p className="text-sm text-muted-foreground">Benjamin Graham, Bazin e mais. Descubra se o ativo está barato</p>
              </Card>
              <Card className="p-8 hover:shadow-lg transition-shadow border-0 bg-muted/30">
                <Shield className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">100% Gratuito</h3>
                <p className="text-sm text-muted-foreground">Sem limitações, sem cobranças futuras. Análise profissional para todos</p>
              </Card>
            </div>
          </div>

          {/* Mostrar componentes públicos */}
          <MarketIndices />

          {/* Top Movers Section */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Ativos em Destaque</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Gainers */}
              <Card className="p-6 border-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-bold text-foreground">Maiores Altas</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { ticker: "VVAR3", price: "R$ 15,42", change: "+8,5%" },
                    { ticker: "AZUL4", price: "R$ 8,65", change: "+6,2%" },
                    { ticker: "RAIL3", price: "R$ 18,20", change: "+5,8%" },
                  ].map((item) => (
                    <div key={item.ticker} className="flex justify-between items-center pb-3 border-b border-border/20 last:border-0">
                      <div>
                        <p className="font-semibold text-foreground">{item.ticker}</p>
                        <p className="text-xs text-muted-foreground">{item.price}</p>
                      </div>
                      <span className="text-green-600 font-semibold">{item.change}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Top Losers */}
              <Card className="p-6 border-0 bg-gradient-to-br from-red-50/50 to-rose-50/50 dark:from-red-950/20 dark:to-rose-950/20">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg font-bold text-foreground">Maiores Quedas</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { ticker: "VALE3", price: "R$ 62,10", change: "-4,2%" },
                    { ticker: "BBAS3", price: "R$ 28,50", change: "-3,8%" },
                    { ticker: "PETR4", price: "R$ 31,25", change: "-2,9%" },
                  ].map((item) => (
                    <div key={item.ticker} className="flex justify-between items-center pb-3 border-b border-border/20 last:border-0">
                      <div>
                        <p className="font-semibold text-foreground">{item.ticker}</p>
                        <p className="text-xs text-muted-foreground">{item.price}</p>
                      </div>
                      <span className="text-red-600 font-semibold">{item.change}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Ticker Search Section */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Análise de Ativos</h2>
            <Card className="p-8 border-0 bg-gradient-to-r from-primary/5 to-secondary/5">
              <p className="text-muted-foreground mb-4">Busque por qualquer ativo da bolsa brasileira para visualizar:</p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6 list-disc list-inside">
                <li>Indicadores fundamentalistas (P/L, P/VP, ROE, Margem, etc)</li>
                <li>Histórico completo de preços</li>
                <li>Análise de dividendos</li>
                <li>Fórmulas de valuation (Graham, Bazin)</li>
                <li>Comparação com outros ativos</li>
              </ul>
              <Button
                onClick={() => {
                  window.location.href = `/busca-avancada`;
                }}
                variant="secondary"
              >
                Explorar Ativos →
              </Button>
            </Card>
          </div>

          {/* Rankings Section */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Rankings de Ativos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Maiores Dividend Yield */}
              <Card className="p-6 border-0 bg-muted/30">
                <h3 className="text-lg font-bold text-foreground mb-4">Maiores Dividend Yield</h3>
                <div className="space-y-3">
                  {[
                    { position: "#1", ticker: "MOAR3", name: "Monteiro Aranha", dy: "80,07%" },
                    { position: "#2", ticker: "SCAR3", name: "São Carlos", dy: "51,64%" },
                    { position: "#3", ticker: "GRND3", name: "Grendene", dy: "36,47%" },
                    { position: "#4", ticker: "GUAR3", name: "Guararapes", dy: "35,60%" },
                    { position: "#5", ticker: "MELK3", name: "Melnick", dy: "34,80%" },
                  ].map((item) => (
                    <div key={item.ticker} className="flex justify-between items-start pb-3 border-b border-border/20 last:border-0">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">{item.position}</p>
                        <p className="font-semibold text-foreground">{item.ticker}</p>
                        <p className="text-xs text-muted-foreground">{item.name}</p>
                      </div>
                      <span className="text-green-600 font-bold text-sm">{item.dy}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm">
                  Ver Ranking Completo →
                </Button>
              </Card>

              {/* Maiores Valor de Mercado */}
              <Card className="p-6 border-0 bg-muted/30">
                <h3 className="text-lg font-bold text-foreground mb-4">Maiores Valor de Mercado</h3>
                <div className="space-y-3">
                  {[
                    { position: "#1", ticker: "ITUB4", name: "Banco Itaú", market: "R$ 418,32 B" },
                    { position: "#2", ticker: "PETR4", name: "Petrobrás", market: "R$ 392,87 B" },
                    { position: "#3", ticker: "VALE3", name: "Vale", market: "R$ 346,05 B" },
                    { position: "#4", ticker: "BPAC11", name: "BTG Pactual", market: "R$ 331,39 B" },
                    { position: "#5", ticker: "ABEV3", name: "Ambev", market: "R$ 215,15 B" },
                  ].map((item) => (
                    <div key={item.ticker} className="flex justify-between items-start pb-3 border-b border-border/20 last:border-0">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">{item.position}</p>
                        <p className="font-semibold text-foreground">{item.ticker}</p>
                        <p className="text-xs text-muted-foreground">{item.name}</p>
                      </div>
                      <span className="text-primary font-bold text-sm">{item.market}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm">
                  Ver Ranking Completo →
                </Button>
              </Card>

              {/* Maiores Receitas */}
              <Card className="p-6 border-0 bg-muted/30">
                <h3 className="text-lg font-bold text-foreground mb-4">Maiores Receitas</h3>
                <div className="space-y-3">
                  {[
                    { position: "#1", ticker: "PETR4", name: "Petrobrás", revenue: "R$ 491,45 B" },
                    { position: "#2", ticker: "ITUB4", name: "Banco Itaú", revenue: "R$ 388,88 B" },
                    { position: "#3", ticker: "BBAS3", name: "Banco do Brasil", revenue: "R$ 305,72 B" },
                    { position: "#4", ticker: "BBDC3", name: "Banco Bradesco", revenue: "R$ 252,28 B" },
                    { position: "#5", ticker: "RAIZ4", name: "Raízen", revenue: "R$ 238,73 B" },
                  ].map((item) => (
                    <div key={item.ticker} className="flex justify-between items-start pb-3 border-b border-border/20 last:border-0">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">{item.position}</p>
                        <p className="font-semibold text-foreground">{item.ticker}</p>
                        <p className="text-xs text-muted-foreground">{item.name}</p>
                      </div>
                      <span className="text-blue-600 font-bold text-sm">{item.revenue}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm">
                  Ver Ranking Completo →
                </Button>
              </Card>
            </div>
          </div>

          {/* Índices e Moedas Section */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Mercado em Tempo Real</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Índices */}
              <Card className="p-6 border-0 bg-muted/30">
                <h3 className="text-lg font-bold text-foreground mb-4">Índices Principais</h3>
                <div className="space-y-3">
                  {[
                    { name: "Ibovespa", value: "161.975,23", change: "-1,03%", isPositive: false },
                    { name: "IFIX", value: "3.781,07", change: "-0,19%", isPositive: false },
                    { name: "Small Cap", value: "56.123,45", change: "+2,15%", isPositive: true },
                  ].map((idx) => (
                    <div key={idx.name} className="flex justify-between items-center pb-3 border-b border-border/20 last:border-0">
                      <div>
                        <p className="font-semibold text-foreground">{idx.name}</p>
                        <p className="text-sm text-foreground">{idx.value}</p>
                      </div>
                      <span className={`font-bold ${idx.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {idx.change}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Moedas */}
              <Card className="p-6 border-0 bg-muted/30">
                <h3 className="text-lg font-bold text-foreground mb-4">Moedas</h3>
                <div className="space-y-3">
                  {[
                    { name: "Dólar Comercial", value: "R$ 5,39", change: "+0,15%" },
                    { name: "Euro", value: "R$ 6,30", change: "+0,11%" },
                    { name: "Yuan Chinês", value: "R$ 0,77", change: "-0,22%" },
                  ].map((moeda) => (
                    <div key={moeda.name} className="flex justify-between items-center pb-3 border-b border-border/20 last:border-0">
                      <div>
                        <p className="font-semibold text-foreground">{moeda.name}</p>
                        <p className="text-sm text-foreground">{moeda.value}</p>
                      </div>
                      <span className="font-semibold text-muted-foreground">{moeda.change}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Criptomoedas */}
              <Card className="p-6 border-0 bg-muted/30">
                <h3 className="text-lg font-bold text-foreground mb-4">Criptomoedas</h3>
                <div className="space-y-3">
                  {[
                    { name: "Bitcoin", value: "R$ 495,50 K", change: "-1,40%", isPositive: false },
                    { name: "Ethereum", value: "R$ 17,31 K", change: "-1,96%", isPositive: false },
                    { name: "Solana", value: "R$ 742,65", change: "-1,59%", isPositive: false },
                  ].map((cripto) => (
                    <div key={cripto.name} className="flex justify-between items-center pb-3 border-b border-border/20 last:border-0">
                      <div>
                        <p className="font-semibold text-foreground">{cripto.name}</p>
                        <p className="text-sm text-foreground">{cripto.value}</p>
                      </div>
                      <span className="font-semibold text-red-600">{cripto.change}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* CTA Final */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-12 text-center border border-primary/20">
            <h2 className="text-3xl font-bold text-foreground mb-4">Comece a Investir com Inteligência</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Acesse ferramentas profissionais de análise, acompanhe sua carteira e receba insights sobre seus investimentos
            </p>
            <Button
              onClick={() => {
                window.location.href = `http://localhost:3000/api/google/login`;
              }}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              Começar Grátis
            </Button>
          </div>
        </div>
      </ModernDashboardLayout>
    );
  }

  // Versão Autenticada - Modo Dashboard Completo
  return (
    <ModernDashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bem-vindo, {user?.name}!</h1>
          <p className="text-muted-foreground mt-2">Acompanhe sua carteira de investimentos em tempo real</p>
        </div>

        {/* Market Indices */}
        <MarketIndices />

        {/* Portfolio Summary and Charts - Only show if user has holdings */}
        <PortfolioSummary />
      </div>
    </ModernDashboardLayout>
  );
}
