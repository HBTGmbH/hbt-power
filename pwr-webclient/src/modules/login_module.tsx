import {getImagePath} from '../API_CONFIG';
import {Paths} from '../Paths';
import {BottomBuildInfo} from './metadata/build-info_module';
import {Link} from 'react-router-dom';
import {LoginStatus} from '../model/LoginStatus';
import {connect} from 'react-redux';
import * as React from 'react';
import {KeyboardEvent} from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../reducers/reducerIndex';
import {PowerLocalize} from '../localization/PowerLocalizer';
import FormHelperText from '@material-ui/core/FormHelperText/FormHelperText';
import TextField from '@material-ui/core/TextField/TextField';
import FormControl from '@material-ui/core/FormControl/FormControl';
import {CrossCuttingActionCreator} from '../reducers/crosscutting/CrossCuttingActionCreator';
import {PwrRaisedButton} from './general/pwr-raised-button';
import {ArrowRight, Person} from '@material-ui/icons';
import {CrossCuttingAsyncActionCreator} from '../reducers/crosscutting/CrossCuttingAsyncActionCreator';

interface LoginProps {
    loginStatus: LoginStatus;
    loginError: string;
}


interface LoginLocalProps {

}


interface LoginLocalState {
    isAdmin: boolean;
    initials: string;
}

interface LoginDispatch {
    logInUser(initials: string): void;
    clearLoginError(): void;
}

class Login_module extends React.Component<LoginProps & LoginLocalProps & LoginDispatch, LoginLocalState> {

    constructor(props) {
        super(props);
        this.state = {
            isAdmin: false,
            initials: '',
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: LoginProps): LoginProps {
        return {
            loginStatus: state.crossCutting.loginStatus,
            loginError: state.crossCutting.loginError
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): LoginDispatch {
        return {
            logInUser: (initials) => dispatch(CrossCuttingAsyncActionCreator.AsyncLogInUser(initials, Paths.USER_HOME)),
            clearLoginError: () => {
                dispatch(CrossCuttingActionCreator.SetLoginStatus(LoginStatus.INITIALS));
                dispatch(CrossCuttingActionCreator.SetLoginError(''));
            }
        };
    }

    private hasError = (): boolean => {
        return this.props.loginStatus == LoginStatus.REJECTED;
    };

    private handleTextChange = (value: string) => {
        this.setState({
            initials: value
        });
    };

    private handleInputFieldKeyPress = (event: KeyboardEvent<{}>) => {
        if (event.key == 'Enter' && !this.hasError()) {
            this.logInUser();
        }
    };

    private handleInitialsChange = (value: string) => {
        this.setState({
            initials: value
        });
      this.props.clearLoginError();
    };

    private logInUser = () => {
        this.props.logInUser(this.state.initials);
    };

    private renderInputField = () => {
        return <FormControl error={this.hasError()}>
            <TextField
                label={PowerLocalize.get('Initials.Singular')}
                value={this.state.initials}
                onChange={(e) => this.handleInitialsChange(e.target.value)}
                onKeyPress={this.handleInputFieldKeyPress}
            />
            {this.hasError() ?
                <FormHelperText id="login-error-text">{this.props.loginError}</FormHelperText> :
                <></>}
        </FormControl>;
    };

    render() {
        return (
            <div>
                <div className="vertical-align">
                    <div style={{padding: '64px', backgroundColor: 'white'}}>
                        <div className="vertical-align">
                            <img className="img-responsive logo-medium" src={getImagePath() + '/HBT002_Logo_pos.png'}/>
                        </div>
                        <div className="vertical-align">
                            <h1>{PowerLocalize.get('Login.Title')}</h1>
                        </div>
                        <div className="vertical-align">
                            <div className="fittingContainer">
                                <div className="vertical-align">
                                    {this.renderInputField()}
                                </div>
                                <br/>
                                <PwrRaisedButton color='primary' icon={<ArrowRight/>} onClick={this.logInUser} text={PowerLocalize.get('Login.SelectProfile')}/>
                                <br/>
                                <br/>
                                <Link to={Paths.ADMIN_LOGIN}>
                                    <PwrRaisedButton color='primary' icon={<Person/>} text={PowerLocalize.get('Login.AdminSpace')}/>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="vertical-align" style={{marginTop: '50px'}}>
                    <BottomBuildInfo/>
                </div>
            </div>);
    }
}

export const LoginModule: React.ComponentClass<LoginLocalProps> = connect(Login_module.mapStateToProps, Login_module.mapDispatchToProps)(Login_module);
