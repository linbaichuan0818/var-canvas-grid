import { BaseBar } from "../scroll-bar/base-bar";
import VarCanvasGrid from "../../src/index";
import $ from "jquery";
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
    columnValues: string[],
    sheet: VarCanvasGrid
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
const DRAGLINE = 'vc-drag-line';
export class BaseCellType {
    public colIndex: number = 0;
    public x: number = 0;
    public y: number = 0;
    public w: number = 0;
    public h: number = 0;
    public displayName: string = "";
    public name: string = "";
    private _direction: 'x' | 'y' | 'o';
    private _offsetLeft: number = 0;
    private _offsetTop: number = 0;
    private _options: BaseCellOptions;
    private _columnValues: string[];
    private _rowCount!: number;
    private _colCount!: number;
    private _ctx!: CanvasRenderingContext2D;
    private draging: boolean = false;

    constructor(options: BaseCellOptions) {
        this.init(options);
        this.paint();
        this.initEvent();
    }

    public reInit(options: any){
        this.initDirections(options);
        this._options = Object.assign({}, this._options, options);
        this.initParams(this._options);
    }

    public rePaint(options: object){
        this.reInit(options);
        this.paint();
    }

    public initEvent() {
        const $canvas = $(this._ctx.canvas);
        let dragStart = 0; 
        let dragX = 0;
        $canvas.bind('mousedown', (e: JQuery.MouseDownEvent) => {
            dragStart = e.offsetX;
            let $line = $('#' + DRAGLINE);
            const dragActive = $line.is(':visible');
            const { xRadio, ch } = this._options.sheet.getGirdInfo();
            const linerHeight = ch - (xRadio < 1? BaseBar.BTNWIDTH: 0);
            if(!$line.length && !dragActive){
                $line = $(document.createElement('div'));
                $line.attr('id', DRAGLINE)
                     .css('position', 'absolute')
                     .css('top', 0)
                     .css('width', 2 + 'px')
                     .css('backgroundColor', '#000')
                     .css('cursor', 'col-resize')
                     .insertAfter(this._ctx.canvas)
                     .hide()
            }
            if(this.draging){
                $line.css('left', dragStart)
                .css('height', linerHeight)
                .show();
            }
        })
        $canvas.bind('mousemove', (e: JQuery.MouseMoveEvent) => {
            let $line = $('#' + DRAGLINE);
            const dragActive = $line.is(':visible');
            const dragActiveArea = Math.abs(e.offsetX + this._offsetLeft - this._options.x - this._options.width);
            if(dragActiveArea < 2 && !dragActive) {
                this.draging = true;
                $canvas.css('cursor', 'col-resize');
            }else if(this.draging && !dragActive){
                $canvas.css('cursor', 'default');
                this.draging = false;
            }
            if(!dragActive) {return};
            dragX = e.offsetX - dragStart; 
            $line.css('left', e.offsetX);
        })
        $(document).bind('mouseup', (e: JQuery.MouseUpEvent) => {
            if(!this.draging) {return};
            let $line = $('#' + DRAGLINE);
            this._options.width += dragX; 
            this._options.sheet.repaint({}, {dragX: dragX / 2, start: this.colIndex})
            $line.hide();
            dragX = 0;
            this.draging = false;
        })
    }

    private init(options: BaseCellOptions){
        this.initDirections(options);
        this._options = Object.assign({}, DEFAULTOPTIONS, options);
        this.initParams(this._options);
    }

    private initDirections(newOptions: any) {
        const {offsetTop, offsetLeft} = newOptions;
        if(offsetTop > this._offsetTop){
            this._direction = 'y';
        }else if (offsetLeft > this._offsetLeft){
            this._direction = 'x';
        }else {
            this._direction = 'o';
        }
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
        this._ctx = this._options.ctx;
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
        // console.time('重渲染耗时');
        const {start, end} = this.getRenderArea();
        let startRow = start;
        // 待优化，横向范围计算，以及时间复杂度优化
        while(startRow <= end) {
            const value = this._columnValues[startRow];
            const paintParams = {
                rowIndex: startRow,
                value
            };
            const cellRect = this.getCellRect(paintParams);
            const paintInfo = {
                ...paintParams,
                ...cellRect
            };
            this.paintContent(paintInfo);
            this.paintText(paintInfo);
            startRow++
        }
        // console.timeEnd('重渲染耗时')
    }

    private getRenderArea() {
        const offsetTop = this._offsetTop;
        const ch = this._ctx.canvas.height;
        let len = this._columnValues.length;
        const oneHzRowCount  = !this.y ? 0 : Math.ceil(ch / 50); // 待优化， 判断cell类型
        let rowIndex = 0;
        let pos = 0;
        let start = 0;
        let end = 0;
        while(rowIndex < len){
            pos = 50 * (rowIndex + 1);
            if(pos > offsetTop){
                start = rowIndex;
                end = start +  oneHzRowCount;
                end = end > len? len - 1:end;
                break
            }
            rowIndex ++;
        }
        return {start, end}
    }

    private paintText(paintInfo: PaintInfo){
        const { fontSize, padding, width } = this._options;
        let  { value: str, ctx } = paintInfo; 
        const strWidth = ctx.measureText(str).width; 
        const textOverflow = width < strWidth;
        ctx.font = ctx.font.replace(PIXELREG, fontSize + 'px');

        if(textOverflow){
            paintInfo.value = this.computeTextOverflow(paintInfo);
        }

        const { x, y, value} = this.getAlignPos(paintInfo);
        ctx.fillText(value, x, y)
    }

    private computeTextOverflow(paintInfo: PaintInfo){
        const {ctx, value, w, rowIndex} = paintInfo;
        const ellipsis = '...';
        const ellipsisWidth = ctx.measureText(ellipsis + '.').width;
        let str = value;
        let strSubLen = 0;
        while(strSubLen < str.length){
            let strSub = str.substring(0, strSubLen);
            const strSubWidth = ctx.measureText(strSub).width;
            if(w < strSubWidth + ellipsisWidth){
                strSub = strSub.slice(0, -1);
                str = strSub + ellipsis; 
                break;
            }
            strSubLen ++
        }
        return str
    }

    // only center
    private getAlignPos(paintInfo: PaintInfo){
        const {x, y, w, h, value, ctx} = paintInfo;
        const { fontSize } = this._options;
        const textWidth = ctx.measureText(value).width;
        return {
            x: x + 0.5*(Math.abs(w - textWidth)),
            y: y + 0.5*(h + fontSize),
            value,
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