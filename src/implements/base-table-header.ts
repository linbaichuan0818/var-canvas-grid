import BaseRows from "./base-rows";
import BaseColumn from "./base-column";
export default class BaseTableHeader extends BaseRows {
  addCol<T extends BaseColumn>(col: T): void {
    if (this.cols.find((headerCol) => headerCol.name === col.name)) return; // 传入优先级高
    super.addCol(
      new BaseColumn({
        name: col.name,
      })
    );
  }
  paint(){
    const {x: tox} = this.table.offset 
    super.paint({x:tox, y:0})
  }
  repaint(){
    const {x: tox} = this.table.offset 
    super.repaint({x:tox, y:0})
  }
}
