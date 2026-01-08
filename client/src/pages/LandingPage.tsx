import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, PieChart, Zap, Shield, Users } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

const features = [
  {
    icon: TrendingUp,
    title: "Análise Fundamentalista Completa",
    description: "Acesso a 20+ indicadores fundamentalistas com histórico de 10 anos",
  },
  {
    icon: BarChart3,
    title: "Fórmulas de Valuation",
    description: "Benjamin Graham e Décio Bazin para encontrar o preço justo dos ativos",
  },
  {
    icon: PieChart,
    title: "Radar de Dividendos",
    description: "Projeção inteligente de pagamentos de dividendos baseada em histórico",
  },
  {
    icon: Zap,
    title: "Comparador Avançado",
    description: "Compare até 10 ativos simultaneamente com todos os indicadores",
  },
  {
    icon: Shield,
    title: "Checklist Buy and Hold",
    description: "Critérios automáticos para identificar ações para investimento de longo prazo",
  },
  {
    icon: Users,
    title: "100% Gratuito",
    description: "Todas as funcionalidades disponíveis sem custos ou limitações",
  },
];

const testimonials = [
  {
    name: "João Silva",
    role: "Investidor Independente",
    text: "Invest Dash mudou minha forma de analisar ações. As fórmulas de valuation são precisas e fáceis de entender.",
    avatar: "JS",
  },
  {
    name: "Maria Santos",
    role: "Analista Financeira",
    text: "Finalmente uma ferramenta gratuita que rivaliza com as plataformas pagas. Recomendo para todos os investidores.",
    avatar: "MS",
  },
  {
    name: "Carlos Oliveira",
    role: "Trader",
    text: "O comparador de ações e a análise de performance são excelentes. Uso diariamente para minhas decisões.",
    avatar: "CO",
  },
];

export default function LandingPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <nav className="sticky top-0 z-50 border-b border-border/40 backdrop-blur-sm bg-background/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">InvestDash</span>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="sm"
          >
            Entrar / Criar Conta
          </Button>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center space-y-6">
          <Badge className="mx-auto" variant="secondary">
            🚀 Plataforma de Análise de Investimentos
          </Badge>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
            Análise Profissional de
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              {" "}Investimentos
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Acesso completo a ferramentas de análise fundamentalista, fórmulas de valuation e comparadores avançados. Tudo 100% gratuito.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button
              size="lg"
              onClick={() => {
                navigate("/dashboard");
              }}
            >
              Começar Agora
            </Button>
            <Button size="lg" variant="outline">
              Saiba Mais
            </Button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold">Funcionalidades Principais</h2>
          <p className="text-muted-foreground mt-2">Tudo que você precisa para tomar decisões de investimento informadas</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="p-6 hover:shadow-lg transition-shadow">
              <feature.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="text-3xl font-bold text-primary mb-2">20+</div>
            <p className="text-muted-foreground">Indicadores Fundamentalistas</p>
          </Card>
          <Card className="p-8 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <div className="text-3xl font-bold text-secondary mb-2">10 Anos</div>
            <p className="text-muted-foreground">Histórico de Dados</p>
          </Card>
          <Card className="p-8 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <div className="text-3xl font-bold text-accent mb-2">100%</div>
            <p className="text-muted-foreground">Gratuito para Sempre</p>
          </Card>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold">O Que Dizem Nossos Usuários</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-semibold text-primary">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-muted-foreground italic">&quot;{testimonial.text}&quot;</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="p-12 bg-gradient-to-r from-primary to-secondary text-primary-foreground text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Pronto para Começar?</h2>
          <p className="text-lg mb-8 opacity-90">Acesse agora e comece a analisar seus investimentos com profissionalismo</p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => {
              navigate("/dashboard");
            }}
          >
            Acessar Plataforma
          </Button>
        </Card>
      </section>

      <footer className="border-t border-border/40 mt-20 py-8 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>© 2026 InvestDash. Desenvolvido com dedicação para democratizar a análise de investimentos.</p>
        </div>
      </footer>
    </div>
  );
}
