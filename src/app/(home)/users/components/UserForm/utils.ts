/**
 * Utilitários para o formulário de usuário
 */

/**
 * Detecta campos alterados entre dois objetos
 */
export function getChangedFields<T extends Record<string, any>>(
   oldObj: T,
   newObj: T
): Partial<T> {
   const isEmpty = (val: any) =>
      val === null || val === undefined || val === "";

   const diff: Partial<T> = {};
   Object.keys(newObj).forEach((k) => {
      const key = k as keyof T;
      const oldVal = oldObj[key];
      const newVal = newObj[key];
      const changed =
         isEmpty(oldVal) !== isEmpty(newVal) ||
         String(oldVal).toLowerCase() !== String(newVal).toLowerCase();

      if (changed) diff[key] = newVal;
   });
   return diff;
}

/**
 * Validador para inputs que aceitam apenas letras
 */
export const onlyLettersKeyDown = (
   e: React.KeyboardEvent<HTMLInputElement>
) => {
   if (
      !e.key.match(/^[a-zA-ZÀ-ÿ\s]$/) &&
      e.key !== "Backspace" &&
      e.key !== "Delete" &&
      e.key !== "Tab"
   ) {
      e.preventDefault();
   }
};

/**
 * Validador para inputs que aceitam apenas números
 */
export const onlyNumbersKeyDown = (
   e: React.KeyboardEvent<HTMLInputElement>
) => {
   if (e.ctrlKey || e.metaKey) {
      return;
   }
   if (
      !e.key.match(/[0-9]/) &&
      e.key !== "Backspace" &&
      e.key !== "Delete" &&
      e.key !== "Tab"
   ) {
      e.preventDefault();
   }
};
