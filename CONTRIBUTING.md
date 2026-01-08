# Contributing to InvestDash

Obrigado por seu interesse em contribuir para o InvestDash! Este documento fornece diretrizes e instruções para contribuição.

## Código de Conduta

Por favor, seja respeitoso e profissional em todas as interações.

## Como Contribuir

### 1. Fork & Clone

```bash
git clone https://github.com/seu-usuario/InvestDash.git
cd InvestDash
npm install
```

### 2. Crie uma Branch

```bash
git checkout -b feature/sua-feature
# ou
git checkout -b fix/seu-bug
```

### 3. Faça suas Alterações

- Mantenha o padrão de código existente
- Use TypeScript em todo código novo
- Adicione testes para novas features
- Atualize documentação conforme necessário

### 4. Commit com Mensagens Semânticas

```bash
git commit -m "feat: adiciona nova funcionalidade"
git commit -m "fix: corrige bug no login"
git commit -m "docs: atualiza README"
git commit -m "test: adiciona testes para auth"
```

### 5. Push e Pull Request

```bash
git push origin feature/sua-feature
```

Abra um PR no GitHub com descrição clara do que foi alterado.

## Padrões de Código

### TypeScript

- Sempre use tipos explícitos
- Evite `any`
- Use `strict: true` no tsconfig

### React Components

```typescript
interface Props {
  label: string;
  onClick: () => void;
}

export function Button({ label, onClick }: Props) {
  return <button onClick={onClick}>{label}</button>;
}
```

### tRPC Procedures

```typescript
export const appRouter = router({
  example: router({
    getUser: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        // implementação
      }),
  }),
});
```

## Testes

- Escreva testes para novas features
- Run: `npm run test`
- Mantenha coverage acima de 80%

## Commits

### Formato Semântico

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: Nova feature
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação/estilo
- `test`: Testes
- `chore`: Manutenção
- `refactor`: Refatoração

**Exemplo:**
```
feat(auth): adiciona autenticação com Google

Implementa OAuth 2.0 com Google
- Cria endpoint /api/google/callback
- Adiciona hook useAuth
- Adiciona testes

Closes #123
```

## Checklist para PRs

- [ ] Código segue o padrão do projeto
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Commits semânticos
- [ ] Sem `console.log` em produção
- [ ] Sem `any` types
- [ ] Funciona em diferentes navegadores

## Reportando Bugs

Ao reportar bugs, inclua:

- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs atual
- Screenshots (se aplicável)
- Ambiente (OS, navegador, Node version)

**Template:**
```
### Descrição
[Descreva o bug]

### Passos para Reproduzir
1. Vá para...
2. Clique em...
3. Veja erro

### Esperado
[O que deveria acontecer]

### Atual
[O que está acontecendo]

### Ambiente
- OS: macOS 14.2
- Browser: Chrome 120
- Node: 20.10
```

## Feature Requests

- Use title descritivo
- Explique o caso de uso
- Liste exemplos similares (se houver)
- Aguarde feedback antes de implementar

---

**Obrigado pela contribuição!** ❤️
