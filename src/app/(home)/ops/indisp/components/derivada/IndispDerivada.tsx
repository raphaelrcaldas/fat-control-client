"use client";

import Link from "next/link";
import {
   Button,
   Modal,
   ModalBody,
   ModalFooter,
   ModalHeader,
} from "flowbite-react";
import { HiOutlineExternalLink } from "react-icons/hi";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
import { DERIVED_BARS } from "@/constants/ops/indisponibilidades";
import type { CrewIndisp } from "services/routes/indisps";
import type { RestricaoDerivada } from "services/routes/ops/restricoes";
import { descreverRestricao, origemDaRestricao } from "./derivadaDetalhe";

interface Props {
   trip: CrewIndisp;
   restricao: RestricaoDerivada;
   onClose: () => void;
}

/**
 * Ficha de uma faixa derivada.
 *
 * A faixa derivada não tem registro por trás — é calculada a cada leitura a
 * partir de outra fonte (a operação, o cartão de saúde, a data do último voo).
 * Por isso não abre o formulário: não há o que editar, e o que a pessoa precisa
 * é saber de onde aquilo veio e onde se resolve.
 *
 * São duas frases e um botão, de propósito. A versão anterior repetia o nome do
 * militar e a situação em campos que já estavam no título e na frase, e gastava
 * metade da grade com "não informado" e "em aberto" — três das quatro derivadas
 * têm alguma ponta indefinida.
 */
export function IndispDerivada({ trip, restricao, onClose }: Props) {
   const meta = DERIVED_BARS[restricao.codigo];
   const origem = origemDaRestricao(restricao);
   const nome = `${trip.user.p_g} ${trip.user.nome_guerra}`.toUpperCase();

   return (
      <Modal show size="md" onClose={onClose} dismissible>
         <ModalHeader as="h2" theme={{ title: "min-w-0" }}>
            <span className="truncate text-base font-bold text-slate-800">
               {restricao.rotulo ?? meta.label}
            </span>
         </ModalHeader>

         <ModalBody className="space-y-3">
            <p className="text-sm leading-relaxed text-slate-700">
               {descreverRestricao(restricao, nome)}
            </p>
            <p className="text-sm leading-relaxed text-slate-500">
               {origem.comoResolver}
            </p>
         </ModalBody>

         <ModalFooter className="justify-end">
            {origem.href && (
               <PermBased resource={origem.resource} requiredPerm={origem.perm}>
                  <Button
                     color="primary"
                     size="sm"
                     as={Link}
                     href={origem.href}
                     className="gap-1.5"
                  >
                     {origem.acao}
                     <HiOutlineExternalLink aria-hidden className="h-4 w-4" />
                  </Button>
               </PermBased>
            )}
            <Button color="light" size="sm" onClick={onClose}>
               Fechar
            </Button>
         </ModalFooter>
      </Modal>
   );
}
