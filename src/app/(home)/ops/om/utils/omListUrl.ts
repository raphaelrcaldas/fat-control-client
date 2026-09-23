// Última URL da listagem de OMs (com tab/página/filtros), gravada pela
// própria lista e usada pelos "voltar" das telas de clonagem/nova e como
// fallback do detalhe quando não há origem no app.
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

// Origem do detalhe dentro do app (lista ou quadro), para o "voltar" usar
// router.back() e restaurar a tela real de origem. Variável de módulo, e não
// sessionStorage: sobrevive à navegação SPA, mas zera em carga completa (URL
// colada, F5) e não é herdada por aba aberta com Ctrl+clique — casos em que
// router.back() ficaria morto ou sairia do sistema.
let inAppOrigin = false;

export function markOmInAppOrigin(): void {
   inAppOrigin = true;
}

export function hasOmInAppOrigin(): boolean {
   return inAppOrigin;
}
