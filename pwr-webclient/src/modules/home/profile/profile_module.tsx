import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {CardHeader, Divider, IconButton, Paper, Tab, Tabs, Toolbar, TouchTapEvent} from 'material-ui';
import {ProfileDescription} from './elements/abstract_module';
import {LanguageSkills} from './elements/language/languages_module';
import {Sectors} from './elements/sectors/sectors_module';
import {TrainingEntries} from './elements/training/training_module';
import {EducationList} from './elements/education/eduction_module';
import {Qualifications} from './elements/qualification/qualification_module';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ProfileStore} from '../../../model/ProfileStore';
import {ProfileAsyncActionCreator} from '../../../reducers/profile/ProfileAsyncActionCreator';
import {Projects} from './elements/project/projects-module';
import {SkillTree} from './elements/skills/skilltree-module';
import {getProfileImageLocation} from '../../../API_CONFIG';
import {ConsultantInfo} from '../../../model/ConsultantInfo';
import {isNullOrUndefined} from 'util';
import {Careers} from './elements/career/career_module';
import {KeySkills} from './elements/keyskill/keySkill_module';
import {ApplicationState} from '../../../reducers/reducerIndex';


interface ProfileProps {
    database: ProfileStore;
    loggedInUser: ConsultantInfo;
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
    reloadProfile(initials: string): void;
    saveProfile(initials: string, database: ProfileStore): void;
}

class ProfileModule extends React.Component<ProfileProps & ProfileLocalProps & ProfileDispatch, ProfileLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: ProfileLocalProps) : ProfileProps {
        return {
            database: state.databaseReducer,
            loggedInUser: state.databaseReducer.loggedInUser()
        };
    }

    private readonly cardToolbarStyle = {
    };

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>) : ProfileDispatch {
        return {
            reloadProfile: function(initials: string) {
                dispatch(ProfileAsyncActionCreator.requestSingleProfile(initials));
            },
            saveProfile: function(initials: string, database: ProfileStore) {
                dispatch(ProfileAsyncActionCreator.saveFullProfile(initials, database.serializeToAPI()));
            }
        };
    }





    private handleReloadProfile = (event: TouchTapEvent) => {
        this.props.reloadProfile(this.props.loggedInUser.initials());
    };

    private handleSaveProfile = (event: TouchTapEvent) => {
        this.props.saveProfile(this.props.loggedInUser.initials(), this.props.database);
    };

    private getInitials = () => {
        return isNullOrUndefined(this.props.loggedInUser) ? "" : this.props.loggedInUser.initials();
    };

    render() {
        return(
           <Paper>
                <Tabs>
                    <Tab label={PowerLocalize.get("ProfileModule.Tabs.Profile.Title")}>
                        <CardHeader
                            title={isNullOrUndefined(this.props.loggedInUser) ? "" : this.props.loggedInUser.getFullName()}
                            avatar={getProfileImageLocation(this.getInitials())}
                        />
                        <Divider/>

                        <div className="row">
                            <div className="col-md-6 col-sm-12 fullWidth">
                                <ProfileDescription
                                hintText={PowerLocalize.get("Profile.Description")}
                                initialMaxCharacters={500}
                            />
                            </div>
                            <div className="col-md-6 col-sm-12 fullWidth">
                                <LanguageSkills/>
                            </div>
                            <div className="col-md-6 col-sm-12 fullWidth ">
                                <TrainingEntries/>
                            </div>
                            <div className="col-md-6 col-sm-12 fullWidth">
                                <EducationList/>
                            </div>
                            <div className="col-md-6 col-sm-12 fullWidth">
                                <Qualifications/>
                            </div>
                            <div className="col-md-6 col-sm-12 fullWidth">
                                <Sectors/>
                            </div>
                            <div className="col-md-6 col-sm-12 fullWidth">
                                <KeySkills/>
                            </div>
                            <div className="col-md-6 col-sm-12 fullWidth">
                                <Careers/>
                            </div>
                        </div>
                    </Tab>
                    <Tab label={PowerLocalize.get("ProfileModule.Tabs.Projects.Title")}>
                        <Projects/>
                    </Tab>
                    <Tab label="Skills">
                        <SkillTree/>
                    </Tab>
                </Tabs>
                <Toolbar style={this.cardToolbarStyle}>
                    <IconButton iconClassName="material-icons" onClick={this.handleSaveProfile} tooltip={PowerLocalize.get('Action.Save')}>done</IconButton>
                    <IconButton iconClassName="material-icons" onClick={this.handleReloadProfile} tooltip={PowerLocalize.get('Action.Undo')}>undo</IconButton>
                </Toolbar>
           </Paper>
        );
    }
}

export const ConsultantProfile: React.ComponentClass<ProfileLocalProps> = connect(ProfileModule.mapStateToProps, ProfileModule.mapDispatchToProps)(ProfileModule);