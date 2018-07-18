import * as React from 'react';
import {Table, TableBody, TableHead, TableCell, TableRow} from '@material-ui/core';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {AdminNotification} from '../../../model/admin/AdminNotification';
import {formatToMailDisplay} from '../../../utils/DateUtil';
import * as Immutable from 'immutable';
import Checkbox from '@material-ui/core/Checkbox/Checkbox';
import FormGroup from '@material-ui/core/FormGroup/FormGroup';

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
            style={{backgroundColor:"white"}}
            //onClick={event => (void)}
            hover
        >
            <TableCell padding={'checkbox'}>
                <FormGroup>
                    <Checkbox checked={props.selectedRows.indexOf(key) !== -1}/>
                </FormGroup>
            </TableCell>
            <TableCell>{notification.initials()}</TableCell>
            <TableCell
                className="cursor-pointer"
            >
                {PowerLocalize.get("NotificationInbox.ProfileUpdateNotification.SubjectText")}
            </TableCell>
            <TableCell>{formatToMailDisplay(notification.occurrence())}</TableCell>
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
// TODO Tabelle selectable machen

export const ProfileUpdateNotificationTable = (props: ProfileUpdateNotificationTableProps) =>  (
    <div>
        <Table //multiSelectable={true}
               //onRowSelection={(rows:any) => handleRowSelection(rows, props)}
        >
            <TableHead>
                <TableRow style={{backgroundColor:'white'}}>
                    <TableCell padding={"checkbox"}>
                        <FormGroup>
                            <Checkbox/>
                        </FormGroup>
                    </TableCell>
                    <TableCell>{PowerLocalize.get('Initials.Singular')}</TableCell>
                    <TableCell>{PowerLocalize.get('Subject.Singular')}</TableCell>
                    <TableCell>{PowerLocalize.get('Date.Singular')}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody //deselectOnClickaway={false} // selectable List
            >
                {
                    props.profileUpdateNotifications.map((value, key) => mapRow(value, key, props)).toArray()
                }
            </TableBody>
        </Table>
    </div>);
