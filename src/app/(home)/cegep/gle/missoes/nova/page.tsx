"use client";

import { MissaoEditor } from "../MissaoEditor";

/**
 * Nova missão.
 *
 * Segmento estático, declarado ao lado de `[id]`: no App Router a rota
 * literal vence a dinâmica, então "nova" nunca é lido como id.
 */
export default function NovaMissaoPage() {
   return <MissaoEditor missaoId={null} />;
}
