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
  $canvas: JQuery<Element | Document>,
  handler: (...arg: any[]) => void
) => {
  $canvas.unbind("mousemove", handler);
  $(document).unbind("mouseup", handler);
};
let scheduledAnimationFrame = false;
export const moveScrollBarXCallBack = (
  e: JQuery.MouseDownEvent,
  rect: Rect,
  options: BaseBarOptions,
  fn: (...arg: any[]) => any,
  e1: JQuery.MouseOverEvent
) => {
  const { 
    xRadio, 
    yRadio,
    w: contentW,
    cw
  } = options;
  const noScrollAreaNum = xRadio < 1 && yRadio < 1 ? 3 : 2;
  const {x: barOffsetLeft } = rect;
  let moveX = (e1.clientX - e.clientX + barOffsetLeft) *  contentW / (cw - BaseBar.BTNWIDTH *noScrollAreaNum);
  if (moveX < 0 ) {
    moveX = 0;
  }
  if (moveX > (1- xRadio) * contentW) {
    moveX = (1- xRadio) * contentW;
  }
  if(scheduledAnimationFrame) return;
  scheduledAnimationFrame = true;
  window.requestAnimationFrame(()=>{
    fn({
      offsetLeft: moveX
    });
    scheduledAnimationFrame = false;
  });
};

export const onMousewheelY = (
    moveY: number, 
    options: BaseBarOptions,
    fn: (...arg: any[]) => any,
    e: any
  ) => {
    const {h: contentH, yRadio} = options;
    if(moveY < 0 ) {
       moveY =  0 ;
    };
    if (moveY > (1- yRadio) * contentH) {
      moveY = (1- yRadio) * contentH;
    }
    if(scheduledAnimationFrame) return;
    scheduledAnimationFrame = true;
    window.requestAnimationFrame(()=>{
      fn({
        offsetTop: moveY
      });
      scheduledAnimationFrame = false;
    });
}
export const moveScrollBarYCallBack = (
  e: JQuery.MouseDownEvent,
  rect: Rect,
  options: BaseBarOptions,
  fn: (...arg: any[]) => any,
  e1: JQuery.MouseOverEvent
) => {

  const { 
    yRadio, 
    xRadio,
    h: contentH,
    ch
  } = options;
  const noScrollAreaNum = xRadio < 1 && yRadio < 1 ? 3 : 2;
  const {y: barOffsetTop } = rect;
  const mouseOffsetY = e1.clientY - e.clientY;
  let moveY = (mouseOffsetY + barOffsetTop) *  contentH / (ch - BaseBar.BTNWIDTH *noScrollAreaNum);
  if(barOffsetTop <= BaseBar.BTNWIDTH && mouseOffsetY < 0 || 
    barOffsetTop >= ch - BaseBar.BTNWIDTH && mouseOffsetY > 0) {
    return false;
  }
  if (moveY < 0 ) {
    moveY = 0;
  }
  if (moveY > (1- yRadio) * contentH) {
    moveY = (1- yRadio) * contentH;
  }
  if(scheduledAnimationFrame) return;
  scheduledAnimationFrame = true;
  window.requestAnimationFrame(()=>{
    fn({
      offsetTop: moveY
    });
    scheduledAnimationFrame = false;
  });
};

export const scrollBarXOnClickCallBack = (
  e: JQuery.ClickEvent,
  inLeftBtnRect: boolean,
  inRightBtnRect: boolean,
  options: BaseBarOptions,
  rect: Rect,
  fn: (...arg: any[]) => any
) => {
  const { 
    offsetLeft, 
    xRadio, 
    yRadio, 
    stepLengthX, 
    w: contentW, cw
  } = options;
  const { w: barW, x: barOffsetLeft } = rect;
  let { offsetX: moveX} = e;
  const isBack = moveX > barOffsetLeft;
  // 待优化
  const bigData = barW < 2 * BaseBar.BTNWIDTH;  
  const noScrollAreaNum = xRadio < 1 && yRadio < 1 ? 3 : 2;
  // click gray area
  if(moveX >= barOffsetLeft && moveX <= barOffsetLeft + barW) {
    return false;
  }

  moveX = (moveX - Number(isBack)*barW - Number(!bigData) * BaseBar.BTNWIDTH) *  contentW / (cw - BaseBar.BTNWIDTH * noScrollAreaNum) ;

  // click button
  if (inLeftBtnRect) {
    moveX = offsetLeft - stepLengthX; // step length
    if (moveX < 0 ) {
      moveX = 0;
    }
  }
  if (inRightBtnRect) {
    moveX = offsetLeft + stepLengthX;
    if (moveX > (1- xRadio) * contentW) {
      moveX = (1- xRadio) * contentW;
    }
  }
  fn({
    offsetLeft: moveX,
  });
};

export const scrollBarYOnClickCallBack = (
  e: JQuery.ClickEvent,
  inRightBottomRect: boolean,
  inTopRightRect: boolean,
  options: BaseBarOptions,
  rect: Rect,
  fn: (...arg: any[]) => any
) => {
  const { 
    offsetTop, 
    yRadio, 
    xRadio,
    stepLengthY, 
    h: contentH, 
    ch
  } = options;
  const { h: barH, y: barOffsetTop } = rect;
  let { offsetY: moveY} = e;
  const isBack = moveY > barOffsetTop;
  const bigData = barH < 2 * BaseBar.BTNWIDTH;  
  const noScrollAreaNum = xRadio < 1 && yRadio < 1 ? 3 : 2;
  
  // click gray area
  if(moveY >= barOffsetTop && moveY <= barOffsetTop + barH) {
    return false;
  }

  moveY = (moveY - Number(isBack) * barH - Number(!bigData) * BaseBar.BTNWIDTH) *  contentH / (ch - BaseBar.BTNWIDTH *noScrollAreaNum) ;
  
  // click button
  if (inTopRightRect) {
    moveY = offsetTop - stepLengthY; // step length
    if (moveY < 0 ) {
      moveY = 0;
    }
  }
  if (inRightBottomRect) {
    moveY = offsetTop + stepLengthY;
    if (moveY > (1- yRadio) * contentH) {
      moveY = (1- yRadio) * contentH;
    }
  }
  fn({
    offsetTop: moveY
  });
};

export const leaveScrollBarCallBack = (
  $target: JQuery,
  handler: (...args: any[]) => any,
  e1: JQuery.MouseLeaveEvent
) => {
  removeEvent($target, handler);
};

export const upScrollBarCallBack = (
  $target: JQuery<Document | Element>,
  handler: (...args: any[]) => any,
  e1: JQuery.MouseLeaveEvent
) => {
  removeEvent($target, handler);
};
