/**
 * Configuração de temas para roles/perfis de usuário
 */

export interface RoleTheme {
   bg: string;
   text: string;
   hover: string;
   label?: string;
}

export const ROLE_THEMES: Record<string, RoleTheme> = {
   admin: {
      bg: "bg-red-100 dark:bg-red-900/40",
      text: "text-red-700 dark:text-red-300",
      hover: "hover:bg-red-200 dark:hover:bg-red-900/20",
      label: "Administrador",
   },
   aeromed: {
      bg: "bg-teal-100 dark:bg-teal-900/40",
      text: "text-teal-700 dark:text-teal-300",
      hover: "hover:bg-teal-200 dark:hover:bg-teal-900/20",
      label: "Aeromédica",
   },
   apoio_avancado: {
      bg: "bg-blue-100 dark:bg-blue-900/40",
      text: "text-blue-700 dark:text-blue-300",
      hover: "hover:bg-blue-200 dark:hover:bg-blue-900/20",
      label: "Apoio Avançado",
   },
   apoio_basico: {
      bg: "bg-blue-100 dark:bg-blue-900/40",
      text: "text-blue-700 dark:text-blue-300",
      hover: "hover:bg-blue-200 dark:hover:bg-blue-900/20",
      label: "Apoio Básico",
   },
   ops_avancado: {
      bg: "bg-orange-100 dark:bg-orange-900/40",
      text: "text-orange-700 dark:text-orange-300",
      hover: "hover:bg-orange-200 dark:hover:bg-orange-900/20",
      label: "Operações Avançado",
   },
   ops_basico: {
      bg: "bg-orange-100 dark:bg-orange-900/40",
      text: "text-orange-700 dark:text-orange-300",
      hover: "hover:bg-orange-200 dark:hover:bg-orange-900/20",
      label: "Operações Básico",
   },
   dout_avancado: {
      bg: "bg-green-100 dark:bg-green-900/40",
      text: "text-green-700 dark:text-green-300",
      hover: "hover:bg-green-200 dark:hover:bg-green-900/20",
      label: "Doutrina Avançado",
   },
   inteligencia: {
      bg: "bg-purple-100 dark:bg-purple-900/40",
      text: "text-purple-700 dark:text-purple-300",
      hover: "hover:bg-purple-200 dark:hover:bg-purple-900/20",
      label: "Inteligência",
   },
   seg_voo: {
      bg: "bg-amber-100 dark:bg-amber-900/40",
      text: "text-amber-700 dark:text-amber-300",
      hover: "hover:bg-amber-200 dark:hover:bg-amber-900/20",
      label: "Segurança de Voo",
   },
   default: {
      bg: "bg-gray-100 dark:bg-gray-700",
      text: "text-gray-700 dark:text-gray-300",
      hover: "hover:bg-gray-200 dark:hover:bg-gray-700/60",
      label: "Default",
   },
};

/**
 * Retorna o tema de um role baseado no nome
 */
export function getRoleTheme(roleName: string): RoleTheme {
   const normalized = roleName.toLowerCase().trim();
   return ROLE_THEMES[normalized] || ROLE_THEMES.default;
}

/**
 * Retorna todas as chaves de roles disponíveis (exceto default)
 */
export function getAvailableRoles(): string[] {
   return Object.keys(ROLE_THEMES).filter((key) => key !== "default");
}

/**
 * Tema suave para o chip de uma permissão, derivado da semântica da ação
 * (CRUD). Ações desconhecidas caem no tema neutro.
 */
export interface ActionChipTheme {
   bg: string;
   text: string;
   border: string;
}

const ACTION_CHIP_THEMES: { keywords: string[]; theme: ActionChipTheme }[] = [
   {
      keywords: ["create", "add", "novo", "nova"],
      theme: {
         bg: "bg-emerald-50 dark:bg-emerald-900/20",
         text: "text-emerald-700 dark:text-emerald-300",
         border: "border-emerald-200 dark:border-emerald-800",
      },
   },
   {
      keywords: ["read", "view", "list", "get", "consultar"],
      theme: {
         bg: "bg-blue-50 dark:bg-blue-900/20",
         text: "text-blue-700 dark:text-blue-300",
         border: "border-blue-200 dark:border-blue-800",
      },
   },
   {
      keywords: ["update", "edit", "editar"],
      theme: {
         bg: "bg-amber-50 dark:bg-amber-900/20",
         text: "text-amber-700 dark:text-amber-300",
         border: "border-amber-200 dark:border-amber-800",
      },
   },
   {
      keywords: ["delete", "remove", "excluir"],
      theme: {
         bg: "bg-rose-50 dark:bg-rose-900/20",
         text: "text-rose-700 dark:text-rose-300",
         border: "border-rose-200 dark:border-rose-800",
      },
   },
];

const DEFAULT_ACTION_CHIP_THEME: ActionChipTheme = {
   bg: "bg-gray-100 dark:bg-gray-700",
   text: "text-gray-700 dark:text-gray-200",
   border: "border-gray-200 dark:border-gray-600",
};

export function getActionChipTheme(action: string): ActionChipTheme {
   const normalized = action.toLowerCase().trim();
   const match = ACTION_CHIP_THEMES.find((entry) =>
      entry.keywords.some((keyword) => normalized.includes(keyword))
   );
   return match?.theme ?? DEFAULT_ACTION_CHIP_THEME;
}

// Ordem semântica de exibição das ações (CRUD). Ações fora desta lista
// entram ao final, em ordem alfabética.
const ACTION_SORT_ORDER = [
   "read",
   "view",
   "list",
   "get",
   "consultar",
   "create",
   "add",
   "novo",
   "nova",
   "update",
   "edit",
   "editar",
   "delete",
   "remove",
   "excluir",
];

function getActionSortIndex(action: string): number {
   const normalized = action.toLowerCase().trim();
   const index = ACTION_SORT_ORDER.findIndex((keyword) =>
      normalized.includes(keyword)
   );
   return index === -1 ? ACTION_SORT_ORDER.length : index;
}

/**
 * Comparador para ordenar permissões pela semântica da ação (CRUD),
 * com desempate alfabético.
 */
export function compareActions(a: string, b: string): number {
   const diff = getActionSortIndex(a) - getActionSortIndex(b);
   return diff !== 0 ? diff : a.localeCompare(b);
}
