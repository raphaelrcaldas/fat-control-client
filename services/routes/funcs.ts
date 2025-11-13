// Tipos para funções
export type FuncType = 'pil' | 'mc' | 'lm' | 'oe' | 'os' | 'tf' | 'ml' | 'md';
export type OperType = 'ba' | 'op' | 'in' | 'al';
export type ProjType = 'kc-390';

export interface CrewFunc {
    id?: number
    trip_id?: number
    func: FuncType
    oper: OperType
    proj: ProjType
    data_op: string | null
}

export interface CreateCrewFunc {
    func: FuncType
    oper: OperType
    proj: ProjType
    data_op: string | null
}