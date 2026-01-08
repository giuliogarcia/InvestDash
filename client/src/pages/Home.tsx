import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown, PlusCircle } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

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

  if (!summary) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Nenhum ativo na carteira</p>
        <Button className="bg-primary text-primary-foreground hover:bg-accent">
          <PlusCircle className="w-4 h-4 mr-2" />
          Adicionar Ativo
        </Button>
      </div>
    );
  }

  const gainPercentage = Number(summary.gainPercentage);
  const isPositive = gainPercentage >= 0;

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

      {/* Holdings Table */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Minha Carteira</h2>
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
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="max-w-md text-center space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">InvestDash</h1>
            <p className="text-lg text-muted-foreground">Sua carteira de investimentos inteligente</p>
          </div>

          <p className="text-foreground">
            Gerencie sua carteira de ações, FIIs e renda fixa com profissionalismo e simplicidade.
          </p>

          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="w-full bg-primary text-primary-foreground hover:bg-accent py-6 text-lg"
          >
            Entrar com Manus
          </Button>

          <p className="text-sm text-muted-foreground">
            Crie uma conta gratuita e comece a acompanhar seus investimentos hoje mesmo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bem-vindo, {user?.name}!</h1>
          <p className="text-muted-foreground mt-2">Acompanhe sua carteira de investimentos em tempo real</p>
        </div>

        <PortfolioSummary />
      </div>
    </DashboardLayout>
  );
}
