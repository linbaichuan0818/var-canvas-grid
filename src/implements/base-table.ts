import BaseTableType, { Raw,Record } from "@/interface/table/base-table-type"
import BaseColumn from "./base-column"
import { Rect, Positon } from "@/interface/columns/base-column-type"
import BaseTableBody from './base-table-body'
import BaseTableHeader from './base-table-header'

import $ from "jquery"
import "../plugins/scroll-bar.css"
import "../plugins/scroll-bar"
import usescrollbar, {SetSizeFn,Size} from  "@/hooc/usescrollbar"

type Container = string | HTMLElement
interface BaseRowOptions {
    container: Container,
    rawData: Raw[],
    columns: BaseColumn[],
    headerColumns?: BaseColumn[],
    headerRowsCount?: number
}
let scheduledAnimationFrame = false;

export default class BaseTable implements BaseTableType{
    ctx: CanvasRenderingContext2D
    rawData: Raw[]
    tableHeader!: BaseTableHeader
    tableBody!: BaseTableBody
    container: Container;
    gridId!: string;
    headerRowsCount!: number
    setSize:SetSizeFn;
    size:Size; // 占位容器size
    fistPaintSize:Size
    offset: Positon = {
        x: 0,
        y: 0
    }
    constructor(options: BaseRowOptions) {
        this.init(options)
        this.paint()
    }
    addCol<T extends BaseColumn>(col: T): void {
        this.tableBody.addCol(col)
        this.tableHeader.addCol(col)
    }
    delCol(index: number): void {
        this.tableBody.delCol(index)
        this.tableHeader.delCol(index)
    }
    paint(repaint?: boolean): void {
        if (scheduledAnimationFrame) return;
        const queen = 
        repaint? [
            ()=>this.tableBody.repaint(),
            ()=>this.tableHeader.repaint()
        ]: [
            ()=>this.tableHeader.paint(),
            ()=>this.tableBody.paint()
        ]
        scheduledAnimationFrame = true;
        window.requestAnimationFrame(() => {
            this.clearRect()
            queen.forEach(fn=>fn())
            this.setSize(this.fistPaintSize.width, Math.max(this.fistPaintSize.height + this.tableBody.firstRowOffset, this.size.height))
            this.paintOutline()
            scheduledAnimationFrame = false;
        })
    }
    paintOutline() {
        const { ctx } = this;
        ctx.strokeStyle = "#ccc";
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    }
    clearRect( x= 0,y=0, w = this.ctx.canvas.width, h = this.ctx.canvas.height) {
        this.ctx.clearRect(0, 0, w, h);
    }

    repaint(): void {
        this.paint(true)
    }
    init(options: BaseRowOptions): void {
        const { rawData, container, columns, headerColumns, headerRowsCount } = options
        const headerOriginal = headerColumns && headerColumns.length? headerColumns : columns
        const titleRaw:Record = {}
        headerOriginal.map(({name})=>titleRaw[name] = name)
        rawData.unshift(titleRaw)
        this.rawData = rawData

        this.gridId = 'grid-' + Date.now()
        this.container = container
        this.headerRowsCount = headerRowsCount || 1
        this.createCanvas()
        this.initColumns(columns, headerColumns)
    }
    initColumns(columns: BaseColumn[], headerColumns: BaseColumn[]) {
        this.tableBody = new BaseTableBody({
            rowsRange: [this.headerRowsCount, this.rawData.length],
            onPainted:()=>{
                this.tableBody.cols.forEach(col=>col.colDataFn())
                this.setSize(this.tableBody.width, this.tableBody.height)
                this.fistPaintSize = {...this.size}
            }
        })
        this.tableHeader = new BaseTableHeader({
            rowsRange: [0,this.headerRowsCount],
            onPainted:()=>{
                this.tableHeader.cols.forEach(col=>col.colDataFn())
                this.setSize(this.tableHeader.width,this.tableHeader.height)
            }
        })
        this.tableBody.table = this.tableHeader.table = this
        columns.forEach((col, index) => {
            this.tableBody.addCol(col)
            const headerCol = headerColumns.find(headerCol => headerCol.name === col.name)// 传入优先级高
            this.tableHeader.addCol(
                headerCol ?
                headerCol :
                new BaseColumn({
                    name: col.name
                }))
        })
    }
    reInit(): void {
        throw new Error("Method not implemented.");
    }
    getRow(index: number): Raw {
        throw new Error("Method not implemented.");
    }
    createCanvas() {
        const { container, rawData } = this
        const $container = $(container as any || document.body) as any;
        const height = $container.height()
        const width = $container.width()
        const $cavans = $(document.createElement('canvas'))
        const [size, setSize] = usescrollbar($container,
        (e: HTMLElement, scrollX: number) => {
            this.offset = {
                ...this.offset,
                x: scrollX
            }
            this.repaint()
        },
        (e: HTMLElement, scrollY: number) => {
            this.offset = {
                ...this.offset,
                y: scrollY
            }
            this.repaint()
        }
        )
        this.setSize = setSize;
        this.size = size
        
        this.ctx = $cavans[0].getContext('2d')
        $cavans.addClass(this.gridId).attr({
            width: width,
            height: height
        }).css({
            'position': 'absolute',
            'top': 0,
            'left': 0
        })
            .appendTo($container)
    }
    initScrollBar(scrollBarSize: number) {
        const $container = $(this.container as any) as any;
        if ($container.length) {
            $container.scrollBar({
                barWidth: scrollBarSize,
                onSrollY: (e: HTMLElement, scrollY: number) => {
                    this.offset = {
                        ...this.offset,
                        y: scrollY
                    }
                    this.repaint()
                },
                onSrollX: (e: HTMLElement, scrollX: number) => {
                    this.offset = {
                        ...this.offset,
                        x: scrollX
                    }
                    this.repaint()
                }
            })
        }
    }
    getScrollBarSize(width: number, height: number) {
        return 20
    }
}