import * as React from 'react';
import {TableRow} from 'material-ui';
import {DragSourceConnector, DragSourceMonitor, DragSource} from 'react-dnd';
import DragSourceSpec = __ReactDnd.DragSourceSpec;

interface DraggableTableRowProps {
    index: number;
    isSelected: boolean;
}

interface DraggableTableRowState {

}

class DraggableTableRowModule extends React.Component<DraggableTableRowProps, DraggableTableRowState> {


    public static spec: DragSourceSpec<any> = {
        beginDrag: (props:any) => {
            return {};
        }
    };

    public static collect(connect: DragSourceConnector, monitor: DragSourceMonitor) {
        return {
            connectDragSource: connect.dragSource(),
            isDragging: monitor.isDragging()
        }
    }

    render() {
        return (
            <TableRow
                selected={this.props.isSelected}
            >
                {this.props.children}
            </TableRow>
        );
    }

}


export const DraggableTableRow = DragSource("ROW", DraggableTableRowModule.spec, DraggableTableRowModule.collect)(DraggableTableRowModule)