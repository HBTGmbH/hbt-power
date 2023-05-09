import {getImagePath} from '../API_CONFIG';
import {LoginStatus} from '../model/LoginStatus';
import {connect} from 'react-redux';
import * as React from 'react';
import {KeyboardEvent} from 'react';
import {ApplicationState} from '../reducers/reducerIndex';
import {PowerLocalize} from '../localization/PowerLocalizer';
import {CrossCuttingActionCreator} from '../reducers/crosscutting/CrossCuttingActionCreator';
import {PwrRaisedButton} from './general/pwr-raised-button';
import ArrowRight from '@material-ui/icons/ArrowRight';
import {ThunkDispatch} from 'redux-thunk';
import {OIDCService} from '../OIDCService';
import {Redirect} from 'react-router-dom';
import {Paths} from '../Paths';

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

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): LoginDispatch {
        return {
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
        OIDCService.instance().login();
    };

    // private renderInputField = () => {
    //     return <FormControl error={this.hasError()}>
    //         <TextField
    //             label={PowerLocalize.get('Initials.Singular')}
    //             value={this.state.initials}
    //             onChange={(e) => this.handleInitialsChange(e.target.value)}
    //             onKeyPress={this.handleInputFieldKeyPress}
    //         />
    //         {this.hasError() ?
    //             <FormHelperText id="login-error-text">{this.props.loginError}</FormHelperText> :
    //             <></>}
    //     </FormControl>;
    // };

    render() {
        if (this.props.loginStatus === LoginStatus.SUCCESS) {
            // Already logged in? Great! Redirect to Profile Selection!
            return <Redirect to={Paths.PROFILE_SELECT}/>
        }
        return (
            <div>
                <div className="vertical-align">
                    <div style={{padding: '64px', backgroundColor: 'white'}}>
                        <div className="vertical-align">
                            <img alt="HBT Power Logo" className="img-responsive logo-medium" src={getImagePath() + '/HBT002_Logo_pos.png'}/>
                        </div>
                        <div className="vertical-align">
                            <h1>{PowerLocalize.get('Login.Title')}</h1>
                        </div>
                        <div className="vertical-align">
                            <div className="fittingContainer">
                                {/*<div className="vertical-align">*/}
                                {/*    {this.renderInputField()}*/}
                                {/*</div>*/}
                                {/*<br/>*/}
                                <PwrRaisedButton color='primary' icon={<ArrowRight/>} onClick={this.logInUser}
                                                 text={PowerLocalize.get('Login.LoginAzure')}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>);
    }
}

export const LoginModule: React.ComponentClass<LoginLocalProps> = connect(Login_module.mapStateToProps, Login_module.mapDispatchToProps)(Login_module) as any;
