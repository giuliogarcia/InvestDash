import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, PlusCircle } from "lucide-react";

export default function Proventos() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    assetId: "",
    type: "dividend" as const,
    amount: "",
    perShare: "",
    paymentDate: "",
  });

  const { data: dividends, isLoading, refetch } = trpc.dividends.getHistory.useQuery({ limit: 100 });
  const { data: summary } = trpc.dividends.getSummary.useQuery();

  const addDividendMutation = trpc.dividends.add.useMutation({
    onSuccess: () => {
      setFormData({
        assetId: "",
        type: "dividend",
        amount: "",
        perShare: "",
        paymentDate: "",
      });
      setShowAddForm(false);
      refetch();
    },
  });

  const handleAddDividend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await addDividendMutation.mutateAsync({
        assetId: Number(formData.assetId),
        type: formData.type as "dividend" | "jcp" | "rendimento" | "amortizacao",
        amount: formData.amount,
        perShare: formData.perShare,
        paymentDate: new Date(formData.paymentDate),
      });
    } catch (error) {
      console.error("Error adding dividend:", error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin w-8 h-8 text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Proventos</h1>
            <p className="text-muted-foreground mt-2">
              Acompanhe dividendos, JCP e rendimentos
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary text-primary-foreground hover:bg-accent"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Novo Provento
          </Button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <p className="text-sm text-muted-foreground font-medium mb-2">Total Recebido</p>
              <p className="text-3xl font-bold text-foreground">
                R$ {summary.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-muted-foreground font-medium mb-2">Dividendos</p>
              <p className="text-3xl font-bold text-primary">
                R${" "}
                {(summary.byType["dividend"] || 0).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-muted-foreground font-medium mb-2">JCP</p>
              <p className="text-3xl font-bold text-secondary">
                R${" "}
                {(summary.byType["jcp"] || 0).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-muted-foreground font-medium mb-2">Rendimentos</p>
              <p className="text-3xl font-bold text-accent">
                R${" "}
                {(summary.byType["rendimento"] || 0).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </Card>
          </div>
        )}

        {/* Add Form */}
        {showAddForm && (
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-foreground">Registrar Novo Provento</h2>
            <form onSubmit={handleAddDividend} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as typeof formData.type,
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground"
                  >
                    <option value="dividend">Dividendo</option>
                    <option value="jcp">JCP</option>
                    <option value="rendimento">Rendimento</option>
                    <option value="amortizacao">Amortização</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Data de Pagamento</label>
                  <Input
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Valor Total</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="100.00"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Por Ação/Cota</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="1.00"
                    value={formData.perShare}
                    onChange={(e) =>
                      setFormData({ ...formData, perShare: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={addDividendMutation.isPending}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-accent"
                >
                  {addDividendMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    "Registrar Provento"
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

        {/* Dividends History */}
        {dividends && dividends.length > 0 ? (
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Histórico de Proventos</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Ativo
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                      Por Ação
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                      Valor Total
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Data de Pagamento
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dividends.map((dividend) => (
                    <tr
                      key={dividend.id}
                      className="border-b border-border hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-foreground">{dividend.ticker}</p>
                          <p className="text-sm text-muted-foreground">
                            {dividend.assetName}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {dividend.type === "dividend"
                            ? "Dividendo"
                            : dividend.type === "jcp"
                            ? "JCP"
                            : dividend.type === "rendimento"
                            ? "Rendimento"
                            : "Amortização"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-foreground">
                        R${" "}
                        {Number(dividend.perShare).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-green-600 dark:text-green-400">
                        R${" "}
                        {Number(dividend.amount).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {new Date(dividend.paymentDate).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">Nenhum provento registrado</p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-primary text-primary-foreground hover:bg-accent"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Registrar Primeiro Provento
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
