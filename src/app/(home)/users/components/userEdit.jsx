"use client";

import { Label, Modal, TextInput, Select } from "flowbite-react";
import { useState } from "react";
import { Button } from "@mui/material";
import { getUserById } from "../../../../../services/api/users";
import pgs from "../../../../../public/infoFAB/infoPGs";
import unidades_bagl from "../../../../../public/infoFAB/infoOMs";


export default function UserEdit({ user_id }) {
  const [show, setShowModal] = useState(false);
  const [user, setUser] = useState(user_id);

  const [postoGrad, setPostoGrad] = useState('');
  const [esp, setEsp] = useState('');
  const [nomeGuerra, setNomeGuerra] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [unidade, setUnidade] = useState('');
  const [saram, setSaram] = useState('');
  const [idFAB, setIdFAB] = useState('');
  const [cpf, setCPF] = useState('');
  const [zimbra, setZimbra] = useState('');
  const [email, setEmail] = useState('');
  const [nasc, setNasc] = useState('');
  const [promo, setPromo] = useState('');

  function onOpenDetail() {
    getUserById(user).then(res => res.json())
      .then(data => {
        console.log(data)
        setPostoGrad(data.p_g)
        setEsp(data.esp)
        setNomeGuerra(data.nome_guerra)
        setNomeCompleto(data.nome_completo)
        setUnidade(data.unidade)
        setSaram(data.saram)
        setIdFAB(data.id_fab)
        setCPF(data.cpf)
        setZimbra(data.email_fab)
        setEmail(data.email_pess)
        setNasc(data.nasc)
        setPromo(data.ult_promo)

        setShowModal(true)
      }
      );
  }


  return (
    <>
      <Button variant="text" color={"gray"} onClick={onOpenDetail}>Detalhes</Button>


      {
        show &&
        <Modal show={show} size="lg" onClose={() => setShowModal(false)} popup>
          <Modal.Header />
          <Modal.Body>
            <div className="space-y-6">
              <h3 className="text-xl font-medium text-center text-gray-900 dark:text-white">Informações do Usuário</h3>

              <div className="flex justify-between">
                <div className="max-w-md">
                  <div className="mb-2 block text-center">
                    <Label value="P/G" />
                  </div>
                  <div>{pgs[postoGrad].pg.mid}</div>
                </div>

                <div className="max-w-md">
                  <div className="mb-2 block text-center">
                    <Label htmlFor="especialidade" value="Especialidade" />
                  </div>
                  <div className="text-center">{esp ? esp.toUpperCase() : "NIL"}</div>
                </div>

                <div className="max-w-md">
                  <div className="mb-2 block text-center">
                    <Label htmlFor="nome_guerra" value="Nome de Guerra" />
                  </div>
                  <div className="text-center">{nomeGuerra.toUpperCase()}</div>
                </div>

              </div>

              <div className="flex justify-between">
                <div className="w-72">
                  <div className="mb-2 block text-center">
                    <Label htmlFor="nome-completo" value="Nome completo" />
                  </div>
                  <div className="text-center">{nomeCompleto ? nomeCompleto.toUpperCase() : "NIL"}</div>
                </div>

                <div className="max-w-md w-28">
                  <div className="mb-2 block text-center">
                    <Label htmlFor="unidade" value="Unidade" />
                  </div>
                  <div className="text-center">{unidades_bagl[unidade].value}</div>
                </div>
              </div>

              <div className="flex justify-between">
                <div className="w-28">
                  <label htmlFor="saram" className="text-center block mb-2 text-sm font-medium text-gray-900 dark:text-white">SARAM</label>
                  <div className="text-center">{saram}</div>
                </div>

                <div className="w-28">
                  <label htmlFor="id_fab" className="text-center block mb-2 text-sm font-medium text-gray-900 dark:text-white">ID FAB</label>
                  <div className="text-center">{idFAB ? idFAB : "NIL"}</div>
                </div>

                <div className="w-40">
                  <label htmlFor="cpf" className="text-center block mb-2 text-sm font-medium text-gray-900 dark:text-white">CPF</label>
                  <div className="text-center">{cpf ? cpf : "NIL"}</div>
                </div>
              </div>

              <div className="flex justify-between">
                <div className="w-52">
                  <div className="mb-2 block text-center">
                    <Label htmlFor="emailFAB" value="Zimbra" />
                  </div>
                  <div className="text-center">{zimbra ? zimbra : "NIL"}</div>
                </div>
                <div className="w-52">
                  <div className="mb-2 block text-center">
                    <Label htmlFor="emailPes" value="Email particular" />
                  </div>
                  <div className="text-center">{email ? email : "NIL"}</div>

                </div>
              </div>

              <div className="flex justify-between">
                <div className="w-52">
                  <div className="mb-2 block text-center">
                    <Label htmlFor="nascimento" value="Data de Nascimento" />
                  </div>
                  <div className="text-center">{nasc ? nasc : "NIL"}</div>
                </div>

                <div className="w-52">
                  <div className="mb-2 block text-center">
                    <Label htmlFor="ult_promo" value="Última Promoção" />
                  </div>
                  <div className="text-center">{promo ? promo : "NIL"}</div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button variant="contained" color="info" className="w-52">Editar</Button>
              </div>
            </div>

          </Modal.Body>
        </Modal>
      }
    </>
  );
}
