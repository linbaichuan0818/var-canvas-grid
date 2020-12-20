import { BaseBar } from "../scroll-bar/base-bar";

interface DefaultOptions{
    bgColor?: string;
    lineWidth?: number;
    borderColor?: string;
    fontSize?: number,
    padding?: string | number,
    offsetLeft?: number,
    offsetTop?: number
} 
interface PaintParams {
    rowIndex: number,
    value: string
}
type PaintInfo  = BaseCellRect & PaintParams;
interface BaseCellOptions extends DefaultOptions{
    colIndex: number;
    x: number;
    y: number;
    width: number;
    height: number;
    ctx: CanvasRenderingContext2D;
    displayName:string,
    name:string,
    rowCount: number,
    colCount: number,
    columnValues: string[]
}
interface BaseCellRect{
    x: number;
    y: number;
    w: number;
    h: number;
    ctx: CanvasRenderingContext2D;
}
const DEFAULTOPTIONS: DefaultOptions = {
    bgColor: "#FFFFFF",
    borderColor: "#CCCCCC" ,
    lineWidth: 1,
    fontSize: 12,
    padding: 0
}
const PIXELREG = /(.\dpx)/i;
export class BaseCellType {
    public colIndex: number = 0;
    public x: number = 0;
    public y: number = 0;
    public w: number = 0;
    public h: number = 0;
    public displayName: string = "";
    public name: string = "";
    private _offsetLeft: number = 0;
    private _offsetTop: number = 0;
    private _options: BaseCellOptions;
    private _columnValues: string[];
    private _rowCount!: number;
    private _colCount!: number;

    constructor(options: BaseCellOptions) {
        this.init(options);
        this.paint();
    }

    public reInit(options: any){
        this._options = Object.assign({}, this._options, options);
        this.initParams(this._options);
    }

    public rePaint(options: object){
        this.reInit(options);
        this.paint();
    }

    private init(options: BaseCellOptions){
        this._options = Object.assign({}, DEFAULTOPTIONS, options);
        this.initParams(this._options);
    }

    private initParams(options: BaseCellOptions){
        this.x = this._options.x;
        this.y = this._options.y;
        this.w = this._options.width;
        this.h = this._options.height;
        this.displayName  = this._options.displayName;
        this.name  = this._options.name;
        this._offsetLeft = this._options.offsetLeft || 0;
        this._offsetTop = this._options.offsetTop || 0;
        this._colCount = this._options.colCount;
        this._rowCount = this._options.rowCount;
        this.colIndex = this._options.colIndex;
        this._columnValues = this._options.columnValues;
    }

    private getCellRect(paintParams: PaintParams): BaseCellRect{
        const { rowIndex } = paintParams;
        const { width: w, 
                height: h, 
                ctx, 
                x,
                y,
                lineWidth: lw,
                } = this._options;
        return {
            x: x - this._offsetLeft, 
            y:  y - this._offsetTop + rowIndex * h, 
            w, 
            h, 
            ctx
        }
    }

    private paint(){
        let rowIndex = 0;
        const columnValues = this._columnValues;
        while (rowIndex < this._rowCount) {
            const value = columnValues[rowIndex];
            const paintParams = {
                rowIndex,
                value
            };
            const cellRect = this.getCellRect(paintParams);
            const {x , y, ctx} = cellRect;
            const {clientWidth: cw , clientHeight: ch} = ctx.canvas
            if(cw < x  || ch < y) {
                rowIndex ++;
                continue; 
            }
            const paintInfo = {
                ...paintParams,
                ...cellRect
            }
            this.paintContent(paintInfo);
            this.paintText(paintInfo);
            rowIndex ++;
        }
    }

    private paintText(paintInfo: PaintInfo){
        const { fontSize, padding } = this._options;
        const {value} = paintInfo; 
        const { x, y, ctx} = this.getAlignPos(paintInfo, fontSize);
        ctx.font = ctx.font.replace(PIXELREG, fontSize + 'px');
        ctx.fillText(value, x, y)
    }

    // only center
    private getAlignPos(cellRect: BaseCellRect, fontSize: number){
        const {x, y, w, h, ctx} = cellRect;
        ctx.font = '12px sans-serif';
        const textWidth = ctx.measureText(this.displayName).width;
        return {
            x: x + 0.5*(w - textWidth),
            y: y + 0.5*(h + fontSize),
            ctx
        }
    }

    private paintContent(paintInfo: PaintInfo){
        const { x, y, w, h, ctx} = paintInfo;
        const { lineWidth: lw, bgColor: bgc, borderColor: bdgc, colCount} = this._options;
        ctx.beginPath();
        ctx.lineWidth = lw / 10;
        ctx.strokeStyle = '#000';
        ctx.moveTo(x,y);
        // cell线宽待优化
        ctx.lineTo(x, y + h); //  left
        ctx.lineTo(x + w, y + h); // bottom
        if(this._colCount - this.colIndex  === 1){
            ctx.lineTo(x + w, y); // right 
        }       
        // ctx.lineTo(x, y); // top

        ctx.stroke();
    }
}