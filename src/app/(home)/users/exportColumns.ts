import type { UserPublic } from "services/routes/users";
import { militarColumns } from "@/components/export/militarColumns";
import type { ExportColumn } from "@/components/export/exportTypes";

/**
 * Catalogo de exportacao de /users.
 *
 * A tela de usuarios e a unica sem dominio proprio: exporta so a identidade
 * militar.
 *
 * `nasc` fica de fora porque nao viaja no `UserPublic` da listagem (so no
 * `UserFull` do detalhe individual). `telefone` viaja, mas fica de fora por
 * decisao: ele nao e exibido em nenhum lugar da tabela nem do card, e
 * oferece-lo aqui transformaria a permissao de VER a listagem em permissao de
 * EXTRAIR o contato do efetivo inteiro em tres cliques, sem rastro no
 * servidor. Ele volta — junto de `nasc`, `data_praca`, `cpf` e os e-mails —
 * quando a hidratacao vier por endpoint proprio, com gate e auditoria.
 */
export const USERS_EXPORT_COLUMNS: ExportColumn<UserPublic>[] =
   militarColumns<UserPublic>((user) => user, {
      omit: ["nasc", "telefone"],
   });
