import * as React from 'react';
import {KeyboardEvent} from 'react';
import {ApplicationState} from '../reducers/reducerIndex';
import {ThunkDispatch} from 'redux-thunk';
import {LoginStatus} from '../model/LoginStatus';
import FormControl from '@material-ui/core/FormControl/FormControl';
import TextField from '@material-ui/core/TextField/TextField';
import Typography from '@material-ui/core/Typography/Typography';
import {PowerLocalize} from '../localization/PowerLocalizer';
import iconPower from '../img/icon-hbt-power.svg';
import {PwrRaisedButton} from './general/pwr-raised-button';
import {PwrSpacer} from './general/pwr-spacer_module';
import ArrowRight from '@material-ui/icons/ArrowRight';
import Link from '@material-ui/core/Link/Link';
import {connect} from 'react-redux';
import {NavigationActionCreator, navigateReplacing} from '../reducers/navigation/NavigationActionCreator';
import {Paths} from '../Paths';
import {ConsultantInfoDTO} from '../model/ConsultantInfoDTO';
import {ConsultantSelect} from './home/consultant-select';
import {ConsultantClient} from '../reducers/profile-new/consultant/ConsultantClient';
import {OIDCService} from '../OIDCService';

interface ProfileSelectDispatch {
    openProfile(initials: string): void;

    openOwnProfile(initials: string): void;

    openAdminArea(): void;
}

interface ProfileSelectProps {
    isAdmin: boolean;
    consultants: Array<ConsultantInfoDTO>;
}

interface ProfileSelectState {
    initials: string;
    /** Message at the field: no profile for the entered initials or for the own account */
    message: string;
    /** Without the admin role: looking up the own profile, nothing to choose yet */
    openingOwnProfile: boolean;
}

/**
 * Admins choose a profile from the list of consultants; everyone else goes straight to their own profile, found by
 * the initials in the token, and only gets the initials field without one (#135)
 */
class ProfileSelectModule extends React.Component<ProfileSelectDispatch & ProfileSelectProps, ProfileSelectState> {

    private readonly account = OIDCService.instance().getCurrentAccount();
    private readonly mayChoose = !!this.account && this.account.roles.includes('Power.Admin');
    private unmounted = false;

    constructor(props) {
        super(props);
        this.state = {
            initials: (this.account && this.account.initials) || '',
            message: '',
            openingOwnProfile: !this.mayChoose,
        };
    }

    static mapStateToProps(state: ApplicationState): ProfileSelectProps {
        return {
            isAdmin: state.adminReducer.loginStatus === LoginStatus.SUCCESS,
            consultants: [...state.adminReducer.consultantInfo].sort((a, b) => a.name.localeCompare(b.name)),
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): ProfileSelectDispatch {
        return {
            openProfile: (initials) => {
                dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.build(Paths.USER_HOME, {initials})));
            },
            // Replacing the selection, so going back doesn't land on it and jump forward again
            openOwnProfile: (initials) => navigateReplacing(Paths.build(Paths.USER_HOME, {initials}), dispatch),
            openAdminArea: () => dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.ADMIN_BASE)),
        };
    }

    componentDidMount() {
        if (this.mayChoose) {
            return;
        }
        const ownInitials = this.account && this.account.initials;
        if (!ownInitials) {
            this.setState({openingOwnProfile: false, message: PowerLocalize.get('ProfileSelect.NoOwnInitials')});
            return;
        }
        ConsultantClient.instance().findConsultant(ownInitials)
            .then(consultant => {
                if (this.unmounted) {
                    return;
                }
                if (consultant) {
                    this.props.openOwnProfile(ownInitials);
                } else {
                    this.setState({
                        openingOwnProfile: false,
                        initials: '',
                        message: PowerLocalize.getFormatted('ProfileSelect.NoOwnProfile', ownInitials)
                    });
                }
            })
            .catch(() => !this.unmounted && this.setState({openingOwnProfile: false}));
    }

    componentWillUnmount() {
        this.unmounted = true;
    }

    /**
     * The list of consultants loads after the admin check; until then, and if it fails, the initials field stands in
     */
    private showsList = (): boolean => {
        return this.mayChoose && this.props.consultants.length > 0;
    };

    /**
     * In the list only a listed consultant counts, the own initials may have no profile
     */
    private selectedInitials = (): string => {
        if (!this.showsList()) {
            return this.state.initials.trim();
        }
        return this.props.consultants.some(consultant => consultant.initials === this.state.initials) ? this.state.initials : '';
    };

    private handleInitialsChange = (initials: string) => {
        this.setState({
            initials,
            message: ''
        });
    };

    private handleInputFieldKeyPress = (event: KeyboardEvent<{}>) => {
        if (event.key === 'Enter') {
            this.openProfile();
        }
    };

    private openProfile = () => {
        const initials = this.selectedInitials();
        if (!initials) {
            return;
        }
        if (this.showsList()) {
            this.props.openProfile(initials);
            return;
        }
        // Typed initials: check first, so unknown ones get a message here instead of an empty profile
        ConsultantClient.instance().findConsultant(initials)
            .then(consultant => {
                if (this.unmounted) {
                    return;
                }
                if (consultant) {
                    this.props.openProfile(initials);
                } else {
                    this.setState({message: PowerLocalize.getFormatted('ProfileSelect.NoProfileFor', initials)});
                }
            })
            .catch(() => undefined);
    };

    private openAdminArea = () => {
        this.props.openAdminArea();
    };

    private renderInputField = () => {
        if (this.showsList()) {
            return <ConsultantSelect consultants={this.props.consultants} initials={this.selectedInitials()}
                                     label={PowerLocalize.get('ProfileSelect.Consultant')}
                                     onSelect={this.handleInitialsChange}/>;
        }
        return <FormControl>
            <TextField
                label={PowerLocalize.get('Initials.Singular')}
                value={this.state.initials}
                onChange={(e) => this.handleInitialsChange(e.target.value)}
                onKeyPress={this.handleInputFieldKeyPress}
            />
        </FormControl>;
    };

    private renderMessage = () => {
        if (!this.state.message) {
            return null;
        }
        return <>
            <PwrSpacer size="tight"/>
            <div className="vertical-align">
                <Typography color="error" className="pwr-profile-select-message">{this.state.message}</Typography>
            </div>
        </>;
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
                            {this.state.openingOwnProfile
                                ? <div className="vertical-align">
                                    <Typography color="textSecondary">{PowerLocalize.get('ProfileSelect.OpeningOwnProfile')}</Typography>
                                </div>
                                : !this.mayChoose
                                    // A user opens only the own profile (#255): nothing to choose, only why it didn't open
                                    ? this.renderMessage()
                                    : <>
                                    <div className="vertical-align">
                                        <div className="fittingContainer">
                                            <div className="vertical-align">
                                                {this.renderInputField()}
                                            </div>
                                        </div>
                                    </div>
                                    {this.renderMessage()}
                                    <PwrSpacer size="tight"/>
                                    <div className="vertical-align">
                                        <PwrRaisedButton color="primary" icon={<ArrowRight/>} onClick={this.openProfile}
                                                         disabled={!this.selectedInitials()}
                                                         text={PowerLocalize.get('ProfileSelect.Open')}/>
                                    </div>
                                </>}
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
