import BaseColumn, {ContentCtx}  from '@/implements/base-column'
export default class CustomColumn extends BaseColumn{
    paintContent(args: any){
        return super.paintContent({...args})
    }
}