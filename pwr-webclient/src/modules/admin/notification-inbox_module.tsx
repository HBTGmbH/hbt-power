import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../Store';
import {AdminNotification} from '../../model/admin/AdminNotification';
import {FontIcon, RaisedButton, Tab, Tabs} from 'material-ui';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {AdminActionCreator} from '../../reducers/admin/AdminActionCreator';
import {ProfileEntryNotification} from '../../model/admin/ProfileEntryNotification';
import {ProfileEntryNotificationTable} from './notification/profile-entry-notification-table_module';
import {ProfileUpdateNotificationTable} from './notification/profile-update-notification-table_module';
import {SkillNotificationTable} from './notification/skill-notification-table_module';
import {SkillNotification} from '../../model/admin/SkillNotification';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link NotificationInbox.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface NotificationInboxProps {
    profileEntryNotifications: Immutable.List<ProfileEntryNotification>;
    profileUpdateNotifications: Immutable.List<AdminNotification>;
    skillNotifications: Immutable.List<SkillNotification>;
    username: string;
    password: string;
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
    selectedProfileEntryRows: Array<number>;
    selectedProfileUpdateRows: Array<number>;
    selectedSkillRows: Array<number>;
}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface NotificationInboxDispatch {
    getNotifications(user: string, pass:string): void;
    trashNotifications(ids: Array<number>, user: string, pass:string): void;
}

class NotificationInboxModule extends React.Component<
    NotificationInboxProps
    & NotificationInboxLocalProps
    & NotificationInboxDispatch, NotificationInboxLocalState> {

    constructor(props: NotificationInboxProps & NotificationInboxLocalProps & NotificationInboxDispatch) {
        super(props);
        this.state = {
            selectedProfileEntryRows: [],
            selectedProfileUpdateRows: [],
            selectedSkillRows: [],
        }
    }

    static mapStateToProps(state: ApplicationState, localProps: NotificationInboxLocalProps): NotificationInboxProps {
        return {
            profileUpdateNotifications: state.adminReducer.profileUpdateNotifications(),
            profileEntryNotifications: state.adminReducer.profileEntryNotifications(),
            skillNotifications: state.adminReducer.skillNotifications(),
            username: state.adminReducer.adminName(),
            password: state.adminReducer.adminPass()
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): NotificationInboxDispatch {
        return {
            getNotifications: (user, pass) => {dispatch(AdminActionCreator.AsyncRequestNotifications(user, pass))},
            trashNotifications: (ids, user, pass) => {dispatch(AdminActionCreator.AsyncTrashNotifications(ids, user, pass))}
        };
    }

    private handleTrashSelectedProfileEntryNotification = (rows: Array<number>, entries: Immutable.List<ProfileEntryNotification>) => {
        let ids: Array<number> = [];
        rows.forEach(rowNum => {
            ids.push(entries.get(rowNum).adminNotification().id())
        });
        this.props.trashNotifications(ids, this.props.username, this.props.password);
    };

    private handleTrashSelectedProfileUpdateNotification = (rows: Array<number>, entries: Immutable.List<AdminNotification>) => {
        let ids: Array<number> = [];
        rows.forEach(rowNum => {
            ids.push(entries.get(rowNum).id())
        });
        console.log("IDs", ids);
        this.props.trashNotifications(ids, this.props.username, this.props.password);
    };

    private handleTrashSelectedSkillNotification = (rows: Array<number>, entries: Immutable.List<SkillNotification>) => {
        let ids: Array<number> = [];
        rows.forEach(rowNum => {
            ids.push(entries.get(rowNum).adminNotification().id())
        });
        this.props.trashNotifications(ids, this.props.username, this.props.password);
    };

    private handleTrashNotifications = () => {
        this.handleTrashSelectedProfileEntryNotification(this.state.selectedProfileEntryRows, this.props.profileEntryNotifications);
        this.handleTrashSelectedProfileUpdateNotification(this.state.selectedProfileUpdateRows, this.props.profileUpdateNotifications);
        this.handleTrashSelectedSkillNotification(this.state.selectedSkillRows, this.props.skillNotifications);
        this.setState({
            selectedProfileEntryRows: [],
            selectedProfileUpdateRows: [],
            selectedSkillRows: []
        })
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
                            onClick={() => this.props.getNotifications(this.props.username, this.props.password)}
                        />
                        <RaisedButton
                            style={{marginTop: '10px', marginBottom: '10px', marginRight: '15px'}}
                            label={PowerLocalize.get('Action.Delete')}
                            icon={<FontIcon className="material-icons">delete</FontIcon>}
                            onClick={this.handleTrashNotifications}
                        />
                    </div>
                </div>
                <Tabs>
                    <Tab
                        icon={<FontIcon className="material-icons">add_box</FontIcon>}
                        label={PowerLocalize.get("NotificationInbox.NewNameEntity")}
                    >
                        <ProfileEntryNotificationTable
                            profileEntryNotifications={this.props.profileEntryNotifications}
                            onRowSelection={rows => this.setState({selectedProfileEntryRows: rows})}
                            selectedRows={this.state.selectedProfileEntryRows}
                        />
                    </Tab>
                    <Tab
                        icon={<FontIcon className="material-icons">color_lens</FontIcon>}
                        label={PowerLocalize.get("NotificationInbox.Skills")}
                    >
                        <SkillNotificationTable
                            skillNotifications={this.props.skillNotifications}
                            selectedRows={this.state.selectedSkillRows}
                            onRowSelection={rows => this.setState({selectedSkillRows: rows})}
                        />
                    </Tab>
                    <Tab
                        icon={<FontIcon className="material-icons">autorenew</FontIcon>}
                        label={PowerLocalize.get("NotificationInbox.ProfileUpdates")}
                    >
                        <ProfileUpdateNotificationTable
                            profileUpdateNotifications={this.props.profileUpdateNotifications}
                            selectedRows={this.state.selectedProfileUpdateRows}
                            onRowSelection={rows => this.setState({selectedProfileUpdateRows: rows})}
                        />
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