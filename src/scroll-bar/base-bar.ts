import $ from "jquery";
import { deBounce, throttle } from "../helper/index";
import {  upScrollBarCallBack, leaveScrollBarCallBack } from "../event/index";
export interface BaseBarOptions{
    ctx: CanvasRenderingContext2D;
    offsetTop?: number,
    offsetLeft?: number,
    xRadio: number,
    yRadio: number,
    repaint:(...args: any[]) => void;
}
interface Rect{
    x: number,
    y: number,
    w: number,
    h: number
}
type ButtonPosition =  "bottomLeft" 
                    | "bottomRight" 
                    | "rightBottom" 
                    | "topRight";
export abstract class BaseBar {
    public static BTNWIDTH: number = 20;
    public abstract EVENTMAP: {
        moveScrollBarCallBack: (...args: any[]) => any,
        scrollBarOnclickCallBack: (...args: any[]) => any
    };
    public ctx!: CanvasRenderingContext2D;
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

    public abstract paintScrollBar(): void

    public getScrollBarRect(){
        const cw = this.ctx.canvas.width;
        const ch = this.ctx.canvas.height;
        const xRadio = this._options.xRadio;
        const yRadio = this._options.yRadio;
        const isX: boolean = this._offsetLeft < (cw - 20);
        const noSCrollAreaLen: number = this.isDouble? 3 : 2;
        return {
            x: this._offsetLeft,
            y: this._offsetTop,
            w: isX ? 
            (cw - BaseBar.BTNWIDTH * noSCrollAreaLen) * xRadio :
            BaseBar.BTNWIDTH,
            h: isX ? 
            BaseBar.BTNWIDTH: 
            (ch - BaseBar.BTNWIDTH * noSCrollAreaLen) * yRadio
        }
    }
    
    public rePaintScrollBar(options: object) {
        this.clearRect();
        this.reinit(options);
        this.paintScrollBar();   
    }

    public getButtonRect(position: ButtonPosition){
        const {width: cw, height: ch } = this.ctx.canvas;
        let x = 0;
        let y = 0;
        switch (position) {
            case "bottomLeft":
                y = ch - BaseBar.BTNWIDTH;
                break;
            case "bottomRight":
                x = cw - BaseBar.BTNWIDTH * (this.isDouble? 2: 1);
                y = ch - BaseBar.BTNWIDTH;
                break;
            case "rightBottom":
                x = cw - BaseBar.BTNWIDTH;
                y = ch - BaseBar.BTNWIDTH * (this.isDouble? 2: 1);
                break;
            case "topRight":
                x = cw - BaseBar.BTNWIDTH;
                break;
            default:
                break;
        }
        return {
            x,
            y,
            w: BaseBar.BTNWIDTH,
            h: BaseBar.BTNWIDTH
        }
    }

    public reinit(options: object){
        this._options = Object.assign({}, this._options, options)
        this.ctx = this._options.ctx;
        this._offsetLeft = this._options.offsetLeft || 0;
        this._offsetTop = this._options.offsetTop || 0;
    }
    
    public get isDouble(){
        const { xRadio, yRadio } = this._options;
        return xRadio < 1 && yRadio < 1
    }

    private clearRect() {
        const {x, y, w, h} = this.getScrollBarRect(); // old rect
        this.ctx.clearRect(x-2, y-2, w+3, h+3);
    }

    private init(options: BaseBarOptions) {
        this._options = options;
        this.ctx = this._options.ctx;
        this._offsetLeft = this._options.offsetLeft || 0;
        this._offsetTop = this._options.offsetTop || 0;
    }

    // common event
    private initEvent(){
        const canvas = this.ctx.canvas;
        const $canvas = $(canvas);
        $canvas.on("click", (e) => {
            const leftBtnRect = this.getButtonRect("bottomLeft");
            const rightBtnRect = this.getButtonRect("bottomRight");
            const rightBottomBtnRect = this.getButtonRect("rightBottom");
            const topRightBtnRect = this.getButtonRect("topRight");
            const inLeftBtnRect = this.judgeTargetArea(e, leftBtnRect);
            const inRightBtnRect = this.judgeTargetArea(e, rightBtnRect);
            const inRightBottomRect = this.judgeTargetArea(e, rightBottomBtnRect);
            const inTopRightRect = this.judgeTargetArea(e, topRightBtnRect);
            this.EVENTMAP.scrollBarOnclickCallBack(
                e,
                inLeftBtnRect,
                inRightBtnRect,
                inRightBottomRect,
                inTopRightRect,
                this._options,
                this.getScrollBarRect(),
                this.repaint, 
            )
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
            const moveScrollBarCallBack =  this.EVENTMAP.moveScrollBarCallBack ?
                                           this.EVENTMAP.moveScrollBarCallBack :
                                           () => false;
            const moveScrollBarHandler = (e1: any)=>{
                moveScrollBarCallBack(
                    e, 
                    rect, 
                    this.isDouble,
                    this.repaint, 
                    e1
                );
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