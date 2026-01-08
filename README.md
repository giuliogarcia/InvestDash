# InvestDash 📈

**Plataforma Profissional de Análise de Investimentos para o Mercado Brasileiro**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)

---

## 🎯 Visão Geral

InvestDash é uma plataforma web moderna de análise de investimentos desenvolvida com as melhores práticas de programação. Permite que investidores brasileiros analisem ações, FIIs, ETFs e outros ativos com ferramentas profissionais.

### ✨ Principais Características

- 📊 **Dashboard Inteligente**: Visualização em tempo real da sua carteira
- 🔍 **Análise Fundamentalista**: 20+ indicadores técnicos e fundamentais
- 💰 **Fórmulas de Valuation**: Benjamin Graham, Bazin, DCF simplificado
- 📈 **Histórico de Proventos**: Acompanhe dividendos e JCP
- 🎯 **Metas de Investimento**: Defina e acompanhe seus objetivos
- 🔐 **Segurança**: Autenticação Google OAuth 2.0, dados encriptados
- 📱 **Responsivo**: Interface adaptável para desktop, tablet e mobile
- 🌍 **API Integrada**: Dados em tempo real via Brapi

---

## 🚀 Quick Start

### Pré-requisitos

- **Node.js** 20+ e npm/pnpm
- **SQLite** (incluído) ou **MySQL** 8.0+
- **Conta Google Cloud** (para OAuth)

### 1. Clone e Instale

```bash
git clone https://github.com/giuliogarcia/InvestDash.git
cd InvestDash
npm install
# ou
pnpm install
```

### 2. Configure as Variáveis de Ambiente

Copie o arquivo de exemplo:
```bash
cp .env.local.example .env.local
```

Preencha com suas credenciais:
```env
# Google OAuth
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/callback

# Database
DATABASE_URL=file:./dev.db

# JWT Secret (gere um valor seguro em produção)
JWT_SECRET=development-secret-key-do-not-use-in-production

# App Config
VITE_APP_ID=investdash-dev
```

### 3. Execute o Servidor

```bash
npm run dev
```

O servidor iniciará em `http://localhost:5173`

---

## 📋 Estrutura do Projeto

```
invest-dash/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── hooks/           # React hooks customizados
│   │   ├── contexts/        # Context API providers
│   │   └── lib/             # Utilitários e APIs
│   └── vite.config.ts
├── server/                   # Backend Express + tRPC
│   ├── routers/            # tRPC routers
│   ├── services/           # Lógica de negócio
│   ├── _core/              # Core utilities
│   ├── db.ts               # Database queries
│   └── index.ts            # Entry point
├── shared/                  # Código compartilhado
│   ├── types.ts            # Type definitions
│   └── const.ts            # Constantes
├── drizzle/                # Database schema & migrations
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔧 Tecnologias Utilizadas

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **TailwindCSS** - Utility-first CSS
- **Radix UI** - Accessible components
- **TanStack Query** - Data fetching & caching
- **Recharts** - Data visualization
- **Wouter** - Lightweight routing
- **Lucide React** - Icons

### Backend
- **Express.js** - HTTP server
- **tRPC** - Type-safe RPC
- **Drizzle ORM** - Type-safe database queries
- **SQLite/MySQL** - Database
- **Google Auth Library** - OAuth 2.0
- **zod** - Runtime validation
- **Jose** - JWT signing

### DevOps
- **TypeScript** - Full-stack type safety
- **ESBuild** - Server bundling
- **Vitest** - Testing framework

---

## 🔐 Autenticação

InvestDash utiliza Google OAuth 2.0 para autenticação segura:

1. Usuário clica "Entrar / Criar Conta"
2. Redirecionado para Google Login
3. Google valida credenciais e redireciona para callback
4. Sistema cria sessão com JWT em cookie httpOnly
5. Requisições posteriores incluem cookie automaticamente

### Setup Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto
3. Ative Google+ API
4. Crie OAuth 2.0 credentials (Web application)
5. Configure URIs autorizados:
   - `http://localhost:3000` (dev)
   - `http://localhost:3000/api/google/callback`
6. Copie Client ID e Client Secret para `.env.local`

---

## 📊 API & Endpoints

### tRPC Endpoints

```typescript
// Autenticação
trpc.auth.me         // Obter usuário atual
trpc.auth.logout     // Fazer logout

// Carteira
trpc.portfolio.getHoldings    // Listar ativos
trpc.portfolio.getSummary     // Resumo da carteira

// Ativos
trpc.assets.getQuote          // Cotação do ativo
trpc.assets.getFundamentals   // Dados fundamentais
trpc.assets.getValuation      // Cálculos de valuation

// Proventos
trpc.dividends.getUpcoming    // Próximos proventos
```

---

## 🧪 Testes

```bash
# Executar testes
npm run test

# Watch mode
npm run test:watch
```

---

## 🏗️ Build & Deploy

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run start
```

### Type Check
```bash
npm run check
```

---

## 📱 Responsividade

Totalmente responsivo em:
- ✅ Desktop (1920px+)
- ✅ Tablet (768px - 1023px)  
- ✅ Mobile (< 768px)

---

## 🔒 Segurança

### Boas Práticas Implementadas

- ✅ **HTTPS Only** em produção
- ✅ **httpOnly Cookies** para sessions
- ✅ **CSRF Protection** via tRPC
- ✅ **JWT Signing** com secret key
- ✅ **SQL Injection Prevention** via Drizzle ORM
- ✅ **XSS Protection** via React
- ✅ **Secrets in .env.local** (nunca commitado)

### Arquivos Ignorados

Veja `.gitignore`:
```
.env.local          # Variáveis sensíveis
node_modules/       # Dependências
dist/              # Build output
build/
*.log
.vscode/
.DS_Store
```

---

## 🐛 Troubleshooting

### Login não funciona

```bash
# 1. Verificar .env.local
# 2. Confirmar URIs no Google Cloud Console  
# 3. Reiniciar servidor
npm run dev
```

### Banco de dados não inicializa

```bash
npm run db:push     # Gerar migrations
```

### TypeScript errors

```bash
npm run check       # Type check completo
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie feature branch: `git checkout -b feature/MinhaFeature`
3. Commit: `git commit -m 'Add MinhaFeature'`
4. Push: `git push origin feature/MinhaFeature`
5. Abra Pull Request

---

## 📄 Licença

MIT License - veja [LICENSE](LICENSE)

---

## 🙏 Agradecimentos

- [Brapi](https://brapi.dev/) - Dados de mercado
- [Google Cloud](https://cloud.google.com/) - Infraestrutura

---

**Versão:** 1.0.0  
**Status:** ✅ Production Ready  
**Última atualização:** 08/01/2026
