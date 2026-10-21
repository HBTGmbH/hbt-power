import * as React from 'react';
import {KeyboardEvent} from 'react';
import {ApplicationState} from '../reducers/reducerIndex';
import {ThunkDispatch} from 'redux-thunk';
import {LoginStatus} from '../model/LoginStatus';
import FormControl from '@material-ui/core/FormControl/FormControl';
import TextField from '@material-ui/core/TextField/TextField';
import {PowerLocalize} from '../localization/PowerLocalizer';
import iconPower from '../img/icon-hbt-power.svg';
import {PwrRaisedButton} from './general/pwr-raised-button';
import {PwrSpacer} from './general/pwr-spacer_module';
import ArrowRight from '@material-ui/icons/ArrowRight';
import Link from '@material-ui/core/Link/Link';
import {connect} from 'react-redux';
import {NavigationActionCreator} from '../reducers/navigation/NavigationActionCreator';
import {Paths} from '../Paths';

interface ProfileSelectDispatch {
    openProfile(initials: string): void;

    openAdminArea(): void;
}

interface ProfileSelectProps {
    isAdmin: boolean;
}

class ProfileSelectModule extends React.Component<ProfileSelectDispatch & ProfileSelectProps, { initials: string }> {

    constructor(props) {
        super(props);
        this.state = {
            initials: '',
        };
    }

    static mapStateToProps(state: ApplicationState): ProfileSelectProps {
        return {
            isAdmin: state.adminReducer.loginStatus === LoginStatus.SUCCESS
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): ProfileSelectDispatch {
        return {
            openProfile: (initials) => {
                dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.build(Paths.USER_HOME, {initials})));
            },
            openAdminArea: () => dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.ADMIN_BASE)),
        };
    }


    private handleInitialsChange = (initials: string) => {
        this.setState({
            initials
        });
    };

    private handleInputFieldKeyPress = (event: KeyboardEvent<{}>) => {
        if (event.key === 'Enter') {
            this.openProfile();
        }
    };

    private openProfile = () => {
        this.props.openProfile(this.state.initials);
    };

    private openAdminArea = () => {
        this.props.openAdminArea();
    };


    private renderInputField = () => {
        return <FormControl>
            <TextField
                label={PowerLocalize.get('Initials.Singular')}
                value={this.state.initials}
                onChange={(e) => this.handleInitialsChange(e.target.value)}
                onKeyPress={this.handleInputFieldKeyPress}
            />
        </FormControl>;
    };

    render() {
        return (
            <React.Fragment>
                <div className="hbt-schild-background">
                </div>

                <div>
                    <div className="vertical-align" style={{height: '100vh'}}>
                        <div style={{padding: '64px', backgroundColor: 'white'}}>
                            {/* Dark only behind the icon, its colours are made for Dunkelblau (#125) */}
                            <div className="vertical-align">
                                <div className="pwr-login-icon-tile">
                                    <img alt={PowerLocalize.get('App.Name')} className="pwr-login-icon" src={iconPower}/>
                                </div>
                            </div>
                            <div className="vertical-align">
                                <h1>{PowerLocalize.get('ProfileSelect.Title')}</h1>
                            </div>
                            <div className="vertical-align">
                                <div className="fittingContainer">
                                    <div className="vertical-align">
                                        {this.renderInputField()}
                                    </div>
                                </div>
                            </div>
                            <PwrSpacer size="tight"/>
                            <div className="vertical-align">
                                <PwrRaisedButton color="primary" icon={<ArrowRight/>} onClick={this.openProfile}
                                                 text={PowerLocalize.get('ProfileSelect.Open')}/>
                            </div>
                            <PwrSpacer size="tight"/>
                            {
                                this.props.isAdmin && <div className="vertical-align">
                                    <Link component="button" variant="body1" onClick={this.openAdminArea}>
                                        {PowerLocalize.get('Login.AdminSpace')}
                                    </Link>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </React.Fragment>);
    }
}

export const ProfileSelect: React.ComponentClass<{}> = connect(ProfileSelectModule.mapStateToProps, ProfileSelectModule.mapDispatchToProps)(ProfileSelectModule) as any;
