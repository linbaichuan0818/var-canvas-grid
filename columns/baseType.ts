
interface DefaultOptions{
    bgColor?: string;
    lineWidth?: number;
    borderColor?: string;
    fontSize?: number,
    padding?: string | number,
    offsetLeft?: number,
    offsetTop?: number
}
interface BaseCellOptions extends DefaultOptions{
    index: number;
    x: number;
    y: number;
    width: number;
    height: number;
    ctx: CanvasRenderingContext2D;
    displayName:string,
    name:string
}
interface BaseCellRect{
    x: number;
    y: number;
    w: number;
    h: number;
    ctx: CanvasRenderingContext2D;
}
const DEFAULTOPTIONS: DefaultOptions = {
    bgColor: "#FFFFFF",
    borderColor: "#CCCCCC" ,
    lineWidth: 1,
    fontSize: 12,
    padding: 0
}
const PIXELREG = /(.\dpx)/i;
export class BaseCellType {
    public x: number = 0;
    public y: number = 0;
    public w: number = 0;
    public h: number = 0;
    public displayName: string = "";
    public name: string = "";
    private _offsetLeft: number = 0;
    private _offsetTop: number = 0;
    private _options: BaseCellOptions;

    constructor(options: BaseCellOptions) {
        this.init(options);
        this.paint();
    }

    public reInit(options: object){
        this._options = Object.assign({}, this._options, options);
        this.initParams(this._options);
    }

    public rePaint(options: object){ 
        this.reInit(options);
        this.clearRect();
        this.paintContent();
        this.paintText()
    }

    private init(options: BaseCellOptions){
        this._options = Object.assign({}, DEFAULTOPTIONS, options);
        this.initParams(this._options);
    }

    private initParams(options: BaseCellOptions){
        this.x = this._options.x;
        this.y = this._options.y;
        this.w = this._options.width;
        this.h = this._options.height;
        this.displayName  = this._options.displayName;
        this.name  = this._options.name;
        this._offsetLeft = this._options.offsetLeft || 0;
        this._offsetTop = this._options.offsetTop || 0;
    }

    private clearRect(){
        const {x, y, w, h, ctx} = this.getCellRect();
        ctx.clearRect(x, y, w, h);
    }

    private getCellRect(): BaseCellRect{
        const { width: w, 
                height: h, 
                ctx, 
                x,
                y,
                lineWidth: lw,
                } = this._options;
        return {x: x - this._offsetLeft, y:  y - this._offsetTop, w, h, ctx}
    }

    private paint(){
        this.paintContent();
        this.paintText()
    }

    private paintText(){
        const { fontSize, padding } = this._options;
        const cellRect = this.getCellRect();
        const { x, y, ctx} = this.getAlignPos(cellRect, fontSize);
        ctx.font = ctx.font.replace(PIXELREG, fontSize + 'px');
        ctx.fillText(this.displayName, x, y)
    }

    // only center
    private getAlignPos(cellRect: BaseCellRect, fontSize: number){
        const {x, y, w, h, ctx} = cellRect;
        const textWidth = ctx.measureText(this.displayName).width;
        return {
            x: x + 0.5*(w - textWidth),
            y: y + 0.5*(h + fontSize),
            ctx
        }
    }

    private paintContent(){
        const { x, y, w, h, ctx} = this.getCellRect();
        const { lineWidth: lw, bgColor: bgc, borderColor: bdgc} = this._options;
        ctx.strokeStyle = bdgc;
        ctx.lineWidth = lw;
        ctx.strokeRect(x + 0.5, y + 0.5, w, h);
    }
}