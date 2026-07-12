# Auditoria de UI/UX

Abre uma rota num Chromium real, em vários breakpoints, e mede **o que foi
renderizado** — não o que o código pretendia. Nasceu para dar evidência ao
agente `ui-ux-auditor`, mas roda sozinho.

Serve os três frontends: o alvo é só a URL (`client:4000`, `fatbird:5000`,
`login:3000`). Mora aqui porque é aqui que o Playwright e o axe-core já estão
instalados.

## Uso

O dev server do serviço-alvo precisa estar no ar — este script não sobe
servidor nenhum.

```bash
node tests/audit/audit.mjs --url http://localhost:4000/ops/operacoes
node tests/audit/audit.mjs --url http://localhost:3000/ --no-auth
node tests/audit/audit.mjs --url http://localhost:4000/users \
  --actions '[{"click":"button:has-text(\"Novo Usuário\")"},{"wait":"[role=dialog]"}]'

node tests/audit/audit.mjs --help
```

Rota protegida precisa de sessão: o token sai de `--token`, de `AUDIT_TOKEN` ou
de `client/.e2e_token` (o mesmo cookie `token` que os e2e usam para pular o
login).

Saída em `client/.audit/<rota>/` (fora do Git): `report.md`, `report.json` e um
PNG full-page por breakpoint.

## O que é medido

Escala tipográfica · paleta · espaçamento e grade de 4px · raios e sombras ·
medida de linha · alvos de toque · estouro horizontal · árvore de títulos · foco
por teclado · layout shift (CLS) · WCAG 2.2 AA (axe-core).

Chromium, não o Firefox dos e2e: `layout-shift` só existe lá.

## Estrutura

O orquestrador não conhece nenhuma métrica nem nenhum formato de saída — ele roda
os coletores e os reporters que recebeu. Quem os escolhe é o composition root
(`audit.mjs`), o único arquivo que conhece implementações concretas.

```
audit.mjs             composition root — monta e injeta as dependências
cli/                  parse de argumentos, resolução do token
config/heuristics.mjs as réguas (44px, grade de 4px, 45-75 caracteres…)
core/auditor.mjs      orquestrador — só fala com os contratos abaixo
core/browserSession.mjs   único módulo que sabe dirigir o Playwright
browser/domUtils.mjs  helpers injetados na página (window.__audit)
collectors/           uma métrica por arquivo
reporters/            json, markdown, console
```

### Contratos

```js
// Collector — mede uma coisa e sabe se descrever.
{
  name: string,
  initScript?: () => void,              // roda antes do primeiro paint (ex: observer de CLS)
  collect({ page, breakpoint }): data,
  render(data): { rows?: [label, valor][], sections?: [{ title, items: string[] }] }
}

// Reporter — escreve o resultado em algum lugar.
{ emit({ report, outDir }) }
```

**Métrica nova** = um arquivo em `collectors/` + uma linha em `buildCollectors()`
(`audit.mjs`). O orquestrador e o relatório não mudam: o markdown renderiza o
`view` que o coletor produziu de si mesmo.

**Limiar novo ou ajustado** = `config/heuristics.mjs`. Os coletores recebem a
régua por injeção; nenhum deles crava um número.

Um coletor que quebra é registrado como erro e não derruba os demais.
