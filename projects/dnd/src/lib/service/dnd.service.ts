import {Injectable, EventEmitter} from '@angular/core';

import {DragDropConfig} from '../config/dnd.config';
import {isPresent} from '../utils/dnd.utils';
import {SortableContainerDirective} from '../directive/sortable.component';

export class DragDropData {
  dragData: any;
  mouseEvent: MouseEvent | any;
}

export function dragDropServiceFactory(): DragDropService {
  return new DragDropService();
}

@Injectable()
export class DragDropService {
  allowedDropZones: Array<string> = [];
  onDragSuccessCallback: EventEmitter<DragDropData> | any;
  dragData: any;
  isDragged: boolean | any;
}

export function dragDropSortableServiceFactory(config: DragDropConfig): DragDropSortableService {
  return new DragDropSortableService(config);
}

@Injectable()
export class DragDropSortableService {
  index: number | any;
  sortableContainer: SortableContainerDirective | any;
  isDragged: boolean | any;

  private elemVar: HTMLElement | any;

  public get elem(): HTMLElement {
    return this.elemVar;
  }

  constructor(private config: DragDropConfig) {
  }

  markSortable(elem: HTMLElement | null): void {
    if (isPresent(this.elem)) {
      this.elemVar.classList.remove(this.config.onSortableDragClass);
    }
    if (isPresent(elem)) {
      this.elemVar = elem;
      this.elem.classList.add(this.config.onSortableDragClass);
    }
  }
}
