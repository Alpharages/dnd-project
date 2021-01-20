import {Injectable, ChangeDetectorRef, ViewRef} from '@angular/core';
import {ElementRef} from '@angular/core';

import {DragDropConfig, DragImage} from './config/dnd.config';
import {DragDropService} from './service/dnd.service';
import {isString, isFunction, isPresent, createImage, callFun} from './utils/dnd.utils';

@Injectable()
export abstract class AbstractComponent {
  elem: HTMLElement;
  dragHandle: HTMLElement | undefined;
  dragHelper: HTMLElement | undefined;
  defaultCursor: string;

  /**
   * Last element that was mousedown'ed
   */
  target: EventTarget | null | undefined;

  /**
   * Whether the object is draggable. Default is true.
   */
  private dragEnabledVar = false;

  set dragEnabled(enabled: boolean) {
    this.dragEnabledVar = !!enabled;
    this.elem.draggable = this.dragEnabledVar;
  }

  get dragEnabled(): boolean {
    return this.dragEnabledVar;
  }

  /**
   * Allows drop on this element
   */
  dropEnabled = false;
  /**
   * Drag effect
   */
  effectAllowed: string | undefined;
  /**
   * Drag cursor
   */
  effectCursor: string | undefined;

  /**
   * Restrict places where a draggable element can be dropped. Either one of
   * these two mechanisms can be used:
   *
   * - dropZones: an array of strings that permits to specify the drop zones
   *   associated with this component. By default, if the drop-zones attribute
   *   is not specified, the droppable component accepts drop operations by
   *   all the draggable components that do not specify the allowed-drop-zones
   *
   * - allowDrop: a boolean function for droppable components, that is checked
   *   when an item is dragged. The function is passed the dragData of this
   *   item.
   *   - if it returns true, the item can be dropped in this component
   *   - if it returns false, the item cannot be dropped here
   */
  allowDrop: ((dropData: any) => boolean) | undefined;
  dropZones: string[] = [];

  /**
   * Here is the property dragImage you can use:
   * - The string value as url to the image
   *   <div class="panel panel-default"
   *        dnd-draggable [dragEnabled]="true"
   *        [dragImage]="/images/simpler.png">
   * ...
   * - The DragImage value with Image and optional offset by x and y:
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
  dragImage: string | DragImage | (() => void) | undefined;

  cloneItem = false;

  constructor(elemRef: ElementRef, public dragDropService: DragDropService, public config: DragDropConfig,
              private cdr: ChangeDetectorRef) {

    // Assign default cursor unless overridden
    this.defaultCursor = config.defaultCursor;
    this.elem = elemRef.nativeElement;
    this.elem.style.cursor = this.defaultCursor;  // set default cursor on our element
    //
    // DROP events
    //
    this.elem.ondragenter = (event: Event) => {
      this._onDragEnter(event);
    };
    this.elem.ondragover = (event: DragEvent) => {
      this._onDragOver(event);
      //
      if (event.dataTransfer != null) {
        event.dataTransfer.dropEffect = this.config.dropEffect.name;
      }

      return false;
    };
    this.elem.ondragleave = (event: Event) => {
      this._onDragLeave(event);
    };
    this.elem.ondrop = (event: Event) => {
      this._onDrop(event);
    };
    //
    // Drag events
    //
    this.elem.onmousedown = (event: MouseEvent) => {
      this.target = event.target;
    };
    this.elem.ondragstart = (event: DragEvent) => {
      if (this.dragHandle) {
        if (!this.dragHandle.contains(this.target as Element)) {
          event.preventDefault();
          return;
        }
      }

      this._onDragStart(event);
      //
      if (event.dataTransfer != null) {
        event.dataTransfer.setData('text', '');
        // Change drag effect
        event.dataTransfer.effectAllowed = this.effectAllowed || this.config.dragEffect.name;
        // Change drag image
        if (isPresent(this.dragImage)) {
          if (isString(this.dragImage)) {
            (event.dataTransfer as any).setDragImage(createImage(this.dragImage as string));
          } else if (isFunction(this.dragImage)) {
            (event.dataTransfer as any).setDragImage(callFun(this.dragImage as (() => void)));
          } else {
            const img: DragImage = this.dragImage as DragImage;
            (event.dataTransfer as any).setDragImage(img.imageElement, img.xOffset, img.yOffset);
          }
        } else if (isPresent(this.config.dragImage)) {
          const dragImage: DragImage = this.config.dragImage;
          (event.dataTransfer as any).setDragImage(dragImage.imageElement, dragImage.xOffset, dragImage.yOffset);
        } else if (this.cloneItem) {
          this.dragHelper = this.elem.cloneNode(true) as HTMLElement;
          this.dragHelper.classList.add('dnd-drag-item');
          this.dragHelper.style.position = 'absolute';
          this.dragHelper.style.top = '0px';
          this.dragHelper.style.left = '-1000px';
          if (this.elem.parentElement != null) {
            this.elem.parentElement.appendChild(this.dragHelper);
          }
          (event.dataTransfer as any).setDragImage(this.dragHelper, event.offsetX, event.offsetY);
        }

        // Change drag cursor
        const cursorelem = (this.dragHandle) ? this.dragHandle : this.elem;

        if (this.dragEnabledVar) {
          cursorelem.style.cursor = this.effectCursor ? this.effectCursor : this.config.dragCursor;
        } else {
          cursorelem.style.cursor = this.defaultCursor;
        }
      }
    };

    this.elem.ondragend = (event: Event) => {
      if (this.elem.parentElement && this.dragHelper) {
        this.elem.parentElement.removeChild(this.dragHelper);
      }
      // console.log('ondragend', event.target);
      this._onDragEnd(event);
      // Restore style of dragged element
      const cursorelem = (this.dragHandle) ? this.dragHandle : this.elem;
      cursorelem.style.cursor = this.defaultCursor;
    };
  }

  public setDragHandle(elem: HTMLElement): void {
    this.dragHandle = elem;
  }

  /******* Change detection ******/

  detectChanges(): void {
    // Programmatically run change detection to fix issue in Safari
    setTimeout(() => {
      if (this.cdr && !(this.cdr as ViewRef).destroyed) {
        this.cdr.detectChanges();
      }
    }, 250);
  }

  // ****** Droppable ******* //
  private _onDragEnter(event: Event): void {
    // console.log('ondragenter._isDropAllowed', this._isDropAllowed);
    if (this._isDropAllowed(event)) {
      // event.preventDefault();
      this._onDragEnterCallback(event);
    }
  }

  private _onDragOver(event: Event): void {
    // // console.log('ondragover._isDropAllowed', this._isDropAllowed);
    if (this._isDropAllowed(event)) {
      // The element is over the same source element - do nothing
      if (event.preventDefault) {
        // Necessary. Allows us to drop.
        event.preventDefault();
      }

      this._onDragOverCallback(event);
    }
  }

  private _onDragLeave(event: Event): void {
    // console.log('ondragleave._isDropAllowed', this._isDropAllowed);
    if (this._isDropAllowed(event)) {
      // event.preventDefault();
      this._onDragLeaveCallback(event);
    }
  }

  private _onDrop(event: Event): void {
    // console.log('ondrop._isDropAllowed', this._isDropAllowed);
    if (this._isDropAllowed(event)) {
      // Necessary. Allows us to drop.
      this._preventAndStop(event);

      this._onDropCallback(event);

      this.detectChanges();
    }
  }

  private _isDropAllowed(event: any): boolean {
    if ((this.dragDropService.isDragged || (event.dataTransfer && event.dataTransfer.files)) && this.dropEnabled) {
      // First, if `allowDrop` is set, call it to determine whether the
      // dragged element can be dropped here.
      if (this.allowDrop) {
        return this.allowDrop(this.dragDropService.dragData);
      }

      // Otherwise, use dropZones if they are set.
      if (this.dropZones.length === 0 && this.dragDropService.allowedDropZones.length === 0) {
        return true;
      }
      for (const i of this.dragDropService.allowedDropZones) {
        if (this.dropZones.indexOf(i) !== -1) {
          return true;
        }
      }
    }
    return false;
  }

  private _preventAndStop(event: Event): any {
    if (event.preventDefault) {
      event.preventDefault();
    }
    if (event.stopPropagation) {
      event.stopPropagation();
    }
  }

  // *********** Draggable **********//

  private _onDragStart(event: Event): void {
    // console.log('ondragstart.dragEnabled', this.dragEnabledVar);
    if (this.dragEnabledVar) {
      this.dragDropService.allowedDropZones = this.dropZones;
      // console.log('ondragstart.allowedDropZones', this._dragDropService.allowedDropZones);
      this._onDragStartCallback(event);
    }
  }

  private _onDragEnd(event: Event): void {
    this.dragDropService.allowedDropZones = [];
    // console.log('ondragend.allowedDropZones', this._dragDropService.allowedDropZones);
    this._onDragEndCallback(event);
  }

  // **** Drop Callbacks ****//
  _onDragEnterCallback(event: Event): void {
  }

  _onDragOverCallback(event: Event): void {
  }

  _onDragLeaveCallback(event: Event): void {
  }

  _onDropCallback(event: Event): void {
  }

  // **** Drag Callbacks ****//
  _onDragStartCallback(event: Event): void {
  }

  _onDragEndCallback(event: Event): void {
  }
}

export class AbstractHandleComponent {
  elem: HTMLElement;

  constructor(elemRef: ElementRef, public dragDropService: DragDropService, public config: DragDropConfig,
              private Component: AbstractComponent, private cdr: ChangeDetectorRef) {
    this.elem = elemRef.nativeElement;
    this.Component.setDragHandle(this.elem);
  }
}
