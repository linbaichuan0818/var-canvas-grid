import { BaseBar, BaseBarOptions } from "./base-bar";
import {  moveScrollBarXCallBack, scrollBarXOnClickCallBack } from "../event/index";


export class ScrollBarX extends BaseBar{
    public EVENTMAP: {
        moveScrollBarCallBack: (...args: any[]) => any,
        scrollBarOnclickCallBack: (...args: any[]) => any
    } = {
        moveScrollBarCallBack: () => false,
        scrollBarOnclickCallBack: () => false
    };
    constructor(options: BaseBarOptions) {
        super(options);
        this.EVENTMAP.moveScrollBarCallBack = moveScrollBarXCallBack;
        this.EVENTMAP.scrollBarOnclickCallBack = scrollBarXOnClickCallBack;

    }

    public paintScrollBar(){
        const { ctx } = this;
        const {x, y, w, h} = this.getScrollBarRect();
        const {width: cw, height: ch } = ctx.canvas;
        const safeArea = BaseBar.BTNWIDTH * (this.isDouble ? 1 : 0);
        ctx.save();
        ctx.fillStyle = "#F1F1F1";
        ctx.fillRect(
            0, 
            ch - h,
            cw - safeArea,
            h
        );
        ctx.fillStyle = "#DCDCDC";
        ctx.fillRect(
            cw - safeArea, 
            ch - h,
            BaseBar.BTNWIDTH,
            BaseBar.BTNWIDTH
        );
        ctx.fillStyle = "#A8A8A8";
        ctx.fillRect(x, y, w, h);
        this.paintLeftbtn();
        this.paintRightbtn();
        ctx.restore();
    } 
    private paintLeftbtn(){
        const btnRect = this.getButtonRect("bottomLeft");
        const {x, y, w, h} = btnRect;
        const {width: cw, height: ch } = this.ctx.canvas;
        const originX = w / 4;
        const originY = h / 4;
        this.drawTriangle(x + BaseBar.BTNWIDTH - originX, y + originY, 
                          x + BaseBar.BTNWIDTH - originX, y + h - originY, 
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
}