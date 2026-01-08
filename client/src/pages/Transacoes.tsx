import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, PlusCircle, TrendingUp, TrendingDown } from "lucide-react";

export default function Transacoes() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    assetId: "",
    type: "buy" as "buy" | "sell",
    quantity: "",
    unitPrice: "",
    transactionDate: new Date().toISOString().split("T")[0],
    fees: "",
  });

  const { data: transactions, isLoading, refetch } = trpc.transactions.getHistory.useQuery({ limit: 100 });

  const addTransactionMutation = trpc.transactions.add.useMutation({
    onSuccess: () => {
      setFormData({
        assetId: "",
        type: "buy",
        quantity: "",
        unitPrice: "",
        transactionDate: new Date().toISOString().split("T")[0],
        fees: "",
      });
      setShowAddForm(false);
      refetch();
    },
  });

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTransactionMutation.mutateAsync({
        assetId: Number(formData.assetId),
        type: formData.type,
        quantity: formData.quantity,
        unitPrice: formData.unitPrice,
        transactionDate: new Date(formData.transactionDate),
        fees: formData.fees || "0",
      });
    } catch (error) {
      console.error("Error adding transaction:", error);
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
            <h1 className="text-3xl font-bold text-foreground">Transações</h1>
            <p className="text-muted-foreground mt-2">Histórico de compras e vendas</p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary text-primary-foreground hover:bg-accent"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-foreground">Registrar Nova Transação</h2>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as "buy" | "sell",
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground"
                  >
                    <option value="buy">Compra</option>
                    <option value="sell">Venda</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Data</label>
                  <Input
                    type="date"
                    value={formData.transactionDate}
                    onChange={(e) =>
                      setFormData({ ...formData, transactionDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
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
                  <label className="text-sm font-medium text-foreground">Preço Unitário</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="25.50"
                    value={formData.unitPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, unitPrice: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Taxas</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.fees}
                    onChange={(e) =>
                      setFormData({ ...formData, fees: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={addTransactionMutation.isPending}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-accent"
                >
                  {addTransactionMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    "Registrar Transação"
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

        {/* Transactions History */}
        {transactions && transactions.length > 0 ? (
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Histórico de Transações</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Ativo
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                      Quantidade
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                      Preço Unitário
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                      Valor Total
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                      Taxas
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => {
                    const isBuy = transaction.type === "buy";

                    return (
                      <tr
                        key={transaction.id}
                        className="border-b border-border hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-foreground">{transaction.ticker}</p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.assetName}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {isBuy ? (
                              <>
                                <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                  Compra
                                </span>
                              </>
                            ) : (
                              <>
                                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                  Venda
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-foreground">
                          {Number(transaction.quantity).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-4 text-right text-foreground">
                          R${" "}
                          {Number(transaction.unitPrice).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-foreground">
                          R${" "}
                          {Number(transaction.totalValue).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-4 text-right text-foreground">
                          R${" "}
                          {Number(transaction.fees || 0).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-4 text-foreground">
                          {new Date(transaction.transactionDate).toLocaleDateString("pt-BR")}
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
            <p className="text-muted-foreground mb-4">Nenhuma transação registrada</p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-primary text-primary-foreground hover:bg-accent"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Registrar Primeira Transação
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
