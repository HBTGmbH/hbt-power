import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState, RequestStatus} from '../../Store';
import {
    Card,
    CardHeader,
    CircularProgress,
    Divider,
    Drawer,
    FontIcon,
    IconButton,
    MenuItem,
    Paper,
    Snackbar,
    Toolbar,
    TouchTapEvent
} from 'material-ui';
import {AbstractText} from './elements/abstract_module';
import {LanguageSkills} from './elements/languages_module';
import {Sectors} from './elements/sectors_module';
import {Career} from './elements/career_module';
import {Education} from './elements/eduction_module';
import {Qualifications} from './elements/qualification_module';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {ProfileActionCreator, ProfileAsyncActionCreator} from '../../reducers/singleProfile/singleProfileActions';
import {Profile} from '../../model/Profile';

interface ProfileProps {
    requestProfileStatus: RequestStatus;
    saveProfileStatus: RequestStatus;
    profile: Profile;
}

/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for disply, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface ProfileLocalProps {

}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface ProfileLocalState {

}

interface ProfileDispatch {
    reloadProfile(): void;
    saveProfile(initials: string, profile: Profile): void;
}

class ProfileModule extends React.Component<ProfileProps & ProfileLocalProps & ProfileDispatch, ProfileLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: ProfileLocalProps) : ProfileProps {
        return {
            requestProfileStatus: state.singleProfile.requestProfileStatus,
            saveProfileStatus: state.singleProfile.saveProfileStatus,
            profile: state.singleProfile.profile
        };
    }

    private readonly cardToolbarStyle = {
        'backgroundColor' : '#bccfff'
    };

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : ProfileDispatch {
        return {
            reloadProfile: function() {dispatch(ProfileAsyncActionCreator.requestSingleProfile('nt'));} ,//FIXME no hardcoding
            saveProfile: function(initials: string, profile: Profile) {
                dispatch(ProfileAsyncActionCreator.saveFullProfile(initials, profile))
            }
        };
    }

    private static renderSnackbar(statusName: string, status: RequestStatus) : JSX.Element {
        let msgSuccess: JSX.Element = (
            <div className="row">
                <FontIcon className="material-icons col-md-2 col-md-offset-5" style={{color: 'green', fontSize: "45"}}>done</FontIcon>
            </div>
        );

        let msgFail: JSX.Element = (
            <div className="row">
                <FontIcon className="material-icons col-md-2 col-md-offset-5" style={{color: 'red', fontSize: "45"}}>error</FontIcon>
            </div>
        );

        let msgPending: JSX.Element = (
            <div className="row">
                <div className="col-md-2 col-md-offset-5">
                    <CircularProgress size={40}/>
                </div>
            </div>
        );

        let msg: JSX.Element;
        if(status === RequestStatus.Successful) {
            msg = msgSuccess;
        } else if(status === RequestStatus.Failiure) {
            msg = msgFail;
        } else {
            msg = msgPending;
        }

        return (<Snackbar open={true} message={msg}/>);
    }




    private handleReloadProfile = (event: TouchTapEvent) => {
        this.props.reloadProfile();
    };

    private handleSaveProfile = (event: TouchTapEvent) => {
        console.log(this.props.profile);
        this.props.saveProfile("nt", this.props.profile); //FIXME remove hardcoding
    };

    private handleResetProfile = (event: TouchTapEvent) => {
        // FIXME implement
    };

    render() {
        return(
            <div className="row">
                <div className="col-md-1"/>
                <div className="col-md-2">
                    <Paper>
                        <Drawer docked={false}>
                            <MenuItem primaryText="Werbetext"/>
                            <MenuItem primaryText="Sprache"/>
                            <MenuItem primaryText="Branchen"/>
                            <MenuItem primaryText="Werdegang"/>
                            <MenuItem primaryText="Ausbildung"/>
                        </Drawer>
                    </Paper>
                </div>
                <div className="col-md-7">
                    <Card style={{'padding': '20px'}}>
                        <CardHeader
                            title="John Doe"
                            avatar="/img/crazy_lama.jpg"
                        />
                        <br/>
                        <Divider/>
                        <AbstractText
                            hintText="Werbetext"
                            initialMaxCharacters={500}
                        />
                        <Divider/>
                        <LanguageSkills/>
                        <Divider/>
                        <Sectors/>
                        <Divider/>
                        <Career/>
                        <Divider/>
                        <Education/>
                        <Divider/>
                        <Qualifications/>
                        <Divider/>
                        <br/>
                        <Toolbar style={this.cardToolbarStyle}>
                            <IconButton iconClassName="material-icons" onClick={this.handleSaveProfile} tooltip={PowerLocalize.get('Action.Save')}>done</IconButton>
                            <IconButton iconClassName="material-icons" onClick={this.handleReloadProfile} tooltip={PowerLocalize.get('Action.Update')}>update</IconButton>
                            <IconButton iconClassName="material-icons" disabled={true} onClick={this.handleResetProfile} tooltip={PowerLocalize.get('Action.Undo')}>undo</IconButton>
                        </Toolbar>
                        <br/>
                        {ProfileModule.renderSnackbar('Save', this.props.saveProfileStatus)}
                        {ProfileModule.renderSnackbar('Load', this.props.requestProfileStatus)}
                    </Card>
                </div>
                <div className="col-md-2"/>
            </div>
        );
    }
}

export const ConsultantProfile: React.ComponentClass<ProfileLocalProps> = connect(ProfileModule.mapStateToProps, ProfileModule.mapDispatchToProps)(ProfileModule);