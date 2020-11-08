/**
 * @description 数组扁平化
 * @param {Array<any>} arr  
 * @return {Array<any>}
 */
export function flatten(arr: any[]): any[] {
    return arr.reduce((pre, cur) => {
                        return pre.concat(Array.isArray(cur) ? 
                        flatten(cur) : cur);
                    },[])
}
/**
 * @description 防抖
 * @param {Function} fn 
 * @param {Number} wait 
 */
export function deBounce(fn: ()=>void, wait: number) {
    let timer: any
    return function() {
      if(timer) { clearTimeout(timer) }
      timer = setTimeout(() => {
                        fn.apply(this, arguments)
                       },wait)
    }
}
/**
 * @description 节流
 * @param {Function} fn 
 * @param {Number} interval 
 */
export function throttle(fn: ()=>void, interval: number) {
    let canRun = true
    return function(){
      if(!canRun) {
        return
      }
      canRun = false
      setTimeout(()=>{
                fn.apply(this, arguments)
                canRun = true
              }, interval)
    }
  }