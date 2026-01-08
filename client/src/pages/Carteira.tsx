import { useState } from "react";
import { trpc } from "@/lib/trpc";
import ModernDashboardLayout from "@/components/ModernDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, PlusCircle, Search, Trash2 } from "lucide-react";
import { z } from "zod";

const addHoldingSchema = z.object({
  ticker: z.string().min(1),
  quantity: z.string().min(1),
  averageBuyPrice: z.string().min(1),
});

export default function Carteira() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    ticker: "",
    quantity: "",
    averageBuyPrice: "",
  });

  const { data: holdings, isLoading, refetch } = trpc.portfolio.getHoldings.useQuery();
  const { data: searchResults } = trpc.assets.search.useQuery(
    { query: searchQuery, limit: 10 },
    { enabled: searchQuery.length >= 2 }
  );

  const addHoldingMutation = trpc.portfolio.addHolding.useMutation({
    onSuccess: () => {
      setFormData({ ticker: "", quantity: "", averageBuyPrice: "" });
      setShowAddForm(false);
      refetch();
    },
  });

  const handleAddHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = addHoldingSchema.parse(formData);
      await addHoldingMutation.mutateAsync(validated);
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  if (isLoading) {
    return (
      <ModernDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin w-8 h-8 text-primary" />
        </div>
      </ModernDashboardLayout>
    );
  }

  return (
    <ModernDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Minha Carteira</h1>
            <p className="text-muted-foreground mt-2">Gerencie seus ativos e investimentos</p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary text-primary-foreground hover:bg-accent"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Novo Ativo
          </Button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-foreground">Adicionar Novo Ativo</h2>
            <form onSubmit={handleAddHolding} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Ticker</label>
                <div className="relative">
                  <Input
                    placeholder="Pesquise o ativo (ex: PETR4, ITUB4)"
                    value={formData.ticker}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onChangeCapture={(e) =>
                      setFormData({ ...formData, ticker: (e.target as HTMLInputElement).value })
                    }
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                </div>

                {/* Search Results */}
                {searchResults && searchResults.length > 0 && (
                  <div className="border border-border rounded-lg mt-2 max-h-48 overflow-y-auto">
                    {searchResults.map((asset) => (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, ticker: asset.ticker });
                          setSearchQuery("");
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-muted border-b border-border last:border-b-0 transition-colors"
                      >
                        <p className="font-semibold text-foreground">{asset.ticker}</p>
                        <p className="text-sm text-muted-foreground">{asset.name}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Quantidade</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="100"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Preço Médio</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="25.50"
                    value={formData.averageBuyPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, averageBuyPrice: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={addHoldingMutation.isPending}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-accent"
                >
                  {addHoldingMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adicionando...
                    </>
                  ) : (
                    "Adicionar Ativo"
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Holdings List */}
        {holdings && holdings.length > 0 ? (
          <Card className="overflow-hidden">
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
                      Preço Médio
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                      Preço Atual
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                      Total Investido
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                      Valor Atual
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                      Ganho/Perda
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding) => {
                    const gainPercentage = Number(holding.gainPercentage);
                    const isPositive = gainPercentage >= 0;

                    return (
                      <tr
                        key={holding.id}
                        className="border-b border-border hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-foreground">{holding.ticker}</p>
                            <p className="text-sm text-muted-foreground">
                              {holding.assetName}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-foreground">
                          {Number(holding.quantity).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-4 text-right text-foreground">
                          R${" "}
                          {Number(holding.averageBuyPrice).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-4 text-right text-foreground">
                          R${" "}
                          {Number(holding.currentPrice).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-4 text-right text-foreground">
                          R${" "}
                          {Number(holding.totalInvested).toLocaleString("pt-BR", {
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
                        <td
                          className={`px-6 py-4 text-right font-medium ${
                            isPositive
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          <div>
                            R${" "}
                            {Number(holding.gain).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <p className="text-xs">({gainPercentage.toFixed(2)}%)</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">Nenhum ativo na carteira</p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-primary text-primary-foreground hover:bg-accent"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Adicionar Primeiro Ativo
            </Button>
          </Card>
        )}
      </div>
    </ModernDashboardLayout>
  );
}
