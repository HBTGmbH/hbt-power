import {connect} from 'react-redux';
import * as React from 'react';
import {KeyboardEvent} from 'react';
import * as redux from 'redux';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import {LoginStatus} from '../../model/LoginStatus';
import {AdminActionCreator} from '../../reducers/admin/AdminActionCreator';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {Link} from 'react-router-dom';
import {Paths} from '../../Paths';
import {ApplicationState} from '../../reducers/reducerIndex';
import {getImagePath} from '../../API_CONFIG';
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup/FormGroup';


const rootLink = (props:any) => <Link to={Paths.APP_ROOT}/>;
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
    rememberLogin: boolean;
}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface AdminLoginDispatch {
    changeUsername(val: string): void;
    changePassword(val: string): void;
    attemptLogIn(username: string, pass: string, rememberLogin: boolean): void;
    changeLoginStatus(status: LoginStatus): void;
}

class AdminLoginModule extends React.Component<
    AdminLoginProps
    & AdminLoginLocalProps
    & AdminLoginDispatch, AdminLoginLocalState> {

    constructor(props: AdminLoginProps & AdminLoginLocalProps & AdminLoginDispatch) {
        super(props);
        this.state = {
            rememberLogin: false
        }
    }

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
            attemptLogIn: (username, pass, rememberLogin) => {dispatch(AdminActionCreator.AsyncValidateAuthentication(username, pass, rememberLogin))},
            changeLoginStatus: status2 => {dispatch(AdminActionCreator.ChangeLoginStatus(status2))}
        }
    }

    private handleAttemptLogIn = () => {
        this.props.attemptLogIn(this.props.username, this.props.password, this.state.rememberLogin);
    };

    private handleInputFieldKeyPress = (event: KeyboardEvent<{}>) => {
        if(event.key == 'Enter') {
            this.handleAttemptLogIn();
        }
    };

    private getErrorText = () => {
        if(this.props.loginState === LoginStatus.REJECTED) {
            return PowerLocalize.get("AdminClient.Login.Rejected");
        } else if(this.props.loginState === LoginStatus.UNAVAILABLE) {
            return PowerLocalize.get("AdminClient.Login.Unavailable");
        } else {
            return null;
        }
    };

    private handleRememberCheckboxCheck = (event: object, isInputChecked: boolean) => {
        this.setState({
            rememberLogin: isInputChecked
        })
    };

    // TODO localize
    // TODO TextField errorText checken
    render() {
        return (
            <div className="fittingContainer vertical-align">
                <Paper style={{padding: "30px"}}>
                    <div  className="fittingContainer">
                        <div className="vertical-align">
                            <img className="logo-medium" src={getImagePath()+"/HBT002_Logo_pos.png"}/>
                        </div>
                        <div className="vertical-align">
                            <h1>Admin-Login</h1>
                        </div>
                        <div className="vertical-align">
                            <h4>Weiter zu HBT Power</h4>
                        </div>
                        <div style={{marginTop:'40px'}}>
                            <div className="vertical-align">
                                <TextField
                                    className="fullWidth"
                                    label={PowerLocalize.get("Username.Singular")}
                                    value={""+this.props.username}
                                    onChange={(evt) => this.props.changeUsername(evt.target.value)}
                                    onKeyPress={this.handleInputFieldKeyPress}
                                />
                            </div>
                            <div className="vertical-align">
                                <TextField
                                    className="fullWidth"
                                    label={PowerLocalize.get("Password.Singular")}
                                    value={(this.getErrorText() === null) ? ""+this.getErrorText() : ""+this.props.password}
                                    onChange={(evt) => this.props.changePassword(evt.target.value)}
                                    type="password"
                                    onKeyPress={this.handleInputFieldKeyPress}
                                />
                            </div>
                            <div className="vertical-align" style={{marginTop: "10px", marginBottom: "10px"}}>
                                <FormGroup>
                                    <FormControlLabel control={
                                        <Checkbox
                                            checked={this.state.rememberLogin}
                                            onChange={this.handleRememberCheckboxCheck}
                                            color={'primary'}
                                        />
                                    }
                                    label={PowerLocalize.get("AdminClient.Login.Remember")}
                                    />
                                </FormGroup>
                            </div>
                            <div className="vertical-align"  style={{marginTop: "5px", marginBottom: "15px", height: "30px"}}>
                                {
                                    this.state.rememberLogin ? <span className="warning-note">Credentials will be stored in a cookie!</span> : <span> </span>
                                }
                            </div>
                            <div className="vertical-align">
                                <Button variant={'raised'} style={{float: "left", marginRight: "5px"}} onClick={this.handleAttemptLogIn} color={'primary'} >{PowerLocalize.get("Action.Login")}</Button>
                                <Button variant={'flat'} style={{float: "right", marginRight: "5px"}}  //component={ rootLink }
                                >{"Zurück"}</Button>
                            </div>
                        </div>
                    </div>
                </Paper>
            </div>);
    }
}

/**
 * @see AdminLoginModule
 * @author nt
 * @since 01.06.2017
 */
export const AdminLogin: React.ComponentClass<AdminLoginLocalProps> = connect(AdminLoginModule.mapStateToProps, AdminLoginModule.mapDispatchToProps)(AdminLoginModule);