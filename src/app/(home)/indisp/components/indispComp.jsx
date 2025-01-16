import { Button, Popover } from "flowbite-react"

function colorIndisp(dataIndisp) {
    const filterSVC = dataIndisp.filter(indisp => indisp.mtv == 'svc');
    if (filterSVC.length > 0) {
        return 'warning';
    }

    const filterPES = dataIndisp.filter(indisp => indisp.mtv == 'pes');
    if (filterPES.length > 0) {
        return 'blue';
    }
}


export function IndispBtn({ dataIndisp, dateRef, user }) {
    const filterIndisp = dataIndisp.filter(indisp => {
        const [startYear, startMonth, startDay] = indisp.dateStart.split('-');
        const dateStart = new Date(startYear, startMonth - 1, startDay);

        const [endYear, endMonth, endDay] = indisp.dateEnd.split('-');
        const dateEnd = new Date(endYear, endMonth - 1, endDay);

        return dateRef.valueOf() >= dateStart.valueOf() && dateRef.valueOf() <= dateEnd.valueOf();
    }); // filterIndisp

    if (filterIndisp.length == 0) {
        return (
            <Button className="h-10 bg-green-600 w-full">
                {" "}
            </Button>
        )
    } else {
        const popoverContent = (
            <div className="w-64 text-sm text-gray-500">
                <div className="border-b border-gray-200 bg-gray-100 px-3 py-2">
                    <h3 className="text-center font-semibold uppercase text-gray-900">
                        {`${user.p_g} ${user.nome_guerra}`}
                    </h3>
                </div>
                {
                    filterIndisp.map((indisp, index) => {
                        return (
                            <div key={index} className="px-3 py-2">
                                <p className="uppercase font-semibold">{indisp.mtv}</p>
                                <p>{indisp.obs}</p>
                                <p>{indisp.created_at}</p>
                            </div>
                        )
                    })
                }
            </div>
        );

        return (
            <Popover content={popoverContent} trigger="hover" placement="right">
                <Button color={colorIndisp(filterIndisp)} className="h-10 w-full">
                    {" "}
                </Button>
            </Popover>
        )
    }
}