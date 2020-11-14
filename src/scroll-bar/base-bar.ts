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
type ButtonPosition =  "bottomLeft" | "bottomRight";
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
        this.initEvent();
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
        this.ctx.clearRect(x-2, y-2, w+3, h+3);
    }

    private paintScrollBar(){
        const {x, y, w, h} = this.getScrollBarRect();
        const {width: cw, height: ch } = this.ctx.canvas;
        this.ctx.save();
        this.ctx.fillStyle = "#F1F1F1";
        this.ctx.fillRect(0, ch - h,  cw, h);
        this.ctx.fillStyle = "#A8A8A8";
        this.ctx.fillRect(x, y, w, h);
        this.paintLeftbtn();
        this.paintRightbtn();
        this.ctx.restore();
    }

    private drawTriangle(x1: number, y1: number, 
                         x2: number, y2: number,
                         x3: number, y3: number, 
                         color: string, type: "fill" | "stroke") {
        const { ctx } = this;
        const style: "fillStyle" | "strokeStyle"  = (type + 'Style') as any;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx[style] = color;
        ctx.closePath();
        ctx[type]();
    }

    private paintLeftbtn(){
        const btnRect = this.getButtonRect("bottomLeft");
        const {x, y, w, h} = btnRect;
        const {width: cw, height: ch } = this.ctx.canvas;
        const originX = w / 4;
        const originY = h / 4;
        this.drawTriangle(x + 20 - originX, y + originY, 
                          x + 20 - originX, y + h - originY, 
                          x + originX, y + (ch-y)/2, 
                          "#A8A8A8", "fill");
    }

    private paintRightbtn(){
        const btnRect = this.getButtonRect("bottomRight");
        const {x, y, w, h} = btnRect;
        const {width: cw, height: ch } = this.ctx.canvas;
        const originX = w / 4;
        const originY = h / 4;
        this.drawTriangle(x + originX , y + originY, 
                          x + originX, y + h - originY, 
                          x + w - originX, y + (ch-y)/2, 
                          "#A8A8A8", "fill" );
    }

    private init(options: BaseBarOptions) {
        this._options = options;
        this.ctx = this._options.ctx;
        this._offsetLeft = this._options.offsetLeft || 0;
        this._offsetTop = this._options.offsetTop || 0;
    }

    private getButtonRect(position: ButtonPosition){
        const {width: cw, height: ch } = this.ctx.canvas;
        let x = 0;
        let y = 0;
        switch (position) {
            case "bottomLeft":
                y = ch - 20;
                break;
            case "bottomRight":
                x = cw - 20;
                y = ch - 20;
                break;
            default:
                break;
        }
        return {
            x,
            y,
            w: 20,
            h: 20
        }
    }

    private getScrollBarRect(){
        return {
            x: 0 + this._offsetLeft,
            y: 480 + this._offsetTop,
            w: 100,
            h: 20
        }
    }
    private initEvent(){
        const canvas = this.ctx.canvas;
        const $canvas = $(canvas);
        $canvas.on("click", (e) => {
            const leftBtnRect = this.getButtonRect("bottomLeft");
            const rightBtnRect = this.getButtonRect("bottomRight");
            const inLeftBtnRect = this.judgeTargetArea(e, leftBtnRect);
            const inRightBtnRect = this.judgeTargetArea(e, rightBtnRect);
            if(inLeftBtnRect) {
                let moveX = this._offsetLeft - 100;
                if(moveX < 0 + 20*2){
                    moveX = 20;
                }
                this.repaint({
                    offsetLeft: moveX,
                    offsetTop: 0
                })
            }
            if(inRightBtnRect){
                const { w } = this.getScrollBarRect();
                const cw = this.ctx.canvas.width;
                const maxX = cw - w 
                let moveX = this._offsetLeft + 100;
                if(moveX > maxX - 20*2){
                    moveX = maxX - 20;
                }
                this.repaint({
                    offsetLeft: moveX,
                    offsetTop: 0
                })

            }
        })
        $canvas.on("mousemove",(e)=>{
            const rect = this.getScrollBarRect();
            if(this.judgeTargetArea(e, rect)){
                $canvas.css("cursor", "pointer");
            }else{
                $canvas.css("cursor", "default");
            }
        })
        $canvas.on("mousedown", (e)=>{
            const rect = this.getScrollBarRect();
            if(!this.judgeTargetArea(e, rect)){
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

    private judgeTargetArea(e: MouseEventInit, rect: Rect): boolean{
        const {x, y, w, h} = rect;
        const offsetLeft: number = e.clientX;
        const offsetTop: number = e.clientY;
        return ((offsetLeft > x && offsetLeft < x + w) &&
        (offsetTop > y && offsetTop < y + h))
    }
}