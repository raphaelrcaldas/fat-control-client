import clsx from "clsx";
import { minutesToTime, timeToMinutes } from "@/../utils/dateHandler";
import type { EsfAerResumoItem } from "services/routes/estatistica/esfAer";

export interface GroupSummary {
   label: string;
   alocado: number;
   voado: number;
   saldo: number;
}

const GROUPS = ["COMPREP", "COMAE", "DCTA"] as const;

export function getGroupSummaries(items: EsfAerResumoItem[]): GroupSummary[] {
   return GROUPS.map((group) => {
      const groupItems = items.filter((item) =>
         item.descricao.startsWith(group)
      );
      return {
         label: group,
         alocado: groupItems.reduce((sum, i) => sum + i.alocado, 0),
         voado: groupItems.reduce((sum, i) => sum + i.voado, 0),
         saldo: groupItems.reduce((sum, i) => sum + i.saldo, 0),
      };
   });
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

export interface EsfAerImportRow {
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
const TIME_REGEX = /^-?\d{1,4}:\d{2}$/;

/**
 * Parses "HH:mm" or "HH:mm (X%)" to minutes. Returns 0 for "-" or empty.
 */
function parseTimeCell(value: string): number {
   const trimmed = value.trim();
   if (!trimmed || trimmed === "-") return 0;
   const timeOnly = trimmed.replace(/\s*\(.*\)/, "");
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
   const lines = raw.trim().split("\n");
   const rows: EsfAerImportRow[] = [];
   const errors: EsfAerParseError[] = [];

   for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const cols = line.split("\t").map((c) => c.trim());
      const lineNum = i + 1;

      const tipo = cols[0];
      if (tipo === "TIPO" || tipo === "TOTAIS") continue;

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

      rows.push({
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

   return { rows, errors };
}

/**
 * Returns Tailwind classes for the "Esforco Aereo" description cell
 * based on the description text content.
 */
export function getDescricaoStyles(descricao: string): string {
   return clsx("text-left whitespace-nowrap text-gray-900", {
      "text-orange-400": descricao.includes("COMPREP"),
      "text-blue-500": descricao.includes("COMAE"),
      "font-bold": descricao.includes("SESQAE"),
      "animate-bounce": descricao.includes("COMPREP PRPO SML"),
   });
}
