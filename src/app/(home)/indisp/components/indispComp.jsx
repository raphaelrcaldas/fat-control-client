import { Button, Popover } from "flowbite-react"
import { dateIsIn, isoDateToString, isoStrToDate } from "../../../../../utils/dateHandler"

function colorBtn(dataIndisp, cemal, dasadaptado) {

    // INDISPNIBILIDADES
    const filterSVC = dataIndisp.filter(indisp => indisp.mtv == 'svc');
    if (filterSVC.length > 0) {
        return 'warning';
    }

    const filterPES = dataIndisp.filter(indisp => indisp.mtv == 'pes');
    if (filterPES.length > 0) {
        return 'blue';
    }

    // INFORMAÇÕES

    if (!cemal) {
        return 'purple';
    }

    if (dasadaptado) {
        return 'dark';
    }


    return 'success';
}

function MtvDIV({ Children }) {
    return (
        <div className="bg-gray-100 m-2 px-3 py-2 rounded-lg">
            {Children}
        </div>
    )
}


export function IndispBtn({ dateRef, trip }) {
    // FILTRA INDISP QUE ESTEJA DENTRO DA DATA REFERENTE
    const filterIndisp = trip.indisps.filter(
        indisp => dateIsIn(dateRef, indisp.dateStart, indisp.dateEnd)
    );

    const isDisp = filterIndisp.length == 0;
    const isValidCEMAL = isoStrToDate(trip.info.cemal).valueOf() >= dateRef.valueOf();
    const isDesadaptado = (dateRef.valueOf() - isoStrToDate(trip.info.ult_voo).valueOf()) >= 3888000000;
    // 3888000000 = 45 dias

    const btnIndisp = (
        <Button
            fullSized
            color={colorBtn(filterIndisp, isValidCEMAL, isDesadaptado)}
            className="h-10">
            {""}
        </Button>
    )

    if (isDisp && isValidCEMAL && !isDesadaptado) {
        return btnIndisp;
    };

    const popoverContent = (
        <div className="w-64 text-sm text-gray-500">
            <div className="border-b border-gray-200 bg-gray-100 px-3 py-2">
                <h3 className="text-center font-semibold uppercase text-gray-900">
                    {`${trip.user.p_g} ${trip.user.nome_guerra}`}
                </h3>
            </div>
            <h3 className="m-2 font-semibold text-center">{isoDateToString(dateRef)}</h3>
            {
                filterIndisp.map((indisp, index) => {
                    const content = (
                        <>
                            <p className="uppercase font-semibold">{indisp.mtv}</p>
                            <p>{indisp.obs}</p>
                            <p>Criado em: {indisp.created_at}</p>
                        </>
                    )

                    return (
                        <MtvDIV key={index} Children={content} />
                    )
                })
            }

            {
                !isValidCEMAL && (
                    <MtvDIV Children={<p className="uppercase text-red-600 font-semibold">CEMAL INVÁLIDO</p>} />
                )
            }

            {
                isDesadaptado && (
                    <MtvDIV Children={<p className="uppercase text-orange-500 font-semibold">DESADAPTADO</p>} />
                )
            }
        </div>
    );

    return (
        <Popover content={popoverContent} placement="right">
            {btnIndisp}
        </Popover>
    )
}