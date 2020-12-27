// 需要扩展jquery时
interface JQueryStatic {
}
interface JQuery {
    vcbind: (event: string, hanlder: (...args: any[])=> any)=> any
}

declare module "jquery" {
    export = $;
}