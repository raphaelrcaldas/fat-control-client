<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# FATCONTROL Client — instruções locais

Além das instruções do Next.js acima, leia `../docs/ai/WORKFLOW.md`,
`../docs/ai/PROJECT_CONTEXT.md` e as regras:

- `../docs/ai/rules/frontend.md` — componentes, padrão visual, densidade, datas
- `../docs/ai/rules/client-brand.md` — identidade da organização e brasões
- `../docs/ai/rules/tanstack-query.md` e `../docs/ai/rules/css-global.md`

O Client usa **Flowbite React 0.12.17**, não shadcn.

Para revisar uma rota, siga `../docs/ai/playbooks/frontend-review.md`. Antes de
dar uma tela por pronta, leia `../docs/ai/notes/frontend-armadilhas.md` e
`../docs/ai/notes/ui-ux.md` — várias decisões visuais que parecem defeito são
deliberadas.

O harness de auditoria (`tests/audit/`) mora aqui, mas serve os três frontends.
