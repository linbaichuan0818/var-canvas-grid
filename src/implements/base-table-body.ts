import BaseRows from './base-rows'
import BaseColumn,{CellInfo} from "./base-column";
import { Ctx, Positon} from "@/interface/columns/base-column-type"
export default class BaseTableBody extends BaseRows{
    addCol<T extends BaseColumn>(col: T): void {
        super.addCol(col)
    }
    paint(){
        const {x: tox, y:toy} = this.table.offset 
        const hoy = this.table.tableHeader.height 
        const offset = {x:tox, y:toy + hoy}
        super.paint(offset)// body区域存在行偏移
    }
    repaint(){
        const {x: tox, y:toy} = this.table.offset 
        const offset = {x:tox, y:toy }
        this.checkFirstRowOffset(offset)
        super.repaint(offset)// body区域存在行偏移
    }
    checkFirstRowOffset(offset: Positon){
        let perColfirstRowOffsets:number[] = [];
        this.rowData.forEach((colData ,colIndex)=>{
            let  rowIndex =  0
            const { ctx} = this.table;
            const {x, y} = offset
            let isFirstRow = true; // need 
            // next col paint reset
            // but keep firstRowOffset,  onPainted for rest blank.
            let perColfirstRowOffset = 0; 
            while(rowIndex< colData.length){
                const MAXY = ctx.canvas.height 
                const MINY = 0
                const cell = colData[rowIndex]
                const cellContext:CellInfo = {...cell, x: cell.x+x,y:cell.y+y + perColfirstRowOffset}
                const {x:cellx, y:celly, h:cellh, w:cellw, mh:cellmh, spanType: cellspanType} = cellContext
                // 只渲染可视区内cell
                if((celly  < MINY && (celly + cellh < MINY)) || celly > MAXY || cellContext.h === 0){ 
                    rowIndex++; 
                    continue
                }
                isFirstRow && (perColfirstRowOffset = this.firstRowControlFn(cellContext, offset))
                isFirstRow = false
                rowIndex++
            }
            perColfirstRowOffsets.push(perColfirstRowOffset)
        })
        this.firstRowOffset = Math.max.apply(Math, perColfirstRowOffsets)
    }

    firstRowControlFn(cell:CellInfo, offset: Positon){
        const {y: ty} = offset
        const {y: cy, mh, ctx} = cell
        const {tableHeader} = this.table
        let perColfirstRowOffset = 0;
        if( ty !==0 && cy  < tableHeader.height ){ // 保证滚动body第一行单元格展示完全
            perColfirstRowOffset = tableHeader.height - cy
            perColfirstRowOffset =  (perColfirstRowOffset > ctx.canvas.height - tableHeader.height)? 0:perColfirstRowOffset;
            cell.y = tableHeader.height
        }
        return perColfirstRowOffset
    }
}