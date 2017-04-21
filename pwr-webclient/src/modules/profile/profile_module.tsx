
import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState, RequestStatus} from '../../Store';
import {
    Card, CardHeader, Divider, Drawer, Menu, MenuItem, Paper, Toolbar, IconButton, Snackbar,
    FontIcon, RefreshIndicator, CircularProgress, TouchTapEvent
} from 'material-ui';
import {Grid, Row} from 'react-flexbox-grid';
import {AbstractText} from './elements/abstract_module';
import {LanguageSkills} from './elements/languages_module';
import {Sectors} from './elements/sectors_module';
import {Career} from './elements/career_module';
import {Education} from './elements/eduction_module';
import {Qualifications} from './elements/qualification_module';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {ProfileActionCreator, ProfileAsyncActionCreator} from '../../reducers/singleProfile/singleProfileActions';

interface ProfileProps {
    requestProfileStatus: RequestStatus;
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
}

class ProfileModule extends React.Component<ProfileProps & ProfileLocalProps & ProfileDispatch, ProfileLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: ProfileLocalProps) : ProfileProps {
        return {
            requestProfileStatus: state.singleProfile.requestProfileStatus
        };
    }

    private readonly cardToolbarStyle = {
        'backgroundColor' : '#bccfff'
    };

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : ProfileDispatch {
        return {
            reloadProfile: function() {dispatch(ProfileAsyncActionCreator.requestSingleProfile("nt"))} //FIXME no hardcoding
        };
    }

    private renderSnackbar() : JSX.Element {
        let msgSuccess: JSX.Element = (
            <div>
                {"Status:\n" + RequestStatus[this.props.requestProfileStatus]}
                <FontIcon className="material-icons" style={{color: "green"}}>done</FontIcon>
            </div>
        );

        let msgFail: JSX.Element = (
            <div>
                {"Status:\n" + RequestStatus[this.props.requestProfileStatus]}
                <FontIcon className="material-icons" style={{color: "red"}}>error</FontIcon>
            </div>
        );

        let msgPending: JSX.Element = (
            <div className="row">
                <div className="col-md-6">
                {"Status:\n" + RequestStatus[this.props.requestProfileStatus]}
                </div>
                <CircularProgress size={40}/>
            </div>
        );

        let msg: JSX.Element;
        if(this.props.requestProfileStatus === RequestStatus.Successful) {
            msg = msgSuccess;
        } else if(this.props.requestProfileStatus === RequestStatus.Failiure) {
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
        // FIXME implement
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
                            <IconButton iconClassName="material-icons" onClick={this.handleResetProfile} tooltip={PowerLocalize.get('Action.Undo')}>undo</IconButton>
                        </Toolbar>
                        <br/>
                        {this.renderSnackbar()}
                    </Card>
                </div>
                <div className="col-md-2"/>
            </div>
        );
    }
}

export const Profile: React.ComponentClass<ProfileLocalProps> = connect(ProfileModule.mapStateToProps, ProfileModule.mapDispatchToProps)(ProfileModule);