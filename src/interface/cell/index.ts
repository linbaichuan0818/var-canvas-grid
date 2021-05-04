// TODO扩展单元格可复写项
export interface ContentView{
    bgcolor:string
    topColor: string
    bottomColor: string
    leftColor: string
    rightColor: string
    topWidth: number
    rightWidth: number
    bottomWidth: number
    leftWidth: number
}
export interface TextView{
    sz:number
    fontColor: string
}
export interface CellStyleView extends ContentView,TextView{}