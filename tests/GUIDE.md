# Guia de Testes — Vigidoc

Este documento é o ponto de referência para qualquer desenvolvedor que for criar, executar ou manter os testes automatizados do Vigidoc.

---

## Pré-requisitos

Antes de rodar os testes, garanta que você tem:

- **Docker Desktop** instalado e rodando.
- **Node.js** na versão usada no projeto.
- O arquivo `.env.test` na raiz do projeto (já incluso no repositório).

---

## 1. Subindo o Banco de Dados de Teste

Os testes usam um banco de dados PostgreSQL **exclusivo**, rodando em Docker na porta `5433` (diferente da porta `5432` usada no desenvolvimento).

```bash
# Na raiz do projeto:
docker-compose -f docker-compose.test.yml up -d
```

Para verificar se está rodando:
```bash
docker ps
# Deve aparecer o container: vigidoc_test_db
```

Para parar o banco:
```bash
docker-compose -f docker-compose.test.yml down
```

---

## 2. Executando os Testes

```bash
# Roda todos os testes (unitários + integração)
npm run test

# Roda apenas os testes unitários — NÃO requer banco Docker
npm run test:unit

# Roda apenas os testes de integração — REQUER banco Docker
npm run test:integration

# Modo watch (reexecuta ao salvar arquivos)
npm run test:watch

# Gera relatório de cobertura de código
npm run test:coverage
```

> **IMPORTANTE:** `test:unit` pode rodar sem o banco Docker (funciona offline).
> `test:integration` e `test` completo requerem o banco rodando em `localhost:5433`.

### Configs Vitest

| Script | Config usada |
|---|---|
| `test:unit` | `vitest.config.ts` |
| `test:integration` | `vitest.integration.config.ts` (inclui limpeza de banco) |
| `test` | `vitest.config.ts` (roda tudo) |

---

## 3. Estrutura de Diretórios

```
tests/
├── GUIDE.md                   ← Você está aqui
├── setup/
│   ├── global-setup.ts        ← Roda UMA VEZ antes de toda a suíte (migrations)
│   └── test-env.ts            ← Roda após CADA teste (limpeza do banco)
├── helpers/
│   ├── api-client.ts          ← Helpers para criar Request/Response do Next.js
│   ├── factories.ts           ← Geração de dados fake realistas (Faker.js)
│   └── prisma-test-client.ts  ← Cliente Prisma apontando para o banco de teste
├── api/
│   └── auth/
│       ├── users-signup.test.ts       ← Testes de cadastro de pacientes
│       ├── doctors-signup.test.ts     ← Testes de cadastro de médicos
│       ├── login-and-session.test.ts  ← Testes de login, PENDING, sessão
│       └── admin-approval-flow.test.ts ← Fluxo de aprovação admin ponta-a-ponta
└── unit/
    ├── zod-schemas.test.ts    ← Validação isolada de todos os schemas Zod
    └── dto-mappers.test.ts    ← Verificação de segurança dos mapeadores de DTO
```

---

## 4. Como Criar Novos Testes

### 4.1 Escolha a pasta correta

| Tipo de Teste | Pasta | Descrição |
|---|---|---|
| **Unitário** | `tests/unit/` | Testa funções puras, schemas, utilitários. Sem banco, sem HTTP. |
| **Integração de API** | `tests/api/<domínio>/` | Testa endpoints com banco real. |

### 4.2 Nomeie o arquivo corretamente

- Use `kebab-case` com sufixo `.test.ts`.
- Exemplo: `tests/api/vitals/record-vitals.test.ts`

### 4.3 Use os Helpers e Factories

**Sempre** use os helpers para criar dados e requisições. Isso garante:
- Dados únicos entre execuções (evita conflitos de unique constraint).
- Padronização da estrutura de Request.

```typescript
import { buildPatientSignupPayload } from "@/tests/helpers/factories";
import { createRequest, readResponseJson } from "@/tests/helpers/api-client";
import { prismaTest } from "@/tests/helpers/prisma-test-client";
```

### 4.4 Padrão de Nomenclatura dos `describe`/`it`

Usamos emojis para categorizar visualmente os blocos:

| Emoji | Categoria |
|---|---|
| ✅ | Cenário de sucesso |
| ❌ | Cenário de erro esperado |
| 🔐 | Autenticação e autorização |
| 🔄 | Fluxo ponta-a-ponta |
| 🗄️ | Verificação de banco de dados |
| 📋 | Estado inicial / setup |
| 🚫 | Bloqueio / negação de acesso |
| 🔑 | Sessão e tokens |
| 📦 | Estrutura de dados / formatos |

---

## 5. Banco de Dados de Teste

### Isolamento

O banco é limpo **após cada arquivo de teste** pela lógica em `tests/setup/test-env.ts`. Isso garante que os testes não se contaminem mutuamente.

### Cliente de Acesso

Use **sempre** o `prismaTest` (de `tests/helpers/prisma-test-client`) para verificar o estado do banco dentro dos testes. **Nunca use** o cliente `prisma` de `@/lib/prisma` nos testes.

### String de Conexão

Definida em `.env.test`:
```
DATABASE_URL="postgresql://vigitest:vigitest_secret@localhost:5433/vigidoc_test"
```

---

## 6. Adicionando Factories

Ao precisar de novos tipos de dados para testes futuros, adicione factories em `tests/helpers/factories.ts`:

```typescript
// Exemplo: factory para sinais vitais
export function buildVitalRecordPayload(overrides = {}) {
  return {
    systolic: 120,
    diastolic: 80,
    heartRate: 72,
    temperature: 36.5,
    oxygenSaturation: 98,
    recordedAt: new Date().toISOString(),
    ...overrides,
  };
}
```

---

## 7. CI/CD (Futuro)

Quando integrarmos CI/CD (GitHub Actions, etc.), o pipeline deverá:
1. Iniciar o container Docker do banco de teste.
2. Aguardar o healthcheck do banco.
3. Rodar `npm run test`.
4. Publicar o relatório de cobertura.
