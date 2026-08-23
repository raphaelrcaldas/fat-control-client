# Design system do `client` — fichas para o claude.ai/design

Fichas de especificação do design system do `client` (Flowbite React + Tailwind
v4), publicadas como projeto _design system_ no claude.ai/design.

**Projeto:** `FATCONTROL — client (Flowbite)`
`b8a3a3a5-2304-431b-9980-a2554d7860d8`

> O `fatbird` usa **shadcn/ui** — vocabulário de componentes e tokens
> diferentes. Quando ganhar fichas, é um **projeto separado**, não uma pasta
> aqui dentro.

## Isto não é código de aplicação

Nada em `src/` é importado pelo Next. São páginas estáticas de _spec_ — o que o
Storybook seria, se houvesse um. A fonte de verdade continua sendo o código:

| Ficha fala sobre           | Fonte de verdade no repo                         |
| -------------------------- | ------------------------------------------------ |
| Escala `--primary-*`, raiz | `src/app/global.css`                             |
| Tema dos componentes       | `src/app/context/theme.tsx` (`createTheme`)      |
| Padrão visual, Masthead    | `.claude/rules/frontend/components.md` (na raiz) |
| Temas de organização       | `api/fcontrol_api/enums/tema.py` (`TemaEnum`)    |

Ao mudar qualquer um desses, atualizar o fragmento correspondente e republicar.
Ficha que descreve o sistema errado é pior que ficha nenhuma.

## Estrutura

```
design-system/
├── build.py              # monta src/ → dist/
├── src/
│   ├── tokens.css        # tokens; entra INLINE em cada ficha
│   └── *.body.html       # o miolo de cada ficha
└── dist/                 # gerado — .gitignore + .prettierignore
```

`dist/` não é versionado: `build.py` regenera. O que se revisa em diff é `src/`.

**Por que o CSS entra inline** e não por `<link href="../tokens.css">`: o painel
do Design System renderiza cada ficha isolada, e a resolução de caminho relativo
não é garantida. Toda ficha é um HTML autocontido.

## Gerar

```bash
python3 client/design-system/build.py
```

A primeira linha de cada saída é o marcador `<!-- @dsCard group="…" -->`, que é
o que o app usa para indexar a ficha na seção certa do painel. Sem ele a ficha
sobe mas não aparece como card.

## Publicar

Pela tool `DesignSync`, **nesta ordem** — write/delete sem plano é rejeitado:

1. `list_files` no projeto — montar o diff estrutural
2. `finalize_plan` com `projectId`, `writes`, `deletes` (**obrigatório, mesmo
   vazio**) e `localDir` apontando para `client/design-system/dist`
3. `write_files` com o `planId`, usando `localPath` (o conteúdo sobe direto do
   disco, sem passar pelo contexto do modelo)

Sincronizar **incrementalmente, uma ficha por vez** — a tool não faz, e não
deve fazer, substituição em massa. `register_assets` é legado: com o marcador
`@dsCard` presente, não é necessário.

## Cores

Os valores oklch em `tokens.css` são os defaults do Tailwind v4 transcritos à
mão, não extraídos do app em execução. Servem para a ficha comunicar a
estrutura da escala e a semântica; para conferência exata de valor, medir no
navegador (`npm run audit:ui`) contra o dev server.
