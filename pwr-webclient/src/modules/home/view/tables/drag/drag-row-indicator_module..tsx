import * as React from 'react';
import {FontIcon, IconButton, TableRow, TableRowColumn} from 'material-ui';
import {
    DragSource,
    DragSourceConnector,
    DragSourceMonitor,
    DropTarget,
    DropTargetConnector,
    DropTargetMonitor,
    DropTargetSpec,
    DragSourceSpec,
    ConnectDragSource,
    ConnectDropTarget
} from 'react-dnd';
import {DraggableItemType} from '../../../../../model/DraggableItemType';

interface DragRowIndicatorLocalProps {
    index: number;
    switchIndexes(index1: number, index2: number): void;
}

interface DragRowIndicatorState {

}

interface CardSourceProps {
    isDragging: boolean;
    connectDragSource: ConnectDragSource;
    connectDropTarget: ConnectDropTarget;
}

let rowSourceSpec: DragSourceSpec<DragRowIndicatorLocalProps> = {
    beginDrag: (props: DragRowIndicatorLocalProps) =>  {
        return {
            index: props.index
        };
    }
};

const rowTargetSpec: DropTargetSpec<DragRowIndicatorLocalProps> = {

    drop(props: DragRowIndicatorLocalProps, monitor: DropTargetMonitor){
        let targetIndex: number = (monitor.getItem() as {index: number}).index;
        props.switchIndexes(props.index, targetIndex);
    },
};


function rowSourceCollect(connect: DragSourceConnector, monitor: DragSourceMonitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    }
}

function rowTargetCollect(connect:DropTargetConnector, monitor: DropTargetMonitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver()
    }
}

@DragSource(DraggableItemType.ROW, rowSourceSpec, rowSourceCollect)
@DropTarget(DraggableItemType.ROW, rowTargetSpec, rowTargetCollect)
export class DragRowIndicator extends React.Component<DragRowIndicatorLocalProps , DragRowIndicatorState> {
    render() {
        let props: CardSourceProps = this.props as any;
        return props.connectDragSource(props.connectDropTarget(<div><FontIcon className="material-icons">drag_handle</FontIcon></div>));
    }
}
