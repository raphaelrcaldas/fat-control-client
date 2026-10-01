import clsx from "clsx";
import { minutesToTime, timeToMinutes } from "@/../utils/dateHandler";
import type { EsfAerResumoItem } from "services/routes/estatistica/esfAer";
import { KNOWN_GRUPOS } from "./historico/constants";

export interface GroupSummary {
   label: string;
   alocado: number;
   voado: number;
   saldo: number;
}

export function getGroupSummaries(items: EsfAerResumoItem[]): GroupSummary[] {
   const groups = [...new Set(items.map((item) => item.grupo))].sort((a, b) => {
      const aIndex = KNOWN_GRUPOS.indexOf(a);
      const bIndex = KNOWN_GRUPOS.indexOf(b);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.localeCompare(b, "pt-BR");
   });
   return groups.map((group) => {
      const groupItems = items.filter((item) => item.grupo === group);
      return {
         label: group,
         alocado: groupItems.reduce((sum, i) => sum + i.alocado, 0),
         voado: groupItems.reduce((sum, i) => sum + i.voado, 0),
         saldo: groupItems.reduce((sum, i) => sum + i.saldo, 0),
      };
   });
}

/**
 * Célula (esforço × mês) que o usuário mandou localizar a partir do painel de
 * divergência. Guarda o ano e o simulador em que nasceu para a página
 * descartá-la quando o filtro muda, sem precisar de efeito para zerar estado.
 */
export interface FocoDivergencia {
   esfaerId: number;
   mes: number;
   ano: number;
   simulador: boolean;
}

/**
 * Formats minutes to "HH:mm", supporting negative values with a "-" prefix.
 */
export function formatMinutes(minutes: number): string {
   if (minutes < 0) {
      const abs = Math.abs(minutes);
      return `-${minutesToTime(abs)}`;
   }
   return minutesToTime(minutes);
}

/**
 * Formats a signed difference in minutes as "+HH:mm" / "-HH:mm".
 * Zero is rendered as "00:00" without a sign.
 */
export function formatSignedMinutes(value: number): string {
   if (value === 0) return minutesToTime(0);
   const sign = value > 0 ? "+" : "-";
   return `${sign}${minutesToTime(Math.abs(value))}`;
}

export interface EsfAerImportRow {
   linha: number;
   tipo: string;
   modelo: string;
   grupo: string;
   programa: string;
   subprograma: string;
   aplicacao: string;
   meses: number[];
   horasAlocadas: number;
   horasGastas: number;
   saldoHoras: number;
}

export interface EsfAerParseError {
   linha: number;
   conteudo: string;
   motivo: string;
}

export interface EsfAerParseResult {
   rows: EsfAerImportRow[];
   errors: EsfAerParseError[];
}

const EXPECTED_COLS = 21;
const TIME_REGEX = /^-?\d{1,4}:[0-5]\d$/;

export function parseAnoParam(raw: string | null, fallback: number): number {
   if (!/^\d{4}$/.test(raw ?? "")) return fallback;
   const ano = Number(raw);
   return ano >= 2020 && ano <= 9999 ? ano : fallback;
}

/**
 * Parses "HH:mm" or "HH:mm (X%)" to minutes. Returns 0 for "-" or empty.
 */
function parseTimeCell(value: string): number {
   const trimmed = value.trim();
   if (!trimmed || trimmed === "-") return 0;
   const timeOnly = trimmed.replace(/\s*\(.*\)/, "").trim();
   if (timeOnly.startsWith("-")) {
      return -timeToMinutes(timeOnly.slice(1));
   }
   return timeToMinutes(timeOnly);
}

function isValidTimeCell(value: string): boolean {
   const trimmed = value.trim();
   if (!trimmed || trimmed === "-") return true;
   const timeOnly = trimmed.replace(/\s*\(.*\)/, "").trim();
   return TIME_REGEX.test(timeOnly);
}

/**
 * Parses tab-separated clipboard data into EsfAerImportRow[].
 * Skips the header row and the "TOTAIS" summary row.
 * Returns parsed rows and any validation errors.
 */
export function parseEsfAerData(raw: string): EsfAerParseResult {
   const lines = raw.replace(/[\r\n]+$/, "").split("\n");
   const rows: EsfAerImportRow[] = [];
   const errors: EsfAerParseError[] = [];
   const firstLineByKey = new Map<string, number>();
   let dataLineCount = 0;

   for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      const cols = line.split("\t").map((c) => c.trim());
      const lineNum = i + 1;

      const tipo = cols[0];
      if (tipo === "TIPO" || tipo === "TOTAIS") continue;
      dataLineCount++;

      if (cols.length < EXPECTED_COLS) {
         errors.push({
            linha: lineNum,
            conteudo: line.substring(0, 80),
            motivo: `Esperado ${EXPECTED_COLS} colunas, encontrado ${cols.length}`,
         });
         continue;
      }

      if (!tipo || !cols[1] || !cols[2] || !cols[3]) {
         errors.push({
            linha: lineNum,
            conteudo: line.substring(0, 80),
            motivo:
               "Campos obrigatórios vazios (TIPO, MODELO, GRUPO ou PROGRAMA)",
         });
         continue;
      }

      const key = JSON.stringify(cols.slice(0, 6));
      const firstLine = firstLineByKey.get(key);
      if (firstLine !== undefined) {
         errors.push({
            linha: lineNum,
            conteudo: line.substring(0, 80),
            motivo: `Repete a linha ${firstLine}`,
         });
         continue;
      }
      firstLineByKey.set(key, lineNum);

      const timeCols = [...cols.slice(6, 18), cols[18], cols[19], cols[20]];
      const invalidTime = timeCols.find((c) => !isValidTimeCell(c));
      if (invalidTime !== undefined) {
         errors.push({
            linha: lineNum,
            conteudo: line.substring(0, 80),
            motivo: `Formato de hora inválido: "${invalidTime.trim()}"`,
         });
         continue;
      }

      const meses = cols.slice(6, 18).map(parseTimeCell);
      const excessiveMonth = meses.find((value) => value > 32767);
      if (excessiveMonth !== undefined) {
         errors.push({
            linha: lineNum,
            conteudo: line.substring(0, 80),
            motivo: `Valor mensal ${minutesToTime(excessiveMonth)} excede o limite de 546:05`,
         });
         continue;
      }

      const sentTimeCols = cols.slice(6, 19);
      const invalidSentTime = sentTimeCols.find((cell) => {
         const value = parseTimeCell(cell);
         return (
            (cell.trim().startsWith("-") && cell.trim() !== "-") ||
            value < 0 ||
            value % 5 !== 0
         );
      });
      if (invalidSentTime !== undefined) {
         errors.push({
            linha: lineNum,
            conteudo: line.substring(0, 80),
            motivo: `Meses e ALOCADAS devem ser não negativos e múltiplos de 5 minutos: "${invalidSentTime.trim()}"`,
         });
         continue;
      }

      rows.push({
         linha: lineNum,
         tipo,
         modelo: cols[1],
         grupo: cols[2],
         programa: cols[3],
         subprograma: cols[4],
         aplicacao: cols[5],
         meses,
         horasAlocadas: parseTimeCell(cols[18]),
         horasGastas: parseTimeCell(cols[19]),
         saldoHoras: parseTimeCell(cols[20]),
      });
   }

   if (dataLineCount > 500) {
      errors.push({
         linha: 0,
         conteudo: "",
         motivo: `Máximo de 500 linhas de dados por importação; encontradas ${dataLineCount}`,
      });
   }

   return { rows, errors };
}

/**
 * Fonte única do tom de um esforço aéreo: cor do texto e cor do marcador
 * (dot, igual ao do histórico). COMAE (azul) prevalece sobre COMPREP
 * (laranja): "COMAE PEO SPMAS COMPREP" é azul. Demais, neutro.
 */
export function getDescricaoTone(descricao: string): {
   text: string;
   dot: string;
} {
   if (descricao.includes("COMAE")) {
      return { text: "text-blue-700", dot: "bg-blue-600" };
   }
   if (descricao.includes("COMPREP")) {
      return { text: "text-orange-700", dot: "bg-orange-600" };
   }
   return { text: "text-gray-900", dot: "bg-slate-400" };
}

/**
 * Returns Tailwind classes for the "Esforco Aereo" description cell
 * based on the description text content.
 */
export function getDescricaoStyles(descricao: string): string {
   return clsx(
      "text-left whitespace-nowrap",
      getDescricaoTone(descricao).text,
      {
         "font-bold": descricao.includes("SESQAE"),
         "animate-bounce": descricao.includes("COMPREP PRPO SML"),
      }
   );
}
