import {Positon, Ctx} from "@/interface/columns/base-column-type"
import {BaseRowType} from "@/interface/rows/base-row-type"
import { Record, Raw } from "@/interface/table/base-table-type"
import BaseColumn, {CellInfo} from './base-column'
import BaseTable from './base-table'

const mergeRange = {
    spanCol:2,
    spanRow:2,
}
interface BaseRowsOptions{
    rowsRange?: [number, number]
    onPainted?:()=>void
}
export default abstract class BaseRows implements BaseRowType{
    height!:number
    width!:number
    firstRowOffset = 0;
    cols: BaseColumn[] = []
    table!: BaseTable
    rowsRange!:[number, number]
    rowData:Record<CellInfo[]> = {} // 搜集行数据
    onPainted:()=>void = ()=> undefined
    constructor(options: BaseRowsOptions){
        this.init(options)
    }
    firstRowControlFn(context:Ctx, offset:Positon):void{return undefined}
    init(options: BaseRowsOptions){
        const {rowsRange , onPainted} = options
        this.rowsRange = rowsRange || [0,1]
        onPainted && (this.onPainted = onPainted)
    }
    addCol(col: BaseColumn){
        col.index = this.cols.length
        col.table = this.table;
        col.rows = this;
        this.cols.push(col)
    }
    delCol(index: number){
        let col = this.cols[index]
        this.cols.splice(index,1)
        col = null
    }
    clearRect( x= 0,y=0, w = 0, h = 0) {
        const {ctx} = this.table
        ctx.clearRect(x, y, w, h);
    }
    paint(offset:Positon = {x:0, y:0}): void {
        this.clearRect(0,0, this.width, this.height)
        this.rowData = {};
        this.cols.forEach(col=>col.colData = [])
        this.cols.forEach((col)=>{
           col.paint({...offset})
        })
        this.width && this.height ? this.onPainted(): null
    }
    repaint(offset:Positon = {x:0, y:0}){
        this.clearRect(0,0, this.width, this.height)
        this.cols.forEach((col)=>{
           col.repaint({...offset})
        })
    }
    addColData(rowIndex:number, colData:CellInfo[]){
        this.rowData[rowIndex] = colData
        const lastRowCell = this.cols[0].colData.slice(-1)[0]
        const lastColCell =  this.cols.slice(-1)[0].colData[0] || {x:0, w:0}
        this.height = lastRowCell.y + lastRowCell.h; 
        this.width = lastColCell.x + lastColCell.w
    }
    mergeCell(mergeParams:{row:number, col:number, spanCol:number,spanRow:number}){
        let { row, col ,spanCol, spanRow}=mergeParams
        if(col + spanCol - 1 > this.cols.length) return // 超出合并范围
        if(row + spanRow - 1 > this.rowData[0].length) return
        // 2,2,3,3
        // (2,2) => (4,,4)
        let illegal = false;
        const rangeCells = Object.values(this.rowData) // rowdata 可以写成 [][]
        .slice(col, spanCol + col)
        .reduce((pre,cur)=>{
            return pre = pre.concat(cur.slice(row, spanRow+row))
        },[])
        
        const haslt = rangeCells.some(cell=>cell.spanType ==='lt')
        const hasrt = rangeCells.some(cell=>cell.spanType === 'rt')
        const hasrb = rangeCells.some(cell=>cell.spanType === 'rb')
        const haslb = rangeCells.some(cell=>cell.spanType === 'lb')
        const nomerged = rangeCells.every(cell => !cell.spanType)
        if(!(nomerged || (haslt && hasrb && hasrt && haslb))){ // 判断有问题
            console.log(nomerged, haslt, hasrb,hasrt,haslb )
            return illegal = true
        }
    

        let i = spanCol
        while(i){
            i --
            const mergeCol = this.rowData[col + i];
            const mergeRows = mergeCol.slice(row, spanRow+row)
            mergeRows.forEach((cell, index)=>{
                const _spanCol = i + 1
                const _spanRow = index + 1
                cell.mw = cell.mh = 0
                if(_spanCol == spanCol && _spanRow ==1){ // rt
                    cell.spanType ='rt'
                    cell.mh = mergeRows[spanRow-1].y + mergeRows[spanRow-1].h - mergeRows[0].y
                    cell.mw = this.rowData[spanCol+col][0].x - this.rowData[col][0].x
                }
                else if(_spanRow == 1 && _spanCol==1 ){
                    cell.spanType ='lt'
                    cell.mh = mergeRows[spanRow-1].y + mergeRows[spanRow-1].h - mergeRows[0].y
                    cell.mw = this.rowData[spanCol+col][0].x - this.rowData[col][0].x
                }
                else if(_spanRow === spanRow && _spanCol==1){
                    cell.spanType ='lb'
                }
                else if(_spanRow === spanRow && _spanCol==spanCol){
                    cell.spanType ='rb'
                }
                else if(_spanCol == spanCol){
                    cell.spanType ='r'
                }
                else if(_spanRow == 1){
                    cell.spanType = 't'
                    cell.mh = mergeRows[spanRow-1].y + mergeRows[spanRow-1].h - mergeRows[0].y
                    cell.mw = this.rowData[spanCol+col][0].x - this.rowData[col][0].x
                }
                else if(_spanCol == 1){
                    cell.spanType = 'l'
                }
                else if(_spanRow == spanRow){
                    cell.spanType = 'b'
                }else{
                    cell.spanType = 'c'
                }
            })
        }
        this.table.repaint()
    }
}