"use client";

import { useState } from "react";
import { Table, Button, TableRow } from "flowbite-react";
import { SelectFuncao } from "../components/inputForm";
import { IndispBtn } from "./components/indispComp";

const dayRef = new Date();
const offset = -3;

let days = [];
for (let index = 0; index < 24; index++) {
    const newDate = new Date(
        dayRef.getFullYear(),
        dayRef.getMonth(),
        dayRef.getDate() + index + offset,
    );
    days.push(newDate);
}

const indispsFake = [
    {
        id: 1,
        trigrama: 'hug',
        user: {
            p_g: '1S',
            nome_guerra: 'Hugo'
        },
        indisps: [
            {
                mtv: "svc",
                obs: "svc SOA",
                dateStart: '2025-01-16',
                dateEnd: '2025-01-17',
                created_at: '2025-01-15'
            },
            {
                mtv: "pes",
                obs: "consulta",
                dateStart: '2025-01-19',
                dateEnd: '2025-01-21',
                created_at: '2025-01-15'
            },
            {
                mtv: "pes",
                obs: "consulta2",
                dateStart: '2025-01-19',
                dateEnd: '2025-01-21',
                created_at: '2025-01-15'
            },
        ]
    },
]

export default function IndispPage() {
    const [filterFunc, setFilterFunc] = useState('');

    return (
        <>
            <h2>Indisponibilidades</h2>
            <div className="w-28 mt-6">
                <SelectFuncao
                    value={filterFunc}
                    callFunc={setFilterFunc}
                />
            </div>

            <div className="overflow-auto mt-6 h-full">
                <Table hoverable>
                    <Table.Head>
                        <Table.HeadCell></Table.HeadCell>
                        {
                            days.map((dayR, index) => {
                                let bold;
                                if (dayR.getDay() == 0 || dayR.getDay() == 6) {
                                    bold = 'font-bold';
                                }

                                return (
                                    <Table.HeadCell key={index} className={"px-0 text-center " + bold}>
                                        {dayR.toLocaleDateString('pt-BR', { weekday: 'short' })}
                                    </Table.HeadCell>
                                )
                            })
                        }
                    </Table.Head>
                    <Table.Head>
                        <Table.HeadCell></Table.HeadCell>
                        {
                            days.map((dayR, index) => {
                                // const dateStr = day.toISOString().split('T')[0];
                                const options = {
                                    month: '2-digit',
                                    day: '2-digit',
                                }
                                const dateStr = dayR.toLocaleDateString('pt-BR', options);

                                let color;

                                if (dayR.getDay() == 0 || dayR.getDay() == 6) {
                                    color = 'bg-red-300';
                                }

                                if (dayR.valueOf() < dayRef.valueOf()) {
                                    color = 'bg-gray-400';
                                }

                                if (dayR.getDate() == dayRef.getDate()) {
                                    color = 'bg-yellow-200';
                                }

                                return (
                                    <Table.HeadCell key={index} className={"px-0 text-center " + color}>
                                        {dateStr}
                                    </Table.HeadCell>
                                )
                            })
                        }
                    </Table.Head>
                    <Table.Body className="divide-y">
                        {
                            indispsFake.map((crew, index) => {
                                return (
                                    <TableRow key={index}>
                                        <Table.Cell className="p-px text-center">
                                            <Button
                                                color={'light'}
                                                // onClick={handleOpenModal}
                                                className="uppercase h-10 text-sm font-medium"
                                                size={'sm'}
                                            >
                                                {crew.trigrama}
                                            </Button>
                                        </Table.Cell>
                                        {
                                            days.map((dayR, index) => {
                                                return (
                                                    <Table.Cell key={index} className="p-px">
                                                        <IndispBtn
                                                            dateRef={dayR}
                                                            dataIndisp={crew.indisps}
                                                            user={crew.user}
                                                        />
                                                    </Table.Cell>
                                                )
                                            })
                                        }
                                    </TableRow>
                                )
                            })
                        }
                    </Table.Body>
                </Table>
            </div>
        </>
    )
}
