import { useState } from "react";
import { trpc } from "@/lib/trpc";
import ModernDashboardLayout from "@/components/ModernDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, PlusCircle, Target, CheckCircle, XCircle } from "lucide-react";

export default function Metas() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetAmount: "",
    targetDate: "",
    category: "patrimonio" as "patrimonio" | "renda" | "economia" | "outro",
  });

  const { data: goals, isLoading, refetch } = trpc.goals.getAll.useQuery();

  const createGoalMutation = trpc.goals.create.useMutation({
    onSuccess: () => {
      setFormData({
        name: "",
        description: "",
        targetAmount: "",
        targetDate: "",
        category: "patrimonio",
      });
      setShowAddForm(false);
      refetch();
    },
  });

  const updateGoalMutation = trpc.goals.update.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createGoalMutation.mutateAsync({
        name: formData.name,
        description: formData.description,
        targetAmount: formData.targetAmount,
        targetDate: formData.targetDate ? new Date(formData.targetDate) : undefined,
        category: formData.category,
      });
    } catch (error) {
      console.error("Error creating goal:", error);
    }
  };

  const handleCompleteGoal = async (goalId: number) => {
    try {
      await updateGoalMutation.mutateAsync({
        goalId,
        status: "concluido",
      });
    } catch (error) {
      console.error("Error updating goal:", error);
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

  const activeGoals = goals?.filter(g => g.status === "ativo") || [];
  const completedGoals = goals?.filter(g => g.status === "concluido") || [];

  return (
    <ModernDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Metas Financeiras</h1>
            <p className="text-muted-foreground mt-2">Defina e acompanhe seus objetivos</p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary text-primary-foreground hover:bg-accent"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Nova Meta
          </Button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-foreground">Criar Nova Meta</h2>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nome da Meta</label>
                <Input
                  placeholder="Ex: Atingir R$ 100.000 em patrimônio"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Descrição</label>
                <textarea
                  placeholder="Descreva sua meta..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Valor Alvo</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="100000.00"
                    value={formData.targetAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, targetAmount: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Data Alvo</label>
                  <Input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) =>
                      setFormData({ ...formData, targetDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as typeof formData.category,
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground"
                >
                  <option value="patrimonio">Patrimônio</option>
                  <option value="renda">Renda</option>
                  <option value="economia">Economia</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={createGoalMutation.isPending}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-accent"
                >
                  {createGoalMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar Meta"
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

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Metas Ativas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeGoals.map((goal) => {
                const progress = goal.currentAmount ? (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100 : 0;
                const daysLeft = goal.targetDate
                  ? Math.ceil(
                      (new Date(goal.targetDate).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : null;

                return (
                  <Card key={goal.id} className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground">{goal.name}</h3>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {goal.description}
                          </p>
                        )}
                      </div>
                      <Target className="w-5 h-5 text-primary flex-shrink-0" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Progresso</span>
                        <span className="text-sm font-semibold text-foreground">
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Atual</p>
                        <p className="font-semibold text-foreground">
                          R${" "}
                          {Number(goal.currentAmount || 0).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Alvo</p>
                        <p className="font-semibold text-foreground">
                          R${" "}
                          {Number(goal.targetAmount).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>

                    {daysLeft !== null && (
                      <p className="text-xs text-muted-foreground">
                        {daysLeft > 0
                          ? `${daysLeft} dias restantes`
                          : "Prazo expirado"}
                      </p>
                    )}

                    <Button
                      onClick={() => handleCompleteGoal(goal.id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Marcar como Concluída
                    </Button>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Metas Concluídas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedGoals.map((goal) => (
                <Card key={goal.id} className="p-6 space-y-4 opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground line-through">
                        {goal.name}
                      </h3>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Valor Atingido</p>
                      <p className="font-semibold text-foreground">
                        R${" "}
                        {Number(goal.targetAmount).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Categoria</p>
                      <p className="font-semibold text-foreground capitalize">
                        {goal.category === "patrimonio"
                          ? "Patrimônio"
                          : goal.category === "renda"
                          ? "Renda"
                          : goal.category === "economia"
                          ? "Economia"
                          : "Outro"}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {activeGoals.length === 0 && completedGoals.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">Nenhuma meta criada</p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-primary text-primary-foreground hover:bg-accent"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Criar Primeira Meta
            </Button>
          </Card>
        )}
      </div>
    </ModernDashboardLayout>
  );
}
