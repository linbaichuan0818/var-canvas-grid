import {cellStyle} from "@/interface/xlsx/style"
export const PixlReg = /(.\dpx)/i;
export const DefaultCellWidth = 100 
export const DefaultCellHeight = 20 
export const DefaultCellStyle:cellStyle = {
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
        bgcolor: {rgb:"#000000"},
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