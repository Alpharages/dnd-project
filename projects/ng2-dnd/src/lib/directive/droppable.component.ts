import {ChangeDetectorRef} from '@angular/core';
import {Directive, Input, Output, EventEmitter, ElementRef} from '@angular/core';

import {AbstractComponent} from '../abstract.component';
import {DragDropConfig} from '../config/dnd.config';
import {DragDropService, DragDropData} from '../service/dnd.service';

@Directive({selector: '[libDndDroppable]'})
export class DroppableComponentDirective extends AbstractComponent {

  @Input('dropEnabled') set droppable(value: boolean) {
    this.dropEnabled = !!value;
  }

  /**
   * Callback function called when the drop action completes correctly.
   * It is activated before the on-drag-success callback.
   */
  @Output() dropSuccess: EventEmitter<DragDropData> = new EventEmitter<DragDropData>();
  @Output() dragEnter: EventEmitter<DragDropData> = new EventEmitter<DragDropData>();
  @Output() dragOver: EventEmitter<DragDropData> = new EventEmitter<DragDropData>();
  @Output() dragLeave: EventEmitter<DragDropData> = new EventEmitter<DragDropData>();

  @Input('allowDrop') set allowdrop(value: (dropData: any) => boolean) {
    this.allowDrop = value;
  }

  @Input('dropZones') set dropzones(value: Array<string>) {
    this.dropZones = value;
  }

  /**
   * Drag allowed effect
   */
  @Input('effectAllowed') set effectallowed(value: string) {
    this.effectAllowed = value;
  }

  /**
   * Drag effect cursor
   */
  @Input('effectCursor') set effectcursor(value: string) {
    this.effectCursor = value;
  }

  constructor(elemRef: ElementRef, dragDropService: DragDropService, config: DragDropConfig,
              cdr: ChangeDetectorRef) {

    super(elemRef, dragDropService, config, cdr);

    this.dropEnabled = true;
  }

  _onDragEnterCallback(event: MouseEvent): void {
    if (this.dragDropService.isDragged) {
      this.elem.classList.add(this.config.onDragEnterClass);
      this.dragEnter.emit({dragData: this.dragDropService.dragData, mouseEvent: event});
    }
  }

  _onDragOverCallback(event: MouseEvent): void {
    if (this.dragDropService.isDragged) {
      this.elem.classList.add(this.config.onDragOverClass);
      this.dragOver.emit({dragData: this.dragDropService.dragData, mouseEvent: event});
    }
  };

  _onDragLeaveCallback(event: MouseEvent): void {
    if (this.dragDropService.isDragged) {
      this.elem.classList.remove(this.config.onDragOverClass);
      this.elem.classList.remove(this.config.onDragEnterClass);
      this.dragLeave.emit({dragData: this.dragDropService.dragData, mouseEvent: event});
    }
  };

  _onDropCallback(event: MouseEvent): void {
    const dataTransfer = (event as any).dataTransfer;
    if (this.dragDropService.isDragged || (dataTransfer && dataTransfer.files)) {
      this.dropSuccess.emit({dragData: this.dragDropService.dragData, mouseEvent: event});
      if (this.dragDropService.onDragSuccessCallback) {
        this.dragDropService.onDragSuccessCallback.emit({dragData: this.dragDropService.dragData, mouseEvent: event});
      }
      this.elem.classList.remove(this.config.onDragOverClass);
      this.elem.classList.remove(this.config.onDragEnterClass);
    }
  }
}
