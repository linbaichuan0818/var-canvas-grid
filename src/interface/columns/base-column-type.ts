import {cellStyle} from  "@/interface/xlsx/style"
export interface Cell{
    text:string
    style:cellStyle
}

export interface Positon{
    x:number
    y: number
}
export interface Size{
    w:number
    h:number
}

export interface Rect extends Positon,Size{}
export type Ctx = Rect&{ctx:CanvasRenderingContext2D}
export interface BaseColumnType{
    paint(args:Ctx):void
    mouseenter():boolean
    mouseleave():boolean
    mouseover():boolean
    mouseup():boolean
    mousedown():boolean
    toolTips():boolean
}