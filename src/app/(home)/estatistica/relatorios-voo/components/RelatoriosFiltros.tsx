"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Label, TextInput } from "flowbite-react";
import { HiCalendar } from "react-icons/hi";
import { todayIso } from "utils/dateHandler";
import { separarFrota } from "../utils/relatorios";

interface Props {
   frota: string[];
   contagem: Record<string, number> | undefined;
   total: number;
   anv?: string;
   onAnv: (anv: string | undefined) => void;
   dataIni: string;
   dataFim: string;
   /** String completa da URL, usada para ressincronizar — ver `useRelatoriosParams`. */
   periodoKey: string;
   /**
    * A cada tecla: só grava quando o valor já forma sozinho um par válido
    * (sem inverter, sem futuro); devolve `true` quando gravou. Nunca puxa a
    * outra ponta — isso é papel só de `onDataIniConfirm`/`onDataFimConfirm`.
    */
   onDataIniChange: (v: string) => boolean;
   onDataFimChange: (v: string) => boolean;
   /**
    * Ao confirmar (perder o foco, ou selecionar via calendário): aplica o
    * ajuste completo (puxa a outra ponta se inverter, limita a hoje) e
    * devolve o período efetivo resultante, para o campo local realinhar.
    */
   onDataIniConfirm: (v: string) => { data_ini: string; data_fim: string };
   onDataFimConfirm: (v: string) => { data_ini: string; data_fim: string };
}

export function RelatoriosFiltros(props: Props) {
   const hoje = todayIso();
   const chip = (ativo: boolean) =>
      clsx(
         "inline-flex min-h-[28px] shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold",
         "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600",
         ativo
            ? "bg-primary-600 border-primary-600 text-white"
            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      );
   // No chip ativo (branco sobre `primary-600`) o contador fica com
   // opacidade total — `opacity-75` reprovava contraste AA. No inativo com
   // contagem 0, `text-slate-500` (não `slate-400`: ~2,6:1 no branco,
   // reprova contraste AA) em vez de `opacity-75`.
   const contador = (ativo: boolean, n: number) =>
      clsx(
         "font-normal",
         ativo ? "opacity-100" : n === 0 ? "text-slate-500" : "opacity-75"
      );

   // Aeronaves com relatório no período ficam habilitadas (com o
   // número); as sem relatório vão desabilitadas para o fim, depois de "sem
   // relatório:" — exceto a aeronave filtrada na URL, que nunca desabilita
   // (precisa continuar clicável para tirar o filtro).
   const { comRelatorio, semRelatorio } = separarFrota(
      props.frota,
      props.contagem,
      props.anv
   );

   // Estado local para os campos de data: o `<input type="date">` do Chrome
   // dispara `onChange` a cada segmento digitado (dia/mês/ano), e um valor
   // intermediário ou "provisoriamente pequeno" (ex.: digitar "2" no dia da
   // final antes de completar "20") não pode virar gravação definitiva nem
   // travar o campo no valor antigo. O campo sempre reflete o que o usuário
   // está digitando; a gravação otimista (`onDataIniChange`/`onDataFimChange`)
   // só grava quando o valor já é, sozinho, um período válido, e a
   // confirmação (`onBlur`) resolve o resto (inversão, limite a hoje) e
   // realinha o campo ao valor efetivo se o que sobrou não for uma data.
   const [localIni, setLocalIni] = useState(props.dataIni);
   const [localFim, setLocalFim] = useState(props.dataFim);

   // Mobile: a linha de chips rola sem barra visível — sem nenhum outro
   // sinal, quem abre no celular vê os primeiros chips e conclui que é a
   // frota inteira. `noFim` acompanha se a rolagem já chegou ao fim (ou nem
   // estoura) para esconder a máscara de esmaecimento da borda direita;
   // atualizado no scroll e na montagem/mudança de conteúdo (efeito abaixo).
   const [noFim, setNoFim] = useState(true);
   const chipsRef = useRef<HTMLDivElement>(null);

   const atualizarNoFim = () => {
      const el = chipsRef.current;
      if (!el) return;
      setNoFim(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
   };

   // Reavalia quando a lista de chips muda de tamanho (frota/contagem
   // carregando) — o conjunto pode passar a caber, ou deixar de caber.
   useEffect(() => {
      atualizarNoFim();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [props.frota, props.contagem]);

   // Reavalia também quando o próprio elemento muda de tamanho (redimensionar
   // a janela, ou o layout mudar de `lg:flex-wrap` para rolagem horizontal):
   // o efeito acima só olha o conteúdo (frota/contagem), não o continente.
   useEffect(() => {
      const el = chipsRef.current;
      if (!el) return;
      const ro = new ResizeObserver(atualizarNoFim);
      ro.observe(el);
      return () => ro.disconnect();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   // Rastreia qual dos dois campos está com foco: usado abaixo para o efeito
   // de ressincronização nunca sobrescrever o campo que o usuário está
   // digitando agora mesmo.
   const campoComFoco = useRef<"data_ini" | "data_fim" | null>(null);

   // Ressincroniza pela `periodoKey` (não por `dataIni`/`dataFim`): a URL
   // pode ser reescrita para o MESMO período efetivo (ex.: "Limpar filtros"
   // quando já está no padrão), e nesse caso `props.dataIni`/`dataFim` não
   // mudam de valor — sem a chave, um dígito parcial que o usuário largou no
   // campo (sem confirmar) ficaria preso na tela apontando para um período
   // que a ação já abandonou. `periodoKey` é a string completa da URL — ver
   // o comentário em `useRelatoriosParams`.
   //
   // Corrida evitada aqui: nunca sobrescreve o campo com foco. Sequência
   // medida — gravação otimista de um valor intermediário (ex.: dia "2",
   // ainda inverteria, fica só local) seguida de uma tecla que já formaria
   // um valor válido e é gravada (`router.replace` em voo); se esse replace
   // resolve DEPOIS que o usuário já digitou o dígito seguinte (que reverte
   // para inválido de novo), a nova `periodoKey` chega e este efeito
   // sobrescreveria o campo com o valor da gravação antiga, atropelando o
   // que está na tela. Como só o campo SEM foco pode estar "atrasado" dessa
   // forma (o campo com foco reflete a intenção atual do usuário, e o
   // `onBlur` já resolve o valor dele ao perder o foco), pular a
   // ressincronização do campo focado é suficiente.
   useEffect(() => {
      if (campoComFoco.current !== "data_ini") setLocalIni(props.dataIni);
      if (campoComFoco.current !== "data_fim") setLocalFim(props.dataFim);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [props.periodoKey]);

   return (
      // Desktop numa linha só (datas `lg:w-auto`, chips `lg:flex-1`) — Período, datas,
      // divisor, chips; entre `lg` e ~1280 os chips quebram para uma segunda
      // linha se não couberem (`lg:flex-wrap` só no grupo de chips, ver
      // abaixo). Abaixo de `lg`, duas linhas: "Período" + as duas datas, e os
      // chips (`w-full` nos dois grupos). `gap-y-2` é o gap vertical entre
      // essas linhas no mobile — menor que o `gap-x-3` horizontal, para
      // aproximar a lista do topo.
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
         {/* Grupo "Período": abaixo de `sm`, rótulo (ícone + texto) em cima
             das duas datas, ocupando a largura toda; a partir de `sm`, o
             rótulo já fica inline com as datas (senão a barra fica com
             102px de altura só para o rótulo sozinho); a partir de `lg`,
             tudo numa linha só com os chips, rótulo e "–" inline entre as
             datas. `role="group"` + `aria-labelledby` associa "Período" aos
             dois campos de data para quem usa comando de voz ou leitor de
             tela, já que o rótulo visível não é um `<label>` deles. */}
         <div
            role="group"
            aria-labelledby="relatorios-periodo"
            className="flex w-full flex-col gap-1 sm:flex-row sm:items-center sm:gap-1.5 lg:w-auto"
         >
            <span
               id="relatorios-periodo"
               className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-slate-600"
            >
               <HiCalendar className="h-4 w-4" aria-hidden />
               Período
            </span>
            <div className="flex w-full items-center gap-2 sm:w-auto">
               <div className="w-1/2 sm:w-36">
                  <Label htmlFor="relatorios-data-ini" className="sr-only">
                     Data inicial
                  </Label>
                  <TextInput
                     id="relatorios-data-ini"
                     type="date"
                     sizing="sm"
                     className="[&_input]:h-[30px]"
                     value={localIni}
                     max={props.dataFim || hoje}
                     onFocus={() => {
                        campoComFoco.current = "data_ini";
                     }}
                     onChange={(e) => {
                        setLocalIni(e.target.value);
                        props.onDataIniChange(e.target.value);
                     }}
                     onBlur={(e) => {
                        const efetivo = props.onDataIniConfirm(e.target.value);
                        campoComFoco.current = null;
                        setLocalIni(efetivo.data_ini);
                        setLocalFim(efetivo.data_fim);
                     }}
                  />
               </div>
               <span className="hidden text-slate-400 lg:inline" aria-hidden>
                  –
               </span>
               <div className="w-1/2 sm:w-36">
                  <Label htmlFor="relatorios-data-fim" className="sr-only">
                     Data final
                  </Label>
                  <TextInput
                     id="relatorios-data-fim"
                     type="date"
                     sizing="sm"
                     className="[&_input]:h-[30px]"
                     value={localFim}
                     min={props.dataIni}
                     max={hoje}
                     onFocus={() => {
                        campoComFoco.current = "data_fim";
                     }}
                     onChange={(e) => {
                        setLocalFim(e.target.value);
                        props.onDataFimChange(e.target.value);
                     }}
                     onBlur={(e) => {
                        const efetivo = props.onDataFimConfirm(e.target.value);
                        campoComFoco.current = null;
                        setLocalIni(efetivo.data_ini);
                        setLocalFim(efetivo.data_fim);
                     }}
                  />
               </div>
            </div>
         </div>

         {/* Divisor vertical: só no desktop, entre as datas e os chips. */}
         <span
            aria-hidden
            className="hidden h-[30px] w-px bg-slate-200 lg:block"
         />

         {/* Abaixo de `lg` os chips ficam numa linha só com rolagem
             horizontal, sem barra visível (`scrollbar-width`/
             `::-webkit-scrollbar`); entre `lg` e ~1280 quebram para uma
             segunda linha se não couberem (`lg:flex-wrap`). A máscara de
             esmaecimento na borda direita (só abaixo de `lg`) avisa que há
             mais chips fora da vista; ela some quando a rolagem já chegou
             ao fim ou quando o conjunto nem estoura (`noFim`). Sem espelho
             à esquerda por YAGNI — o início da lista sempre está visível de
             cara. */}
         <div
            ref={chipsRef}
            role="group"
            aria-label="Aeronave"
            onScroll={atualizarNoFim}
            className={clsx(
               // `py-1 -my-1 pl-1 -ml-1` compensam o corte do
               // `overflow-x-auto`: sem essa folga, o anel de foco
               // (`outline-offset-2`) do primeiro/último chip ficava cortado
               // pela borda de rolagem. A folga soma zero à altura/posição
               // visível (o padding positivo e a margem negativa se
               // cancelam).
               "-my-1 -ml-1 flex w-full min-w-0 [scrollbar-width:none] flex-nowrap items-center gap-1.5 overflow-x-auto py-1 pl-1 lg:w-auto lg:flex-1 lg:flex-wrap lg:[mask-image:none]",
               "[&::-webkit-scrollbar]:hidden",
               !noFim &&
                  "[mask-image:linear-gradient(to_right,black_calc(100%-24px),transparent)]"
            )}
         >
            <button
               type="button"
               aria-pressed={!props.anv}
               aria-label={`Todas as aeronaves, ${props.total} ${props.total === 1 ? "relatório" : "relatórios"}`}
               className={chip(!props.anv)}
               onClick={() => props.onAnv(undefined)}
            >
               Todas{" "}
               <span className={contador(!props.anv, props.total)}>
                  {props.total}
               </span>
            </button>
            {comRelatorio.map((anv) => {
               const n = props.contagem?.[anv] ?? 0;
               const ativo = props.anv === anv;
               return (
                  <button
                     key={anv}
                     type="button"
                     aria-pressed={ativo}
                     aria-label={`${anv}, ${n} ${n === 1 ? "relatório" : "relatórios"}`}
                     className={chip(ativo)}
                     onClick={() => props.onAnv(anv)}
                  >
                     <span className="font-mono">{anv}</span>
                     <span className={contador(ativo, n)}>{n}</span>
                  </button>
               );
            })}
            {semRelatorio.length > 0 && (
               <>
                  <span className="shrink-0 text-[11px] text-slate-500">
                     sem relatório:
                  </span>
                  {semRelatorio.map((anv) => (
                     <button
                        key={anv}
                        type="button"
                        disabled
                        title="Sem relatório no período"
                        aria-label={`${anv}, sem relatório no período`}
                        className="inline-flex min-h-[28px] shrink-0 items-center gap-1.5 rounded-full border border-dashed border-slate-300 bg-white px-3 text-xs font-normal text-slate-400"
                     >
                        <span className="font-mono">{anv}</span>
                     </button>
                  ))}
               </>
            )}
         </div>
      </div>
   );
}
