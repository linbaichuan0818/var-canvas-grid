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
    offsetLeft: number;
    offsetTop: number;
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

    constructor(options: GridOption) {
        this.init(options);
        this.paint();
    }

    public reinit(){
        this.tableRows = [];
        this.nameToRectMap = {};
    }

    public repaint(options: CellCommon){
        this.cellCommon = Object.assign(this.cellCommon, options);
        const tableHeaderCells: BaseCellType[] = this.tableRows[0];
        const tableBodyCells: BaseCellType[] = flatten(this.tableRows.slice(1));
        const scrollBars = this.scrollBars;
        this.clearRect();
        this.rePaintTableHeader(tableHeaderCells);
        this.rePaintTableBody(tableBodyCells);
        this.rePaintScrollBar(scrollBars);
        this.paintOutline();
    }

    public rePaintTableHeader(tableHeaderCells: BaseCellType[]) {
        if(tableHeaderCells) {
            const offset = this.getContentOffset();
            tableHeaderCells.forEach(tableHeaderCell => {
                tableHeaderCell.rePaint(offset);
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
        const { offsetLeft, offsetTop } = this.cellCommon;
        const isScrollBarX = (scrollBar: BaseBar) => scrollBar instanceof ScrollBarX;
        scrollBars.forEach(scrollBar => {
            if(isScrollBarX(scrollBar)){
                scrollBar.rePaintScrollBar({ offsetLeft })
            }else{
                scrollBar.rePaintScrollBar({ offsetTop })
            }
        });
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
        this.paintScrollBar();
        this.paintOutline();
    }

    private computeGridInfo(): GridInfo{
        const cw = this.ctx.canvas.width;
        const ch = this.ctx.canvas.height;
        let clientWidth: number = cw;
        let clientHeight: number = ch;
        const w = sum(this.tableRows[0].map(headerCol => headerCol.w));
        const h = sum(this.tableRows.map(bodyRow => bodyRow[0].h)) + BaseBar.BTNWIDTH * 3;
        if(w > cw) { // - scrollBarXHeight
            clientHeight -= BaseBar.BTNWIDTH; 
        }
        if(h > ch) {
            clientWidth -= BaseBar.BTNWIDTH; 
        }
        return {
            xRadio: Number((clientWidth / w).toFixed(1)),
            yRadio: Number((clientHeight / h).toFixed(1)),
            w,
            h,
            cw,
            ch
        } 
    }

    private clearRect(){
        const canvasWidth = this.ctx.canvas.width;
        const canvasHeight = this.ctx.canvas.height;
        this.ctx.clearRect(1, 0.5, canvasWidth - 1.5, canvasHeight - 1.5);
    }

    private init(options: GridOption){
        this.tableRows = [];
        this.nameToRectMap = {};
        this.cellCommon = {
            offsetLeft: options.offsetLeft || BaseBar.BTNWIDTH,
            offsetTop: options.offsetTop || BaseBar.BTNWIDTH,
        }
        this.data = options.data;
        this._rowHeight = options.rowHeight ? options.rowHeight: DEFAULTROWHEIGHT;
        this._headerRowHeight = options.headerRowHeight ? options.headerRowHeight: DEFAULTHEADERROWHEIGHT;
        this._options = options;
    }

    private paintOutline(){
        this.ctx.strokeStyle = "#ccc";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0,0, this.ctx.canvas.width, this.ctx.canvas.height)
    }

    private paintScrollBar(){
        const gridInfo = this.computeGridInfo();
        const { xRadio, yRadio} = gridInfo;
        if(xRadio < 1) {
            const offset = this.getSrollBarOffset("x", gridInfo);
            const scrollBar = new ScrollBarX({ctx: this.ctx, 
                                              ...offset,
                                              xRadio,
                                              yRadio,
                                              repaint: this.repaint.bind(this)});
            this.scrollBars.push(scrollBar);
        }

        if(yRadio < 1) {
            const offset = this.getSrollBarOffset("y", gridInfo);
            const scrollBar = new ScrollBarY({ctx: this.ctx, 
                                              ...offset,
                                              xRadio,
                                              yRadio,
                                              repaint: this.repaint.bind(this)});
            this.scrollBars.push(scrollBar);
        }
    }

    private getSrollBarOffset(
        scrollDirection: "x" | "y", 
        gridInfo: GridInfo
    ): CellCommon{
        const { offsetLeft, offsetTop } = this.cellCommon;
        const offset = {
            offsetLeft: 0,
            offsetTop: 0
        };
        offset.offsetLeft = scrollDirection === "x" ?
        offsetLeft: 
        gridInfo.cw - BaseBar.BTNWIDTH;
        offset.offsetTop = scrollDirection === "y" ?
        offsetTop:
        gridInfo.ch - BaseBar.BTNWIDTH;
        return offset
    }
    
    private getContentOffset(): CellCommon{
        const offset = {
            offsetLeft: 0,
            offsetTop: 0
        };
        const { xRadio, yRadio, w, h, cw, ch } = this.computeGridInfo();
        const { offsetLeft, offsetTop } = this.cellCommon;
        offset.offsetLeft =  ((offsetLeft - BaseBar.BTNWIDTH) /((cw - BaseBar.BTNWIDTH *2) * (1 - xRadio))) * (w - cw);
        offset.offsetTop =  ((offsetTop - BaseBar.BTNWIDTH) /((ch - BaseBar.BTNWIDTH *2) * (1 - yRadio))) * (h - ch);
        return offset
    }

    private paintTableHeaderRow(cellOptionsList: ThCellOptions []){
        const nextCellOptions: {x: number, y: number} = {x:0, y:0};
        const tableRow: BaseCellType[] = [];
        let {offsetLeft, offsetTop} = this.cellCommon;
        offsetLeft -= BaseBar.BTNWIDTH;
        offsetTop -= BaseBar.BTNWIDTH;

        cellOptionsList.forEach((cellOptions, index) => {
            const extendedCellOptions = Object.assign({}, 
                                                      cellOptions, 
                                                      {index, ctx: this.ctx, 
                                                       height: this._headerRowHeight,
                                                       offsetLeft,
                                                       offsetTop
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
        data.forEach((row, index) => {
           const tableRow: BaseCellType[] = []; 
           for (const key of headerNames) {
                const extendedCellOptions = this.getBodyCellRect(row, key, index);
                const cell = new BaseCellType(extendedCellOptions);
                tableRow.push(cell);
           };
           this.tableRows.push(tableRow);
        })
    }

    private getBodyCellRect(row: RowData, key: string, index: number){
        let matchRect = this.nameToRectMap[key];
        let displayName:string = row[key] !== undefined? row[key]: "";
        let name:string = row[key] !== undefined? row[key]: "";
        let {offsetLeft, offsetTop} = this.cellCommon;
        offsetLeft -= BaseBar.BTNWIDTH;
        offsetTop -= BaseBar.BTNWIDTH;
        if(!matchRect) {
            const {x, y, w: width, h: height}=this.tableRows[0][index]; // get last row rect
            matchRect = {x, y, width, height};
            name = displayName = "";
        }
        matchRect.y = this.currentY;
        matchRect.height = this._rowHeight;
        return Object.assign({displayName, name}, 
                             {index, 
                              ctx: this.ctx,
                              offsetLeft,
                              offsetTop,
                              ...matchRect});
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