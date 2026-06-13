/**
 * Saneamento global de inputs de texto livre.
 *
 * Espelha `api/fcontrol_api/utils/sanitize.py` (a API é a guarda final;
 * isto é UX). Normaliza unicode (NFC), remove caracteres de controle e
 * invisíveis e apara as pontas.
 *
 * - `sanitizeLinha`: campos de uma linha (descrições, nº de documento).
 * - `sanitizeBloco`: textos multilinha (textarea) — preserva quebras.
 */

// \p{C} = toda a categoria de controle/formatação/invisíveis (Cc, Cf, Cs,
// Co, Cn) — espelha unicodedata.category(ch)[0] == 'C' do backend Python.
const CONTROLE = /\p{C}/gu;

export function sanitizeLinha(texto: string): string {
   return texto.normalize("NFC").replace(CONTROLE, "").trim();
}

export function sanitizeBloco(texto: string): string {
   return texto
      .normalize("NFC")
      .replace(/\r\n?/g, "\n")
      .replace(CONTROLE, (ch) => (ch === "\n" || ch === "\t" ? ch : ""))
      .trim();
}
