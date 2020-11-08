import { BaseCellType } from "./columns/index";
import { BaseBar } from "./scroll-bar/base-bar";
import $ from 'jquery';
import { flatten } from "./helper/index";
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
        this.cellCommon = options;
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
            tableHeaderCells.forEach(tableHeaderCell => {
                tableHeaderCell.rePaint(this.cellCommon);
            })
        }
    }

    public rePaintTableBody(tableBodyCells: BaseCellType[]){
        if(tableBodyCells) {
            tableBodyCells.forEach(tableBodyCell => {
                tableBodyCell.rePaint(this.cellCommon);
            })
        }
    }

    public rePaintScrollBar(scrollBars: BaseBar[]){
        scrollBars.forEach(scrollBar => {
            scrollBar.rePaintScrollBar(this.cellCommon)
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
        this.paintOutline();
    }

    private paint() {
        const { thCellOptionsList, data, style, gridId } = this._options;
        this.createCanvas(gridId, style);
        this.paintTableHeader();
        this.paintTableBody();
        this.paintScrollBar();
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
            offsetLeft: options.offsetLeft || 0,
            offsetTop: options.offsetTop || 0,
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
        const scrollBar = new BaseBar({ctx: this.ctx, ...this.cellCommon ,repaint: this.repaint.bind(this)});
        this.scrollBars.push(scrollBar);
    }

    private paintTableHeaderRow(cellOptionsList: ThCellOptions []){
        const nextCellOptions: {x: number, y: number} = {x:0, y:0};
        const tableRow: BaseCellType[] = [];
        cellOptionsList.forEach((cellOptions, index) => {
            const extendedCellOptions = Object.assign({}, 
                                                      cellOptions, 
                                                      {index, ctx: this.ctx, 
                                                       height: this._headerRowHeight,
                                                       ...this.cellCommon,
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
        data.forEach((row, index) => {
           const tableRow: BaseCellType[] = []; 
           for (const key in row) {
                const extendedCellOptions = this.getBodyCellRect(row, key, index);
                const cell = new BaseCellType(extendedCellOptions);
                tableRow.push(cell);
           };
           this.tableRows.push(tableRow);
        })
    }

    private getBodyCellRect(row: RowData, key: string, index: number){
        let matchRect = this.nameToRectMap[key];
        let displayName:string = row[key];
        let name:string = row[key];
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
                              ...this.cellCommon,
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