import {BaseColumnType, Ctx, Positon, Rect} from "@/interface/columns/base-column-type"
import { Raw,Record,MergeCellRange } from "@/interface/table/base-table-type"
import BaseTable from "@/implements/base-table"
import {cellStyle} from "@/interface/xlsx/style"
import {DefaultCellStyle, PixlReg, DefaultCellWidth, DefaultCellHeight} from "@/common/data"
import {ctxline} from "@/tools/canvas"
import BaseRows from './base-rows'

interface BaseColumnOptions { //不需要用户传入
    width?:number
    name: string | number // 唯一id
}
export type CellInfo = Ctx & cellStyle & {value: Raw[keyof Raw]} & MergeCellRange
export type TextCtx =   Ctx & cellStyle & {value: Raw[keyof Raw]}
export type ContentCtx =  Ctx & cellStyle

let firstRowOffset = 0;

export default class BaseColumn implements BaseColumnType{
    index!:number;
    name!:string | number;
    table!:BaseTable;
    width!:number;
    colData:CellInfo[] = []; // 收集列数据
    rows!:BaseRows;
    colDataFn: ()=>void
    constructor(options?: BaseColumnOptions) {
        options&&this.init(options)
    }
    init(options: BaseColumnOptions){
        const {width, name} = options
        this.name = name
        this.width = width ||　DefaultCellWidth
    }

    paint(
        offset: Positon = {x:0, y:0}, 
        ) {
        const {width,index} = this
        const {rawData, ctx} = this.table;
        const {rowsRange:[start, end]} = this.rows
        const {x, y} = offset
        let i = start;
        const MAXY = ctx.canvas.height 
        const MINY = 0
        const colX = this.rows.cols.slice(0,index).reduce((pre,cur)=>pre+cur.width,0) 
        let context:Ctx = {y,x:x+colX, w:width ,h:DefaultCellHeight, ctx}// 暂假设列宽相同
        while(i<end){
            const value = rawData[i][this.name]
            if((context.y  < MINY && (context.y + context.h < MINY)) || context.y > MAXY){ // 只渲染可视区内cell
                context = this.nextCtx(context) 
                i++; 
                continue
            }
            if(i%2) context.h = 100
            if(i%3) context.h = 300
            if(i%5) context.h = 200


            context = this.paintContent({...context, ...DefaultCellStyle, value})
            context= this.paintText({
                ...context,
                ...DefaultCellStyle,
                value
            }) 
            const cellInfo:CellInfo = {
                value,
                ...DefaultCellStyle,
                ...context,
            }
            this.colData.push(cellInfo)
            context = this.nextCtx(context) 
            i++; 
        }

        // 初次绘制初始化可视cell数据。保证结构不坍塌
        this.rows.addColData(this.index,this.colData)
        // 全量cellfn。供后置获取
        this.colDataFn = this.getColData(offset, [start, end])
    }
    repaint(offset: Positon = {x:0, y:0}){
        let  rowIndex =  0
        const { ctx} = this.table;
        const {x, y} = offset
        let isFirstRow = true; // need 
        if(this.index === 0){ // repaint table reset
            this.rows.firstRowOffset = 0;
        }
        while(rowIndex< this.colData.length){
            const MAXY = ctx.canvas.height 
            const MINY = 0
            const cell = this.colData[rowIndex]
            const cellContext = {...cell, x: cell.x+x,y:cell.y+y + this.rows.firstRowOffset}
            if((cellContext.y  < MINY && (cellContext.y + (cellContext.mh || cellContext.h) < MINY)) || cellContext.y > MAXY){ // 只渲染可视区内cell
                rowIndex++; 
                continue
            }
            isFirstRow && this.rows.firstRowControlFn(cellContext, offset) 
            this.paintContent(cellContext)
            this.paintText(cellContext)
            isFirstRow = false
            rowIndex++
        }
        // next col paint reset
        // keep firstRowOffset  onPainted.
        if(this.index < this.rows.cols.length - 1){
            this.rows.firstRowOffset = 0;
        }
    }
    paintContent<T extends CellInfo>(args: T, noPaint = false):any{
        if(noPaint) return args
        let { x, y, w, h, ctx, border, spanType} = args;
        // cell线宽待优化
        (!spanType || spanType.includes('l')) && ctxline(ctx,x,y,x, y + h); // left
        (!spanType || spanType.includes('b')) && ctxline(ctx,x, y + h, x + w, y + h); // bottom
        (!spanType || spanType.includes('r')) && ctxline(ctx,x + w, y + h,x + w, y); //  right
        (!spanType || spanType.includes('t')) && ctxline(ctx,x + w, y,x, y); // top
        this.width = w;
        return {x,y,w,h,ctx}
    }
    paintText<T extends CellInfo>(args:T, noPaint = false){
        if(noPaint) return args
        let { font:{sz}, w,ctx, value,h,x,y, spanType, mh,mw } = args;
        if(!spanType || spanType === 'lt'){
            ctx.font = ctx.font.replace(PixlReg, sz + 'px');
            const { x:fontX, y:fontY} = this.getAlignPos(args);
            ctx.fillText(value, fontX, fontY)
        }
        return {x,y,w,h,ctx}
    }

    // 渲染优先于于数据组装，数据后行处理函数->绘制完之后统一处理
    // 可以抽离一下，取个好名字
    // 待优化，耗时项
    getColData(_offset: Positon, rowsRange:[number, number]){
        const offset: Positon = _offset
        return ()=>{
            let colData:CellInfo[] = []
            const {rawData, ctx} = this.table
            const {index, width} = this;
            const {x, y} = offset
            const [start, end] =rowsRange
            let i = start;
            let context:Ctx = {y,x:x+index*width, w:width ,h:DefaultCellHeight, ctx}// 暂假设列宽相同
            while(i < end){
                const value = rawData[i][this.name]
                if(i%2) context.h = 100
                if(i%3) context.h = 300
                if(i%5) context.h = 200

                context = this.paintContent({...context, ...DefaultCellStyle, value}, true)
                context= this.paintText({
                    ...context,
                    ...DefaultCellStyle,
                    value
                }, true) 
                const cellInfo:CellInfo = {
                    value,
                    ...DefaultCellStyle,
                    ...context,
                }
                colData.push(cellInfo) // 可视区列数据
                context = this.nextCtx(context) 
                i++
            }
            this.colData = colData
            this.rows.addColData(this.index,colData)
        }
    }

    keepInOneLine(args:Ctx, offset: Positon){
        const {y: ty} = offset
        const {y: ry} = args
        const {tableHeader} = this.table
        if( ty !==0 && ry < tableHeader.height){ // 保证滚动body第一行单元格展示完全
            firstRowOffset =  tableHeader.height - args.y;
            args.y = tableHeader.height
        }
    }
    nextCtx(args:Ctx):Ctx{
        let {y, h, w} = args
        return {...args,w: this.width, h: DefaultCellHeight,y:y+h} // 只传递位置因子
    }
    getAlignPos<T extends CellInfo>(args: T):{x:number, y:number}{
        let {x, y, w, h, value, ctx, font:{sz}, spanType, mw, mh} = args;
        if(!!spanType){ // 使用合并高度绘制文字
            w = mw
            h = mh
            console.log(w, h)
        }
        const textWidth = ctx.measureText(value).width;
        return {
            x: x + 0.5*(Math.abs(w - textWidth)),
            y: y + 0.5*(h + sz),
        }
    }
    mouseenter(): boolean {
        throw new Error("Method not implemented.");
    }
    mouseleave(): boolean {
        throw new Error("Method not implemented.");
    }
    mouseover(): boolean {
        throw new Error("Method not implemented.");
    }
    mouseup(): boolean {
        throw new Error("Method not implemented.");
    }
    mousedown(): boolean {
        throw new Error("Method not implemented.");
    }
    toolTips(): boolean {
        throw new Error("Method not implemented.");
    }
}
