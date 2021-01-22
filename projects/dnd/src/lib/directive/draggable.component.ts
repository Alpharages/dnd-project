import {ChangeDetectorRef} from '@angular/core';
import {Directive, Input, Output, EventEmitter, ElementRef} from '@angular/core';

import {AbstractComponent, AbstractHandleComponent} from '../abstract.component';
import {DragDropConfig, DragImage} from '../config/dnd.config';
import {DragDropService, DragDropData} from '../service/dnd.service';

@Directive({selector: '[libDndDraggable]'})
export class DraggableComponentDirective extends AbstractComponent {

  @Input('dragEnabled') set draggable(value: boolean) {
    this.dragEnabled = !!value;
  }

  /**
   * Callback function called when the drag actions happened.
   */
  @Output() onDragStart: EventEmitter<DragDropData> = new EventEmitter<DragDropData>();
  @Output() onDragEnd: EventEmitter<DragDropData> = new EventEmitter<DragDropData>();

  /**
   * The data that has to be dragged. It can be any JS object
   */
  @Input() dragData: any;

  /**
   * Callback function called when the drag action ends with a valid drop action.
   * It is activated after the on-drop-success callback
   */
  @Output() dragSuccess: EventEmitter<any> = new EventEmitter<any>();

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

  /**
   * Here is the property dragImage you can use:
   * - The string value as url to the image
   *   <div class="panel panel-default"
   *        dnd-draggable [dragEnabled]="true"
   *        [dragImage]="/images/simpler.png">
   * ...
   * - The DragImage value with Image and offset by x and y:
   *   let myDragImage: DragImage = new DragImage("/images/simpler1.png", 0, 0);
   * ...
   *   <div class="panel panel-default"
   *        dnd-draggable [dragEnabled]="true"
   *        [dragImage]="myDragImage">
   * ...
   * - The custom function to return the value of dragImage programmatically:
   *   <div class="panel panel-default"
   *        dnd-draggable [dragEnabled]="true"
   *        [dragImage]="getDragImage(someData)">
   * ...
   *   getDragImage(value:any): string {
   *     return value ? "/images/simpler1.png" : "/images/simpler2.png"
   *   }
   */
  @Input() dragImage: string | DragImage | (() => void) | any;


  @Input() cloneItem: boolean | any;

  constructor(elemRef: ElementRef, dragDropService: DragDropService, config: DragDropConfig,
              cdr: ChangeDetectorRef) {

    super(elemRef, dragDropService, config, cdr);
    this.defaultCursor = this.elem.style.cursor;
    this.dragEnabled = true;
  }

  _onDragStartCallback(event: MouseEvent): void {
    this.dragDropService.isDragged = true;
    this.dragDropService.dragData = this.dragData;
    this.dragDropService.onDragSuccessCallback = this.dragSuccess;
    this.elem.classList.add(this.config.onDragStartClass);
    //
    this.onDragStart.emit({dragData: this.dragData, mouseEvent: event});
  }

  _onDragEndCallback(event: MouseEvent): void {
    this.dragDropService.isDragged = false;
    this.dragDropService.dragData = null;
    this.dragDropService.onDragSuccessCallback = null;
    this.elem.classList.remove(this.config.onDragStartClass);
    //
    this.onDragEnd.emit({dragData: this.dragData, mouseEvent: event});
  }
}


@Directive({selector: '[libDndDraggableHandle]'})
export class DraggableHandleComponentDirective extends AbstractHandleComponent {
  constructor(elemRef: ElementRef, dragDropService: DragDropService, config: DragDropConfig, component: DraggableComponentDirective,
              cdr: ChangeDetectorRef) {

    super(elemRef, dragDropService, config, component, cdr);
  }
}
