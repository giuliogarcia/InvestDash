import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/HomeEnhanced";
import Carteira from "@/pages/Carteira";
import Proventos from "@/pages/Proventos";
import Transacoes from "@/pages/Transacoes";
import Analise from "@/pages/Analise";
import Metas from "@/pages/Metas";
import Rankings from "@/pages/Rankings";
import AdvancedSearch from "@/pages/AdvancedSearch";
import Comparator from "@/pages/Comparator";
import AssetDetails from "@/pages/AssetDetails";
// import AssetComparator from "@/pages/AssetComparator";
// import ComparisonWithIndices from "@/pages/ComparisonWithIndices";
import LandingPage from "@/pages/LandingPage";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={LandingPage} />
      <Route path={"/dashboard"} component={Home} />
      <Route path={"/carteira"} component={Carteira} />
      <Route path={"/proventos"} component={Proventos} />
      <Route path={"/transacoes"} component={Transacoes} />
      <Route path={"/analise"} component={Analise} />
      <Route path={"/metas"} component={Metas} />
      <Route path={"/rankings"} component={Rankings} />
      <Route path={"/busca-avancada"} component={AdvancedSearch} />
      <Route path={"/comparador"} component={Comparator} />
      <Route path={"/ativo/:ticker"} component={AssetDetails} />
      {/* <Route path={"/comparador-acoes"} component={AssetComparator} /> */}
      {/* <Route path={"/comparacao-indices"} component={ComparisonWithIndices} /> */}
      <Route path={"/relatorios"} component={NotFound} />
      <Route path={"/configuracoes"} component={NotFound} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
