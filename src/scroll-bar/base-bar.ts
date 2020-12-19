import $ from "jquery";
import { deBounce, throttle } from "../helper/index";
import { upScrollBarCallBack, leaveScrollBarCallBack } from "../event/index";
import { ScrollBarX } from "./scroll-bar-x";
export interface BaseBarOptions {
  ctx: CanvasRenderingContext2D;
  offsetTop?: number;
  offsetLeft?: number;
  xRadio: number;
  yRadio: number;
  type: 'x' | 'y';
  ch: number,
  h: number,
  cw: number,
  w: number,
  stepLengthY: number;
  stepLengthX: number;
  repaint: (...args: any[]) => void;
}
interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
type ButtonPosition = "bottomLeft" | "bottomRight" | "rightBottom" | "topRight";
export abstract class BaseBar {
  public static BTNWIDTH: number = 20;
  public abstract EVENTMAP: {
    moveScrollBarCallBack: (...args: any[]) => any;
    scrollBarXOnclickCallBack?: (...args: any[]) => any;
    scrollBarYOnclickCallBack?: (...args: any[]) => any;
    onMousewheel?: (...args: any[]) => any;
  };
  public ctx!: CanvasRenderingContext2D;
  private repaint: (...arg: any[]) => void;
  private _offsetLeft: number = 0;
  private _offsetTop: number = 0;
  private _options!: BaseBarOptions;

  constructor(options: BaseBarOptions) {
    this.init(options);
    this.repaint = options.repaint;
    this.paintScrollBar();
    this.initEvent();
  }

  public abstract paintScrollBar(): void;

  public getScrollBarRect() {
    let { xRadio, yRadio} = this._options;
    const {cw ,ch} = this._options;
    const noSCrollAreaLen: number = this.isDouble ? 3 : 2;

    const isX: boolean =  this._options.type === 'x';
    return {
      x: isX ? this._offsetLeft + BaseBar.BTNWIDTH: this._offsetLeft,
      y: isX ? this._offsetTop: this._offsetTop + BaseBar.BTNWIDTH,
      w: isX
        ? (cw - BaseBar.BTNWIDTH * noSCrollAreaLen) * xRadio
        : BaseBar.BTNWIDTH,
      h: isX
        ? BaseBar.BTNWIDTH
        : (ch - BaseBar.BTNWIDTH * noSCrollAreaLen) * yRadio,
    };
  }

  public rePaintScrollBar(options: object) {
    // this.clearRect();
    this.reinit(options);
    this.paintScrollBar();
  }

  public getButtonRect(position: ButtonPosition) {
    const { width: cw, height: ch } = this.ctx.canvas;
    let x = 0;
    let y = 0;
    switch (position) {
      case "bottomLeft":
        y = ch - BaseBar.BTNWIDTH;
        break;
      case "bottomRight":
        x = cw - BaseBar.BTNWIDTH * (this.isDouble ? 2 : 1);
        y = ch - BaseBar.BTNWIDTH;
        break;
      case "rightBottom":
        x = cw - BaseBar.BTNWIDTH;
        y = ch - BaseBar.BTNWIDTH * (this.isDouble ? 2 : 1);
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
      h: BaseBar.BTNWIDTH,
    };
  }

  public reinit(options: object) {
    const {offsetTop: oldOffsetTop} = this._options;
    this._options = Object.assign({}, this._options, options);
    const {ctx, ch, offsetTop} = this._options;
    this.ctx = ctx;
    const scrollDirection = this._options.type;
    const {
      offsetLeft: _offsetLeft, 
      offsetTop:_offsetTop
    } = this.getSrollBarOffset(scrollDirection);
    this._offsetLeft = _offsetLeft || 0;
    this._offsetTop = _offsetTop || 0;
  }

  public get isDouble() {
    const { xRadio, yRadio } = this._options;
    return xRadio < 1 && yRadio < 1;
  }

  private clearRect() {
    const { x, y, w, h } = this.getScrollBarRect(); // old rect
    this.ctx.clearRect(x - 2, y - 2, w + 3, h + 3);
  }

  private init(options: BaseBarOptions) {
    this._options = options;
    const {ctx, ch, offsetTop} = options;
    this.ctx = ctx;
    const scrollDirection =   this._options.type;
    const {
      offsetLeft: _offsetLeft, 
      offsetTop:_offsetTop
    } = this.getSrollBarOffset(scrollDirection);
    this._offsetLeft = _offsetLeft || 0;
    this._offsetTop = _offsetTop || 0; 
  }

  // common event
  private initEvent() {
    const canvas = this.ctx.canvas;
    const {width, height} = canvas;
    const safeAreaSize = Number(this.isDouble) * BaseBar.BTNWIDTH;
    const $canvas = $(canvas);
    $canvas.bind("click", (e: any) => {
      const { offsetX, offsetY } = e;
      if(offsetY > height - BaseBar.BTNWIDTH 
        && offsetX < width - safeAreaSize) {
        const leftBtnRect = this.getButtonRect("bottomLeft");
        const rightBtnRect = this.getButtonRect("bottomRight");
        const inLeftBtnRect = this.judgeTargetArea(e, leftBtnRect);
        const inRightBtnRect = this.judgeTargetArea(e, rightBtnRect);
        if(this.EVENTMAP.scrollBarXOnclickCallBack) {
          this.EVENTMAP.scrollBarXOnclickCallBack(
            e,
            inLeftBtnRect,
            inRightBtnRect,
            this._options,
            this.getScrollBarRect(),
            this.repaint
          ) 
        }
      }
      if(offsetX > width - BaseBar.BTNWIDTH 
        && offsetY < height - safeAreaSize) {
          const rightBottomBtnRect = this.getButtonRect("rightBottom");
          const topRightBtnRect = this.getButtonRect("topRight");
          const inRightBottomRect = this.judgeTargetArea(e, rightBottomBtnRect);
          const inTopRightRect = this.judgeTargetArea(e, topRightBtnRect);
          if (this.EVENTMAP.scrollBarYOnclickCallBack) {
            this.EVENTMAP.scrollBarYOnclickCallBack(
              e,
              inRightBottomRect,
              inTopRightRect,
              this._options,
              this.getScrollBarRect(),
              this.repaint
            )
          }
      }
    });
    $canvas.on('mousewheel DOMMouseScroll', (e: any)=>{
      e.preventDefault();
      const wheel = e.originalEvent.wheelDelta || -e.originalEvent.detail;
      const delta = Math.max(-1, Math.min(1, wheel) );
      const onMousewheelHandelr= this.EVENTMAP.onMousewheel? this.EVENTMAP.onMousewheel: () => false;
      onMousewheelHandelr(
        this._options.offsetTop - delta * this._options.stepLengthY, 
        this._options,
        this.repaint,
        e
        )
    });
    $canvas.on("mousemove", (e) => {
      // const rect = this.getScrollBarRect();
      // if (this.judgeTargetArea(e, rect)) {
      //   $canvas.css("cursor", "pointer");
      // } else {
      //   $canvas.css("cursor", "default");
      // }
    });
    $canvas.on("mousedown", (e: any) => {
      const rect = this.getScrollBarRect();
      if (!this.judgeTargetArea(e, rect)) {
        return false;
      }
      const moveScrollBarCallBack = this.EVENTMAP.moveScrollBarCallBack
        ? this.EVENTMAP.moveScrollBarCallBack
        : () => false;
      const moveScrollBarHandler = (e1: any) => {
        moveScrollBarCallBack(e, rect, this._options, this.repaint, e1);
      };

      $canvas.on("mousemove", moveScrollBarHandler);
      $canvas.on("mouseleave", (e3: any) => {
        leaveScrollBarCallBack($canvas, moveScrollBarHandler, e3);
      });
      $(document).on("mouseup", (e2: any) => {
        upScrollBarCallBack($canvas, moveScrollBarHandler, e2);
      });
    });
  }
  private getSrollBarOffset(
    scrollDirection: "x" | "y", 
  ) {
      const { offsetLeft, offsetTop, cw, ch, h, w, yRadio, xRadio } = this._options;
      const offset = {
          offsetLeft: 0,
          offsetTop: 0
      };
      
      const noScrollNum = yRadio < 1 && xRadio < 1? 3: 2;
      offset.offsetLeft = scrollDirection === "x" ?
      offsetLeft / w * (cw - BaseBar.BTNWIDTH * noScrollNum): 
      cw - BaseBar.BTNWIDTH;
      offset.offsetTop = scrollDirection === "y" ?
      offsetTop / h * (ch - BaseBar.BTNWIDTH * noScrollNum):
      ch - BaseBar.BTNWIDTH;
      return offset
  }
  private judgeTargetArea(e: JQuery.MouseOverEvent, rect: Rect): boolean {
    const { x, y, w, h } = rect;
    const offsetLeft: number = e.offsetX;
    const offsetTop: number = e.offsetY;
    return (
      offsetLeft > x && offsetLeft < x + w && offsetTop > y && offsetTop < y + h
    );
  }
}
