import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {CardHeader, Divider, Paper, Tab, Tabs, Toolbar} from '@material-ui/core';
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
import Avatar from '@material-ui/core/Avatar/Avatar';
import {PwrIconButton} from '../../general/pwr-icon-button';


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
    tabValue: number;
}

interface ProfileDispatch {
    reloadProfile(initials: string): void;

    saveProfile(initials: string, database: ProfileStore): void;
}

class ProfileModule extends React.Component<ProfileProps & ProfileLocalProps & ProfileDispatch, ProfileLocalState> {

    constructor(props: ProfileProps & ProfileLocalProps & ProfileDispatch) {
        super(props);
        this.state = {
            tabValue: 0,
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: ProfileLocalProps): ProfileProps {
        return {
            database: state.databaseReducer,
            loggedInUser: state.databaseReducer.loggedInUser()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ProfileDispatch {
        return {
            reloadProfile: function (initials: string) {
                dispatch(ProfileAsyncActionCreator.requestSingleProfile(initials));
            },
            saveProfile: function (initials: string, database: ProfileStore) {
                dispatch(ProfileAsyncActionCreator.saveFullProfile(initials, database.serializeToAPI()));
            }
        };
    }

    private handleReloadProfile = () => {
        this.props.reloadProfile(this.props.loggedInUser.initials());
    };

    private handleSaveProfile = () => {
        this.props.saveProfile(this.props.loggedInUser.initials(), this.props.database);
    };

    private getInitials = () => {
        return isNullOrUndefined(this.props.loggedInUser) ? '' : this.props.loggedInUser.initials();
    };

    private renderAvatar = () => {
        return (
            <Avatar
                src={getProfileImageLocation(this.getInitials())}
                style={{width: 80, height: 80}}
            />);


    };

    render() {
        return (
            <Paper className="mui-margin">
                <Tabs
                    value={this.state.tabValue}
                    centered
                    style={{backgroundColor: '#191e55'}}
                    textColor={'secondary'}
                    onChange={(e: any, v: any) => {
                        this.setState({tabValue: v});
                    }}
                >
                    <Tab value={0} label={PowerLocalize.get('ProfileModule.Tabs.Profile.Title')}/>
                    <Tab value={1} label={PowerLocalize.get('ProfileModule.Tabs.Projects.Title')}/>
                    <Tab value={2} label="Skills"/>
                </Tabs>
                <div>
                    {this.state.tabValue === 0 &&
                    <div className="mui-margin">
                        <CardHeader
                            title={isNullOrUndefined(this.props.loggedInUser) ? '' : this.props.loggedInUser.getFullName()}
                            avatar={this.renderAvatar()}
                        />
                        <Divider/>
                        <div className="row">
                            <div className="col-md-6 col-sm-12">
                                <ProfileDescription
                                    hintText={PowerLocalize.get('Profile.Description')}
                                    initialMaxCharacters={500}
                                />
                            </div>
                            <div className="col-md-6 col-sm-12">
                                <LanguageSkills/>
                            </div>
                            <div className="col-md-6 col-sm-12 ">
                                <TrainingEntries/>
                            </div>
                            <div className="col-md-6 col-sm-12">
                                <EducationList/>
                            </div>
                            <div className="col-md-6 col-sm-12">
                                <Qualifications/>
                            </div>
                            <div className="col-md-6 col-sm-12">
                                <Sectors/>
                            </div>
                            <div className="col-md-6 col-sm-12">
                                <KeySkills/>
                            </div>
                            <div className="col-md-6 col-sm-12">
                                <Careers/>
                            </div>
                        </div>
                    </div>
                    }

                    {this.state.tabValue === 1 &&
                    <div className="mui-margin">
                        <Projects/>
                    </div>
                    }

                    {this.state.tabValue === 2 &&
                    <div className="mui-margin">
                        <SkillTree/>
                    </div>
                    }
                </div>
                <Toolbar>
                    <div style={{marginLeft: "auto"}}>
                        <PwrIconButton iconName={'done'} tooltip={PowerLocalize.get('Action.Save')}
                                       onClick={this.handleSaveProfile}/>
                        <PwrIconButton iconName={'undo'} tooltip={PowerLocalize.get('Action.Undo')}
                                       onClick={this.handleReloadProfile}/>
                    </div>
                </Toolbar>
            </Paper>
        );
    }
}

export const ConsultantProfile: React.ComponentClass<ProfileLocalProps> = connect(ProfileModule.mapStateToProps, ProfileModule.mapDispatchToProps)(ProfileModule);