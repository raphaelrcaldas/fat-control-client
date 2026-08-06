# FATCONTROL Client

Dashboard administrativo do FATCONTROL — a interface de trabalho das seções da
organização: operações, CEGEP, estatística, aeromédica, instrução,
inteligência, segurança de voo e administração do sistema.

É **multi-tenant**: todo o conteúdo é escopado pela organização ativa, trocada
pelo OrgSwitcher.

- **Porta padrão:** 4000
- **Backend:** [`api/`](../api) em `http://localhost:8000`
- **Autenticação:** delegada ao [`login/`](../login) via OAuth PKCE

---

## Stack

Versões exatas em [`package.json`](package.json).

| Tecnologia                 | Papel                                  |
| -------------------------- | -------------------------------------- |
| Next.js 16 (App Router)    | Framework React com RSC                |
| React 19                   | UI                                     |
| TypeScript 6               | Tipagem                                |
| Tailwind CSS v4            | Estilos                                |
| **Flowbite React 0.12.17** | Biblioteca de componentes              |
| TanStack Query 5           | Cache e estado de servidor             |
| React Hook Form + Zod 4    | Formulários e validação                |
| ApexCharts                 | Gráficos                               |
| Leaflet                    | Mapas                                  |
| docxtemplater / ExcelJS    | Exportação de OM (`.docx`) e planilhas |
| Playwright + axe-core      | E2E e auditoria de UI                  |
| Prettier                   | Formatação                             |

> A biblioteca de UI **não** é a mesma nos três frontends: `client` e `login`
> usam Flowbite React; o `fatbird` usa shadcn/ui.

---

## Como rodar

```bash
npm install
npm run dev        # http://localhost:4000
```

Requer Node 24.x e a API no ar em `http://localhost:8000`.

### Variáveis de ambiente

`.env` na raiz do `client/`:

```env
NEXT_PUBLIC_API_URL="http://localhost:8000"
LOGIN_REDIRECT="http://localhost:3000"

# Só em desenvolvimento: pula o fluxo de login usando um token fixo.
DEV_TOKEN=""

# Integrações opcionais
NEXT_PUBLIC_AISWEB_ICAO=""
REDEMET_API_KEY=""
```

## Comandos

```bash
npm run dev          # servidor de desenvolvimento (porta 4000)
npm run build        # build de produção
npm run start        # serve o build
npm run lint         # tsc --noEmit && prettier --check .
npm run format       # prettier --write .
npm run test:e2e     # Playwright
npm run test:e2e:ui  # Playwright em modo interativo
npm run audit:ui -- --url <url>   # auditoria de UI no navegador real
```

---

## Estrutura

```
client/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout: lê cookies de org (tema/marca) no SSR
│   │   ├── (home)/           # Área autenticada, com shell e menu lateral
│   │   │   ├── ops/          # Tripulantes, escala, quadrinhos, OM, operações, aeronaves
│   │   │   ├── cegep/        # Missões, comissionamento, orçamento, dados bancários
│   │   │   ├── estatistica/  # Horas de aeronave, etapas, esforço aéreo, indicadores, SEBO
│   │   │   ├── aeromedica/   # Cartões de saúde
│   │   │   ├── instrucao/    # Cartões de instrução e simulador
│   │   │   ├── inteligencia/ # Passaportes
│   │   │   ├── seg-voo/      # CRM
│   │   │   ├── admin/        # Organizações, tenants, roles, soldos, diárias, logs, storage
│   │   │   ├── users/        # Cadastro de usuários
│   │   │   └── acessos/ · config/ · 403/
│   │   ├── change-password/  # Troca obrigatória no primeiro acesso
│   │   ├── components/       # Shell da aplicação (header, menu, loading screen)
│   │   └── context/          # Providers globais (auth, org, tema)
│   ├── components/           # Componentes compartilhados (ui/, location/)
│   ├── hooks/queries/        # Hooks TanStack Query por domínio
│   ├── constants/            # Tabelas e rótulos de domínio
│   ├── lib/ · utils/ · types/
│   └── proxy.ts              # Gate de autenticação (PKCE, first_login, cookie)
├── services/                 # Cliente HTTP da API e rotas
├── tests/
│   ├── e2e/                  # Playwright
│   ├── factories/            # Fixtures de dados
│   └── audit/                # Harness de auditoria de UI (ver README próprio)
└── public/brasoes/           # Brasões das organizações (JPEG 150x200)
```

---

## Autenticação

Não há tela de login aqui. O `src/proxy.ts` intercepta toda navegação:

1. **Sem token** → gera o par PKCE, grava o `code_verifier` num cookie httpOnly
   e redireciona para o `LOGIN_REDIRECT` com `client_id=fatcontrol`.
2. **Voltando com `?code=`** → troca o código pelo JWT e grava o cookie `token`
   (24 h; 15 min quando é primeiro acesso).
3. **`first_login: true`** → prende o usuário em `/change-password`.

Erros da API disparam redirects centralizados no `services/Api.ts`: 401 limpa o
token e volta ao login, `PASSWORD_CHANGE_REQUIRED` vai para `/change-password`,
`SCOPE_FORBIDDEN` vai para `/403`.

Em desenvolvimento, `DEV_TOKEN` substitui o cookie e pula o fluxo inteiro.

---

## Multi-tenancy e identidade visual

O escopo de organização vem do token e é trocado pelo **OrgSwitcher**. Nome,
saudação e tema da org ativa são gravados em cookies e lidos no root layout
(SSR), para que a tela de carregamento já apareça com a identidade certa — sem
flash. Sem cookie, cai no genérico: nome `FATCONTROL` e tema neutro.

Brasões são assets estáticos em `public/brasoes/<sigla>.jpg`, registrados em
`src/lib/orgBrasao.ts`. O formato **JPEG 150x200** é exigência da moldura do
template de OM; sem brasão registrado, a exportação da OM é bloqueada.

---

## Auditoria de UI

`tests/audit/` abre a rota num Chromium real em quatro breakpoints
(360/768/1280/1920) e mede contraste, tipografia, alvos de toque, layout shift e
WCAG 2.2 AA. O harness mora aqui mas serve os três frontends.

```bash
npm run audit:ui -- --url http://localhost:4000/ops/escala
npm run audit:ui -- --url http://localhost:3000 --no-auth   # tela pública
```

O servidor de desenvolvimento precisa estar no ar (o harness não sobe nada).
Rotas protegidas usam o token de `.e2e_token` / `AUDIT_TOKEN` — se ele estiver
expirado a auditoria **falha em silêncio**, redirecionando para a home e
medindo a tela errada; confira sempre o screenshot. Saída em `.audit/` (fora do
Git).
