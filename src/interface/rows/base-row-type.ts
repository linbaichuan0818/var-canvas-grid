import {BaseColumnType,Positon} from "@/interface/columns/base-column-type"
import { Record } from "@/interface/table/base-table-type"
export  interface BaseRowType {
    cols: BaseColumnType[],
    paint(rowOffset?:Positon):void
    addCol(col:BaseColumnType):void
    delCol(index: number):void
    addColData(rowIndex:number,rowData:Record):void
}