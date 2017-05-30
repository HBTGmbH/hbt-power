import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {Avatar, FlatButton, FontIcon, List, RaisedButton, Toolbar, ToolbarGroup} from 'material-ui';
import {Paper, ListItem} from 'material-ui';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {ApplicationState, RequestStatus} from '../../Store';
import {AdminActionCreator} from '../../reducers/admin/AdminActionCreator';
import {RequestSnackbar} from '../general/request-snackbar_module.';


/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link AdminClient.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface AdminClientProps {
    requestStatus: RequestStatus;
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link AdminClientProps} and will then be
 * managed by redux.
 */
interface AdminClientLocalProps {

}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface AdminClientLocalState {

}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface AdminClientDispatch {
    getNotifications(): void;
    navigateToTrashbox(): void;
    navigateToInbox(): void;
}

class AdminClientModule extends React.Component<
    AdminClientProps
    & AdminClientLocalProps
    & AdminClientDispatch, AdminClientLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: AdminClientLocalProps): AdminClientProps {
        return {
            requestStatus: state.adminReducer.requestStatus()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): AdminClientDispatch {
        return {
            getNotifications: () => {dispatch(AdminActionCreator.AsyncRequestNotifications());},
            navigateToInbox: () => {dispatch(AdminActionCreator.AsyncNavigateToInbox())},
            navigateToTrashbox: () => {dispatch(AdminActionCreator.AsyncNavigateToTrashbox())}
        };
    }

    private handleInboxButtonClick = () => {
        this.props.navigateToInbox();
    };

    private handleTrashboxButtonClick = () => {
        this.props.navigateToTrashbox();
    };

    render() {
        return (
            <div>
                <Paper zDepth={3}>
                    <Toolbar style={{height: '100px', backgroundColor:'SlateGray'}}>
                        <ToolbarGroup>
                            <div className="row">
                                <div className="col-md-3">
                                    <img className="img-responsive" src="/img/HBTBlueWithText.png"/>
                                </div>
                                <div className="col-md-5" style={{paddingTop:'40px'}}>
                                    <span style={{fontSize:'2.3em', fontStyle:'oblique', color: 'white'}}>Poooower!   </span>
                                    <span style={{fontSize:'2.3em', color: 'white'}}>&nbsp;2.0</span>
                                </div>
                            </div>
                        </ToolbarGroup>
                        <ToolbarGroup lastChild={true}>
                            <div style={{marginRight: '30px', textAlign: 'right', color:'white'}} >
                                <span style={{paddingRight:'15px'}}>{PowerLocalize.get('Toolbar.LoggedInAs') + ': admin'}</span>
                                <br/>
                                <FlatButton label={PowerLocalize.get('Tooolbar.LogOut')} />
                            </div>
                            <div style={{marginRight: '50px'}}>
                                <Avatar size={70} src="/img/crazy_lama.jpg" />
                            </div>
                        </ToolbarGroup>
                    </Toolbar>
                </Paper>
                <div className="row">
                    <div className="col-md-2">
                        <Paper  style={{marginTop:"55px"}}>
                            <List>
                                <ListItem primaryText="Postkorb"
                                          leftIcon={<FontIcon className="material-icons">inbox</FontIcon>}
                                          open={true}
                                          nestedItems={[
                                              <ListItem
                                                  primaryText="Inbox"
                                                  leftIcon={<FontIcon className="material-icons">inbox</FontIcon>}
                                                  key="AdminClient.Overview.Mail.Inbox"
                                                  onClick={this.handleInboxButtonClick}
                                              />,
                                              <ListItem
                                                  primaryText="Trashbin"
                                                  leftIcon={<FontIcon className="material-icons">delete</FontIcon>}
                                                  key="AdminClient.Overview.Mail.Trashbin"
                                                  onClick={this.handleTrashboxButtonClick}
                                              />
                                          ]}
                              />
                            </List>
                        </Paper>
                    </div>
                    <div className="col-md-9">
                        {this.props.children}
                    </div>
                    <RequestSnackbar APIRequestStatus={this.props.requestStatus}/>
                </div>
            </div>);
    }
}

/**
 * @see AdminClientModule
 * @author nt
 * @since 30.05.2017
 */
export const AdminClient: React.ComponentClass<AdminClientLocalProps> = connect(AdminClientModule.mapStateToProps, AdminClientModule.mapDispatchToProps)(AdminClientModule);