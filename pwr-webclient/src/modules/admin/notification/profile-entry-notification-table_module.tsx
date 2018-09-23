import * as React from 'react';
import {Table, TableBody, TableHead, TableCell, TableRow} from '@material-ui/core';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ProfileEntryNotification} from '../../../model/admin/ProfileEntryNotification';
import {NameEntityUtil} from '../../../utils/NameEntityUtil';
import {formatToMailDisplay} from '../../../utils/DateUtil';
import {NotificationDialog} from './notification-dialog_module';
import {StringUtils} from '../../../utils/StringUtil';
import formatString = StringUtils.formatString;
import Checkbox from '@material-ui/core/Checkbox/Checkbox';
import FormGroup from '@material-ui/core/FormGroup/FormGroup';
import withTheme from '@material-ui/core/styles/withTheme';


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
        let isSelected:boolean = this.props.selectedRows.indexOf(key) != -1;

        return (
            <TableRow
                key={"NotificationInbox.TableRow.Not." + notification.adminNotification().id()}
                selected={this.props.selectedRows.indexOf(key) != -1}
                style={{backgroundColor:"white"}}
                onClick={event => this.handleRowSelection}
                hover
            >
                <TableCell padding={'checkbox'}>
                    <FormGroup>
                        <Checkbox checked={isSelected}
                                  onChange={(event:any,checked:boolean) => {this.handleSingleRow(event,checked,key)}}
                                  color="primary"
                        />
                    </FormGroup>
                </TableCell>
                <TableCell>{notification.adminNotification().initials()}</TableCell>
                <TableCell
                    className="cursor-pointer"
                >
                    {formatString(
                        PowerLocalize.get("NotificationInbox.NameEntityNotification.SubjectTextTemplate"),
                        notification.nameEntity().name(),
                        NameEntityUtil.typeToLocalizedType(notification.nameEntity()))
                    }
                </TableCell>
                <TableCell>{formatToMailDisplay(notification.adminNotification().occurrence())}</TableCell>
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

    private handleSelectAll = (e:any, checked:boolean) => {
        let selection:Array<number>;
        selection = [];
        if (checked) {
            this.props.profileEntryNotifications.map((value, key) => {selection.push(key)});
        }else{

        }
        this.props.onRowSelection(selection);
    };

    private handleSingleRow = (e:any, checked:boolean, key:number) => {
        let selection = this.props.selectedRows;
        let isSelected:boolean = this.props.selectedRows.indexOf(key) !== -1;
        if(isSelected){
            // entfernen
            selection.splice(this.props.selectedRows.indexOf(key),1);
        }else{
            // hinzufügen
            selection.push(key);
        }
        this.props.onRowSelection(selection);
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
                onClose={this.hideNotificationDialog}
            />
            <Table>
                <TableHead>
                    <TableRow style={{backgroundColor:'white'}}>
                        <TableCell padding={"checkbox"}>
                            <FormGroup>
                                <Checkbox
                                    indeterminate={this.props.selectedRows.length > 0 && this.props.selectedRows.length < this.props.profileEntryNotifications.toArray().length}
                                    checked = {this.props.selectedRows.length === this.props.profileEntryNotifications.toArray().length}
                                    onChange={this.handleSelectAll}
                                    color="primary"

                                />
                            </FormGroup>
                        </TableCell>
                        <TableCell>{PowerLocalize.get('Initials.Singular')}</TableCell>
                        <TableCell>{PowerLocalize.get('Subject.Singular')}</TableCell>
                        <TableCell>{PowerLocalize.get('Date.Singular')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        this.props.profileEntryNotifications.map(this.mapRow).toArray()
                    }
                </TableBody>
            </Table>
        </div>);
    }
}