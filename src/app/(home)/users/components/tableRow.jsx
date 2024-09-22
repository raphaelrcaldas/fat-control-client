import { Table } from "flowbite-react"
import { Skeleton } from "@mui/material"
import pgs from "../../../../../public/infoFAB/infoPGs"
import BadgeUAE from "../../components/badgeUae"
import { UserDetail } from "./userForm"
import { QuestionExclude } from "../../components/messageModal"
import { deleteUser } from "../../../../../services/api/users"

function TableRow({ pg, esp, guerra, completo, unidade, detalhes }) {

    return (
        <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800 text-base">
            <Table.Cell className="text-center whitespace-nowrap font-medium text-gray-900 dark:text-white">
                {pg}
            </Table.Cell>
            <Table.Cell className="text-center">
                {esp}
            </Table.Cell>
            <Table.Cell>
                {guerra}
            </Table.Cell>
            <Table.Cell>
                {completo}
            </Table.Cell>
            <Table.Cell className="flex justify-center">
                {unidade}
            </Table.Cell>
            <Table.Cell className="py-2">
                {detalhes}
            </Table.Cell>
        </Table.Row>
    )
}


export function UserRow({ user, callFunc }) {

    async function onDeleteUser() {
        deleteUser(user.id).then(res => res.json())
            .then(data => {
                alert(data.detail);
                callFunc();
            })
    }


    return (
        <TableRow
            key={user.id}
            pg={pgs[user.p_g].pg.mid}
            esp={user.esp.toUpperCase()}
            guerra={user.nome_guerra.toUpperCase()}
            completo={user.nome_completo.toUpperCase()}
            unidade={<BadgeUAE>{user.unidade}</BadgeUAE>}
            detalhes={
                <>
                    <div className="flex gap-2">
                        <UserDetail user_id={user.id} />
                        <QuestionExclude callFunc={onDeleteUser} />
                    </div>
                </>
            }
        />
    )
}


export function SkeletonRow() {
    return (
        <TableRow
            pg={<Skeleton />}
            esp={<Skeleton />}
            guerra={<Skeleton width={100} />}
            completo={<Skeleton width={410} />}
            unidade={<Skeleton width={50} />}
            detalhes={<Skeleton width={50} />}
        />
    )
}