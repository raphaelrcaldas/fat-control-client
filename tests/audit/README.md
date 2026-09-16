# Auditoria de UI/UX

Abre uma rota num Chromium real, em vários breakpoints, e mede **o que foi
renderizado** — não o que o código pretendia. O breakpoint `mobile` é o
**Galaxy S25** (360x780 CSS, dpr 3, dedo), o aparelho de referência do projeto:
ajuste de mobile se confere nele. Nasceu para dar evidência ao
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
medida de linha · alvos de toque · estouro horizontal · **conteúdo cortado** ·
árvore de títulos · foco por teclado · layout shift (CLS) · WCAG 2.2 AA
(axe-core).

Chromium, não o Firefox dos e2e: `layout-shift` só existe lá.

### Duas leituras que costumam confundir

**Conteúdo cortado ≠ truncado.** `overflow: hidden` sem reticências corta no
meio do glifo e mente para quem lê (`REP` vira `REI`); com `text-overflow:
ellipsis` a degradação é deliberada e avisa (`CEMAL venci…`). Só o primeiro é
reportado como defeito — o segundo aparece apenas como contagem. É uma classe
de defeito que nenhuma outra métrica enxerga: o texto está no DOM, o leitor de
tela lê inteiro, o axe não reclama e não há scroll lateral.

**Paradas de Tab medidas ≠ paradas existentes.** Navbar e sidebar vêm antes do
conteúdo e sozinhas passam de 30 paradas: elas são atravessadas sem consumir o
orçamento (`focusRing.maxStops`), que vale só para o conteúdo. Quando o
relatório diz _"teto atingido — há mais adiante"_, a tela tem mais elementos
focáveis do que foram medidos; suba `maxStops` se precisar varrer tudo.

## Estrutura

O orquestrador não conhece nenhuma métrica nem nenhum formato de saída — ele roda
os coletores e os reporters que recebeu. Quem os escolhe é o composition root
(`audit.mjs`), o único arquivo que conhece implementações concretas.

```
audit.mjs             composition root — monta e injeta as dependências
cli/                  parse de argumentos, resolução do token
config/heuristics.mjs as réguas (24px, grade de 4px, 45-75 caracteres…)
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

---

## Ciclo curto: `peek.mjs`

`audit.mjs` responde _"esta tela está pronta?"_ — sobe um browser limpo, mede
quatro breakpoints, grava relatório. É caro porque auditoria se faz uma vez, no
fim.

`peek.mjs` responde _"e agora, ficou melhor?"_ — a pergunta que se faz vinte
vezes seguidas enquanto se mexe num easing.

```bash
npm run peek -- --url http://localhost:4000/ops/operacoes
npm run peek -- --url http://localhost:4000/users --only motion
npm run peek -- --url http://localhost:4000/users --viewport mobile
node tests/audit/peek.mjs --help
```

|                | `audit.mjs`                     | `peek.mjs`                    |
| -------------- | ------------------------------- | ----------------------------- |
| Browser        | sobe e descarta a cada execução | um Chromium persistente (CDP) |
| Sessão         | cookie de `.e2e_token`          | o login que já está na aba    |
| Estado da tela | recomeça do zero                | **sobrevive entre execuções** |
| Viewports      | 4                               | 1, a que você pedir           |
| Saída          | `report.md` + `report.json`     | resumo no terminal + PNG      |
| Custo típico   | dezenas de segundos             | ~1s                           |

### O que o torna diferente

Na primeira execução ele sobe o Chromium que o **Playwright já instalou** (não há
Chrome de sistema envolvido) com `--remote-debugging-port` e perfil próprio em
`client/.peek-chrome/`, **desanexado** do processo Node. As execuções seguintes
reatam nesse mesmo browser.

Por isso ele **não recarrega a página por padrão**: o Fast Refresh do Next já
repintou a tela depois da sua edição, e recarregar jogaria fora o estado que se
quer inspecionar — o modal aberto, a aba selecionada, o filtro aplicado. Você
navega até o estado uma vez (`--actions`) e mede quantas vezes quiser. Use
`--reload` quando quiser justamente o contrário.

Login também se faz **uma vez**: o perfil persiste, então não há token de longa
duração para expirar em silêncio.

### Ponteiro: viewport nomeada emula o dedo

`--viewport mobile` não estreita só a janela: emula o aparelho inteiro, com
`pointer: coarse`. Isso **não muda a régua de alvo** — ela é 24px em qualquer
ponteiro —, mas muda o que a página renderiza, porque `@media (pointer: coarse)`
passa a valer. Como `hasTouch`/`isMobile` são opções de _contexto_ — e recriar o
contexto custaria o perfil logado, que é o motivo de existir a ferramenta —, a
emulação vai por CDP na própria aba (`Emulation.setDeviceMetricsOverride` +
`setTouchEmulationEnabled`), o mesmo caminho do modo dispositivo do DevTools.

O override é **por sessão CDP**: ela fica aberta até o fim da execução de
propósito, porque `detach()` reverte tudo na hora — a primeira versão media a
página já revertida, com o ponteiro do sistema. Ao terminar, a aba volta ao
ponteiro do sistema.

`--viewport 400x900` (WxH avulso) é só um retângulo, com ponteiro de mouse.

`layoutShift` e `focusRing` também ficam de fora, por incompatibilidade real: o
primeiro precisa instrumentar a página antes do primeiro paint; o segundo
percorre a tela com Tab e deixaria o foco pousado num controle para a execução
seguinte encontrar.

## O coletor `motion`

Roda nos dois modos e é o único que mede o que **não** aparece no screenshot:

- **Propriedade cara** — `transform`/`opacity` sobem para a GPU; `width`, `top`,
  `padding` forçam reflow a cada quadro. `transition-property: all` (o
  `transition-all` do Tailwind) é sinalizado por construção: anima o que quer que
  venha a mudar, layout incluso.
- **Duração** — acima de `maxDurationMs` a interface parece arrastada. Animação
  infinita (`animate-pulse` de skeleton) é isenta: ali a duração é ritmo, não
  espera.
- **`prefers-reduced-motion`** — segundo passe com a media emulada, relendo o
  computed style. Pega uma falha que ler o CSS fonte **não** pega: o bloco
  `@media (prefers-reduced-motion: reduce)` pode existir e mesmo assim não valer,
  porque um shorthand `transition:` declarado depois reescreve a duração inteira.
  A régua é `reducedMaxMs`, não zero — encolher para `0.01ms` é o padrão correto
  com Radix, já que com duração zero o painel não chega a desmontar.
