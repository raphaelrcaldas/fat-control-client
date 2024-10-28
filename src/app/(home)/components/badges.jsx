import { Badge } from "flowbite-react"
import unidades_bagl from "../../../../public/infoFAB/infoOMs"


export function ActiveBadge(active) {
    console.log(active);
    return (
        <>
            <Badge className="justify-center" color={active ? 'success' : 'failure'}>
                {active ? 'ATIVO' : 'INATIVO'}
            </Badge>
        </>
    )
}


export function FuncBadge({ funcao, oper }) {
    let color;
    switch (funcao) {
        case 'pil':
            color = 'info';
            break;

        case 'mc':
            color = 'success';
            break;

        case 'lm':
            color = 'dark';
            break;

        case 'tf':
            color = 'indigo';
            break;

        case 'os':
            color = 'warning';
            break;

        case 'oe':
            color = 'failure';
            break;
    }

    return (
        <>
            <Badge color={color} className="m-1 justify-center">
                {`${funcao}: ${oper}`}
            </Badge>
        </>
    )
}


export function BadgeUAE({ children }) {

    const color = unidades_bagl[children].color

    return (
        <Badge className="w-fit" color={color} size="sm">
            {unidades_bagl[children].value}
        </Badge>
    )
}
