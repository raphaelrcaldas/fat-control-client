import type { UserPublic } from "services/routes/users";
import {
   militarColumns,
   MILITAR_HYDRATED_COLUMNS,
} from "@/components/export/militarColumns";
import type { ExportColumn } from "@/components/export/exportTypes";

/**
 * Catalogo de exportacao de /users.
 *
 * A tela de usuarios e a unica sem dominio proprio: exporta so a identidade
 * militar.
 *
 * As colunas de PII (`telefone`, `nasc`, `cpf`, e-mails, `data_praca`) nao
 * estao na listagem: elas chegam pela hidratacao (`POST /users/export`), e
 * por isso so sao OFERECIDAS a quem tem `users.export`. Oferecer coluna que
 * sairia vazia em toda linha e pior do que nao oferecer.
 */
export function usersExportColumns(
   podeHidratar: boolean
): ExportColumn<UserPublic>[] {
   return militarColumns<UserPublic>((user) => user, {
      omit: podeHidratar ? [] : MILITAR_HYDRATED_COLUMNS,
   });
}
