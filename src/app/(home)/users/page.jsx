"use client";

import { Table } from "flowbite-react";
import { useState, useEffect } from "react";
import BadgeUAE from "../components/badgeUae";
import pgs from "../../../../public/infoFAB/infoPGs";
import { getUsersAPI } from "../../../../services/api/users";
import UserTableRow from "./components/userTableRow";
import { Skeleton } from "@mui/material";
import UserRegister from "./components/userRegister";
import UserEdit from "./components/userEdit";

const initUsers = []
for (let i = 0; i < 9; i++) {
    initUsers.push(
        <UserTableRow
            key={i}
            pg={<Skeleton />}
            esp={<Skeleton />}
            guerra={<Skeleton width={100} />}
            completo={<Skeleton width={410} />}
            unidade={<Skeleton width={50} />}
            detalhes={<Skeleton width={50} />}
        />
    )
}

function UsersPage() {
    const [usuarios, setUsuarios] = useState(initUsers);

    useEffect(() => {
        getUsersAPI()
            .then(res => res.json())
            .then(users => {
                const fetchUsers = users.data.map((user) => {
                    return (
                        <UserTableRow
                            key={user.id}
                            pg={pgs[user.p_g].pg.mid}
                            esp={user.esp.toUpperCase()}
                            guerra={user.nome_guerra.toUpperCase()}
                            completo={user.nome_completo.toLocaleUpperCase()}
                            unidade={<BadgeUAE>{user.unidade}</BadgeUAE>}
                            detalhes={<UserEdit user_id={user.id}/>}
                        />
                    )
                })

                setUsuarios(fetchUsers);
            })
    }, [])


    function addUserToTable(user) {
        user = <UserTableRow
            key={user.id}
            pg={pgs[user.p_g].pg.mid}
            esp={user.esp.toUpperCase()}
            guerra={user.nome_guerra.toUpperCase()}
            completo={user.nome_completo.toLocaleUpperCase()}
            unidade={<BadgeUAE>{user.unidade}</BadgeUAE>}
            detalhes={"Detalhes"}
            user_id={user.id}
        />

        setUsuarios([...usuarios, user])
    }


    return (
        <>
            <div className="mb-4">
                <UserRegister action={{ addUserToTable }} />
            </div>

            <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
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
                    <Table.Body className="divide-y" >
                        {usuarios}
                    </Table.Body>
                </Table>
            </div >
        </>
    )
}

export default UsersPage;