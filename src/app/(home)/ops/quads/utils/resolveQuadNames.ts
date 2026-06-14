import { QuadTypeGroup } from "services/routes/quads";

/**
 * Resolve os nomes longos do grupo e do tipo a partir do `quadType` selecionado.
 * Retorna strings vazias quando o tipo não é encontrado.
 */
export function resolveQuadNames(
   quadsType: QuadTypeGroup[],
   quadType: number
): { groupName: string; typeName: string } {
   for (const group of quadsType) {
      for (const type of group.types) {
         if (type.id === quadType) {
            return { groupName: group.long, typeName: type.long };
         }
      }
   }
   return { groupName: "", typeName: "" };
}
