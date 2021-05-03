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
        super.repaint(offset)// body区域存在行偏移
    }
    firstRowControlFn(cell:CellInfo, offset: Positon){
        const {y: ty} = offset
        const {y: cy, mh, ctx} = cell
        const {tableHeader} = this.table
        if( ty !==0 && cy + (mh || 0) < tableHeader.height ){ // 保证滚动body第一行单元格展示完全
            const firstRowOffset = tableHeader.height - cy
            this.firstRowOffset =  (firstRowOffset > ctx.canvas.height - tableHeader.height)? 0:firstRowOffset;
            cell.y = tableHeader.height
        }
    }
}