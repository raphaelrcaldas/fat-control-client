"use client";

import DefaultDatePicker from "../../components/defaultDatePicker"
import MessageModal from "../../components/messageModal";
import { Button, Label, Modal, TextInput, Select } from "flowbite-react";
import { useState } from "react";
import { HiMail } from "react-icons/hi";
import { addUserAPI } from "../../../../../services/api/users";
import pgs from "../../../../../public/infoFAB/infoPGs";
import { validateNoNumber, validateOnlyNumber, cleanText } from "../../../../../utils/textFormat";


export default function UserRegister({ action }) {
  const [openModal, setOpenModal] = useState(false);

  const [messageModal, setMessageModal] = useState(false);
  const [msgToModal, setMsgToModal] = useState('');
  const [typeMsgModal, setTypeMsgModal] = useState('success');

  const [postoGrad, setPostoGrad] = useState('');
  const [esp, setEsp] = useState('');
  const [nomeGuerra, setNomeGuerra] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [unidade, setUnidade] = useState('');
  const [saram, setSaram] = useState('');
  const [idfab, setIdfab] = useState('');
  const [cpf, setCPF] = useState('');

  const [emailPes, setEmailPes] = useState('');
  const [emailFAB, setEmailFAB] = useState('');
  const [nasc, setNasc] = useState(null);
  const [promo, setPromo] = useState(null);

  function cleanModal() {
    setPostoGrad('');
    setEsp('');
    setNomeGuerra('');
    setNomeCompleto('');
    setUnidade('');
    setSaram('');
    setIdfab('');
    setCPF('');
    setEmailFAB('');
    setEmailPes('');
    setNasc('');
    setPromo('');
  }

  function onCloseModal() {
    cleanModal();
    setOpenModal(false);
  }

  async function onAddUser(event) {
    event.preventDefault()

    // chamar spinner
    const user = {
      p_g: postoGrad, // obrigatório
      nome_guerra: cleanText(nomeGuerra), // obrigatório
      nome_completo: cleanText(nomeCompleto),
      esp: esp,
      id_fab: idfab ? idfab : null, // API só aceita INT ou None
      saram: parseInt(saram), // obrigatório - API só aceita INT
      cpf: cpf,
      ult_promo: promo ? promo : null,
      nasc: nasc ? nasc : null,
      email_pess: emailPes.trim(),
      email_fab: emailFAB.trim(),
      unidade: unidade // obrigatório
    }

    const response = await addUserAPI(user);
    const dataRes = await response.json();

    if (response.ok) {
      setTypeMsgModal('success');
      setMsgToModal("Adicionado com sucesso");
      action.addUserToTable(dataRes);
      cleanModal();
    } else {
      setMsgToModal(dataRes.detail);
      setTypeMsgModal('failure')
    }

    // encerrar spinner
    setMessageModal(true);
  }


  return (
    <>
      <Button color="blue" onClick={() => setOpenModal(true)}>
        Adicionar
      </Button>

      <Modal show={openModal} size="lg" onClose={onCloseModal} popup>
        <Modal.Header />
        <Modal.Body>
          <form onSubmit={(e) => onAddUser(e)}>
            <div className="space-y-6">
              <h3 className="text-xl font-medium text-center text-gray-900 dark:text-white">Adicionar Usuário</h3>

              <div className="flex justify-between">
                <div className="max-w-md">
                  <div className="mb-2 block text-center">
                    <Label htmlFor="posto_grad" value="P/G" />
                  </div>
                  <Select id="posto_grad" onChange={(event) => setPostoGrad(event.target.value)} value={postoGrad} required>
                    <option disabled value={""}></option>
                    {Object.entries(pgs).map(([key, obj], index) =>
                      <option key={index} value={key}>{obj.pg.mid}</option>
                    )}
                  </Select>
                </div>

                <div className="max-w-md w-24">
                  <div className="mb-2 block text-center">
                    <Label htmlFor="especialidade" value="Especialidade" />
                  </div>
                  <TextInput
                    id="especialidade"
                    maxLength="5"
                    value={esp}
                    onChange={(event) => setEsp(event.target.value)}
                  />
                </div>

                <div className="max-w-md">
                  <div className="mb-2 block text-center">
                    <Label htmlFor="nome_guerra" value="Nome de Guerra" />
                  </div>
                  <TextInput
                    autoComplete="off"
                    id="nome_guerra"
                    type="text"
                    sizing="md"
                    onChange={(event) => setNomeGuerra(event.target.value)}
                    value={nomeGuerra}
                    required
                    onKeyPress={(event) => validateNoNumber(event)}
                  />
                </div>

              </div>

              <div className="flex justify-between">
                <div className="w-72">
                  <div className="mb-2 block text-center">
                    <Label htmlFor="nome-completo" value="Nome completo" />
                  </div>
                  <TextInput
                    id="nome-completo"
                    value={nomeCompleto}
                    onChange={(event) => setNomeCompleto(event.target.value)}
                    autoComplete="off"
                    onKeyPress={(event) => validateNoNumber(event)}
                  />
                </div>

                <div>
                  <div className="max-w-md">
                    <div className="mb-2 block text-center">
                      <Label htmlFor="unidade" value="Unidade" />
                    </div>
                    <Select id="unidade" required onChange={(event) => setUnidade(event.target.value)} value={unidade}>
                      <option disabled value={""}></option>
                      <option value="11gt">1º/1º GT</option>
                      <option value="12gt">1º/2º GT</option>
                      <option value="22gt">2º/2º GT</option>
                      <option value="bagl">BAGL</option>
                      <option value="glog">GLOG</option>
                      <option value="gsdgl">GSD-GL</option>
                    </Select>
                  </div>
                </div>


              </div>

              <div className="flex justify-between">
                <div>
                  <label htmlFor="saram" className="text-center block mb-2 text-sm font-medium text-gray-900 dark:text-white">SARAM</label>
                  <TextInput
                    autoComplete="off"
                    required
                    type="text"
                    inputMode="numeric"
                    id="saram"
                    className="w-28"
                    maxLength="7"
                    minLength="7"
                    value={saram}
                    onChange={(event) => setSaram(event.target.value)}
                    onKeyPress={(event) => validateOnlyNumber(event)}
                  />
                </div>

                <div>
                  <label htmlFor="id_fab" className="text-center block mb-2 text-sm font-medium text-gray-900 dark:text-white">ID FAB</label>
                  <TextInput
                    autoComplete="off"
                    id="id_fab"
                    className="w-28"
                    maxLength="6"
                    minLength="6"
                    value={idfab}
                    onChange={(event) => setIdfab(event.target.value)}
                    onKeyPress={(event) => { validateOnlyNumber(event) }}
                  />
                </div>

                <div>
                  <label htmlFor="cpf" className="text-center block mb-2 text-sm font-medium text-gray-900 dark:text-white">CPF</label>
                  <TextInput
                    autoComplete="off"
                    id="cpf"
                    className="w-40"
                    maxLength="11"
                    minLength="11"
                    value={cpf}
                    onChange={(event) => setCPF(event.target.value)}
                    onKeyPress={(event) => { validateOnlyNumber(event) }}
                  />
                </div>

              </div>

              <div className="flex justify-between">
                <div className="w-52">
                  <div className="mb-2 block text-center">
                    <Label htmlFor="emailFAB" value="Zimbra" />
                  </div>
                  <TextInput
                    id="emailFAB"
                    autoComplete="off"
                    type="email"
                    placeholder="fulano@fab.mil.br"
                    value={emailFAB}
                    icon={HiMail}
                    onChange={(event) => setEmailFAB(event.target.value)}
                  />
                </div>
                <div className="w-52">
                  <div className="mb-2 block text-center">
                    <Label htmlFor="emailPes" value="Email particular" />
                  </div>
                  <TextInput
                    id="emailPes"
                    type="email"
                    autoComplete="off"
                    placeholder="fulano@exemplo.com"
                    value={emailPes}
                    icon={HiMail}
                    onChange={(event) => setEmailPes(event.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <div className="w-52">
                  <div className="mb-2 block text-center">
                    <Label htmlFor="nascimento" value="Data de Nascimento" />
                  </div>
                  <DefaultDatePicker id="nascimento" setParent={setNasc} />
                </div>

                <div className="w-52">
                  <div className="mb-2 block text-center">
                    <Label htmlFor="ult_promo" value="Última Promoção" />
                  </div>
                  <DefaultDatePicker id="ult_promo" setParent={setPromo} />
                </div>
              </div>

              <div className="flex justify-center">
                <Button type="submit" color="blue" className="w-52">Adicionar</Button>
              </div>
            </div>

          </form>

        </Modal.Body>

        <MessageModal active={messageModal} callFunc={setMessageModal} msg={msgToModal} typeMsg={typeMsgModal} />

      </Modal>
    </>
  );
}
