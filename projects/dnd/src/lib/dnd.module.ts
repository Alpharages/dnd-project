import {NgModule, ModuleWithProviders} from '@angular/core';

import {DragDropConfig} from './config/dnd.config';
import {DragDropService, DragDropSortableService, dragDropServiceFactory, dragDropSortableServiceFactory} from './service/dnd.service';
import {DraggableComponentDirective, DraggableHandleComponentDirective} from './directive/draggable.component';
import {DroppableComponentDirective} from './directive/droppable.component';
import {SortableContainerDirective, SortableComponentDirective, SortableHandleComponentDirective} from './directive/sortable.component';

export * from './abstract.component';
export * from './config/dnd.config';
export * from './service/dnd.service';
export * from './directive/draggable.component';
export * from './directive/droppable.component';
export * from './directive/sortable.component';

@NgModule({
  declarations: [DraggableComponentDirective, DraggableHandleComponentDirective, DroppableComponentDirective, SortableContainerDirective
    , SortableComponentDirective, SortableHandleComponentDirective],
  exports: [DraggableComponentDirective, DraggableHandleComponentDirective, DroppableComponentDirective, SortableContainerDirective,
    SortableComponentDirective, SortableHandleComponentDirective],

})
export class DndModule {
  static forRoot(): ModuleWithProviders<DndModule> {
    return {
      ngModule: DndModule,
      providers: [
        DragDropConfig,
        {provide: DragDropService, useFactory: dragDropServiceFactory},
        {provide: DragDropSortableService, useFactory: dragDropSortableServiceFactory, deps: [DragDropConfig]}
      ]
    };
  }
}
