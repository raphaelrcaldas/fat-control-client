/**
 * Quadros da FAB (siglas)
 * Usado no cadastro/edição de usuários (campo `quadro`).
 */

export const quadros: string[] = [
   "QOAV",
   "QOENG",
   "QOINT",
   "QOMED",
   "QOFARM",
   "QODENT",
   "QOINF",
   "QOEAV",
   "QOECOM",
   "QOEARM",
   "QOEFOT",
   "QOEMET",
   "QOECTA",
   "QOESUP",
   "QOEA",
   "QOCAPL",
   "QFO",
   "QCOA",
   "QOAP",
   "QOCON3",
   "QOCON",
   "QEST",
   "QSS",
   "QFG",
   "QESA",
   "QTA",
   "QSCON",
   "QCBCON",
   "QCB",
   "QSD",
];

/**
 * Opções no formato { value, label } para selects.
 */
export const quadroOptions = quadros.map((q) => ({ value: q, label: q }));
