import {NormalFlowElement, UnNormalFlowElement, FlowElement} from "@/interface/element-flow/index"
export default class ElementFlow {
    normalFlow:NormalFlowElement[]
    unNormalFlow:UnNormalFlowElement[]
    addElement(element:FlowElement){
        const normal = element instanceof NormalFlowElement
        const unnormal = element instanceof UnNormalFlowElement
        if(unnormal){
            this.unNormalFlow.push(element as UnNormalFlowElement)
        }else if(normal){
            this.normalFlow.push(element as NormalFlowElement)
            this.caculateFlow()
        }
    }
    delElement(element:FlowElement){
        const normal = element instanceof NormalFlowElement
        const unnormal = element instanceof UnNormalFlowElement
        if(unnormal){
            const index = this.unNormalFlow.indexOf(element as UnNormalFlowElement)
            this.unNormalFlow.splice(index,1)
        }else if(normal){
            const index = this.normalFlow.indexOf(element as NormalFlowElement)
            this.normalFlow.splice(index,1)
            this.caculateFlow()
        }
        element = null
    }
    caculateFlow(){
        let sy = 0;
        this.normalFlow.reduce((pre, cur)=>{
            const curFlowY = pre + cur.flowY
            cur.flowY = curFlowY
            return curFlowY
        },sy)
    }
}   