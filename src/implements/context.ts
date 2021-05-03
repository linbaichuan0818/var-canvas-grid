import {Ctx} from "@/interface/columns/base-column-type"
let context:Ctx = null
export function getContext():Ctx{
    return context
}
export function setContext(ctx: Ctx){
    context = ctx
}