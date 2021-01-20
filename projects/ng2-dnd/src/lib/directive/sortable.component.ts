import {ChangeDetectorRef} from '@angular/core';
import {Directive, Input, Output, EventEmitter, ElementRef} from '@angular/core';
import {FormArray} from '@angular/forms';

import {AbstractComponent, AbstractHandleComponent} from '../abstract.component';
import {DragDropConfig} from '../config/dnd.config';
import {DragDropService, DragDropSortableService} from '../service/dnd.service';

@Directive({selector: '[libDndSortableContainer]'})
export class SortableContainerDirective extends AbstractComponent {

  @Input('dragEnabled') set draggable(value: boolean) {
    this.dragEnabled = !!value;
  }

  private sortableDataVar: Array<any> | FormArray = [];
  private sortableHandler: SortableFormArrayHandler | SortableArrayHandler | any;

  @Input() set sortableData(sortableData: Array<any> | FormArray) {
    this.sortableDataVar = sortableData;
    if (sortableData instanceof FormArray) {
      this.sortableHandler = new SortableFormArrayHandler();
    } else {
      this.sortableHandler = new SortableArrayHandler();
    }
    //
    this.dropEnabled = !!this.sortableDataVar;
    // console.log("collection is changed, drop enabled: " + this.dropEnabled);
  }

  get sortableData(): Array<any> | FormArray {
    return this.sortableDataVar;
  }

  @Input('dropZones') set dropzones(value: Array<string>) {
    this.dropZones = value;
  }

  constructor(elemRef: ElementRef, dragDropService: DragDropService, config: DragDropConfig, cdr: ChangeDetectorRef,
              private sortableDataVarService: DragDropSortableService) {

    super(elemRef, dragDropService, config, cdr);
    this.dragEnabled = false;
  }

  _onDragEnterCallback(event: Event): void {
    if (this.sortableDataVarService.isDragged) {
      const item: any = this.sortableDataVarService.sortableContainer.getItemAt(this.sortableDataVarService.index);
      // Check does element exist in sortableData of this Container
      if (this.indexOf(item) === -1) {
        // Let's add it
        // console.log('Container._onDragEnterCallback. drag node [' + this.sortableDataVarService.index.toString() + '] over parent node');
        // Remove item from previouse list
        this.sortableDataVarService.sortableContainer.removeItemAt(this.sortableDataVarService.index);
        if (this.sortableDataVarService.sortableContainer.sortableDataVar.length === 0) {
          this.sortableDataVarService.sortableContainer.dropEnabled = true;
        }
        // Add item to new list
        this.insertItemAt(item, 0);
        this.sortableDataVarService.sortableContainer = this;
        this.sortableDataVarService.index = 0;
      }
      // Refresh changes in properties of container component
      this.detectChanges();
    }
  }

  getItemAt(index: number): any {
    return this.sortableHandler.getItemAt(this.sortableDataVar, index);
  }

  indexOf(item: any): number {
    return this.sortableHandler.indexOf(this.sortableDataVar, item);
  }

  removeItemAt(index: number): void {
    this.sortableHandler.removeItemAt(this.sortableDataVar, index);
  }

  insertItemAt(item: any, index: number): void {
    this.sortableHandler.insertItemAt(this.sortableDataVar, item, index);
  }
}

class SortableArrayHandler {
  getItemAt(sortableData: any, index: number): any {
    return sortableData[index];
  }

  indexOf(sortableData: any, item: any): number {
    return sortableData.indexOf(item);
  }

  removeItemAt(sortableData: any, index: number): void {
    sortableData.splice(index, 1);
  }

  insertItemAt(sortableData: any, item: any, index: number): void {
    sortableData.splice(index, 0, item);
  }
}

class SortableFormArrayHandler {
  getItemAt(sortableData: any, index: number): any {
    return sortableData.at(index);
  }

  indexOf(sortableData: any, item: any): number {
    return sortableData.controls.indexOf(item);
  }

  removeItemAt(sortableData: any, index: number): void {
    sortableData.removeAt(index);
  }

  insertItemAt(sortableData: any, item: any, index: number): void {
    sortableData.insert(index, item);
  }
}

@Directive({selector: '[libDndSortable]'})
export class SortableComponentDirective extends AbstractComponent {

  @Input() sortableIndex: number | any;

  @Input('dragEnabled') set draggable(value: boolean) {
    this.dragEnabled = !!value;
  }

  @Input('dropEnabled') set droppable(value: boolean) {
    this.dropEnabled = !!value;
  }

  /**
   * The data that has to be dragged. It can be any JS object
   */
  @Input() dragData: any;

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
   * Callback function called when the drag action ends with a valid drop action.
   * It is activated after the on-drop-success callback
   */
  @Output() dragSuccess: EventEmitter<any> = new EventEmitter<any>();

  @Output() dragStart: EventEmitter<any> = new EventEmitter<any>();
  @Output() dragOver: EventEmitter<any> = new EventEmitter<any>();
  @Output() dragEnd: EventEmitter<any> = new EventEmitter<any>();
  @Output() dropSuccess: EventEmitter<any> = new EventEmitter<any>();

  constructor(elemRef: ElementRef, dragDropService: DragDropService, config: DragDropConfig,
              private sortableContainer: SortableContainerDirective,
              private sortableDataVarService: DragDropSortableService,
              cdr: ChangeDetectorRef) {
    super(elemRef, dragDropService, config, cdr);
    this.dropZones = this.sortableContainer.dropZones;
    this.dragEnabled = true;
    this.dropEnabled = true;
  }

  _onDragStartCallback(event: Event): void {
    // console.log('_onDragStartCallback. dragging elem with index ' + this.index);
    this.sortableDataVarService.isDragged = true;
    this.sortableDataVarService.sortableContainer = this.sortableContainer;
    this.sortableDataVarService.index = this.sortableIndex;
    this.sortableDataVarService.markSortable(this.elem);
    // Add dragData
    this.dragDropService.isDragged = true;
    this.dragDropService.dragData = this.dragData;
    this.dragDropService.onDragSuccessCallback = this.dragSuccess;
    //
    this.dragStart.emit(this.dragDropService.dragData);
  }

  _onDragOverCallback(event: Event): void {
    if (this.sortableDataVarService.isDragged && this.elem !== this.sortableDataVarService.elem) {
      // console.log('_onDragOverCallback. dragging elem with index ' + this.index);
      this.sortableDataVarService.sortableContainer = this.sortableContainer;
      this.sortableDataVarService.index = this.sortableIndex;
      this.sortableDataVarService.markSortable(this.elem);
      this.dragOver.emit(this.dragDropService.dragData);
    }
  }

  _onDragEndCallback(event: Event): void {
    // console.log('_onDragEndCallback. end dragging elem with index ' + this.index);
    this.sortableDataVarService.isDragged = false;
    this.sortableDataVarService.sortableContainer = null;
    this.sortableDataVarService.index = null;
    this.sortableDataVarService.markSortable(null);
    // Add dragGata
    this.dragDropService.isDragged = false;
    this.dragDropService.dragData = null;
    this.dragDropService.onDragSuccessCallback = null;
    //
    this.dragEnd.emit(this.dragDropService.dragData);
  }

  _onDragEnterCallback(event: Event): void {
    if (this.sortableDataVarService.isDragged) {
      this.sortableDataVarService.markSortable(this.elem);
      if ((this.sortableIndex !== this.sortableDataVarService.index) ||
        (this.sortableDataVarService.sortableContainer.sortableData !== this.sortableContainer.sortableData)) {
        // Get item
        const item: any = this.sortableDataVarService.sortableContainer.getItemAt(this.sortableDataVarService.index);
        // Remove item from previous list
        this.sortableDataVarService.sortableContainer.removeItemAt(this.sortableDataVarService.index);
        if (this.sortableDataVarService.sortableContainer.sortableData.length === 0) {
          this.sortableDataVarService.sortableContainer.dropEnabled = true;
        }
        // Add item to new list
        this.sortableContainer.insertItemAt(item, this.sortableIndex);
        if (this.sortableContainer.dropEnabled) {
          this.sortableContainer.dropEnabled = false;
        }
        this.sortableDataVarService.sortableContainer = this.sortableContainer;
        this.sortableDataVarService.index = this.sortableIndex;
        this.detectChanges();
      }
    }
  }

  _onDropCallback(event: Event): void {
    if (this.sortableDataVarService.isDragged) {
      // console.log('onDropCallback.onDropSuccessCallback.dragData', this._dragDropService.dragData);
      this.dropSuccess.emit(this.dragDropService.dragData);
      if (this.dragDropService.onDragSuccessCallback) {
        // console.log('onDropCallback.onDragSuccessCallback.dragData', this._dragDropService.dragData);
        this.dragDropService.onDragSuccessCallback.emit(this.dragDropService.dragData);
      }
      // Refresh changes in properties of container component
      this.sortableContainer.detectChanges();
    }
  }
}

@Directive({selector: '[libDndSortableHandle]'})
export class SortableHandleComponentDirective extends AbstractHandleComponent {
  constructor(elemRef: ElementRef, dragDropService: DragDropService, config: DragDropConfig, component: SortableComponentDirective,
              cdr: ChangeDetectorRef) {

    super(elemRef, dragDropService, config, component, cdr);
  }
}
