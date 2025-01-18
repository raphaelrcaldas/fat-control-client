"use client";

import { useEffect, useState } from "react";
import { Table, Button, TableRow } from "flowbite-react";
import { SelectFuncao } from "../components/inputForm";
import { IndispBtn } from "./components/indispComp";

const indispsFake = [
    {
        id: 1,
        trigrama: 'hug',
        user: {
            p_g: '1S',
            nome_guerra: 'Hugo'
        },
        info: {
            ult_voo: '2024-12-11',
            cemal: '2025-01-25'
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

function genDates(dateRefer) {
    const offset = -3;
    const days = Array(31).fill().map((_, i) => {
        const yearUTC = dateRefer.getUTCFullYear();
        const mounthUTC = dateRefer.getUTCMonth();
        const dayUTC = dateRefer.getUTCDate();

        return new Date(yearUTC, mounthUTC, (dayUTC + i + offset));
    })

    return days;
}

export default function IndispPage() {
    const dateNow = new Date();

    const [filterFunc, setFilterFunc] = useState('');
    const [dateRef, setDateRef] = useState(dateNow);
    const [datesArray, setDatesArray] = useState(genDates(dateRef));

    const changeDateRef = (day, month) => {
        const dateCopy = new Date(dateRef.getTime())

        if (day) {
            const prevDay = dateCopy.getDate();
            dateCopy.setDate(prevDay + day);
        }

        if (month) {
            const prevMonth = dateCopy.getMonth();
            dateCopy.setMonth(prevMonth + month);
        }

        setDateRef(dateCopy);
    }

    useEffect(() => {
        const newDates = genDates(dateRef);
        setDatesArray(newDates);
    }, [dateRef]);

    return (
        <>
            <h2>Indisponibilidades</h2>
            {/* <div className="w-28 mt-6">
                <SelectFuncao
                    value={filterFunc}
                    callFunc={setFilterFunc}
                />
            </div> */}
            <div className="grid justify-center">
                <div className="gap-3 flex m-1 text-center font-semibold">
                    <Button className="p-0" color="light" size="sm" onClick={() => changeDateRef(null, -1)}>
                        <span className="text-lg">{"<<"}</span>
                    </Button>
                    <Button className="p-0" color="light" size="sm" onClick={() => changeDateRef(-1)}>
                        <span className="text-lg">{"<"}</span>
                    </Button>
                    <span className="text-lg content-center">
                        {
                            dateRef.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: "long",
                                year: "numeric"
                            })
                        }
                    </span>
                    <Button className="p-0" color="light" size="sm" onClick={() => changeDateRef(1)}>
                        <span className="text-lg">{">"}</span>
                    </Button>
                    <Button className="p-0" color="light" size="sm" onClick={() => changeDateRef(null, 1)}>
                        <span className="text-lg">{">>"}</span>
                    </Button>
                </div>
            </div>
            <div className="grid justify-center">
                <Button color="light" size="sm" onClick={() => setDateRef(new Date())}>
                    Hoje
                </Button>
            </div>
            <div className="overflow-auto h-full">
                <Table>
                    <Table.Head>
                        <Table.HeadCell />
                        {
                            datesArray.map((dayR, index) => {
                                let bold;
                                if (dayR.getDay() != 0 && dayR.getDay() != 6) {
                                    bold = 'font-normal';
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
                        <Table.HeadCell />
                        {
                            datesArray.map((dayR, index) => {
                                // const dateStr = day.toISOString().split('T')[0];
                                const options = {
                                    month: '2-digit',
                                    day: '2-digit',
                                }
                                const dateStr = dayR.toLocaleDateString('pt-BR', options);

                                let color;

                                if (dayR.getDay() == 0 || dayR.getDay() == 6) {
                                    color = 'bg-red-400';
                                }

                                if (dayR.valueOf() < dateNow.valueOf()) {
                                    color = 'bg-gray-400';
                                }

                                if (dayR.getDate() == dateNow.getDate() && dayR.getMonth() == dateNow.getMonth()) {
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
                                        <Table.Cell className="grid p-px justify-center">
                                            <Button
                                                color={'light'}
                                                // onClick={handleOpenModal}
                                                className="uppercase h-10 text-sm font-medium"
                                            // size={'sm'}
                                            >
                                                {crew.trigrama}
                                            </Button>
                                        </Table.Cell>
                                        {
                                            datesArray.map((dayR, index) => {
                                                return (
                                                    <Table.Cell key={index} className="p-px">
                                                        <IndispBtn
                                                            dateRef={dayR}
                                                            trip={crew}
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
