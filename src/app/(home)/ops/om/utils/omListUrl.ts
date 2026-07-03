// Última URL da listagem de OMs (com tab/página/filtros), gravada pela
// própria lista e usada pelos "voltar" das telas de detalhe/clonagem/nova.
// Mais confiável que a heurística window.history.length, que conta qualquer
// entrada do histórico (inclusive páginas externas ao sistema).

const STORAGE_KEY = "om:lastListUrl";

export function saveOmListUrl(url: string): void {
   try {
      sessionStorage.setItem(STORAGE_KEY, url);
   } catch {
      // sessionStorage indisponível (ex: modo privado restrito) — sem fallback
   }
}

export function getOmListUrl(): string {
   try {
      return sessionStorage.getItem(STORAGE_KEY) || "/ops/om";
   } catch {
      return "/ops/om";
   }
}
