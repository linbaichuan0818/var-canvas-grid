import { BaseBar, BaseBarOptions } from "./base-bar";
import {
  moveScrollBarYCallBack,
  scrollBarYOnClickCallBack,
} from "../event/index";

export class ScrollBarY extends BaseBar {
  public EVENTMAP: {
    moveScrollBarCallBack: (...args: any[]) => any;
    scrollBarOnclickCallBack: (...args: any[]) => any;
  } = {
    moveScrollBarCallBack: () => false,
    scrollBarOnclickCallBack: () => false,
  };
  constructor(options: BaseBarOptions) {
    super(options);
    this.EVENTMAP.moveScrollBarCallBack = moveScrollBarYCallBack;
    this.EVENTMAP.scrollBarOnclickCallBack = scrollBarYOnClickCallBack;
  }

  public paintScrollBar() {
    const { ctx } = this;
    const { x, y, w, h } = this.getScrollBarRect();
    const { width: cw, height: ch } = ctx.canvas;
    const safeArea = BaseBar.BTNWIDTH * (this.isDouble ? 1 : 0);
    ctx.save();
    ctx.fillStyle = "#F1F1F1";
    ctx.fillRect(cw - w, 0, w, ch - safeArea);
    if (safeArea) {
      ctx.fillStyle = "#DCDCDC";
      ctx.fillRect(cw - w, ch - safeArea, BaseBar.BTNWIDTH, BaseBar.BTNWIDTH);
    }
    ctx.fillStyle = "#A8A8A8";
    ctx.fillRect(x, y, w, h);
    this.paintTopbtn();
    this.paintBottomtbtn();
    ctx.restore();
  }
  private paintTopbtn() {
    const btnRect = this.getButtonRect("topRight");
    const { x, y, w, h } = btnRect;
    const { width: cw, height: ch } = this.ctx.canvas;
    const originX = w / 4;
    const originY = h / 4;
    this.drawTriangle(
      x + 2 * originX,
      y + originY,
      x + originX,
      y + h - originY,
      x + w - originX,
      3 * originY,
      "#A8A8A8",
      "fill"
    );
  }

  private paintBottomtbtn() {
    const btnRect = this.getButtonRect("rightBottom");
    const { x, y, w, h } = btnRect;
    const { width: cw, height: ch } = this.ctx.canvas;
    const originX = w / 4;
    const originY = h / 4;
    this.drawTriangle(
      x + originX,
      y + originY,
      x + 2 * originX,
      y + h - originY,
      x + w - originX,
      y + originY,
      "#A8A8A8",
      "fill"
    );
  }

  private drawTriangle(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    color: string,
    type: "fill" | "stroke"
  ) {
    const { ctx } = this;
    const style: "fillStyle" | "strokeStyle" = (type + "Style") as any;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx[style] = color;
    ctx.closePath();
    ctx[type]();
  }
}
