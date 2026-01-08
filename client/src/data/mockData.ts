/**
 * Mock data for demo purposes
 * Remove when connecting to real database
 */

export const mockHoldings = [
  {
    id: "1",
    ticker: "ITUB4",
    assetName: "Banco Itaú",
    quantity: "150",
    averageBuyPrice: "32.50",
    currentPrice: "35.80",
    currentValue: "5370.00",
    totalInvested: "4875.00",
    gain: "495.00",
    gainPercentage: "10.15",
  },
  {
    id: "2",
    ticker: "PETR4",
    assetName: "Petrobrás",
    quantity: "200",
    averageBuyPrice: "28.00",
    currentPrice: "31.25",
    currentValue: "6250.00",
    totalInvested: "5600.00",
    gain: "650.00",
    gainPercentage: "11.61",
  },
  {
    id: "3",
    ticker: "VALE3",
    assetName: "Vale",
    quantity: "100",
    averageBuyPrice: "62.00",
    currentPrice: "59.50",
    currentValue: "5950.00",
    totalInvested: "6200.00",
    gain: "-250.00",
    gainPercentage: "-4.03",
  },
  {
    id: "4",
    ticker: "BBAS3",
    assetName: "Banco do Brasil",
    quantity: "300",
    averageBuyPrice: "25.50",
    currentPrice: "26.80",
    currentValue: "8040.00",
    totalInvested: "7650.00",
    gain: "390.00",
    gainPercentage: "5.10",
  },
  {
    id: "5",
    ticker: "HGLG11",
    assetName: "CSHG Logística",
    quantity: "50",
    averageBuyPrice: "138.00",
    currentPrice: "142.50",
    currentValue: "7125.00",
    totalInvested: "6900.00",
    gain: "225.00",
    gainPercentage: "3.26",
  },
];

export const mockPortfolioSummary = {
  totalValue: "32735.00",
  totalInvested: "31225.00",
  totalGain: "1510.00",
  gainPercentage: "4.84",
  holdingCount: "5",
};

export const mockTopMovers = {
  gainers: [
    { ticker: "COGN3", change: "+7,51%", price: "R$ 3,58" },
    { ticker: "CSNA3", change: "+5,69%", price: "R$ 9,85" },
    { ticker: "BRAV3", change: "+2,74%", price: "R$ 16,13" },
  ],
  losers: [
    { ticker: "DXCO34", change: "-5,20%", price: "R$ 25,30" },
    { ticker: "EMBR3", change: "-4,85%", price: "R$ 7,42" },
    { ticker: "GOLL4", change: "-3,92%", price: "R$ 8,15" },
  ],
};

export const mockDividendUpcoming = [
  {
    id: "1",
    ticker: "ITUB4",
    assetName: "Itaú Unibanco",
    type: "jcp",
    amount: "125.50",
    perShare: "0.0251",
    exDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    paymentDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    ticker: "HGLG11",
    assetName: "CSHG Logística",
    type: "rendimento",
    amount: "89.30",
    perShare: "0.8930",
    exDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    paymentDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    ticker: "PETR4",
    assetName: "Petrobrás",
    type: "dividendo",
    amount: "156.00",
    perShare: "0.78",
    exDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    paymentDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
