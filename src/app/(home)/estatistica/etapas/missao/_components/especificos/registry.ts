import type { ComponentType } from "react";

import { HvyCdsBlock } from "./HvyCdsBlock";
import { PqdBlock } from "./PqdBlock";
import { RevoBlock } from "./RevoBlock";
import { TalBlock } from "./TalBlock";
import type { EspecificoBlockProps } from "./types";

export const ESPECIFICOS_REGISTRY: Record<
   string,
   ComponentType<EspecificoBlockProps>
> = {
   PQD: PqdBlock,
   REVO: RevoBlock,
   HVY: HvyCdsBlock,
   CDS: HvyCdsBlock,
   TAL: TalBlock,
};
