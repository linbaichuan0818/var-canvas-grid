export class FlowElement{
    width:number
    height:number
    parent?: FlowElement
    flowType: FlowType
}
export class NormalFlowElement extends FlowElement{
    flowX: number
    flowY: number
}
export class UnNormalFlowElement extends FlowElement{
    level: number
    top: number
    left: number
}
export enum FlowType {
    BLOCK,
    ABSOLUTE
}