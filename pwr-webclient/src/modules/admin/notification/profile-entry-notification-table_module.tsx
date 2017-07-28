import * as React from 'react';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ProfileEntryNotification} from '../../../model/admin/ProfileEntryNotification';
import {formatString} from '../../../utils/StringUtil';
import {NameEntityUtil} from '../../../utils/NameEntityUtil';
import {formatToMailDisplay} from '../../../utils/DateUtil';
import {NotificationDialog} from './notification-dialog_module';


interface ProfileEntryNotificationTableLocalProps {
    profileEntryNotifications: Immutable.List<ProfileEntryNotification>;
    selectedRows: Array<number>;
    onRowSelection(rows: Array<number>): void;
}

interface ProfileEntryNotificationTableLocalState {
    notificationDialogOpen: boolean;
    selectedNotification: number;
}


export class ProfileEntryNotificationTable extends React.Component<ProfileEntryNotificationTableLocalProps, ProfileEntryNotificationTableLocalState> {

    constructor(props: any) {
        super(props);
        this.state = {
            notificationDialogOpen: false,
            selectedNotification: -1
        }
    }

    private mapRow = (notification: ProfileEntryNotification, key: number) => {
        return (
            <TableRow
                key={"NotificationInbox.TableRow.Not." + notification.adminNotification().id()}
                selected={this.props.selectedRows.indexOf(key) != -1}
            >
                <TableRowColumn>{notification.adminNotification().initials()}</TableRowColumn>
                <TableRowColumn
                    className="cursor-pointer"
                >
                    {formatString(
                        PowerLocalize.get("NotificationInbox.NameEntityNotification.SubjectTextTemplate"),
                        notification.nameEntity().name(),
                        NameEntityUtil.typeToLocalizedType(notification.nameEntity()))
                    }
                </TableRowColumn>
                <TableRowColumn>{formatToMailDisplay(notification.adminNotification().occurrence())}</TableRowColumn>
            </TableRow>
        )
    };

    private showNotificationDialog = (index: number) => {
        this.setState({
            notificationDialogOpen: true,
            selectedNotification: index
        })
    };

    private handleCellClick = (rowNum: number, colNum: number) => {
        // Ignore the checkboxes.
        if(colNum >= 0) {
            this.showNotificationDialog(rowNum);
        }
    };

    private hideNotificationDialog = () => {
        this.setState({
            notificationDialogOpen: false
        })
    };

    private handleRowSelection = (rows: string | Array<number>) => {
        let selectedIndexes: Array<number> = [];
        if(rows === "all") {
            this.props.profileEntryNotifications.forEach((value, key) => selectedIndexes.push(key));
        } else if(rows === "none") {
            selectedIndexes = [];
        } else {
            selectedIndexes = rows as Array<number>;
        }
        this.props.onRowSelection(selectedIndexes);
    };

    render() {
        return (
        <div>
            <NotificationDialog
                index={this.state.selectedNotification}
                open={this.state.notificationDialogOpen}
                onRequestClose={this.hideNotificationDialog}
            />
            <Table multiSelectable={true}
                    onRowSelection={this.props.onRowSelection}
                    onCellClick={this.handleCellClick}
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
                        this.props.profileEntryNotifications.map(this.mapRow).toArray()
                    }
                </TableBody>
            </Table>
        </div>);
    }
}