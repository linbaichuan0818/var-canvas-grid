import $ from "jquery";
import { deBounce, throttle } from "../helper/index";
import { moveScrollBarCallBack, upScrollBarCallBack, leaveScrollBarCallBack } from "../event/index";
interface BaseBarOptions{
    ctx: CanvasRenderingContext2D;
    offsetTop?: number,
    offsetLeft?: number,
    repaint:(...args: any[]) => void;
}
interface Rect{
    x: number,
    y: number,
    w: number,
    h: number
}
export class BaseBar {
    private ctx!: CanvasRenderingContext2D;
    private repaint:(...arg:any[]) => void;
    private _offsetLeft: number = 0;
    private _offsetTop: number = 0;
    private _options!: BaseBarOptions

    constructor(options: BaseBarOptions){
        this.init(options)
        this.repaint = options.repaint;
        this.paintScrollBar();
        this.initScrollEvent();
    }

    public rePaintScrollBar(options: object) {
        this.clearRect();
        this.reinit(options);
        this.paintScrollBar();
    }

    public reinit(options: object){
        this._options = Object.assign({}, this._options, options)
        this.ctx = this._options.ctx;
        this._offsetLeft = this._options.offsetLeft || 0;
        this._offsetTop = this._options.offsetTop || 0;
    }

    private clearRect() {
        const {x, y, w, h} = this.getScrollBarRect(); // old rect
        this.ctx.clearRect(x, y, w, h);
    }

    private paintScrollBar(){
        const {x, y, w, h} = this.getScrollBarRect();
        this.ctx.strokeStyle = "#ccc";
        this.ctx.shadowOffsetX = 10;
        this.ctx.shadowOffsetY = 20;
        this.ctx.strokeRect(x, y, w, h);
    }

    private init(options: BaseBarOptions) {
        this._options = options;
        this.ctx = this._options.ctx;
        this._offsetLeft = this._options.offsetLeft || 0;
        this._offsetTop = this._options.offsetTop || 0;
    }

    private getScrollBarRect(){
        return {
            x: 0 + this._offsetLeft,
            y: 480 + this._offsetTop,
            w: 100,
            h: 20
        }
    }
    private initScrollEvent(){
        const canvas = this.ctx.canvas;
        const $canvas = $(canvas);
        $canvas.on("mousemove",(e)=>{
            if(this.judgeTargetArea(e)){
                $canvas.css("cursor", "pointer");
            }else{
                $canvas.css("cursor", "default");
            }
        })
        $(canvas).on("mousedown", (e)=>{
            const rect = this.getScrollBarRect();
            if(!this.judgeTargetArea(e)){
                return false;
            }
            const moveScrollBarHandler = (e1: any)=>{
                moveScrollBarCallBack(e, rect, this.repaint, e1);
            }

            $canvas.on("mousemove", moveScrollBarHandler)
            $canvas.on("mouseleave", (e3: any)=>{
                leaveScrollBarCallBack($canvas, moveScrollBarHandler, e3);
            })
            $(document).on("mouseup", (e2: any)=>{
                upScrollBarCallBack($canvas, moveScrollBarHandler, e2);
            })
        })
    }

    private judgeTargetArea(e: MouseEventInit): boolean{
        const {x, y, w, h} = this.getScrollBarRect();
        const offsetLeft: number = e.clientX;
        const offsetTop: number = e.clientY;
        return ((offsetLeft > x && offsetLeft < x + w) &&
        (offsetTop > y && offsetTop < y + h))
    }
}