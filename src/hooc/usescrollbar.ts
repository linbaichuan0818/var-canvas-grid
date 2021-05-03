import $ from 'jquery'

type ScrollFn = (e: HTMLElement, scrollX: number) => any
export type Size = {width:number, height:number} 
export type SetSizeFn = (width: number, height:number)=>any
function getScrollBarSize(width: number, height: number) {
    return 20
}

function initScrollBar(scrollBarSize: number, $container:JQuery , onSrollX:ScrollFn, onSrollY:ScrollFn) {
    if ($container.length) {
        ($container as any).scrollBar({
            barWidth: scrollBarSize,
            onSrollY,
            onSrollX
        })
    }
}
export default function ( $container: JQuery, 
    onSrollX:ScrollFn, 
    onSrollY:ScrollFn,
     width:number = 0, height:number = 0):[Size,SetSizeFn]{
    const $placeholderContent = $(document.createElement('div'))
    const scrollBarSize = getScrollBarSize(width, height)
    let size = {
        width,
        height
    }
    $placeholderContent.addClass('placeholder-content')
                        .width(width)
                        .height(height)
                        .appendTo($container)

    initScrollBar(scrollBarSize, $container,onSrollX,onSrollY)

    return [size, (width:number, height:number)=>{
        $placeholderContent.width(width).height(height)
        size.width = width
        size.height = height
    }]
}