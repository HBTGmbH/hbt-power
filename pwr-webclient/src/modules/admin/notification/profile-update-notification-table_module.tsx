import * as React from 'react';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {AdminNotification} from '../../../model/admin/AdminNotification';
import {formatToMailDisplay} from '../../../utils/DateUtil';
import * as Immutable from 'immutable';

interface ProfileUpdateNotificationTableProps {
    profileUpdateNotifications: Immutable.List<AdminNotification>;
    selectedRows: Array<number>;
    onRowSelection(rows: Array<number>): void;
}

interface ProfileUpdateNotificationTableState {
}

const mapRow = (notification: AdminNotification, key: number, props: ProfileUpdateNotificationTableProps) => {
    return (
        <TableRow
            key={"NotificationInbox.TableRow.Not." + notification.id()}
            selected={props.selectedRows.indexOf(key) !== -1}
        >
            <TableRowColumn>{notification.initials()}</TableRowColumn>
            <TableRowColumn
                className="cursor-pointer"
            >
                {PowerLocalize.get("NotificationInbox.ProfileUpdateNotification.SubjectText")}
            </TableRowColumn>
            <TableRowColumn>{formatToMailDisplay(notification.occurrence())}</TableRowColumn>
        </TableRow>
    )
};

const handleRowSelection = (rows: string | Array<number>, props: ProfileUpdateNotificationTableProps) => {
    let selectedIndexes: Array<number> = [];
    if(rows === "all") {
        props.profileUpdateNotifications.forEach((value, key) => selectedIndexes.push(key));
    } else if(rows === "none") {
        selectedIndexes = [];
    } else {
        selectedIndexes = rows as Array<number>;
    }
    props.onRowSelection(selectedIndexes);
};


export const ProfileUpdateNotificationTable = (props: ProfileUpdateNotificationTableProps) =>  (
    <div>
        <Table multiSelectable={true}
               onRowSelection={rows => handleRowSelection(rows, props)}
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
                    props.profileUpdateNotifications.map((value, key) => mapRow(value, key, props)).toArray()
                }
            </TableBody>
        </Table>
    </div>);
