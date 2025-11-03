export interface CrewFunc {
    id?: number
    trip_id: number
    func: string
    oper: string
    proj: string
    data_op: string | null
}