"use client";

import ExcelJS from "exceljs";
import { downloadBlob } from "@/../utils/downloadBlob";
import type { ExportColumn } from "./exportTypes";

/**
 * Paleta neutra, na escala slate do sistema. A planilha e documento de
 * trabalho: sai sem faixa institucional e sem linha de metadados, so o
 * cabecalho e os dados — quem recebe filtra, ordena e cola em outro lugar
 * sem ter que limpar enfeite antes.
 */
const HEADER_BG = "FFF1F5F9"; // slate-100
const HEADER_TEXT = "FF0F172A"; // slate-900
const HEADER_BORDER = "FFCBD5E1"; // slate-300
const CELL_BORDER = "FFE2E8F0"; // slate-200
const ZEBRA_BG = "FFF8FAFC"; // slate-50

const CELL_BORDER_SIDES: Partial<ExcelJS.Borders> = {
   top: { style: "thin", color: { argb: CELL_BORDER } },
   bottom: { style: "thin", color: { argb: CELL_BORDER } },
   left: { style: "thin", color: { argb: CELL_BORDER } },
   right: { style: "thin", color: { argb: CELL_BORDER } },
};

const HEADER_ROW = 1;
const MIN_WIDTH = 10;
const MAX_WIDTH = 46;

function cellText<T>(column: ExportColumn<T>, row: T): string | number {
   const raw = column.get(row);
   if (raw === null || raw === undefined || raw === "") return "—";
   if (typeof raw === "number") return raw;
   return column.uppercase ? raw.toUpperCase() : raw;
}

export interface ExportToXlsxArgs<T> {
   rows: T[];
   /** Ja filtradas e ordenadas pelo chamador — aqui elas so viram celula. */
   columns: ExportColumn<T>[];
   fileName: string;
   sheetName: string;
}

export async function exportToXlsx<T>({
   rows,
   columns,
   fileName,
   sheetName,
}: ExportToXlsxArgs<T>): Promise<void> {
   const workbook = new ExcelJS.Workbook();
   workbook.created = new Date();
   const sheet = workbook.addWorksheet(sheetName, {
      views: [{ state: "frozen", ySplit: HEADER_ROW }],
      pageSetup: { orientation: "landscape", fitToWidth: 1, fitToHeight: 0 },
   });

   const lastCol = columns.length;

   // ── Cabecalho ───────────────────────────────────────────────────
   columns.forEach((column, index) => {
      const cell = sheet.getCell(HEADER_ROW, index + 1);
      cell.value = column.label;
      cell.font = { bold: true, size: 10, color: { argb: HEADER_TEXT } };
      cell.fill = {
         type: "pattern",
         pattern: "solid",
         fgColor: { argb: HEADER_BG },
      };
      cell.alignment = {
         horizontal: "center",
         vertical: "middle",
         wrapText: true,
      };
      cell.border = {
         top: { style: "thin", color: { argb: HEADER_BORDER } },
         bottom: { style: "thin", color: { argb: HEADER_BORDER } },
         left: { style: "thin", color: { argb: HEADER_BORDER } },
         right: { style: "thin", color: { argb: HEADER_BORDER } },
      };
   });
   sheet.getRow(HEADER_ROW).height = 22;
   sheet.autoFilter = {
      from: { row: HEADER_ROW, column: 1 },
      to: { row: HEADER_ROW, column: lastCol },
   };

   // ── Dados ───────────────────────────────────────────────────────
   rows.forEach((row, rowIndex) => {
      const excelRow = HEADER_ROW + 1 + rowIndex;
      const zebra = rowIndex % 2 === 1;

      columns.forEach((column, colIndex) => {
         const cell = sheet.getCell(excelRow, colIndex + 1);
         cell.value = cellText(column, row);
         cell.border = CELL_BORDER_SIDES;
         cell.alignment = {
            horizontal: column.align ?? "left",
            vertical: "middle",
         };
         if (zebra) {
            cell.fill = {
               type: "pattern",
               pattern: "solid",
               fgColor: { argb: ZEBRA_BG },
            };
         }
      });
   });

   // ── Larguras ────────────────────────────────────────────────────
   columns.forEach((column, index) => {
      const excelCol = sheet.getColumn(index + 1);
      if (column.width) {
         excelCol.width = column.width;
         return;
      }
      let longest = column.label.length + 4;
      for (const row of rows) {
         const value = cellText(column, row);
         longest = Math.max(longest, String(value).length);
      }
      excelCol.width = Math.min(Math.max(longest + 2, MIN_WIDTH), MAX_WIDTH);
   });

   const buffer = await workbook.xlsx.writeBuffer();
   const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
   });
   downloadBlob(blob, fileName);
}
