import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Save, 
  TrendingUp, 
  TrendingDown,
  Star,
  X
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFilters {
  assetType: string;
  sector: string;
  minPrice: string;
  maxPrice: string;
  minDY: string;
  maxDY: string;
  minPL: string;
  maxPL: string;
  minROE: string;
  maxROE: string;
  minMarketCap: string;
  maxMarketCap: string;
}

interface SearchResult {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  dy: number;
  pl: number;
  roe: number;
  marketCap: number;
}

const mockResults: SearchResult[] = [
  {
    ticker: 'PETR4',
    name: 'Petrobras',
    price: 38.50,
    change: 0.50,
    changePercent: 1.32,
    dy: 8.5,
    pl: 4.2,
    roe: 25.3,
    marketCap: 501000000000,
  },
  {
    ticker: 'VALE3',
    name: 'Vale',
    price: 62.30,
    change: -0.80,
    changePercent: -1.27,
    dy: 10.2,
    pl: 3.8,
    roe: 22.1,
    marketCap: 295000000000,
  },
  {
    ticker: 'ITUB4',
    name: 'Itaú Unibanco',
    price: 28.90,
    change: 0.40,
    changePercent: 1.40,
    dy: 6.5,
    pl: 8.5,
    roe: 18.7,
    marketCap: 283000000000,
  },
];

export default function AdvancedSearch() {
  const [filters, setFilters] = useState<SearchFilters>({
    assetType: 'all',
    sector: 'all',
    minPrice: '',
    maxPrice: '',
    minDY: '',
    maxDY: '',
    minPL: '',
    maxPL: '',
    minROE: '',
    maxROE: '',
    minMarketCap: '',
    maxMarketCap: '',
  });

  const [results, setResults] = useState<SearchResult[]>(mockResults);
  const [showFilters, setShowFilters] = useState(true);

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    // TODO: Implement real search
    console.log('Searching with filters:', filters);
  };

  const handleClearFilters = () => {
    setFilters({
      assetType: 'all',
      sector: 'all',
      minPrice: '',
      maxPrice: '',
      minDY: '',
      maxDY: '',
      minPL: '',
      maxPL: '',
      minROE: '',
      maxROE: '',
      minMarketCap: '',
      maxMarketCap: '',
    });
  };

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'all').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Busca Avançada</h1>
          <p className="text-muted-foreground mt-2">Encontre os ativos ideais para sua carteira</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Panel */}
          {showFilters && (
            <div className="lg:col-span-1 space-y-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filtros
                  </h2>
                  {activeFiltersCount > 0 && (
                    <Badge variant="outline">{activeFiltersCount}</Badge>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Asset Type */}
                  <div>
                    <Label>Tipo de Ativo</Label>
                    <Select 
                      value={filters.assetType} 
                      onValueChange={(value) => handleFilterChange('assetType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="acoes">Ações</SelectItem>
                        <SelectItem value="fiis">FIIs</SelectItem>
                        <SelectItem value="bdrs">BDRs</SelectItem>
                        <SelectItem value="etfs">ETFs</SelectItem>
                        <SelectItem value="stocks">Stocks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sector */}
                  <div>
                    <Label>Setor</Label>
                    <Select 
                      value={filters.sector} 
                      onValueChange={(value) => handleFilterChange('sector', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="financeiro">Financeiro</SelectItem>
                        <SelectItem value="energia">Energia</SelectItem>
                        <SelectItem value="tecnologia">Tecnologia</SelectItem>
                        <SelectItem value="consumo">Consumo</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <Label>Faixa de Preço</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input 
                        type="number" 
                        placeholder="Mín"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      />
                      <Input 
                        type="number" 
                        placeholder="Máx"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Dividend Yield */}
                  <div>
                    <Label>Dividend Yield (%)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input 
                        type="number" 
                        placeholder="Mín"
                        value={filters.minDY}
                        onChange={(e) => handleFilterChange('minDY', e.target.value)}
                      />
                      <Input 
                        type="number" 
                        placeholder="Máx"
                        value={filters.maxDY}
                        onChange={(e) => handleFilterChange('maxDY', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* P/L */}
                  <div>
                    <Label>P/L</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input 
                        type="number" 
                        placeholder="Mín"
                        value={filters.minPL}
                        onChange={(e) => handleFilterChange('minPL', e.target.value)}
                      />
                      <Input 
                        type="number" 
                        placeholder="Máx"
                        value={filters.maxPL}
                        onChange={(e) => handleFilterChange('maxPL', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* ROE */}
                  <div>
                    <Label>ROE (%)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input 
                        type="number" 
                        placeholder="Mín"
                        value={filters.minROE}
                        onChange={(e) => handleFilterChange('minROE', e.target.value)}
                      />
                      <Input 
                        type="number" 
                        placeholder="Máx"
                        value={filters.maxROE}
                        onChange={(e) => handleFilterChange('maxROE', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Market Cap */}
                  <div>
                    <Label>Valor de Mercado (Bilhões)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input 
                        type="number" 
                        placeholder="Mín"
                        value={filters.minMarketCap}
                        onChange={(e) => handleFilterChange('minMarketCap', e.target.value)}
                      />
                      <Input 
                        type="number" 
                        placeholder="Máx"
                        value={filters.maxMarketCap}
                        onChange={(e) => handleFilterChange('maxMarketCap', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-4">
                    <Button className="w-full" onClick={handleSearch}>
                      <Search className="w-4 h-4 mr-2" />
                      Buscar
                    </Button>
                    <Button variant="outline" className="w-full" onClick={handleClearFilters}>
                      <X className="w-4 h-4 mr-2" />
                      Limpar Filtros
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Busca
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Saved Searches */}
              <Card className="p-6">
                <h3 className="text-sm font-bold text-foreground mb-3">Buscas Salvas</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Dividendos Altos
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Small Caps Baratas
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    FIIs Logísticos
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Results Panel */}
          <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
            <Card className="overflow-hidden">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Resultados da Busca</h2>
                    <p className="text-sm text-muted-foreground mt-1">{results.length} ativos encontrados</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
                    </Button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Ativo</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Cotação</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Variação</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">DY</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">P/L</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">ROE</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Val. Mercado</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((asset) => {
                      const isPositive = asset.changePercent >= 0;
                      
                      return (
                        <tr key={asset.ticker} className="border-b border-border hover:bg-muted/20 transition-colors">
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
                          <td className="px-6 py-4 text-right text-foreground">
                            {asset.dy.toFixed(2)}%
                          </td>
                          <td className="px-6 py-4 text-right text-foreground">
                            {asset.pl.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right text-foreground">
                            {asset.roe.toFixed(2)}%
                          </td>
                          <td className="px-6 py-4 text-right text-foreground">
                            R$ {(asset.marketCap / 1000000000).toFixed(2)}B
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
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
