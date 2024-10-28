"use client";

import { Table } from "flowbite-react";
import { useState, useEffect } from "react";
import { getUsersAPI } from "../../../../services/api/users";
import { UserRegister, UserDetail } from "./components/userForm";
import { BadgeUAE } from "../components/badges";


function UsersPage() {
    const [usuarios, setUsuarios] = useState([]);

    function updateListUsers() {
        getUsersAPI()
            .then(res => res.json())
            .then(users => { setUsuarios(users.data) })
    }

    useEffect(() => { updateListUsers() }, [])

    return (
        <>
            <div className="flex mb-4 gap-16">
                <h2>Usuários</h2>
                <div className="flex flex-row gap-8">
                    <UserRegister afterAdd={updateListUsers} />
                </div>
            </div>

            <div className="overflow-x-auto relative shadow-md sm:rounded-lg max-w-6xl">
                <Table hoverable>
                    <Table.Head className="text-sm">
                        <Table.HeadCell className="text-center">P/G</Table.HeadCell>
                        <Table.HeadCell className="text-center">Especialidade</Table.HeadCell>
                        <Table.HeadCell>Nome de Guerra</Table.HeadCell>
                        <Table.HeadCell>Nome Completo</Table.HeadCell>
                        <Table.HeadCell className="text-center">Unidade</Table.HeadCell>
                        <Table.HeadCell>
                            <span className="sr-only">Detalhes</span>
                        </Table.HeadCell>
                    </Table.Head>
                    <Table.Body>
                        {
                            usuarios.map((user) => {
                                return (
                                    <Table.Row key={user.id} className="bg-white uppercase text-base">
                                        <Table.Cell className="text-center font-medium text-gray-900 dark:text-white">
                                            {user.p_g}
                                        </Table.Cell>
                                        <Table.Cell className="text-center">
                                            {user.esp}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {user.nome_guerra}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {user.nome_completo}
                                        </Table.Cell>
                                        <Table.Cell className="grid justify-center">
                                            <BadgeUAE>{user.unidade}</BadgeUAE>
                                        </Table.Cell>
                                        <Table.Cell className="py-2">
                                            <UserDetail user_id={user.id} />
                                        </Table.Cell>
                                    </Table.Row>
                                )
                            })
                        }
                    </Table.Body>
                </Table>
            </div>
        </>
    )
}

export default UsersPage;