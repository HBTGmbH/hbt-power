import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {Button, Icon, Tab, Table, TableBody, TableCell, TableRow, Tabs} from '@material-ui/core';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {AdminNotification} from '../../../model/admin/AdminNotification';
import {formatToMailDisplay} from '../../../utils/DateUtil';
import {AdminActionCreator} from '../../../reducers/admin/AdminActionCreator';
import {ApplicationState} from '../../../reducers/reducerIndex';

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

class NotificationTrashboxModule extends React.Component<NotificationTrashboxProps
    & NotificationTrashboxLocalProps
    & NotificationTrashboxDispatch, NotificationTrashboxLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: NotificationTrashboxLocalProps): NotificationTrashboxProps {
        return {
            notifications: state.adminReducer.trashedNotifications(),
            username: state.adminReducer.adminName(),
            password: state.adminReducer.adminPass()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): NotificationTrashboxDispatch {
        return {
            getTrashedNotifications: (user, pass) => dispatch(AdminActionCreator.AsyncRequestTrashedNotifications(user, pass)),
            finalDeleteTrashed: (user, pass) => dispatch(AdminActionCreator.AsyncDeleteTrashed(user, pass))
        };
    }

    private getNotificationContentString = (notification: AdminNotification): string => {
        let toReturn: string = '';
        switch (notification.type()) {
            case 'SkillNotification':
                // toReturn = formatString(PowerLocalize.get("NotificationInbox.SkillNotification.SubjectTextTemplate"),
                //    notification.type());
                toReturn = 'Skill hinzugefügt';
                break;
            case 'ProfileUpdatedNotification':
                // toReturn = PowerLocalize.get("NotificationInbox.ProfileUpdateNotification.SubjectText");
                toReturn = 'Profil aktualisiert';
                break;
            case 'ProfileEntryNotification':
                //toReturn = formatString(
                //   PowerLocalize.get("NotificationInbox.NameEntityNotification.SubjectTextTemplate"),
                //   notification.reason().toString(),
                //   notification.type().toString())
                toReturn = 'Neuer Bezeichner hinzugefügt';
                break;
        }

        return toReturn;

    };

    private renderNotificationAsTableRow = (notification: AdminNotification) => {
        return (
            <TableRow key={'NotificationInbox.TableRow.Not.' + notification.id()} style={{backgroundColor: 'white'}}>
                <TableCell>{notification.initials()}</TableCell>
                <TableCell>
                    {this.getNotificationContentString(notification)}
                </TableCell>
                <TableCell>{formatToMailDisplay(notification.occurrence())}</TableCell>
            </TableRow>
        );
    };


    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-md-9">
                        <Button
                            variant={'contained'}
                            style={{marginTop: '5px', marginBottom: '10px', marginRight: '15px'}}
                            onClick={() => this.props.getTrashedNotifications(this.props.username, this.props.password)}
                        >
                            {PowerLocalize.get('Action.Update')}
                            <Icon className="material-icons">refresh</Icon>
                        </Button>
                        <Button
                            variant={'contained'}
                            style={{marginTop: '5px', marginBottom: '10px', marginRight: '15px'}}
                            onClick={() => this.props.finalDeleteTrashed(this.props.username, this.props.password)}
                        >
                            {PowerLocalize.get('Action.FinalDelete')}
                            <Icon className="material-icons">delete</Icon>
                        </Button>
                    </div>
                </div>
                <div>
                    <Tabs value={0} centered fullWidth >
                        <Tab
                            icon={<Icon className="material-icons">delete</Icon>}
                            label={PowerLocalize.get('NotificationInbox.TrashedMessages')}
                        >
                        </Tab>
                    </Tabs>


                    <Table>
                        <TableBody>
                            {
                                this.props.notifications.map(this.renderNotificationAsTableRow).toArray()
                            }
                        </TableBody>
                    </Table>
                </div>
            </div>

        );
    }
}

/**
 * @see NotificationTrashboxModule
 * @author nt
 * @since 30.05.2017
 */
export const NotificationTrashbox: React.ComponentClass<NotificationTrashboxLocalProps> = connect(NotificationTrashboxModule.mapStateToProps, NotificationTrashboxModule.mapDispatchToProps)(NotificationTrashboxModule);