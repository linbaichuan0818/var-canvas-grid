import BaseColumn from "@/implements/base-column"
export interface Raw{
    [key: string]: any 
}
export interface Record<T = any>{
    [key:string]:T
}
/**
 * 大数据应用中rows > cols ，选择中粒度渲染方式
 * row管理col
 */
export default interface BaseTableType{
    addCol<T extends BaseColumn>(cellType:T):void
    delCol(index:number):void
    paint(repaint?:boolean):void
    repaint():void
    reInit():void
    // destroy():void
    // destroyed():void
    // created():void
    // mounted():void
    getRow(index: number): Raw
}
export interface MergeCellRange{
    spanType?: 'r' | 'l' | 't' | 'b' | 'rt' | 'rb' | 'lt' | 'lb' | 'c'
    mh?:number
    mw?:number
}