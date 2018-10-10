import {connect} from 'react-redux';
import * as React from 'react';
import {KeyboardEvent} from 'react';
import * as redux from 'redux';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import {PowerLocalize} from '../localization/PowerLocalizer';
import {LoginStatus} from '../model/LoginStatus';
import {Link} from 'react-router-dom';
import {Paths} from '../Paths';
import {BottomBuildInfo} from './metadata/build-info_module';
import {ProfileActionCreator} from '../reducers/profile/ProfileActionCreator';
import {ApplicationState} from '../reducers/reducerIndex';
import {ProfileAsyncActionCreator} from '../reducers/profile/ProfileAsyncActionCreator';
import {getImagePath} from '../API_CONFIG';
import {FormControl, FormHelperText} from '@material-ui/core';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link PowerLogin.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface PowerLoginProps {
    loginStatus: LoginStatus;
    initials: string;
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link PowerLoginProps} and will then be
 * managed by redux.
 */
interface PowerLoginLocalProps {

}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface PowerLoginLocalState {
    isAdmin: boolean;
}


/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface PowerLoginDispatch {
    logInUser(initials: string): void;

    setUserInitials(value: string): void;
}

class PowerLoginModule extends React.Component<PowerLoginProps
    & PowerLoginProps
    & PowerLoginDispatch, PowerLoginLocalState> {

    constructor(props: PowerLoginProps & PowerLoginProps & PowerLoginDispatch) {
        super(props);
        this.state = {
            isAdmin: false
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: PowerLoginProps): PowerLoginProps {
        return {
            loginStatus: state.databaseReducer.loginStatus(),
            initials: state.databaseReducer.loggedInUser().initials()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): PowerLoginDispatch {
        return {
            logInUser: (initials) => dispatch(ProfileAsyncActionCreator.logInUser(initials, Paths.USER_HOME)),
            setUserInitials: (value) => dispatch(ProfileActionCreator.SetUserInitials(value))
        };
    }

    componentDidMount() {
        this.props.setUserInitials("");
    }

    private handleInputFieldKeyPress = (event: KeyboardEvent<{}>) => {
        if (event.key == 'Enter' && !this.hasError()) {
            this.props.logInUser(this.props.initials);
        }
    };

    private handleProgressButtonClick = () => {
        this.props.logInUser(this.props.initials);
    };

    private handleFieldValueChange = (value: string) => {
        this.props.setUserInitials(value);
    };

    private hasError = (): boolean => {
        return this.props.loginStatus == LoginStatus.REJECTED || this.props.loginStatus == LoginStatus.INVALID_NAME;
    }


    private renderInputField = () => {
        return <FormControl error={this.hasError()}>
            <TextField
                label={PowerLocalize.get('Initials.Singular')}
                value={this.props.initials}
                onChange={(e) => this.handleFieldValueChange(e.target.value)}
                onKeyPress={this.handleInputFieldKeyPress}
            />
            {this.props.loginStatus === LoginStatus.REJECTED ?   <FormHelperText id="login-error-text">{PowerLocalize.get('UserLogin.LoginFailed')}</FormHelperText> : <React.Fragment/>}
            {this.props.loginStatus === LoginStatus.INVALID_NAME ?   <FormHelperText id="login-error-text">{PowerLocalize.get('UserLogin.InvalidName')}</FormHelperText> : <React.Fragment/>}
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
                            <Button variant="raised"
                                    onClick={this.handleProgressButtonClick}
                                    disabled={this.hasError()}
                                    color={'primary'}>Weiter</Button>
                            <br/>
                            <br/>
                            <Link to={Paths.ADMIN_LOGIN}><Button variant="flat">Admin</Button></Link>
                        </div>

                    </div>
                </div>
                <div className="vertical-align" style={{marginTop: '50px'}}>
                    <BottomBuildInfo/>
                </div>
            </div>);
    }
}

/**
 * @see PowerLoginModule
 * @author nt
 * @since 11.05.2017
 */
export const PowerLogin: React.ComponentClass<PowerLoginLocalProps> = connect(PowerLoginModule.mapStateToProps, PowerLoginModule.mapDispatchToProps)(PowerLoginModule);