/**
 * Builder de HTML do tooltip custom do gráfico de Histórico de Esforço Aéreo.
 *
 * NÃO é um componente React: o ApexCharts (`tooltip.custom`) espera uma função
 * que devolva uma STRING de HTML. Este módulo concentra essa renderização para
 * manter `HistoricoChart` enxuto e o markup do tooltip testável isoladamente.
 *
 * Estilo inline sóbrio (sem dependência de CSS externo, pois o Apex injeta o
 * HTML cru): fonte do sistema, horas em fonte monoespaçada, deltas com sinal e
 * cor (verde = aumento, vermelho = redução). Espelha o "Layout A" adaptado ao
 * padrão visual do projeto.
 */

import { formatNaiveDate, minutesToTime } from "@/../utils/dateHandler";
import type { ChangeMeta } from "../utils";

/** Verde de aumento (green-600) e vermelho de redução (red-600). */
const UP_COLOR = "#16a34a";
const DOWN_COLOR = "#dc2626";

const FONT = "system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

/** Escapa texto para interpolação segura no HTML do tooltip. */
function escapeHtml(value: string): string {
   return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
}

/** Span de hora HH:mm em fonte monoespaçada. */
function hhmm(min: number, color = "#0f172a"): string {
   return `<span style="font-family:${MONO};font-weight:600;color:${color}">${minutesToTime(min)}</span>`;
}

/**
 * Linha de delta assinado e colorido ("▲ +HH:mm" / "▼ -HH:mm"). Δ zero é
 * NEUTRO (cinza, sem seta) — mesmo tratamento do rail e do changelog.
 */
function deltaLine(delta: number): string {
   if (delta === 0) {
      return `<div style="margin-top:4px;font-family:${MONO};font-size:12px;font-weight:600;color:#94a3b8">00:00</div>`;
   }
   const up = delta > 0;
   const color = up ? UP_COLOR : DOWN_COLOR;
   const arrow = up ? "▲" : "▼";
   const sign = up ? "+" : "-";
   return `<div style="margin-top:4px;font-family:${MONO};font-size:12px;font-weight:600;color:${color}">${arrow} ${sign}${minutesToTime(Math.abs(delta))}</div>`;
}

/**
 * Monta o HTML do tooltip para um ponto da timeline.
 *
 * - `carry`   → "vigente HH:mm · sem mudança" (degrau estendido até 31/dez).
 * - `criacao` → "criação · 0 → HH:mm" + linha verde de aumento.
 * - caso geral → "HH:mm → HH:mm" + linha de delta (verde/vermelho).
 */
export function buildTooltipHTML(name: string, m: ChangeMeta): string {
   const header = `
      <div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:4px">
         <span style="font-weight:700;color:#0f172a">${escapeHtml(name)}</span>
         <span style="font-size:11px;color:#64748b">${formatNaiveDate(m.data)}</span>
      </div>`;

   let body: string;
   if (m.carry) {
      body = `<div style="font-size:12px;color:#475569">vigente ${hhmm(m.to)} · <span style="color:#94a3b8">sem mudança</span></div>`;
   } else if (m.criacao) {
      body =
         `<div style="font-size:12px;color:#475569">criação · ${hhmm(0)} → ${hhmm(m.to)}</div>` +
         deltaLine(m.delta);
   } else {
      body =
         `<div style="font-size:12px;color:#475569">${hhmm(m.from)} → ${hhmm(m.to)}</div>` +
         deltaLine(m.delta);
   }

   return `<div style="font-family:${FONT};min-width:150px;padding:8px 10px;line-height:1.35">${header}${body}</div>`;
}
