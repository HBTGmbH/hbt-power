import {getImagePath} from '../API_CONFIG';
import {Paths} from '../Paths';
import {BottomBuildInfo} from './metadata/build-info_module';
import Button from '@material-ui/core/Button/Button';
import {Link} from 'react-router-dom';
import {LoginStatus} from '../model/LoginStatus';
import {connect} from 'react-redux';
import * as React from 'react';
import {KeyboardEvent} from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../reducers/reducerIndex';
import {ProfileAsyncActionCreator} from '../reducers/profile/ProfileAsyncActionCreator';
import {PowerLocalize} from '../localization/PowerLocalizer';
import FormHelperText from '@material-ui/core/FormHelperText/FormHelperText';
import TextField from '@material-ui/core/TextField/TextField';
import FormControl from '@material-ui/core/FormControl/FormControl';

interface LoginProps {
    loginStatus: LoginStatus;
    initials: string;
}


interface LoginLocalProps {

}


interface LoginLocalState {
    isAdmin: boolean;
    initials: string;
}

interface LoginDispatch {
    logInUser(initials: string): void;
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
            // loginStatus: state.databaseReducer.loginStatus(),
            loginStatus: LoginStatus.INITIALS,
            initials: state.profileStore.consultant.initials
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): LoginDispatch {
        return {
            logInUser: (initials) => dispatch(ProfileAsyncActionCreator.logInUser(initials, Paths.USER_HOME)),
        };
    }

    componentDidMount() {
        //TODO  get saved initials?
    }

    private hasError = (): boolean => {
        return this.props.loginStatus == LoginStatus.REJECTED || this.props.loginStatus == LoginStatus.INVALID_NAME;
    };

    private handleTextChange = (value: string) => {
        this.setState({
            initials: value
        });
    };

    private handleInputFieldKeyPress = (event: KeyboardEvent<{}>) => {
        if (event.key == 'Enter' && !this.hasError()) {
            this.props.logInUser(this.props.initials);
        }
    };

    private logInUser = () => {
        this.props.logInUser(this.state.initials);
    };

    private renderInputField = () => {
        return <FormControl error={this.hasError()}>
            <TextField
                label={PowerLocalize.get('Initials.Singular')}
                value={this.state.initials}
                onChange={(e) => this.handleTextChange(e.target.value)}
                onKeyPress={this.handleInputFieldKeyPress}
            />
            {this.props.loginStatus === LoginStatus.REJECTED ?
                <FormHelperText id="login-error-text">{PowerLocalize.get('UserLogin.LoginFailed')}</FormHelperText> :
                <></>}
            {this.props.loginStatus === LoginStatus.INVALID_NAME ?
                <FormHelperText id="login-error-text">{PowerLocalize.get('UserLogin.InvalidName')}</FormHelperText> :
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
                            <h1>Profilauswahl HBT Power</h1>
                        </div>
                        <div className="fittingContainer">
                            <div className="vertical-align">
                                {this.renderInputField()}
                            </div>
                            <br/>
                            <Button variant={'contained'}
                                    onClick={this.logInUser}
                                    disabled={this.hasError()}
                                    color={'primary'}>Weiter</Button>
                            <br/>
                            <br/>
                            <Link to={Paths.ADMIN_LOGIN}><Button variant={'text'}>Admin</Button></Link>
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
