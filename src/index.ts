import { BaseCellType } from "./columns/index";
import { BaseBar } from "./scroll-bar/base-bar";
import { ScrollBarX } from "./scroll-bar/scroll-bar-x";
import { ScrollBarY } from "./scroll-bar/scroll-bar-y";

import $ from 'jquery';
import { flatten, sum } from "./helper/index";
interface ThCellOptions {
    width: number;
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
    public tableRows: BaseCellType[][] = [];
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

    constructor(options: GridOption) {
        this.init(options);
        this.paint();
    }

    public reinit(){
        this.tableRows = [];
        this.nameToRectMap = {};
        this.colCount = this._options.thCellOptionsList.length;
        this.rowCount = this._options.data.length;
    }

    public repaint(options: CellCommon){
        this.cellCommon = Object.assign(this.cellCommon, options);
        const tableHeaderCells: BaseCellType[] = this.tableRows[0];
        const tableBodyCells: BaseCellType[] = flatten(this.tableRows.slice(1));
        const scrollBars = this.scrollBars;
        this.clearRect();
        this.rePaintTableBody(tableBodyCells);
        this.rePaintTableHeader(tableHeaderCells);
        this.rePaintScrollBar(scrollBars);
        this.paintOutline();
    }

    public rePaintTableHeader(tableHeaderCells: BaseCellType[]) {
        if(tableHeaderCells) {
            let offset = this.getContentOffset();
            offset = {
                offsetLeft: offset.offsetLeft,
                offsetTop: 0
            };
            this.ctx.clearRect(0,0,this.ctx.canvas.width, this._headerRowHeight);
            tableHeaderCells.forEach(tableHeaderCell => {
                tableHeaderCell.rePaint(
                        offset
                    );
            })
        }
    }

    public rePaintTableBody(tableBodyCells: BaseCellType[]){
        if(tableBodyCells) {
            const offset = this.getContentOffset();
            tableBodyCells.forEach(tableBodyCell => {
                tableBodyCell.rePaint(offset);
            })
        }
    }

    public rePaintScrollBar(scrollBars: BaseBar[]){
        const gridInfo = this.computeGridInfo();
        const isScrollBarX = (scrollBar: BaseBar) => scrollBar instanceof ScrollBarX;
        // this.initStepLen();
        const {offsetLeft, offsetTop} = this.cellCommon
        scrollBars.forEach(scrollBar => {
            if(isScrollBarX(scrollBar)){
                scrollBar.rePaintScrollBar({ offsetLeft })
            }else{
                scrollBar.rePaintScrollBar({ offsetTop })
            }
        });
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
        .append(this.$canvas);
        const gridContainerWidth = gridContainer.clientWidth;
        const gridContainerHeigth = gridContainer.clientHeight;

        $(this.$canvas).attr("id", this._gridId)
            .attr("width", String(gridContainerWidth))
            .attr("height", String(gridContainerHeigth));

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

    private computeGridInfo(): GridInfo{
        const cw = this.ctx.canvas.width;
        const ch = this.ctx.canvas.height;
        let w = sum(this.tableRows[0].map(headerCol => headerCol.w));
        let h = sum(this.tableRows.map(bodyRow => bodyRow[0].h)); 
        const restAreaNum = (cw / w < 1) &&  (ch / h < 1) ? 2 : 1;
        // show area hidden by scrollBar
        h += restAreaNum * BaseBar.BTNWIDTH;
        w += restAreaNum * BaseBar.BTNWIDTH;
        const xRadio =  cw / w;
        const yRadio = ch / h;

        return {
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
        this.tableRows = [];
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
        const gridInfo = this.computeGridInfo();
        const { xRadio, yRadio} = gridInfo;
        if(xRadio < 1) {
            const scrollBar = new ScrollBarX({ctx: this.ctx, 
                                              ...this.cellCommon,
                                              ...gridInfo,
                                              type:'x',
                                              stepLengthY: this.stepLengthY,
                                              stepLengthX: this.stepLengthX,
                                              repaint: this.repaint.bind(this)});
            this.scrollBars.push(scrollBar);
        }

        if(yRadio < 1) {
            const scrollBar = new ScrollBarY({ctx: this.ctx, 
                                              ...this.cellCommon,
                                              ...gridInfo,
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
        const nextCellOptions: {x: number, y: number} = {x:0, y:0};
        const tableRow: BaseCellType[] = [];
        const {offsetLeft, offsetTop} = this.cellCommon;

        cellOptionsList.forEach((cellOptions, index) => {
            const extendedCellOptions = Object.assign({}, 
                                                      cellOptions, 
                                                      {index, ctx: this.ctx, 
                                                       height: this._headerRowHeight,
                                                       offsetLeft,
                                                       offsetTop,
                                                       colCount :this.colCount,
                                                       rowCount: this.rowCount, 
                                                       row: 0,
                                                       col: index
                                                      }, 
                                                      nextCellOptions);
            const cell = new BaseCellType(extendedCellOptions);
            const {x, y, w: width, h: height, name} = cell;
            this.nameToRectMap[name] = {x, y, width, height};
            nextCellOptions.x = cell.x + cell.w;
            nextCellOptions.y = cell.y;
            tableRow.push(cell)
        })
        this.tableRows.push(tableRow);
    }

    private paintTableBodyRow(data: RowData[]){
        const headerNames: string[] = this.tableRows[0].map(headerRow => headerRow.name); 
        console.time("耗时->待优化")
        // 耗时点-> 循环两次，循环内调用方法，new多次对象。
        data.forEach((row, rowIndex) => {
           const tableRow: BaseCellType[] = []; 
           headerNames.forEach( (key, colIndex) => {
            const extendedCellOptions = this.getBodyCellRect(row, key, rowIndex, colIndex);
            const cell = new BaseCellType(extendedCellOptions);
            tableRow.push(cell);
           })
           this.tableRows.push(tableRow);
        })
        console.timeEnd("耗时->待优化")
    }

    private getBodyCellRect(row: RowData, key: string, rowIndex: number, colIndex: number){
        let matchRect = this.nameToRectMap[key];
        let displayName:string = row[key] !== undefined? row[key]: "";
        let name:string = row[key] !== undefined? row[key]: "";
        const {offsetLeft, offsetTop} = this.cellCommon;
        if(!matchRect) {
            const {x, y, w: width, h: height}=this.tableRows[0][rowIndex]; // get last row rect
            matchRect = {x, y, width, height};
            name = displayName = "";
        }
        matchRect.y = this.currentY;
        matchRect.height = this._rowHeight;
        return {
                displayName,
                name,
                index: rowIndex, 
                ctx: this.ctx,
                offsetLeft,
                offsetTop,
                colCount :this.colCount,
                rowCount: this.rowCount, 
                row: rowIndex + 1, // header——> 1
                col: colIndex,
                ...matchRect
            };
    }

    private get currentY(){
        let currentY: number = 0;
        currentY = this.tableRows.reduce((pre, cur)=>{
                                        return cur[0].h + pre
                                      }, 0);
        return currentY
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