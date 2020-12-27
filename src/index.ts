import { BaseCellType } from "./columns/index";
import { BaseBar } from "./scroll-bar/base-bar";
import { ScrollBarX } from "./scroll-bar/scroll-bar-x";
import { ScrollBarY } from "./scroll-bar/scroll-bar-y";

import $ from 'jquery';
import { sum } from "./helper/index";
interface ThCellOptions {
    width: number;
    height: number,
    displayName: string,
    name: string
}
interface RowData {
    [name: string]: any;
}
interface Rect{
    x: number,
    y: number,
    width: number,
    height: number
}

interface GridInfo{
    w: number,
    h: number,
    cw: number,
    ch: number,
    xRadio: number,
    yRadio: number
}

interface CellCommon{
    offsetLeft?: number;
    offsetTop?: number;
    dragX?: number
}

interface GridOption {
    gridId: string;
    style?: string;
    data: RowData[];
    rowHeight?: number;
    headerRowHeight?: number;
    offsetLeft?: number;
    offsetTop?: number;
    thCellOptionsList: ThCellOptions[];
}
const DEFAULTGRIDID = "grid-id";
const DEFAULTROWHEIGHT = 30;
const DEFAULTHEADERROWHEIGHT = 50;

export default class VarCanvasGrid {
    public headerColumnCellTypes: BaseCellType[] = [];
    public bodyColumnCellTypes: BaseCellType[] = [];
    public scrollBars: BaseBar[] = []
    public nameToRectMap: {[name: string]: Rect} = {};
    public data: object[] = [];
    private $canvas!: HTMLCanvasElement;
    private _gridId: string = DEFAULTGRIDID;
    private ctx!: CanvasRenderingContext2D;
    private _rowHeight: number;
    private _headerRowHeight: number;
    private _options!:GridOption;
    private cellCommon: CellCommon;
    private stepLengthY!: number;
    private stepLengthX!: number;
    private colCount: number;
    private rowCount: number;
    private gridInfo: GridInfo;

    constructor(options: GridOption) {
        this.init(options);
        this.paint();
    }

    public reinit(){
        this.headerColumnCellTypes = [];
        this.bodyColumnCellTypes = [];
        this.nameToRectMap = {};
        this.colCount = this._options.thCellOptionsList.length;
        this.rowCount = this._options.data.length;
    }

    public repaint(options: CellCommon, dragOptions: any = {}){
        this.cellCommon = Object.assign(this.cellCommon, options);
        let tableHeaderCells: BaseCellType[] = this.headerColumnCellTypes;
        let tableBodyCells: BaseCellType[] = this.bodyColumnCellTypes;
        let scrollBars = this.scrollBars;
        this.clearRect();
        this.rePaintTableBody(tableBodyCells, dragOptions);
        this.rePaintTableHeader(tableHeaderCells, dragOptions);
        this.rePaintScrollBar(scrollBars, dragOptions);
        this.paintOutline();
    }

    public rePaintTableHeader(tableHeaderCells: BaseCellType[], dragOptions: any) {
        if(tableHeaderCells) {
            const { start, dragX} = dragOptions;
            let offset = this.getContentOffset();
            offset = {
                offsetLeft: offset.offsetLeft,
                offsetTop: 0
            };
            this.ctx.clearRect(0,0,this.ctx.canvas.width, this._headerRowHeight);
            tableHeaderCells.forEach((tableHeaderCell, colIndex) => {
                let x = tableHeaderCell.x;
                x =  colIndex > start? (x + dragX) : x;
                tableHeaderCell.rePaint(
                        {
                            ...offset,
                            x
                        }
                    );
            })
        }
    }

    public rePaintTableBody(tableBodyCells: BaseCellType[], dragOptions: any){
        if(tableBodyCells) {
            const { start, dragX} = dragOptions;
            const offset = this.getContentOffset();
            tableBodyCells.forEach((tableBodyCell, colIndex) => {
                let x = tableBodyCell.x;
                x = colIndex > start? (x + dragX ): x;
                tableBodyCell.rePaint({
                    ...offset,
                    x
                });
            })
        }
    }

    public rePaintScrollBar(scrollBars: BaseBar[], dragOptions: any){
        const isScrollBarX = (scrollBar: BaseBar) => scrollBar instanceof ScrollBarX;
        const { start, dragX} = dragOptions;
        const {offsetLeft, offsetTop} = this.cellCommon;
        if(dragX) {
            this.computeGridInfo();
            const {yRadio, xRadio} = this.gridInfo;
            const existXBar = scrollBars.some(isScrollBarX);
            if(xRadio > 1 && existXBar) {
                scrollBars.shift().destroy();
            }else if(xRadio < 1 && !existXBar){
                scrollBars.unshift( 
                    new ScrollBarX({ctx: this.ctx, 
                    ...this.cellCommon,
                    ...this.gridInfo,
                    type:'x',
                    stepLengthY: this.stepLengthY,
                    stepLengthX: this.stepLengthX,
                    repaint: this.repaint.bind(this)}));
            }
        }

        scrollBars.forEach(scrollBar => {
            if(isScrollBarX(scrollBar)){
                scrollBar.rePaintScrollBar({ offsetLeft, ...this.gridInfo })
            }else{
                scrollBar.rePaintScrollBar({ offsetTop, ...this.gridInfo })
            }
        });
    }

    public getGirdInfo() {
        return this.gridInfo
    }

    private initStepLen(){
        // 步长待优化
        this.stepLengthY = this._rowHeight;
        this.stepLengthX = Math.min.apply(null, this._options.thCellOptionsList.map(i => i.width));
    }

    private createCanvas(gridId: string, style: string) {
        this._gridId = gridId? gridId: this._gridId;
        this._gridId += Date.now();
        const gridContainer = document.getElementById(gridId) || document.body;
        this.$canvas = document.createElement("canvas");
        $(gridContainer).attr("style", style)
                        .append(this.$canvas)
                        .css('position', 'relative')
        const gridContainerWidth = gridContainer.clientWidth;
        const gridContainerHeigth = gridContainer.clientHeight;

        $(this.$canvas).attr("id", this._gridId)
            .attr("width", String(gridContainerWidth))
            .attr("height", String(gridContainerHeigth))

        this.ctx = this.$canvas.getContext("2d");
    }

    private paint() {
        const { thCellOptionsList, data, style, gridId } = this._options;
        this.createCanvas(gridId, style);
        this.paintTableHeader();
        this.paintTableBody();
        this.initStepLen();
        this.paintScrollBar();
        this.paintOutline();
    }

    private computeGridInfo(){
        const cw = this.ctx.canvas.width;
        const ch = this.ctx.canvas.height;
        let w = sum(this.headerColumnCellTypes.map(headerCol => headerCol.w));
        let h = this._options.data.length * this._rowHeight + this._headerRowHeight; 
        const restAreaNum = (cw / w < 1) &&  (ch / h < 1) ? 2 : 1;
        // show area hidden by scrollBar
        h += restAreaNum * BaseBar.BTNWIDTH;
        w += restAreaNum * BaseBar.BTNWIDTH;
        const xRadio =  cw / w;
        const yRadio = ch / h;
        this.gridInfo = {
            xRadio,
            yRadio,
            w,
            h,
            cw,
            ch
        } 
    }

    private clearRect(){
        const canvasWidth = this.ctx.canvas.width;
        const canvasHeight = this.ctx.canvas.height;
        this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    }

    private init(options: GridOption){
        this.nameToRectMap = {};
        this.cellCommon = {
            offsetLeft: options.offsetLeft || 0,
            offsetTop: options.offsetTop || 0,
        }
        this.data = options.data;
        this._rowHeight = options.rowHeight ? options.rowHeight: DEFAULTROWHEIGHT;
        this._headerRowHeight = options.headerRowHeight ? options.headerRowHeight: DEFAULTHEADERROWHEIGHT;
        this._options = options;
        this.colCount = this._options.thCellOptionsList.length;
        this.rowCount = this._options.data.length;
    }

    private paintOutline(){
        this.ctx.strokeStyle = "#ccc";
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(0,0, this.ctx.canvas.width, this.ctx.canvas.height)
    }

    private paintScrollBar(){
        this.computeGridInfo();
        const { xRadio, yRadio} = this.gridInfo;
        if(xRadio < 1) {
            const scrollBar = new ScrollBarX({ctx: this.ctx, 
                                              ...this.cellCommon,
                                              ...this.gridInfo,
                                              type:'x',
                                              stepLengthY: this.stepLengthY,
                                              stepLengthX: this.stepLengthX,
                                              repaint: this.repaint.bind(this)});
            this.scrollBars.push(scrollBar);
        }

        if(yRadio < 1) {
            const scrollBar = new ScrollBarY({ctx: this.ctx, 
                                              ...this.cellCommon,
                                              ...this.gridInfo,
                                              type:'y',
                                              stepLengthY: this.stepLengthY,
                                              stepLengthX: this.stepLengthX,
                                              repaint: this.repaint.bind(this)});
            this.scrollBars.push(scrollBar);
        }
    }
    
    private getContentOffset(): CellCommon{
        const offset = {
            offsetLeft: 0,
            offsetTop: 0
        };
        const { offsetLeft, offsetTop } = this.cellCommon;
        offset.offsetLeft =  offsetLeft;
        offset.offsetTop =  offsetTop;
        return offset
    }

    private paintTableHeaderRow(cellOptionsList: ThCellOptions []){
        const { thCellOptionsList } = this._options;
        thCellOptionsList.forEach((thCellOption, colIndex) => {
            const {displayName, name, width, height} = thCellOption;
            const lastColumnType = this.headerColumnCellTypes[colIndex - 1];
            const x =  lastColumnType? lastColumnType.x + lastColumnType.w: 0; 
            const columnValues =  [displayName];
            const columnCellType = new BaseCellType({
                colIndex,
                x,
                y: 0,
                displayName, 
                name, 
                width, 
                height: this._headerRowHeight,
                columnValues,
                ctx: this.ctx,
                rowCount: 1,
                colCount: this.colCount,
                sheet: this
            });
            this.headerColumnCellTypes.push(columnCellType);
        })
    }

    private paintTableBodyRow(data: RowData[]){
        console.time("首次加载耗时")
        const { thCellOptionsList } = this._options;
        thCellOptionsList.forEach((thCellOptions, colIndex) => {
            const {displayName, name, width, height} = thCellOptions;
            const lastColumnType = this.bodyColumnCellTypes[colIndex - 1];
            const x =  lastColumnType? lastColumnType.x + lastColumnType.w: 0; 
            const columnValues: string[] = this._options.data.map(rowData => rowData[name]);
            const columnCellType = new BaseCellType({
                colIndex,
                x,
                y: this._headerRowHeight,
                displayName, 
                name, 
                width, 
                height,
                columnValues,
                ctx: this.ctx,
                rowCount: this.rowCount,
                colCount: this.colCount,
                sheet: this
            });
            this.bodyColumnCellTypes.push(columnCellType);
        })
        console.timeEnd("首次加载耗时")
    }
 
    private paintTableHeader(){
        const { thCellOptionsList } = this._options;
        this.paintTableHeaderRow(thCellOptionsList)
    }
    private paintTableBody(){
        const { data } = this._options;
        this.paintTableBodyRow(data)
    }
}