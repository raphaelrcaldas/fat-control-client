"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Badge, Button, Drawer } from "flowbite-react";
import {
   HiOutlineRefresh,
   HiDocumentText,
   HiUpload,
   HiX,
} from "react-icons/hi";
import { useAbaixoDe } from "@/hooks/useAbaixoDe";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useAllAeronaves } from "@/hooks/queries/useAeronaves";
import { useRelatoriosVooPeriodo } from "@/hooks/queries/useRelatoriosVoo";
import { PermBased, usePermBased } from "@/app/(home)/hooks/usePermBased";
import PermDenied from "@/app/components/permDenied";
import { RelatoriosHeader } from "./components/RelatoriosHeader";
import { RelatoriosFiltros } from "./components/RelatoriosFiltros";
import { RelatoriosLista } from "./components/RelatoriosLista";
import { RelatoriosSkeleton } from "./components/RelatoriosSkeleton";
import { RelatorioPainel } from "./components/RelatorioPainel";
import { EnvioLoteModal } from "./components/EnvioLoteModal";
import { useRelatoriosParams } from "./hooks/useRelatoriosParams";
import { agruparPorDia } from "./utils/relatorios";
import { formatDiaSemana } from "utils/dateHandler";

// Altura explícita só a partir de `lg` — mesma régua de `ops/indisp/page.tsx`:
// o pai (`PageTransition`) só tem `min-h-full`, então `h-full` sozinho vira
// `auto` e a lista/painel não conseguem `overflow-y-auto` interno; quem
// rolaria seria o `<main>` inteiro, empurrando o masthead para fora da
// viewport. Abaixo de `lg` a lista tem altura natural e a página inteira rola
// (o `<main>` do layout), porque nesse tamanho o painel vira Drawer e não há
// mais duas colunas para repartir a altura.
const ALTURA_PAGINA =
   "flex min-h-0 flex-col space-y-2 lg:h-[calc(100dvh-5rem)] lg:overflow-hidden";

// Elementos que `prenderTabNoDrawer` considera focáveis dentro do Drawer.
const FOCAVEIS_SELETOR =
   'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export default function RelatoriosVooPage() {
   // Item de menu e página exigem `view` (RBAC): sem isso, um link direto
   // com `?sel=` cairia no card de erro genérico em vez de "acesso negado".
   const { hasPerm } = usePermBased();
   const podeVer = hasPerm("estatistica.relatorios_voo", "view");

   if (!podeVer) {
      return <PermDenied />;
   }

   return <RelatoriosVooConteudo />;
}

function RelatoriosVooConteudo() {
   const {
      data_ini,
      data_fim,
      periodoKey,
      anv,
      sel,
      setParams,
      setPeriodoOtimista,
      confirmarPeriodo,
   } = useRelatoriosParams();
   const [envioAberto, setEnvioAberto] = useState(false);
   const abrirEnvio = () => setEnvioAberto(true);
   const compacto = useAbaixoDe("lg");

   // O Drawer do Flowbite também escuta Escape para fechar: sem isto, Escape
   // no modal de exclusão aberto por cima do drawer fechava os dois de uma
   // vez. `onConfirmacaoChange` (setter estável) avisa a página quando o
   // modal abre/fecha; enquanto aberto, o `onClose` do Drawer é ignorado.
   const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);

   const { data: aeronaves } = useAllAeronaves({ is_sim: false });
   const frota = useMemo(
      () => (aeronaves ?? []).map((a) => a.matricula),
      [aeronaves]
   );

   // A URL, os campos e os chips seguem a tecla imediatamente; só a chave da
   // query atrasa ~500ms. Sem isto, cada dígito válido de uma data (mesmo
   // sem inverter o período) disparava um GET — digitar uma data completa
   // chegou a soltar 4 requisições com estados intermediários descartáveis.
   // O par inteiro é debounced numa única chave (não duas independentes):
   // dois timers separados deixavam a confirmação que puxa a outra ponta
   // (`ajustarPeriodo`) disparar um GET com o par invertido no meio do
   // caminho (422) ou um GET a mais que o intermediário já tornava inútil.
   const periodoQuery = useDebouncedValue(`${data_ini}|${data_fim}`, 500);
   const [dataIniQuery, dataFimQuery] = periodoQuery.split("|");
   const { data, isLoading, isError, isFetching, refetch } =
      useRelatoriosVooPeriodo({
         data_ini: dataIniQuery,
         data_fim: dataFimQuery,
         anv,
      });
   const grupos = useMemo(() => agruparPorDia(data?.itens ?? []), [data]);
   const total = useMemo(
      () =>
         Object.values(data?.contagem_por_anv ?? {}).reduce((a, b) => a + b, 0),
      [data]
   );

   // No desktop o padrão é o primeiro item da lista, sem exigir `sel` na URL;
   // no mobile a ausência de `sel` significa "nenhum aberto" (ver Drawer).
   const selecionado = useMemo(
      () => data?.itens.find((r) => r.id === sel) ?? data?.itens[0] ?? null,
      [data, sel]
   );
   // Só para o Drawer: um `?sel=` que não bate com nenhum item da página
   // atual (excluído, ou fora do período/filtro) não pode cair no fallback
   // `itens[0]` de `selecionado` — isso abriria o Drawer com o relatório
   // errado. `null` (sem seleção) mantém o próprio `null`; um id presente na
   // URL mas ausente na lista também vira `null`, nunca o primeiro item.
   const noDrawer = useMemo(
      () =>
         sel === null ? null : (data?.itens.find((r) => r.id === sel) ?? null),
      [data, sel]
   );
   const fecharSelecao = () => setParams({ sel: undefined });

   // Devolve o foco a quem abriu o drawer: guarda o elemento ativo no
   // momento da seleção — só no compacto, onde o Drawer existe (no desktop
   // não há nada para "devolver": o painel é permanente, não some). Ao
   // fechar (compacto e `sel` volta a null), foca-o de novo se ainda estiver
   // no DOM; se o item foi excluído (removido do DOM) ou a abertura veio de
   // um deep link (nada para devolver), não força foco.
   const elementoQueAbriuRef = useRef<HTMLElement | null>(null);
   const selecionarNaLista = (id: number) => {
      elementoQueAbriuRef.current =
         compacto && document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
      setParams({ sel: String(id) });
   };

   // Exclusão: nunca devolve o foco ao botão do item excluído. Quando este
   // callback roda, o refetch já terminou (ver `useExcluirRelatorio`): o item
   // saiu da lista e, no mobile, o drawer já fechou porque `noDrawer` virou
   // `null`. Zerar a ref é defensivo, para o efeito de devolução acima nunca
   // mirar um botão que não existe mais. Vale nos dois painéis por
   // coerência, embora só o drawer leia esta ref.
   const onExcluido = () => {
      elementoQueAbriuRef.current = null;
      fecharSelecao();
   };

   // Período sem nenhum relatório (independente de filtro) x filtro por
   // aeronave sem resultado num período que tem relatórios — a ação certa
   // muda: enviar vs. limpar filtro.
   const periodoVazio = total === 0;
   const filtroSemResultado = !periodoVazio && grupos.length === 0;

   // Tira o filtro por aeronave mantendo o período escolhido: se o usuário
   // já tinha ajustado as datas, "Limpar filtros" devolvendo tudo ao padrão
   // de 15 dias jogaria fora essa escolha junto com o filtro que não deu
   // resultado.
   const verTodasAeronaves = () =>
      setParams({ anv: undefined, sel: undefined });

   // O drawer precisa sair do wrapper de PageTransition (carrega um
   // `translate` residual que vira bloco contêiner para `position: fixed`
   // descendente) — mesma razão do MissaoEditor.
   const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
   useEffect(() => setPortalTarget(document.body), []);

   // O Drawer do Flowbite 0.12 não move nem prende o foco: sem isto, abrir o
   // painel deixa o teclado passeando pela lista atrás dele (mesmo padrão de
   // `estatistica/etapas/missao/components/MissaoEditor.tsx`). O Drawer só é
   // inserido no DOM quando `portalTarget && compacto && sel !== null &&
   // selecionado` são todos verdadeiros — por isso `drawerPronto` depende dos
   // quatro. Num deep link `?sel=` a 360, `compacto`/`portalTarget` ficam
   // prontos ANTES da resposta da query (`selecionado` ainda `null`): sem
   // essa condição o efeito rodava achando o ref nulo (drawer nem existia) e
   // nunca disparava de novo quando os dados chegavam.
   //
   // `drawerPronto` é um booleano, não o objeto `noDrawer`: colocar o
   // OBJETO nas deps refaz o foco a cada novo objeto (identidade), e
   // `noDrawer` é recriado a cada refetch — o PATCH da Observação
   // (`salvarObs`) invalida a query, o objeto muda de identidade mesmo com o
   // MESMO relatório, e o efeito arrancava o foco do campo/botão que o
   // usuário estava usando de volta para o X a cada refetch (medido: foco
   // em "Abrir PDF" arrancado de volta para o X pouco mais de 1s depois).
   // Depender só da PRESENÇA (`!== null`), estável entre refetches do mesmo
   // relatório, evita isso.
   const drawerPronto =
      compacto && sel !== null && portalTarget !== null && noDrawer !== null;
   const drawerCloseRef = useRef<HTMLButtonElement>(null);
   useEffect(() => {
      if (drawerPronto) drawerCloseRef.current?.focus();
   }, [drawerPronto, sel]);

   // Efeito companheiro de `selecionarNaLista` (declarado acima, junto de
   // `elementoQueAbriuRef`): ao fechar (compacto e `sel` volta a null),
   // devolve o foco ao elemento guardado se ainda estiver no DOM.
   useEffect(() => {
      if (compacto && sel === null) {
         const el = elementoQueAbriuRef.current;
         if (el?.isConnected) el.focus();
         elementoQueAbriuRef.current = null;
      }
   }, [compacto, sel]);

   // Prende Tab dentro do drawer sem `inert` (a navbar e a sidebar ficam
   // fora dele) — Tab no último focável volta ao primeiro, Shift+Tab no
   // primeiro vai ao último. O modal de exclusão é um portal próprio do
   // Flowbite com foco gerenciado; este handler só olha para o foco atual, e
   // quando o foco está dentro do modal (fora deste container) não faz nada.
   const prenderTabNoDrawer = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "Tab") return;
      const container = e.currentTarget;
      if (!container.contains(document.activeElement)) return;
      const focaveis = Array.from(
         container.querySelectorAll<HTMLElement>(FOCAVEIS_SELETOR)
      ).filter((el) => el.offsetParent !== null);
      if (focaveis.length === 0) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
         e.preventDefault();
         ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
         e.preventDefault();
         primeiro.focus();
      }
   };

   return (
      <div className={ALTURA_PAGINA}>
         <RelatoriosHeader onEnviar={abrirEnvio} />
         <RelatoriosFiltros
            frota={frota}
            contagem={data?.contagem_por_anv}
            total={total}
            anv={anv}
            onAnv={(v) => setParams({ anv: v, sel: undefined })}
            dataIni={data_ini}
            dataFim={data_fim}
            periodoKey={periodoKey}
            onDataIniChange={(v) => setPeriodoOtimista("data_ini", v)}
            onDataFimChange={(v) => setPeriodoOtimista("data_fim", v)}
            onDataIniConfirm={(v) => confirmarPeriodo("data_ini", v)}
            onDataFimConfirm={(v) => confirmarPeriodo("data_fim", v)}
         />
         {isLoading ? (
            <RelatoriosSkeleton />
         ) : isError ? (
            <div className="flex flex-col items-center gap-1 rounded border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
               <p className="text-sm font-semibold text-red-800">
                  Não foi possível carregar os relatórios.
               </p>
               <Button
                  color="light"
                  size="sm"
                  className="mt-3"
                  onClick={() => refetch()}
               >
                  <HiOutlineRefresh className="mr-2 h-4 w-4" />
                  Tentar de novo
               </Button>
            </div>
         ) : grupos.length === 0 ? (
            <div className="flex flex-col items-center gap-1 rounded border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
               <HiDocumentText className="mb-2 h-7 w-7 text-slate-300" />
               {periodoVazio ? (
                  <>
                     <p className="text-sm font-semibold text-slate-700">
                        Nenhum relatório no período
                     </p>
                     <p className="text-xs text-slate-500">
                        Envie os PDFs escaneados pelo botão “Enviar relatórios”.
                     </p>
                     <PermBased
                        resource="estatistica.relatorios_voo"
                        requiredPerm="create"
                     >
                        <Button
                           color="primary"
                           size="sm"
                           className="mt-3"
                           onClick={abrirEnvio}
                        >
                           <HiUpload className="mr-2 h-4 w-4" />
                           Enviar relatórios
                        </Button>
                     </PermBased>
                  </>
               ) : (
                  filtroSemResultado && (
                     <>
                        <p className="text-sm font-semibold text-slate-700">
                           Nenhum relatório com esses filtros
                        </p>
                        <p className="text-xs text-slate-500">
                           Tente outra aeronave ou período.
                        </p>
                        <Button
                           color="light"
                           size="sm"
                           className="mt-3"
                           onClick={verTodasAeronaves}
                        >
                           Ver todas as aeronaves
                        </Button>
                     </>
                  )
               )}
            </div>
         ) : (
            <div
               className={clsx(
                  "grid min-h-0 flex-1 gap-2 transition-opacity",
                  "lg:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] 2xl:grid-cols-[500px_minmax(0,1fr)]",
                  isFetching && "opacity-50"
               )}
            >
               <RelatoriosLista
                  grupos={grupos}
                  selecionado={compacto ? sel : (selecionado?.id ?? null)}
                  onSelecionar={selecionarNaLista}
               />
               {selecionado && !compacto && (
                  <RelatorioPainel
                     relatorio={selecionado}
                     onExcluido={onExcluido}
                     onConfirmacaoChange={setConfirmacaoAberta}
                  />
               )}
            </div>
         )}

         {portalTarget &&
            compacto &&
            sel !== null &&
            noDrawer &&
            createPortal(
               <Drawer
                  open
                  // Enquanto o modal de exclusão está aberto por cima do
                  // drawer, o Drawer também escuta Escape no document — sem
                  // isto, um Escape fechava os dois de uma vez.
                  onClose={() => {
                     if (!confirmacaoAberta) fecharSelecao();
                  }}
                  position="right"
                  aria-labelledby="relatorio-drawer-titulo"
                  // O Flowbite 0.12.17 injeta um `aria-describedby` próprio
                  // apontando para o `DrawerHeader`, que este drawer não usa
                  // (header próprio abaixo) — sem `undefined` aqui o atributo
                  // fica órfão, apontando para um id inexistente. Como
                  // `...restProps` vem depois no componente, essa prop
                  // sobrescreve a dele.
                  aria-describedby={undefined}
                  // Prende o Tab dentro do drawer sem `inert` (navbar e
                  // sidebar ficam fora dele). O modal de exclusão é um portal
                  // próprio com foco gerenciado pelo Flowbite; enquanto o
                  // foco estiver nele (fora deste container), o handler nota
                  // pelo `contains` e não interfere.
                  onKeyDown={prenderTabNoDrawer}
                  // Abaixo do navbar (fixed, z-50, 4rem/h-16): ancorado em
                  // top-0 o cabeçalho do drawer (com o X) ficava por baixo
                  // dela — mesmo defeito e correção do MissaoEditor.tsx.
                  className="top-16 flex h-[calc(100dvh-4rem)] w-full flex-col overflow-hidden p-0"
               >
                  {/* Header próprio em vez do DrawerHeader do Flowbite: o dele
                      é um <h5> fixo, que quebra a ordem de headings. A barra
                      é o título: h2 com o mesmo conteúdo do h2 do painel, e o
                      painel (compacto) deixa de renderizar o seu próprio
                      h2/badge — só um cabeçalho em vez de dois. O
                      botão de fechar recebe o foco ao abrir — ver comentário
                      do drawerCloseRef acima. */}
                  <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-4 py-2">
                     <h2
                        id="relatorio-drawer-titulo"
                        title={
                           noDrawer.seq > 1
                              ? `${noDrawer.anv} · ${formatDiaSemana(noDrawer.data)} · ${noDrawer.seq}º do dia`
                              : `${noDrawer.anv} · ${formatDiaSemana(noDrawer.data)}`
                        }
                        className="flex min-w-0 items-baseline gap-2.5 truncate text-sm font-semibold text-slate-700"
                     >
                        <span className="truncate">
                           <span className="font-mono">{noDrawer.anv}</span> ·{" "}
                           {formatDiaSemana(noDrawer.data)}
                        </span>
                        {noDrawer.seq > 1 && (
                           <Badge color="info">{noDrawer.seq}º do dia</Badge>
                        )}
                     </h2>
                     <button
                        ref={drawerCloseRef}
                        type="button"
                        onClick={fecharSelecao}
                        aria-label="Fechar painel do relatório"
                        className="grid min-h-[24px] min-w-[24px] shrink-0 place-items-center rounded text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                     >
                        <HiX className="h-5 w-5" />
                     </button>
                  </div>
                  {/* `overflow-y-auto` (não `min-h-0 flex-1` sem rolagem):
                      cabeçalho + prévia (420px fixo) + rodapé de metadados
                      podem somar mais que a altura do Drawer numa tela baixa
                      (ex.: 360×780 com o título quebrando em 2 linhas) — sem
                      isto o rodapé com a observação ficava cortado e
                      inalcançável. O painel entra em modo `compacto`, que
                      troca `overflow-hidden`/`min-h-0` por altura natural,
                      para não cortar o próprio conteúdo antes de chegar
                      aqui. */}
                  <div className="min-h-0 flex-1 overflow-y-auto">
                     <RelatorioPainel
                        relatorio={noDrawer}
                        onExcluido={onExcluido}
                        onConfirmacaoChange={setConfirmacaoAberta}
                        compacto
                     />
                  </div>
               </Drawer>,
               portalTarget
            )}

         <EnvioLoteModal
            aberto={envioAberto}
            onFechar={() => setEnvioAberto(false)}
            frota={frota}
         />
      </div>
   );
}
