import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Só os balões alternados — reaproveitado em dois lugares: dentro do
 * `ConversaSkeleton` cheio (primeira carga) e, sozinho, logo após a
 * abertura real, quando a conversa ainda é `isPlaceholderData` (semeada
 * pelo resumo da lista, sem os eventos de verdade).
 */
export function SkeletonBaloes() {
   return (
      <div className="space-y-2 py-1" aria-hidden>
         <Skeleton className="mx-auto h-3 w-16" />
         <Skeleton className="ml-auto h-16 w-3/4 rounded" />
         <Skeleton className="h-12 w-2/3 rounded" />
         <Skeleton className="ml-auto h-10 w-1/2 rounded" />
      </div>
   );
}

/**
 * Primeira carga do modal da conversa: o cabeçalho (título, selo) e o
 * rodapé (campo) já vêm do modal; aqui só os balões.
 */
export function ConversaSkeleton() {
   return (
      <div role="status">
         <span className="sr-only">Carregando conversa…</span>
         <SkeletonBaloes />
      </div>
   );
}
