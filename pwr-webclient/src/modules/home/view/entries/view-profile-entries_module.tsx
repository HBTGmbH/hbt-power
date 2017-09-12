import * as React from 'react';
import {CSSProperties} from 'react';
import {SortableContainer, SortableElement, SortableHandle} from 'react-sortable-hoc';
import {FontIcon, Paper} from 'material-ui';
import {IViewEntry} from '../../../../model/view/IViewEntry';

const Toggle = require('react-toggle').default;

interface ViewProfileEntriesProps {
    entries: Array<IViewEntry>;
    toggleableEntryType: string;
    movableEntryType: string;
    headers: Array<JSX.Element | string>;
    moveDisabled?: boolean;
    renderEntry(entry: any, entryIndex: number): Array<JSX.Element>;
    onToggle(toggleableEntryType: string, index: number, isEnabled: boolean): void;
    onMove(movableEntryType: string, sourceIndex: number, targetIndex: number): void;
}

interface ViewProfileEntriesState {

}

export class ViewProfileEntries extends React.Component<ViewProfileEntriesProps, ViewProfileEntriesState> {

    public static defaultProps: Partial<ViewProfileEntriesProps> = {
        moveDisabled: false
    };

    private handleToggle = (entryIndex: number, checked: boolean) => {
        this.props.onToggle(this.props.toggleableEntryType, entryIndex, checked);
    };

    private onSortEnd = (data: {oldIndex: number, newIndex: number}) => {
        if(data.oldIndex !== data.newIndex) {
            this.props.onMove(this.props.movableEntryType, data.oldIndex, data.newIndex);
        }
    };

    private readonly dragStyle: CSSProperties = {
        width: "46px"
    };

    private readonly toggleStyle: CSSProperties = {
        width: "58px"
    };


    private DragHandle = SortableHandle(() => <FontIcon className="material-icons">drag_handle</FontIcon>); // This can be any component you want



    private SortableItem = SortableElement((props: {entry: IViewEntry, entryIndex: number}) => {
        return(
            <tr>
                <td>
                    {this.props.moveDisabled ? "" : <this.DragHandle/>}
                </td>
                <td>
                    <span style={{marginRight: '8px'}}>
                        <Toggle
                            checked={props.entry.enabled}
                            onChange={(e: any) => this.handleToggle(props.entryIndex, e.target.checked)}
                        />
                     </span>
                </td>
                {this.props.renderEntry(props.entry, props.entryIndex)}
            </tr>);
    });


    private SortableList = SortableContainer((props: {entries: Array<IViewEntry>}) => {
        return(
        <div>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <td style={this.dragStyle}/>
                        <td style={this.toggleStyle}/>
                        {this.props.headers.map((header, index) => <td key={index}>{header}</td>)}
                    </tr>
                </thead>
                <tbody>
                    {
                        props.entries.map((entry, index) => {
                            let id = 0; //FIXME bad bad hack
                            if(this.props.movableEntryType === "PROJECT") {
                                id = (entry as any).id;
                            }
                            return <this.SortableItem
                                disabled={this.props.moveDisabled}
                                key={this.props.movableEntryType + "_" + entry.name + "_" + id}
                                entryIndex={index}
                                index={index}
                                entry={entry}/>
                        })
                    }
                </tbody>
            </table>
        </div>);
    });

    render() {
        return (<div>
            <Paper>
                <this.SortableList
                    transitionDuration={250}
                    entries={this.props.entries}
                    useDragHandle={true}
                    onSortEnd={this.onSortEnd}/>
            </Paper>
        </div>);
    }
}
