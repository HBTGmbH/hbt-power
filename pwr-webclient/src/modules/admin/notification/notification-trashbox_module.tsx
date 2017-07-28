import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../Store';
import {FontIcon, RaisedButton, Tab, Table, TableBody, TableRow, TableRowColumn, Tabs} from 'material-ui';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {AdminNotification} from '../../../model/admin/AdminNotification';
import {formatString} from '../../../utils/StringUtil';
import {formatToMailDisplay} from '../../../utils/DateUtil';
import {AdminActionCreator} from '../../../reducers/admin/AdminActionCreator';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link NotificationTrashbox.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface NotificationTrashboxProps {
    notifications: Immutable.List<AdminNotification>;
    username: string;
    password: string;
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link NotificationTrashboxProps} and will then be
 * managed by redux.
 */
interface NotificationTrashboxLocalProps {

}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface NotificationTrashboxLocalState {

}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface NotificationTrashboxDispatch {
    getTrashedNotifications(user: string, pass: string): void;
    finalDeleteTrashed(user: string, pass: string): void;
}

class NotificationTrashboxModule extends React.Component<
    NotificationTrashboxProps
    & NotificationTrashboxLocalProps
    & NotificationTrashboxDispatch, NotificationTrashboxLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: NotificationTrashboxLocalProps): NotificationTrashboxProps {
        return {
            notifications: state.adminReducer.trashedNotifications(),
            username: state.adminReducer.adminName(),
            password: state.adminReducer.adminPass()
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): NotificationTrashboxDispatch {
        return {
            getTrashedNotifications: (user, pass) => dispatch(AdminActionCreator.AsyncRequestTrashedNotifications(user, pass)),
            finalDeleteTrashed: (user, pass) => dispatch(AdminActionCreator.AsyncDeleteTrashed(user, pass))
        }
    }

    private renderNotificationAsTableRow = (notification: AdminNotification) => {
        return (
            <TableRow key={"NotificationInbox.TableRow.Not." + notification.id()}>
                <TableRowColumn>{notification.initials()}</TableRowColumn>
                <TableRowColumn>
                    {formatString(
                        PowerLocalize.get("NotificationInbox.NameEntityNotification.SubjectTextTemplate"),
                        "TODO",
                        "TODO")
                    }
                </TableRowColumn>
                <TableRowColumn>{formatToMailDisplay(notification.occurrence())}</TableRowColumn>
            </TableRow>
        )
    };


    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-md-9">
                        <RaisedButton
                            style={{marginTop: '10px', marginBottom: '10px', marginRight: '15px'}}
                            label={PowerLocalize.get('Action.Update')}
                            icon={<FontIcon className="material-icons">refresh</FontIcon>}
                            onClick={() => this.props.getTrashedNotifications(this.props.username, this.props.password)}
                        />
                        <RaisedButton
                            style={{marginTop: '10px', marginBottom: '10px', marginRight: '15px'}}
                            label={PowerLocalize.get('Action.FinalDelete')}
                            icon={<FontIcon className="material-icons">delete</FontIcon>}
                            onClick={() => this.props.finalDeleteTrashed(this.props.username, this.props.password)}
                        />
                    </div>
                </div>
                <Tabs>
                    <Tab
                        icon={<FontIcon className="material-icons">delete</FontIcon>}
                        label={PowerLocalize.get("NotificationInbox.TrashedMessages")}
                    >
                        <Table>
                            <TableBody
                                displayRowCheckbox={false}
                            >
                                {
                                    this.props.notifications.map(this.renderNotificationAsTableRow).toArray()
                                }
                            </TableBody>
                        </Table>
                    </Tab>
                </Tabs>
            </div>

        )
    }
}

/**
 * @see NotificationTrashboxModule
 * @author nt
 * @since 30.05.2017
 */
export const NotificationTrashbox: React.ComponentClass<NotificationTrashboxLocalProps> = connect(NotificationTrashboxModule.mapStateToProps, NotificationTrashboxModule.mapDispatchToProps)(NotificationTrashboxModule);