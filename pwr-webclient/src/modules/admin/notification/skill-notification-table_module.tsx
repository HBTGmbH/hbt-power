import * as React from 'react';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {SkillNotification} from '../../../model/admin/SkillNotification';
import * as Immutable from 'immutable';
import {formatToMailDisplay} from '../../../utils/DateUtil';
import {formatString} from '../../../utils/StringUtil';


interface SkillNotificationTableProps {
    skillNotifications: Immutable.List<SkillNotification>;
    selectedRows: Array<number>;
    onRowSelection(rows: Array<number>): void;
}

interface SkillNotificationTableState {

}

export class SkillNotificationTable extends React.Component<SkillNotificationTableProps, SkillNotificationTableState> {

    private handleRowSelection = (rows: string | Array<number>) => {
        let selectedIndexes: Array<number> = [];
        if(rows === "all") {
            this.props.skillNotifications.forEach((value, key) => selectedIndexes.push(key));
        } else if(rows === "none") {
            selectedIndexes = [];
        } else {
            selectedIndexes = rows as Array<number>;
        }
        this.props.onRowSelection(selectedIndexes);
    };

    private mapRow = (notification: SkillNotification, key: number) => {
        return (
            <TableRow
                key={"NotificationInbox.TableRow.Not." + notification.adminNotification().id()}
                selected={this.props.selectedRows.indexOf(key) !== -1}
            >
                <TableRowColumn>{notification.adminNotification().initials()}</TableRowColumn>
                <TableRowColumn
                    className="cursor-pointer"
                >
                    {formatString(PowerLocalize.get("NotificationInbox.SkillNotification.SubjectTextTemplate"),
                        notification.skill().name())
                    }
                </TableRowColumn>
                <TableRowColumn>{formatToMailDisplay(notification.adminNotification().occurrence())}</TableRowColumn>
            </TableRow>
        )
    };


    render() {
        return ( <div>
            <Table multiSelectable={true}
                   onRowSelection={this.handleRowSelection}
            >
                <TableHeader>
                    <TableRow>
                        <TableHeaderColumn>{PowerLocalize.get('Initials.Singular')}</TableHeaderColumn>
                        <TableHeaderColumn>{PowerLocalize.get('Subject.Singular')}</TableHeaderColumn>
                        <TableHeaderColumn>{PowerLocalize.get('Date.Singular')}</TableHeaderColumn>
                    </TableRow>
                </TableHeader>
                <TableBody deselectOnClickaway={false}
                >
                    {
                        this.props.skillNotifications.map(this.mapRow).toArray()
                    }
                </TableBody>
            </Table>
        </div>);
    }
}
