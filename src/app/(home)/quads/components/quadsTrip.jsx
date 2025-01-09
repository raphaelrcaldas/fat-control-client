"use client";

import { Button, Modal, Table } from "flowbite-react";
import { useState } from "react";

export function QuadsTrip({ trip }) {
    const [openModal, setOpenModal] = useState(false);

    const themeTable = {
        root: {
            base: "w-full text-base text-gray-500 uppercase text-center",
            shadow: "absolute left-0 top-0 -z-10 h-full w-full rounded-lg bg-white shadow-md",
            wrapper: "relative"
        },
        body: {
            base: "group/body",
            cell: {
                base: "px-0.5 py-2 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg"
            }
        },
        head: {
            base: "group/head text-xs text-gray-700 dark:text-gray-400",
            cell: {
                base: "bg-gray-200 px-6 py-3 group-first/head:first:rounded-tl-lg group-first/head:last:rounded-tr-lg dark:bg-gray-700"
            }
        },
        row: {
            base: "group/row bg-white hover:font-semibold",
            hovered: "hover:bg-gray-50",
            striped: "odd:bg-white even:bg-gray-50"
        }
    }

    // const sortedQuads = func.quads.sort((a, b) => b.value - a.value)

    return (
        <>
            <Button
                color={'light'}
                onClick={() => setOpenModal(true)}
                className="w-14 uppercase"
                size={'sm'}>
                {trip.trig}
            </Button>

            <Modal show={openModal} size="md" onClose={() => setOpenModal(false)} popup>
                <Modal.Header>Quadrinhos</Modal.Header>
                <Modal.Body>
                    <div className="m-4 text-base uppercase text-center">
                        <h2>{trip.trig}</h2>
                        <h3 className="font-semibold">
                            {`${trip.user.p_g} ${trip.user.esp} ${trip.user.nome_guerra}`}
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <Table theme={themeTable} hoverable>
                            <Table.Head>
                                <Table.HeadCell>ID</Table.HeadCell>
                                <Table.HeadCell>DATA</Table.HeadCell>
                                <Table.HeadCell>
                                    <span className="sr-only">Edit</span>
                                </Table.HeadCell>
                            </Table.Head>
                            <Table.Body>
                                {/* {
                                    sortedQuads.map(quad => {
                                        const dateStr = quad.value > 0 ? new Date(quad.value).toLocaleDateString('pt-br') : "LASTRO";

                                        return (
                                            <Table.Row key={quad.id}>
                                                <Table.Cell>
                                                    {quad.id}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {dateStr}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    Edit
                                                </Table.Cell>
                                            </Table.Row>
                                        )
                                    })
                                } */}
                            </Table.Body>
                        </Table>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}