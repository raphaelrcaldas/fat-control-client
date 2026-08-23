#!/usr/bin/env python3
"""Monta os previews do design system do client para o claude.ai/design.

Le os fragmentos de `src/` e escreve HTMLs autocontidos em `dist/`.

Autocontido porque o painel do Design System renderiza cada ficha isolada:
um `<link>` relativo para o tokens.css nao tem resolucao garantida, entao o
CSS de tokens entra inline em cada saida. `dist/` e artefato — nao versionar.

Uso:
    python3 client/design-system/build.py
"""

from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "src"
DIST = ROOT / "dist"

TOKENS = (SRC / "tokens.css").read_text(encoding="utf-8")

# out_path -> (group, title, subtitle, fragmento em src/)
#
# `group` e a secao no painel do Design System e vem do marcador @dsCard da
# primeira linha do HTML — o app compila esses marcadores no _ds_manifest.json.
CARDS = {
    "foundations/color.html": (
        "Fundações",
        "Cor — escala primary por organização",
        "Alias --primary-*, 9 temas, reserva semântica",
        "color.body.html",
    ),
    "foundations/type.html": (
        "Fundações",
        "Tipografia e densidade",
        "Raiz 87.5% (1rem = 14px), eyebrow mono, caixa alta militar",
        "type.body.html",
    ),
    "foundations/shape.html": (
        "Fundações",
        "Forma, borda e espaçamento",
        "rounded · border-slate-200 · shadow-sm · space-y-2",
        "shape.body.html",
    ),
    "components/buttons.html": (
        "Componentes",
        "Botões",
        "primary / light / red, 4 tamanhos, alvo 44px só no dedo",
        "buttons.body.html",
    ),
    "components/forms.html": (
        "Componentes",
        "Campos de formulário",
        "TextInput, Select, Textarea, Checkbox, erro 422",
        "forms.body.html",
    ),
    "components/table.html": (
        "Componentes",
        "Tabela",
        "Densidade py-2, linha não é alvo compacto, refetch suave",
        "table.body.html",
    ),
    "components/feedback.html": (
        "Componentes",
        "Badge, Spinner, Paginação e Modal",
        "Chip de marca, dot cross-tenant, armadilhas do Modal",
        "feedback.body.html",
    ),
    "patterns/masthead.html": (
        "Padrões",
        "Masthead de página",
        "Referência canônica + exceção slate do admin de sistema",
        "masthead.body.html",
    ),
    "patterns/loading.html": (
        "Padrões",
        "Carregamento e estados vazios",
        "Skeleton espelhando o layout real, vazio ≠ falha",
        "loading.body.html",
    ),
}

TEMPLATE = """<!-- @dsCard group="{group}" -->
<!doctype html>
<html lang="pt-BR">
   <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{title}</title>
      <meta name="description" content="{subtitle}" />
      <style>
{tokens}
      </style>
   </head>
   <body>
      <header style="margin-bottom: 2rem">
         <h1
            style="
               margin: 0;
               font-size: 1.25rem;
               font-weight: 800;
               letter-spacing: -0.02em;
            "
         >
            {title}
         </h1>
         <p style="margin: 0.25rem 0 0; font-size: 0.8125rem; color: var(--slate-500)">
            {subtitle} · FATCONTROL / client
         </p>
      </header>
{body}
   </body>
</html>
"""


def main() -> None:
    for out, (group, title, subtitle, frag) in CARDS.items():
        body = (SRC / frag).read_text(encoding="utf-8")
        html = TEMPLATE.format(
            group=group, title=title, subtitle=subtitle, tokens=TOKENS, body=body
        )
        dest = DIST / out
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(html, encoding="utf-8")
        print(f"{out:34} {len(html):>7} bytes")

    # tokens.css vai cru junto, como referencia legivel dentro do projeto
    (DIST / "foundations").mkdir(parents=True, exist_ok=True)
    (DIST / "foundations" / "tokens.css").write_text(TOKENS, encoding="utf-8")
    print(f"{'foundations/tokens.css':34} {len(TOKENS):>7} bytes")


if __name__ == "__main__":
    main()
