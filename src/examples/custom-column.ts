import BaseColumn, {ContentCtx, TextCtx}  from '@/implements/base-column'
export default class CustomColumn extends BaseColumn{
    paintContent(cell: ContentCtx){
        if(cell.row === 0 || cell.row === 9){
            cell.bgcolor = "#FFFF33"
        }
        if(cell.row ===2 && cell.col === 0){
            cell.leftWidth = cell.rightWidth = cell.topWidth = cell.bottomWidth = 20
            cell.topColor =cell.rightColor =cell.bottomColor =cell.leftColor = "red"
        }
        return super.paintContent(cell)
    }
    paintText(cell:TextCtx){
        if(cell.row ===2 && cell.col === 0){
            cell.fontColor = "red"
        }
        return super.paintText(cell)
    }
}