"use client";
import { useState } from "react";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
import { QuadsTrip } from "./QuadsTrip";
import { QuadForm } from "./QuadForm";
import { QuadPopover } from "./QuadPopover";
import { CrewQuadRes } from "services/routes/quads";
import { VscAdd } from "react-icons/vsc";

interface CrewRowProps {
   tripQuadRes: CrewQuadRes;
   /** Posição na grade — alimenta o atraso da entrada escalonada. */
   index: number;
   groupName: string;
   typeName: string;
}

export function CrewRow({
   tripQuadRes,
   index,
   groupName,
   typeName,
}: CrewRowProps) {
   const [showForm, setShowForm] = useState(false);

   return (
      <div
         /* Escalona a entrada: a grade se monta de cima para baixo em vez de
            aparecer inteira num quadro só. O teto do atraso mora no utilitário
            (`global.css`), então grade longa não vira espera. É o mesmo
            movimento das listas do portal do tripulante. */
         style={{ "--i": index } as React.CSSProperties}
         /* `min-w-max` é o que faz o trigrama grudado à esquerda funcionar
            de verdade. A linha é filha de um flex-col, então ela nascia com a
            largura do CONTÊINER (381px no celular) enquanto o conteúdo rolava
            2164px: o `sticky left-0` prendia o trigrama dentro de uma caixa de
            381px e, passados esses pixels, ele saía de cena junto com a linha
            — a 600px de rolagem estava em x=-288, fora da tela. Com a largura
            do conteúdo, ele acompanha a linha até o último quadrinho, como no
            portal do tripulante. */
         className="animate-enter flex min-w-max items-center justify-start gap-1 px-1 py-0.5"
      >
         {/* `overflow-visible` saiu daqui e do contêiner acima: existia para o
             selo de contagem escapar pela quina do botão, e ele nem escapava —
             quem clipava era o `overflow-y-auto` da área rolável, dois níveis
             acima. Na primeira linha da grade o selo aparecia cortado. A
             contagem agora mora DENTRO do botão. */}
         <div className="sticky left-0 z-10 shrink-0 bg-white px-1">
            <QuadsTrip
               trip={tripQuadRes.trip}
               totalQuads={tripQuadRes.quads_len}
               groupName={groupName}
               typeName={typeName}
            />
         </div>
         {tripQuadRes.quads.map((quad) => {
            return <QuadPopover key={quad.id} quad={quad} />;
         })}
         <PermBased resource={"ops.quadrinhos"} requiredPerm={"create"}>
            <button
               type="button"
               aria-label={`Adicionar quadrinho de ${tripQuadRes.trip.trig}`}
               className="grid shrink-0 cursor-pointer place-items-center rounded p-1 hover:bg-slate-100 pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]"
               onClick={() => setShowForm(true)}
            >
               <VscAdd className="size-6" />
            </button>
         </PermBased>

         <QuadForm
            show={showForm}
            setShow={setShowForm}
            trip={tripQuadRes.trip}
         />
      </div>
   );
}
