import { deBounce, throttle } from "../helper/index";
import { BaseBar, BaseBarOptions } from "../scroll-bar/base-bar";
import $ from "jquery";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
export const removeEvent = (
  $canvas: JQuery,
  handler: (...arg: any[]) => void
) => {
  $canvas.unbind("mousemove", handler);
  $(document).unbind("mouseup", handler);
};

export const moveScrollBarXCallBack = (
  e: JQuery.MouseDownEvent,
  rect: Rect,
  isDouble: boolean,
  fn: (...arg: any[]) => any,
  e1: JQuery.MouseOverEvent
) => {
  const { x, y, w, h } = rect;
  const cw = e.currentTarget.width;
  const ch = e.currentTarget.height;
  let moveX: number = 0;
  const maxX: number = cw - w;
  const noSCrollAreaLen: number = isDouble ? 2 : 1;
  moveX = e1.clientX - e.clientX + x;
  if (moveX < BaseBar.BTNWIDTH * noSCrollAreaLen) {
    moveX = BaseBar.BTNWIDTH;
  }
  if (moveX > maxX - BaseBar.BTNWIDTH * noSCrollAreaLen) {
    moveX = maxX - BaseBar.BTNWIDTH * noSCrollAreaLen;
  }
  fn({
    offsetLeft: moveX,
  });
};

export const moveScrollBarYCallBack = (
  e: JQuery.MouseDownEvent,
  rect: Rect,
  isDouble: boolean,
  fn: (...arg: any[]) => any,
  e1: JQuery.MouseOverEvent
) => {
  const { x, y, w, h } = rect;
  const cw = e.currentTarget.width;
  const ch = e.currentTarget.height;
  let moveY: number = 0;
  const maxY: number = ch - h;
  const noSCrollAreaLen: number = isDouble ? 2 : 1;
  moveY = e1.clientY - e.clientY + y;
  if (moveY < BaseBar.BTNWIDTH * noSCrollAreaLen) {
    moveY = BaseBar.BTNWIDTH;
  }
  if (moveY > maxY - BaseBar.BTNWIDTH * noSCrollAreaLen) {
    moveY = maxY - BaseBar.BTNWIDTH * noSCrollAreaLen;
  }
  fn({
    offsetTop: moveY,
  });
};

export const scrollBarXOnClickCallBack = (
  e: JQuery.ClickEvent,
  inLeftBtnRect: boolean,
  inRightBtnRect: boolean,
  inRightBottomRect: boolean,
  inLeftRect: boolean,
  options: BaseBarOptions,
  rect: Rect,
  fn: (...arg: any[]) => any
) => {
  const { offsetLeft, ctx, xRadio, yRadio } = options;
  const isDouble = xRadio < 1 && yRadio < 1;
  if (inLeftBtnRect) {
    let moveX = offsetLeft - 100; // stepLen
    if (moveX < 0 + BaseBar.BTNWIDTH * 2) {
      moveX = BaseBar.BTNWIDTH;
    }
    fn({
      offsetLeft: moveX,
    });
  }
  if (inRightBtnRect) {
    const { w } = rect;
    const cw = ctx.canvas.width;
    const maxX = cw - w;
    let moveX = offsetLeft + 100;
    if (moveX > maxX - BaseBar.BTNWIDTH * 2) {
      moveX = maxX - BaseBar.BTNWIDTH * (isDouble ? 2 : 1);
    }
    fn({
      offsetLeft: moveX,
    });
  }
};

export const scrollBarYOnClickCallBack = (
  e: JQuery.ClickEvent,
  inLeftBtnRect: boolean,
  inRightBtnRect: boolean,
  inRightBottomRect: boolean,
  inTopRightRect: boolean,
  options: BaseBarOptions,
  rect: Rect,
  fn: (...arg: any[]) => any
) => {
  const { offsetTop, ctx, xRadio, yRadio } = options;
  const isDouble = xRadio < 1 && yRadio < 1;
  if (inTopRightRect) {
    let moveY = offsetTop - 100; // stepLen
    if (moveY < 0 + BaseBar.BTNWIDTH * 2) {
      moveY = BaseBar.BTNWIDTH;
    }
    fn({
      offsetTop: moveY,
    });
  }
  if (inRightBottomRect) {
    const { h } = rect;
    const ch = ctx.canvas.height;
    const maxY = ch - h;
    let moveY = offsetTop + 100;
    if (moveY > maxY - BaseBar.BTNWIDTH * 2) {
      moveY = maxY - BaseBar.BTNWIDTH * (isDouble ? 2 : 1);
    }
    fn({
      offsetTop: moveY,
    });
  }
};

export const leaveScrollBarCallBack = (
  $target: JQuery,
  handler: (...args: any[]) => any,
  e1: JQuery.MouseLeaveEvent
) => {
  removeEvent($target, handler);
};

export const upScrollBarCallBack = (
  $target: JQuery,
  handler: (...args: any[]) => any,
  e1: JQuery.MouseLeaveEvent
) => {
  removeEvent($target, handler);
};
