import { deBounce, throttle } from "../helper/index";
import $ from "jquery";

interface Rect{
    x: number;
    y: number;
    w: number;
    h: number
}
export const removeEvent = ($canvas: JQuery, handler: (...arg:any[])=>void) => {
    $canvas.unbind("mousemove", handler);
    $(document).unbind("mouseup", handler);
}

export const moveScrollBarCallBack = (e: JQuery.MouseDownEvent, 
                                      rect: Rect,
                                      fn:(...arg:any[])=>any, 
                                      e1: JQuery.MouseOverEvent) => {
    let moveX: number = 0;
    const {x, y, w, h} = rect; 
    const maxX: number = e1.currentTarget.width - w;
    moveX =  e1.clientX - e.clientX + x;
    if(moveX < 0){
        moveX = 0;
    }
    if(moveX > maxX){
        moveX = maxX;
    }
    if(x < y){
        deBounce(fn.bind(null, {
                offsetLeft: moveX,
                offsetTop: 0
            }),  10)()
    }
};

export const leaveScrollBarCallBack = ($target: JQuery, 
                                       handler: (...args:any[]) => any, 
                                       e1: JQuery.MouseLeaveEvent) => {
            removeEvent($target ,handler);
}

export const upScrollBarCallBack = ($target: JQuery, 
                                    handler: (...args:any[]) => any, 
                                    e1: JQuery.MouseLeaveEvent) => {
            removeEvent($target ,handler);
}
