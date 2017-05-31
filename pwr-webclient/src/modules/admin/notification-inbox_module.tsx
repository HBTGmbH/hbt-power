import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../Store';
import {AdminNotification} from '../../model/admin/AdminNotification';
import {
    FontIcon, RaisedButton, Tab, Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn,
    Tabs
} from 'material-ui';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {formatString} from '../../utils/StringUtil';
import {formatToMailDisplay, formatToShortDisplay} from '../../utils/DateUtil';
import {AdminActionCreator} from '../../reducers/admin/AdminActionCreator';
import {type} from 'os';
import {NotificationDialog} from './notification-dialog_module';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link NotificationInbox.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface NotificationInboxProps {
    notifications: Immutable.List<AdminNotification>;
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link NotificationInboxProps} and will then be
 * managed by redux.
 */
interface NotificationInboxLocalProps {

}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface NotificationInboxLocalState {
    selectedRows: string | Array<number>;
    notificationDialogOpen: boolean;
    selectedNotification: number;
}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface NotificationInboxDispatch {
    getNotifications(): void;
    trashNotifications(ids: Array<number>): void;
}

class NotificationInboxModule extends React.Component<
    NotificationInboxProps
    & NotificationInboxLocalProps
    & NotificationInboxDispatch, NotificationInboxLocalState> {

    constructor(props: NotificationInboxProps & NotificationInboxLocalProps & NotificationInboxDispatch) {
        super(props);
        this.state = {
            selectedRows: [],
            notificationDialogOpen: false,
            selectedNotification: -1
        }
    }

    static mapStateToProps(state: ApplicationState, localProps: NotificationInboxLocalProps): NotificationInboxProps {
        return {
            notifications: state.adminReducer.notifications()
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): NotificationInboxDispatch {
        return {
            getNotifications: () => {dispatch(AdminActionCreator.AsyncRequestNotifications())},
            trashNotifications: (ids) => {dispatch(AdminActionCreator.AsyncTrashNotifications(ids))}
        };
    }

    private showNotificationDialog = (index: number) => {
        console.log("show", index);
        this.setState({
            notificationDialogOpen: true,
            selectedNotification: index
        })
    };

    private hideNotificationDialog = () => {
        this.setState({
            notificationDialogOpen: false
        })
    };

    private renderNotificationAsTableRow = (notification: AdminNotification, key: number) => {
        return (
            <TableRow
                key={"NotificationInbox.TableRow.Not." + notification.id()}
            >
                <TableRowColumn>{notification.initials()}</TableRowColumn>
                <TableRowColumn>
                    {formatString(
                        PowerLocalize.get("NotificationInbox.NameEntityNotification.SubjectTextTemplate"),
                        notification.nameEntity().name(),
                        "TODO")
                    }
                </TableRowColumn>
                <TableRowColumn>{formatToMailDisplay(notification.occurrence())}</TableRowColumn>
            </TableRow>
        )
    };

    private renderTableHeader = () => {
        return ( <TableHeader>
            <TableRow>
                <TableHeaderColumn>{PowerLocalize.get("Initials.Singular")}</TableHeaderColumn>
                <TableHeaderColumn>{PowerLocalize.get("Subject.Singular")}</TableHeaderColumn>
                <TableHeaderColumn>{PowerLocalize.get("Date.Singular")}</TableHeaderColumn>
            </TableRow>
        </TableHeader>);
    };

    private handleAllMessagesRowSelection = (rows: string | Array<number>) => {
        console.log("Selected rows:", rows);
        this.setState({
            selectedRows: rows
        });
    };

    private handleTrashSelected = () => {
        let ids: Array<number> = [];
        if(typeof(this.state.selectedRows) == 'string') {
            if(this.state.selectedRows == 'all') {
                this.props.notifications.forEach(n => ids.push(n.id()));
            }
        } else {
            let selRows: Array<number> = this.state.selectedRows as Array<number>;
            selRows.forEach(rowNum => {
                ids.push(this.props.notifications.get(rowNum).id())
            });
        }
        this.props.trashNotifications(ids);
    };

    render() {
        return (
            <div>
                <NotificationDialog
                    index={this.state.selectedNotification}
                    open={this.state.notificationDialogOpen}
                    onRequestClose={this.hideNotificationDialog}
                />
                <div className="row">
                    <div className="col-md-9">
                        <RaisedButton
                            style={{marginTop: '10px', marginBottom: '10px', marginRight: '15px'}}
                            label={PowerLocalize.get('Action.Update')}
                            icon={<FontIcon className="material-icons">refresh</FontIcon>}
                            onClick={this.props.getNotifications}
                        />
                        <RaisedButton
                            style={{marginTop: '10px', marginBottom: '10px', marginRight: '15px'}}
                            label={PowerLocalize.get('Action.Delete')}
                            icon={<FontIcon className="material-icons">delete</FontIcon>}
                            onClick={this.handleTrashSelected}
                        />
                    </div>
                </div>
                <Tabs>
                    <Tab
                        icon={<FontIcon className="material-icons">inbox</FontIcon>}
                        label={PowerLocalize.get("NotificationInbox.AllMessages")}
                    >
                        <Table
                            multiSelectable={true}
                            onRowSelection={this.handleAllMessagesRowSelection}
                            onCellClick={this.showNotificationDialog}
                        >
                            {this.renderTableHeader()}
                            <TableBody deselectOnClickaway={false}>
                                {
                                    this.props.notifications.map(this.renderNotificationAsTableRow).toArray()
                                }
                            </TableBody>
                        </Table>
                    </Tab>
                    <Tab
                        icon={<FontIcon className="material-icons">add_box</FontIcon>}
                        label={PowerLocalize.get("NotificationInbox.NewNameEntity")}
                    >
                        <Table multiSelectable={true}>
                            {this.renderTableHeader()}
                            <TableBody deselectOnClickaway={false}>
                                {
                                    this.props.notifications.map(this.renderNotificationAsTableRow).toArray()
                                }
                            </TableBody>
                        </Table>
                    </Tab>
                    <Tab
                        icon={<FontIcon className="material-icons">autorenew</FontIcon>}
                        label={PowerLocalize.get("NotificationInbox.ProfileUpdates")}
                    >
                        <Table multiSelectable={true}>
                            {this.renderTableHeader()}
                            <TableBody deselectOnClickaway={false}>

                            </TableBody>
                        </Table>
                    </Tab>
                </Tabs>
            </div>);
    }
}

/**
 * @see NotificationInboxModule
 * @author nt
 * @since 30.05.2017
 */
export const NotificationInbox: React.ComponentClass<NotificationInboxLocalProps> = connect(NotificationInboxModule.mapStateToProps, NotificationInboxModule.mapDispatchToProps)(NotificationInboxModule);