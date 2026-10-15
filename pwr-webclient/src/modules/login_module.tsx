import {getImagePath} from '../API_CONFIG';
import {LoginStatus} from '../model/LoginStatus';
import {connect} from 'react-redux';
import * as React from 'react';
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

    static mapStateToProps(state: ApplicationState, _: LoginProps): LoginProps {
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

    private logInUser = () => {
        OIDCService.instance().login();
    };

    render() {
        if (this.props.loginStatus === LoginStatus.SUCCESS) {
            // Already logged in? Great! Redirect to Profile Selection!
            return <Redirect to={Paths.PROFILE_SELECT}/>;
        }
        return (
            <React.Fragment>
                <div className="hbt-schild-background">
                </div>
                <div>
                    <div className="vertical-align" style={{height: '100vh'}}>
                        <div style={{padding: '64px', backgroundColor: 'white'}}>
                            <div className="vertical-align">
                                <img alt="HBT Power Logo" className="img-responsive logo-medium" src={getImagePath() + '/HBT002_Logo_pos.png'}/>
                            </div>
                            <div className="vertical-align">
                                <h1>{PowerLocalize.get('Login.Title')}</h1>
                            </div>
                            <div className="vertical-align">
                                <div className="fittingContainer">
                                    <PwrRaisedButton color="primary" icon={<ArrowRight/>} onClick={this.logInUser}
                                                     text={PowerLocalize.get('Login.LoginAzure')}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export const LoginModule: React.ComponentClass<LoginLocalProps> = connect(Login_module.mapStateToProps, Login_module.mapDispatchToProps)(Login_module) as any;
