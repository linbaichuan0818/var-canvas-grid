import {getBrowserType} from './views'
export function ctxline(
    ctx: CanvasRenderingContext2D,
    sx: number,
    sy: number,
    ex: number,
    ey: number,
    strokeStyle: string = "#000",
    lineWidth: number = 1
) {
    const env = getBrowserType();
    const ii = env.includes('IE')? 8 : 10
    ctx.beginPath();
    ctx.strokeStyle = strokeStyle
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.lineWidth = lineWidth / ii;
    ctx.stroke()
}