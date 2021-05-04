import {cellStyle} from "@/interface/xlsx/style"
import {ContentView,TextView} from "@/interface/cell/index"
export const PixlReg = /(.\dpx)/i;
export const DefaultCellWidth = 100 
export const DefaultCellHeight = 20 
export const DefaultCellStyleXlsx:cellStyle = {
    font: {
        name:'Calibri',
        sz: 11,
        bold: false,
        color:{rgb:"#000000"},
        underline: false,
        italic: false,
        strike: false,
        outline: false,
        shadow: false,
        vertAlign: false
    },
    aligment: {
        horizontal: "center",
        vertical:"center",
        wrapText: false,
        readingOrder: 2,
        textRotation:  0 // 0-180-255
    },
    fill:{
        bgcolor: {rgb:"#FFFFFF"},
        fgColor: {rgb:"#000000"},
        patternType: "solid"
    },
    border:{    
        top: {
            style:'thin',
            color:{rgb:"#000000"}
        }, 
        bottom: {
            style:'thin',
            color:{rgb:"#000000"}
        },  
        left: {
            style:'thin',
            color:{rgb:"#000000"}
        },  
        right: {
            style:'thin',
            color:{rgb:"#000000"}
        },  
        diagonal: {
            style:'thin',
            color:{rgb:"#000000"}
        } , 
        diagonalUp: false,
        diagonalDown: false,
    },
    numFmt:'0'
}
export const DefaultCellContentView:ContentView = {
    bgcolor:"#ffffff",
    bottomColor: "#000000",
    leftColor: "#000000",
    rightColor: "#000000",
    topColor:"#000000",
    topWidth: 2,
    rightWidth: 2,
    bottomWidth: 2,
    leftWidth: 2
}
export const DefaultCellTextView:TextView = {
    sz:11,
    fontColor: "#000000"
}
export const DefaultCellStyleView = {
    ...DefaultCellContentView,
    ...DefaultCellTextView
}