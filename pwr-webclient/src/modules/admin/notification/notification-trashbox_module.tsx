import {connect} from 'react-redux';
import * as React from 'react';
import * as Immutable from 'immutable';
import {Icon, Table, TableBody, TableCell, TableRow, Typography} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {AdminNotification} from '../../../model/admin/AdminNotification';
import {formatToMailDisplay} from '../../../utils/DateUtil';
import {AdminActionCreator} from '../../../reducers/admin/AdminActionCreator';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {ThunkDispatch} from 'redux-thunk';
import {PwrButton} from '../../general/pwr-button';
import {PwrRow} from '../../general/pwr-form-section';
import {PwrSpacer} from '../../general/pwr-spacer_module';

const useStyles = makeStyles(theme => ({
    // Destroys every entry (#201)
    empty: {
        color: theme.palette.error.main,
    },
}));

/**
 * Refresh and empty (#211): emptying in the error colour, it deletes every entry for good
 */
const TrashboxActions = (props: { onRefresh(): void, onEmpty(): void }) => {
    const classes = useStyles();
    return <PwrRow>
        <PwrButton color="primary" text={PowerLocalize.get('Action.Update')}
                   icon={<Icon className="material-icons">refresh</Icon>} onClick={props.onRefresh}/>
        <PwrButton color="default" className={classes.empty} text={PowerLocalize.get('Action.EmptyTrash')}
                   icon={<Icon className="material-icons">delete_forever</Icon>} onClick={props.onEmpty}/>
    </PwrRow>;
};

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link NotificationTrashbox.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface NotificationTrashboxProps {
    notifications: Immutable.List<AdminNotification>;
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
    getTrashedNotifications(): void;

    finalDeleteTrashed(): void;
}

class NotificationTrashboxModule extends React.Component<NotificationTrashboxProps
    & NotificationTrashboxLocalProps
    & NotificationTrashboxDispatch, NotificationTrashboxLocalState> {

    static mapStateToProps(state: ApplicationState, _: NotificationTrashboxLocalProps): NotificationTrashboxProps {
        return {
            notifications: state.adminReducer.trashedNotifications,
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): NotificationTrashboxDispatch {
        return {
            getTrashedNotifications: () => dispatch(AdminActionCreator.AsyncRequestTrashedNotifications()),
            finalDeleteTrashed: () => dispatch(AdminActionCreator.AsyncDeleteTrashed())
        };
    }

    private getNotificationContentString = (notification: AdminNotification): string => {
        let toReturn: string = '';
        switch (notification.type()) {
            case 'SkillNotification':
                toReturn = 'Skill hinzugefügt';
                break;
            case 'ProfileUpdatedNotification':
                toReturn = 'Profil aktualisiert';
                break;
            case 'ProfileEntryNotification':
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
                <PwrSpacer size="tight"/>
                <TrashboxActions onRefresh={() => this.props.getTrashedNotifications()}
                                 onEmpty={() => this.props.finalDeleteTrashed()}/>
                <PwrSpacer/>
                <div>
                    {/* A heading, not a tab: there is nothing to switch to (#211) */}
                    <Typography variant="h6" component="h2">
                        {PowerLocalize.get('NotificationInbox.TrashedMessages')}
                    </Typography>
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
export const NotificationTrashbox = connect(NotificationTrashboxModule.mapStateToProps, NotificationTrashboxModule.mapDispatchToProps)(NotificationTrashboxModule);
