"use client";

import { Button, Table, TextInput } from "flowbite-react";
import { useState, useEffect } from "react";
import { getUsersAPI } from "../../../../services/api/users";
import { UserRegister } from "./components/userForm";
import { BadgeUAE } from "../components/badges";
import { IoSearchSharp } from "react-icons/io5";

export default function UsersPage() {
    const [usuarios, setUsuarios] = useState([]);
    const [filterUsers, setFilterUsers] = useState([]);
    const [filterName, setFilterName] = useState("");

    function updateListUsers() {
        getUsersAPI()
            .then(res => res.json())
            .then(users => {
                users.sort(function (a, b) {
                    if (a.nome_guerra > b.nome_guerra) {
                        return 1;
                    }
                    if (a.nome_guerra < b.nome_guerra) {
                        return -1;
                    }
                    return 0;
                });

                setUsuarios(users);
                setFilterUsers(users);
            })
    }


    function filters() {
        // FILTRO NOME
        const filter = usuarios.filter(user => {
            const inputFilter = filterName.toLowerCase()
            const checkCompleto = user.nome_completo.includes(inputFilter);
            const checkGuerra = user.nome_guerra.includes(inputFilter);

            return checkCompleto || checkGuerra;
        })

        setFilterUsers(filter);
    }

    useEffect(() => { updateListUsers() }, [])

    return (
        <>
            <h2>Usuários</h2>
            <div className="max-w-6xl">
                <div className="my-4 flex justify-between">
                    <div className="flex gap-2">
                        <TextInput
                            className="w-80"
                            placeholder="Search for User"
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                        />
                        <Button className="w-12" onClick={filters}>
                            <IoSearchSharp className="h-5 w-5" />
                        </Button>
                    </div>
                    <div>
                        <UserRegister
                            user_id={null}
                            updateUsers={updateListUsers}
                        />
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
                                filterUsers.map((user) => {
                                    return (
                                        <Table.Row key={user.id} className="bg-white uppercase text-base">
                                            <Table.Cell className="text-center font-medium text-gray-900">
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
                                            <Table.Cell className="justify-items-center">
                                                <BadgeUAE>{user.unidade}</BadgeUAE>
                                            </Table.Cell>
                                            <Table.Cell className="justify-items-center">
                                                <UserRegister
                                                    readOnly={false}
                                                    user_id={user.id}
                                                    updateUsers={updateListUsers}
                                                />
                                            </Table.Cell>
                                        </Table.Row>
                                    )
                                })
                            }
                        </Table.Body>
                    </Table>
                </div>
            </div>
        </>
    )
}
