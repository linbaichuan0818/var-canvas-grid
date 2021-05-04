import {BaseColumnType, Ctx, Positon, Rect} from "@/interface/columns/base-column-type"
import { Raw,Record,MergeCellRange } from "@/interface/table/base-table-type"
import BaseTable from "@/implements/base-table"
import {cellStyle} from "@/interface/xlsx/style"
import {TextView, ContentView, CellStyleView} from "@/interface/cell/index"

import {DefaultCellTextView,DefaultCellContentView, PixlReg, DefaultCellWidth, DefaultCellHeight} from "@/common/data"
import {ctxline} from "@/tools/canvas"
import BaseRows from './base-rows'

interface BaseColumnOptions { //不需要用户传入
    width?:number
    displayname?: string | number 
    name: string | number // 唯一id
}
export type CellIndex = {col:number, row:number}
export type CellInfo = Ctx & CellStyleView & {value: Raw[keyof Raw]} & MergeCellRange & CellIndex
export type TextCtx =   Ctx & TextView & {value: Raw[keyof Raw]} & MergeCellRange & CellIndex
export type ContentCtx =  Ctx & ContentView & MergeCellRange & CellIndex

let maxoff = 0;
/**
 * TODO：优化公共逻辑代码。形象化类型
 */
export default class BaseColumn implements BaseColumnType{
    index!:number;
    name!:string | number;
    displayname?:string | number;
    table!:BaseTable;
    width!:number;
    colData:CellInfo[] = []; // 收集列数据
    rows!:BaseRows;
    colDataFn: ()=>void
    constructor(options?: BaseColumnOptions) {
        options&&this.init(options)
    }
    init(options: BaseColumnOptions){
        const {width, name, displayname} = options
        this.name = name
        this.displayname = displayname
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
            context = this.paintContent({...context, ...DefaultCellContentView, value, col: this.index ,row: i-1})
            context= this.paintText({
                ...context,
                ...DefaultCellTextView,
                value,
                col: this.index ,row: i-1
            }) 
            const cellInfo:CellInfo = {
                value,
                ...DefaultCellContentView,
                ...DefaultCellTextView,
                ...context,
                col: this.index ,row: i-1
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
        while(rowIndex< this.colData.length){
            const MAXY = ctx.canvas.height 
            const MINY = 0
            const cell = this.colData[rowIndex]
            const cellContext:CellInfo = {...cell, x: cell.x+x,y:cell.y+y + this.rows.firstRowOffset}
            this.checkMerge(cellContext)
            const {y:celly, h:cellh} = cellContext
            // 只渲染可视区内cell
            if((celly  < MINY && (celly + cellh < MINY)) || celly > MAXY || cellContext.h === 0){ 
                rowIndex++; 
                continue
            }
            this.paintContent(cellContext)
            this.paintText(cellContext)
            rowIndex++
        }
    }
    checkMerge(cellContext:CellInfo){
        const {h, mh, mw, spanType} =cellContext
        if(spanType){
            cellContext.h = mh
            cellContext.w = mw
        }
    }
    paintContent<T extends ContentCtx>(args: T, noPaint = false):any{
        if(noPaint) return args;
        let { x, y, w, h,ctx,bgcolor, spanType, leftColor,
             rightColor, topColor, bottomColor,
            topWidth, leftWidth, rightWidth, bottomWidth
            } = args;
        const showCell =  (!spanType || spanType.includes('lt')) // 合并cell以第一个为准

        if(showCell){
        // cell线宽待优化
            ctx.save()
            ctx.fillStyle = bgcolor
            ctx.fillRect(x,y,w,h)
            ctx.restore()
            ctxline(ctx,x,y,x, y + h, leftColor, leftWidth); // left
            ctxline(ctx,x, y + h, x + w, y + h, bottomColor, bottomWidth); // bottom
            ctxline(ctx,x + w, y + h,x + w, y, rightColor, rightWidth); //  right
            ctxline(ctx,x + w, y,x, y, topColor, topWidth); // top
        }
        this.width = w;
        return {x,y,w,h,ctx}
    }
    paintText<T extends TextCtx>(args:T, noPaint = false){
        if(noPaint) return args
        let { sz, w,ctx, value,h,x,y, spanType, fontColor } = args;
        value = value ===undefined? '':value
        if(!spanType || spanType === 'lt'){
            ctx.fillStyle = fontColor
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
                context = this.paintContent({...context, ...DefaultCellContentView, value,col: this.index ,row: i}, true)
                context= this.paintText({
                    ...context,
                    ...DefaultCellTextView,
                    value,
                    col: this.index ,row: i-1
                }, true) 
                const cellInfo:CellInfo = {
                    value,
                    ...DefaultCellContentView,
                    ...DefaultCellTextView,
                    ...context,
                    col: this.index ,row: i-1
                }
                colData.push(cellInfo) // 可视区列数据
                context = this.nextCtx(context) 
                i++
            }
            this.colData = colData
            this.rows.addColData(this.index,colData)
        }
    }

    
    nextCtx(args:Ctx):Ctx{
        let {y, h, w} = args
        return {...args,w: this.width, h: DefaultCellHeight,y:y+h} // 只传递位置因子
    }
    getAlignPos<T extends TextCtx>(args: T):{x:number, y:number}{
        let {x, y, w, h, value, ctx, sz, spanType, mw, mh} = args;
        if(!!spanType){ // 使用合并高度绘制文字
            w = mw
            h = mh
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
