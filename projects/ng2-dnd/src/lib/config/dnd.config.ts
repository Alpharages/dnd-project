import {isString} from '../utils/dnd.utils';

export class DataTransferEffect {

  static COPY = new DataTransferEffect('copy');
  static LINK = new DataTransferEffect('link');
  static MOVE = new DataTransferEffect('move');
  static NONE = new DataTransferEffect('none');

  constructor(public name: string) {
  }
}

export class DragImage {
  constructor(
    public imageElement: any,
    public xOffset: number = 0,
    public yOffset: number = 0) {
    if (isString(this.imageElement)) {
      // Create real image from string source
      const imgScr: string = this.imageElement as string;
      this.imageElement = new HTMLImageElement();
      (this.imageElement as HTMLImageElement).src = imgScr;
    }
  }
}

export class DragDropConfig {
  public onDragStartClass = 'dnd-drag-start';
  public onDragEnterClass = 'dnd-drag-enter';
  public onDragOverClass = 'dnd-drag-over';
  public onSortableDragClass = 'dnd-sortable-drag';

  public dragEffect: DataTransferEffect = DataTransferEffect.MOVE;
  public dropEffect: DataTransferEffect = DataTransferEffect.MOVE;
  public dragCursor = 'move';
  public dragImage: DragImage | any;
  public defaultCursor = 'pointer';
}
