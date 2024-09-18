import { Badge } from "flowbite-react"
import unidades_bagl from "../../../../public/infoFAB/infoOMs"


export default function BadgeUAE({children}) {

    const color = unidades_bagl[children].color

    return (
        <>
            <Badge className="w-fit" color={color} size="sm">
                {unidades_bagl[children].value}
            </Badge>
        </>
    )
}
