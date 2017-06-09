import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {KeyboardEvent} from 'react';
import {ApplicationState} from '../../Store';
import {Paper, RaisedButton, TextField} from 'material-ui';
import {LoginStatus} from '../../model/LoginStatus';
import {AdminActionCreator} from '../../reducers/admin/AdminActionCreator';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {Paths} from '../../index';
import {browserHistory} from 'react-router';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link AdminLogin.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface AdminLoginProps {
    loginState: LoginStatus;
    username: string;
    password: string;
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link AdminLoginProps} and will then be
 * managed by redux.
 */
interface AdminLoginLocalProps {

}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface AdminLoginLocalState {

}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface AdminLoginDispatch {
    changeUsername(val: string): void;
    changePassword(val: string): void;
    attemptLogIn(username: string, pass: string): void;
    changeLoginStatus(status: LoginStatus): void;
}

class AdminLoginModule extends React.Component<
    AdminLoginProps
    & AdminLoginLocalProps
    & AdminLoginDispatch, AdminLoginLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: AdminLoginLocalProps): AdminLoginProps {
        return {
            loginState: state.adminReducer.loginStatus(),
            username: state.adminReducer.adminName(),
            password: state.adminReducer.adminPass()
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): AdminLoginDispatch {
        return {
            changePassword: (val) => dispatch(AdminActionCreator.ChangePassword(val)),
            changeUsername: (val) => dispatch(AdminActionCreator.ChangeUsername(val)),
            attemptLogIn: (username, pass) => {dispatch(AdminActionCreator.AsyncValidateAuthentication(username, pass))},
            changeLoginStatus: status2 => {dispatch(AdminActionCreator.ChangeLoginStatus(status2))}
        }
    }

    private handleProgressButtonClick = () => {
        switch(this.props.loginState) {
            case LoginStatus.INITIALS:
                this.props.changeLoginStatus(LoginStatus.PASSWORD);
                break;
            case LoginStatus.PASSWORD:
                this.props.attemptLogIn(this.props.username, this.props.password);
                break;
            case LoginStatus.REJECTED:
                this.props.changeLoginStatus(LoginStatus.INITIALS);
                break;
            default:
                break;
        }
    };

    private handleInputFieldKeyPress = (event: KeyboardEvent<{}>) => {
        if(event.key == 'Enter') {
            this.handleProgressButtonClick();
        }
    };

    private handleToUserLogin = () => {
        browserHistory.push(Paths.APP_ROOT);
    };

    private getErrorText = () => {
        return this.props.loginState == LoginStatus.REJECTED ? "Invalid" : null
    };

    private renderInputField = () => {
        if(this.props.loginState == LoginStatus.INITIALS) {
            return <TextField
                floatingLabelText={PowerLocalize.get("Username.Singular")}
                value={this.props.username}
                onChange={(evt,val) => this.props.changeUsername(val)}
                onKeyPress={this.handleInputFieldKeyPress}
            />
        } else if(this.props.loginState == LoginStatus.PASSWORD || this.props.loginState == LoginStatus.REJECTED) {
            return <TextField
                floatingLabelText={PowerLocalize.get("Password.Singular")}
                value={this.props.password}
                onChange={(evt,val) => this.props.changePassword(val)}
                errorText={this.getErrorText()}
                type="password"
                onKeyPress={this.handleInputFieldKeyPress}
            />
        }
        return null;
    };

    render() {
        return (
            <div className="row">
                <div className="col-md-4 col-md-offset-4">
                    <Paper style={{height: "400px"}}>
                        <br/>
                        <div className="row">
                            <div className="col-md-4 col-md-offset-1">
                                <img className="img-responsive" src="/img/logo_hbt.png"/>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-offset-1">
                                <h1>Admin-Login</h1>
                                <h4>Weiter zu HBT Power</h4>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-offset-1">
                                {this.renderInputField()}
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-offset-1">
                                <RaisedButton onClick={this.handleProgressButtonClick} label="Weiter" primary={true}/>
                            </div>
                        </div>
                        <div className="row"  style={{marginTop: "20px"}}>
                            <div className="col-md-offset-1">
                                <RaisedButton onClick={this.handleToUserLogin} label="Zurück"/>
                            </div>
                        </div>
                    </Paper>
                </div>
            </div>);
    }
}

/**
 * @see AdminLoginModule
 * @author nt
 * @since 01.06.2017
 */
export const AdminLogin: React.ComponentClass<AdminLoginLocalProps> = connect(AdminLoginModule.mapStateToProps, AdminLoginModule.mapDispatchToProps)(AdminLoginModule);