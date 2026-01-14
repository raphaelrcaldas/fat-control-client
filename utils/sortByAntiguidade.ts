/**
 * Funções de ordenação por antiguidade militar
 *
 * Critérios de ordenação (do mais antigo para o mais moderno):
 * 1. posto.ant - Antiguidade do posto (menor número = posto mais antigo)
 * 2. ult_promo - Data da última promoção (mais antiga primeiro)
 * 3. ant_rel - Antiguidade relativa dentro do posto (menor número = mais antigo)
 */

import type { UserPublic } from "services/routes/users";

/**
 * Função de comparação base para ordenação por antiguidade
 * Compara dois objetos UserPublic
 *
 * @example
 * // Uso com array.sort diretamente
 * users.sort((a, b) => compareByAntiguidade(a, b))
 *
 * // Uso com objetos que contêm user
 * items.sort((a, b) => compareByAntiguidade(a.user, b.user))
 */
export function compareByAntiguidade(a: UserPublic, b: UserPublic): number {
   // 1. Comparar posto (menor ant = mais antigo)
   const antA = a.posto.ant;
   const antB = b.posto.ant;
   if (antA !== antB) return antA - antB;

   // 2. Comparar data de última promoção (mais antiga primeiro)
   const promoA = a.ult_promo || "";
   const promoB = b.ult_promo || "";
   if (promoA !== promoB) return promoA.localeCompare(promoB);

   // 3. Comparar antiguidade relativa (menor = mais antigo)
   return (a.ant_rel ?? 0) - (b.ant_rel ?? 0);
}

/**
 * Ordena array de objetos que contêm { user: UserPublic } por antiguidade
 * Retorna um NOVO array ordenado (não modifica o original)
 * Itens sem user são colocados no final
 *
 * @example
 * const ordered = sortByAntiguidade(crewMembers)
 * const ordered = sortByAntiguidade(userRoles)
 */
export function sortByAntiguidade<T extends { user?: UserPublic }>(
   items: T[]
): T[] {
   return [...items].sort((a, b) => {
      // Itens sem user vão para o final
      if (!a.user && !b.user) return 0;
      if (!a.user) return 1;
      if (!b.user) return -1;
      return compareByAntiguidade(a.user, b.user);
   });
}

/**
 * Ordena array in-place de objetos que contêm { user: UserPublic }
 * MODIFICA o array original e o retorna
 * Itens sem user são colocados no final
 *
 * @example
 * sortByAntiguidadeInPlace(data)
 */
export function sortByAntiguidadeInPlace<T extends { user?: UserPublic }>(
   items: T[]
): T[] {
   return items.sort((a, b) => {
      // Itens sem user vão para o final
      if (!a.user && !b.user) return 0;
      if (!a.user) return 1;
      if (!b.user) return -1;
      return compareByAntiguidade(a.user, b.user);
   });
}
