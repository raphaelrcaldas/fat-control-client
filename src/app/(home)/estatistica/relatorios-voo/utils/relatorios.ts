import { todayIso, addDays, dateToIso, isoStrToDate } from "utils/dateHandler";
import type { RelatorioVoo } from "services/routes/estatistica/relatoriosVoo";

/** Período padrão: dos últimos 15 dias (hoje − 14 até hoje, inclusivo). */
export function periodoPadrao(): { data_ini: string; data_fim: string } {
   const fim = todayIso();
   return {
      data_ini: dateToIso(addDays(isoStrToDate(fim), -14)),
      data_fim: fim,
   };
}

/**
 * `true` quando `v` é "AAAA-MM-DD" e forma uma data real (rejeita
 * "2026-02-30": o `Date` local "rola" o dia 30 de fevereiro para março, e
 * comparar os componentes de volta pega essa correção silenciosa). Também
 * rejeita ano fora de 4 dígitos (`0002-09-09`): o Chrome emite esses valores
 * intermediários enquanto o usuário ainda está digitando o ano num
 * `<input type="date">`, e um ano de 1 dígito nunca é a data final que o
 * usuário quis.
 */
export function dataIsoValida(v: string | null): boolean {
   if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
   const [ano, mes, dia] = v.split("-").map(Number);
   if (ano < 1000) return false;
   const d = isoStrToDate(v);
   return (
      d.getFullYear() === ano && d.getMonth() === mes - 1 && d.getDate() === dia
   );
}

export type CampoPeriodo = "data_ini" | "data_fim";

export interface Periodo {
   data_ini: string;
   data_fim: string;
}

/**
 * Aplica a mudança de um campo de data ao período atual, puxando a outra
 * ponta junto quando a mudança inverteria o intervalo — nunca cai no padrão
 * por inversão causada pelo próprio usuário (digitar uma final anterior à
 * inicial, ou apagar a inicial quando a final já é anterior aos 15 dias
 * padrão). Também limita a `hoje`: uma data futura vira `hoje`. Valor
 * inválido ou intermediário (ver `dataIsoValida`) é ignorado: devolve
 * `atual` sem mudança, para o chamador não gravar lixo na URL.
 *
 * Usada na **confirmação** (perda de foco do campo, ou seleção via
 * calendário) — é aqui, e só aqui, que a outra ponta pode ser puxada. Ver
 * `periodoSeValido` para a gravação otimista a cada tecla.
 */
export function ajustarPeriodo(
   atual: Periodo,
   campo: CampoPeriodo,
   valor: string,
   hoje: string = todayIso()
): Periodo {
   if (!dataIsoValida(valor)) return atual;
   const limitado = valor > hoje ? hoje : valor;

   if (campo === "data_ini") {
      return {
         data_ini: limitado,
         data_fim: limitado > atual.data_fim ? limitado : atual.data_fim,
      };
   }
   return {
      data_ini: limitado < atual.data_ini ? limitado : atual.data_ini,
      data_fim: limitado,
   };
}

/**
 * Versão "otimista" para gravar a cada tecla (`onChange`): só devolve um
 * período novo quando o valor digitado **já** forma, sozinho, um par válido
 * — sem inverter o intervalo e sem ultrapassar `hoje` — e devolve `null` em
 * qualquer outro caso (formato incompleto, data inválida, inversão, data
 * futura), para o chamador manter o campo só no estado local sem gravar
 * nada. Ao contrário de `ajustarPeriodo`, nunca puxa a outra ponta: um
 * dígito de dia/mês sozinho formando uma data "pequena" (ex.: digitar "2" no
 * dia da final, virando temporariamente `09-02` antes de completar "20")
 * não deve arrastar a inicial — só a confirmação (blur/calendário) tem
 * permissão para isso.
 */
export function periodoSeValido(
   atual: Periodo,
   campo: CampoPeriodo,
   valor: string,
   hoje: string = todayIso()
): Periodo | null {
   if (!dataIsoValida(valor) || valor > hoje) return null;

   const proximo: Periodo =
      campo === "data_ini"
         ? { data_ini: valor, data_fim: atual.data_fim }
         : { data_ini: atual.data_ini, data_fim: valor };

   return proximo.data_ini <= proximo.data_fim ? proximo : null;
}

/**
 * Tamanho de arquivo em texto curto: KB abaixo de 1 MB (a maioria dos PDFs
 * escaneados fica nessa faixa, e "0.0 MB" não diz nada útil), MB com uma
 * casa decimal a partir daí. Mesmo critério usado no painel e no modal de
 * envio.
 */
export function formatarTamanho(bytes: number): string {
   if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
   return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** A API já ordena por data desc e id desc; aqui só se agrupa. */
export function agruparPorDia(
   itens: RelatorioVoo[]
): { data: string; itens: RelatorioVoo[] }[] {
   const grupos: { data: string; itens: RelatorioVoo[] }[] = [];
   for (const item of itens) {
      const ultimo = grupos[grupos.length - 1];
      if (ultimo && ultimo.data === item.data) ultimo.itens.push(item);
      else grupos.push({ data: item.data, itens: [item] });
   }
   return grupos;
}

/**
 * Separa a frota entre aeronaves com relatório no período (habilitadas, com
 * o número) e sem relatório (desabilitadas, agrupadas no fim da barra de
 * filtros). `contagem` vem de `data?.contagem_por_anv`, que só existe depois
 * da primeira resposta da API.
 *
 * - `contagem === undefined` (ainda carregando): tudo em `comRelatorio`, na
 *   ordem da frota, e `semRelatorio` vazio — nada nasce desabilitado para
 *   ficar piscando quando os dados chegarem. Mesmo aqui, `anvAtiva` fora da
 *   frota entra no fim de `comRelatorio` (regra igual à do ramo com dados):
 *   um filtro por deep link a uma aeronave fora da frota ativa não pode
 *   ficar invisível na barra enquanto a primeira resposta não chega.
 * - Caso contrário: `comRelatorio` é a frota com contagem > 0 (na ordem da
 *   frota) mais as chaves de `contagem` com valor > 0 que não estão na
 *   frota (relatório de uma aeronave fora da frota ativa), em ordem
 *   alfabética no fim; `semRelatorio` é a frota com contagem 0 ou ausente.
 * - `anvAtiva` (o filtro aplicado na URL) nunca fica em `semRelatorio`: se
 *   não estiver já em `comRelatorio`, entra nela (na posição da frota, ou no
 *   fim se for uma aeronave fora da frota) — permite tirar o filtro mesmo
 *   quando a aeronave filtrada não tem mais relatório no período.
 */
export function separarFrota(
   frota: string[],
   contagem: Record<string, number> | undefined,
   anvAtiva: string | undefined
): { comRelatorio: string[]; semRelatorio: string[] } {
   if (contagem === undefined) {
      const comRelatorio = [...frota];
      if (anvAtiva && !comRelatorio.includes(anvAtiva)) {
         comRelatorio.push(anvAtiva);
      }
      return { comRelatorio, semRelatorio: [] };
   }

   const naFrota = new Set(frota);
   // `temRelatorio` também conta como "com relatório" a própria `anvAtiva`
   // quando ela está na frota: isso mantém sua posição ORIGINAL da frota
   // (em vez de empurrá-la para o fim como as aeronaves fora da frota),
   // ainda que a contagem dela seja 0.
   const temRelatorio = (anv: string) =>
      (contagem[anv] ?? 0) > 0 || anv === anvAtiva;
   const comRelatorio = frota.filter(temRelatorio);
   const semRelatorio = frota.filter((anv) => !temRelatorio(anv));

   const foraDaFrota = Object.keys(contagem)
      .filter((anv) => !naFrota.has(anv) && contagem[anv] > 0)
      .sort((a, b) => a.localeCompare(b));
   comRelatorio.push(...foraDaFrota);

   // `anvAtiva` fora da frota (não coberta pelo filtro acima) entra no fim.
   if (anvAtiva && !naFrota.has(anvAtiva) && !comRelatorio.includes(anvAtiva)) {
      comRelatorio.push(anvAtiva);
   }

   return { comRelatorio, semRelatorio };
}

/**
 * Roda `tarefa` para cada item com no máximo `limite` simultâneas. A máquina
 * da API tem 512 MB e cada envio roda Ghostscript: mais de 2 em paralelo é
 * risco real. `tarefa` deve tratar os próprios erros (não lançar).
 */
export async function executarComLimite<T>(
   itens: T[],
   limite: number,
   tarefa: (item: T) => Promise<void>
): Promise<void> {
   let proximo = 0;
   const trabalhador = async () => {
      while (proximo < itens.length) {
         const atual = itens[proximo];
         proximo += 1;
         await tarefa(atual);
      }
   };
   await Promise.all(
      Array.from({ length: Math.min(limite, itens.length) }, trabalhador)
   );
}
