type Color = { auto?: number} & { rgb?: string } & { theme?: string, tint?: string} & { indexed?: number}
type BorderStyle = "thin" | "medium" | "thick" | "dotted" | "hair" | "dashed" | "mediumDashed" | "dashDot" | "mediumDashDot" | "dashDotDot" | "mediumDashDotDot" | "slantDashDot"
export type NumFmt = string //"0" | "0.00%" | "0.0%" | "0.00%;\\(0.00%\\);\\-;@"  | "m/dd/yy"
interface BorderLine {
    style: BorderStyle
    color:Color
}
export interface Font{
    name:string
    sz: number
    bold: boolean
    color:Color
    underline: boolean
    italic: boolean
    strike: boolean
    outline: boolean
    shadow: boolean
    vertAlign: boolean
}
export interface Aligment{
    horizontal: "bottom"|"center"|"top"
    vertical: "bottom"|"center"|"top"
    wrapText: boolean
    readingOrder: number
    textRotation: Number  // 0-180-255
}
export interface Fill{
    bgcolor?: Color
    fgColor?: Color
    patternType?: "solid"|"none"
}
export interface Border{
    top: BorderLine 
    bottom: BorderLine 
    left: BorderLine 
    right: BorderLine 
    diagonal: BorderLine 
    diagonalUp: boolean
    diagonalDown: boolean
}

// xsls-style
export interface cellStyle{
    font: Font
    aligment: Aligment
    fill:Fill
    border:Border
    numFmt:NumFmt
}