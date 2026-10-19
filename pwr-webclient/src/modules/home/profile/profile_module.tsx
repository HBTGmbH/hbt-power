import {connect} from 'react-redux';
import * as React from 'react';
import {Divider, Paper, Tab, Tabs} from '@material-ui/core';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {ProfileDataAsyncActionCreator} from '../../../reducers/profile-new/profile/ProfileDataAsyncActionCreator';
import {Profile} from '../../../reducers/profile-new/profile/model/Profile';
import Grid from '@material-ui/core/Grid/Grid';
import Typography from '@material-ui/core/Typography/Typography';
import {SuggestionAsyncActionCreator} from '../../../reducers/suggestions/SuggestionAsyncActionCreator';
import {SuggestionStore} from '../../../reducers/suggestions/SuggestionStore';
import {Consultant} from '../../../reducers/profile-new/consultant/model/Consultant';
import {ProfileEntryElement} from './profile-entry_module';
import {ProfileEntry} from '../../../reducers/profile-new/profile/model/ProfileEntry';
import {FurtherTraining} from '../../../reducers/profile-new/profile/model/FurtherTraining';
import {Language} from '../../../reducers/profile-new/profile/model/Language';
import {Education} from '../../../reducers/profile-new/profile/model/Education';
import {Qualification} from '../../../reducers/profile-new/profile/model/Qualification';
import {Career} from '../../../reducers/profile-new/profile/model/Career';
import {ProfileDescription} from './elements/profile-description_module';
import {Projects} from './elements/project/projects_module';
import {ProfileSkills} from './elements/skills/profile-skills_module';
import {formatToShortDisplay} from '../../../utils/DateUtil';
import {ThunkDispatch} from 'redux-thunk';
import {ProfileServiceClient} from '../../../clients/ProfileServiceClient';
import {matchPath} from 'react-router-dom';
import {Paths} from '../../../Paths';
import {projectsUrl} from './elements/project/project-url-sync';


interface ProfileProps {
    suggestions: SuggestionStore;
    activeConsultant: Consultant;
    profile: Profile;
    profilePictureSrc: string;
    projectsTabUrl: string;
}

/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for disply, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface ProfileLocalProps {
    // Provided by the route
    match?: any;
    location?: any;
    history?: any;
}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface ProfileLocalState {
}

const PROFILE_TAB = 0;
const PROJECTS_TAB = 1;
const SKILLS_TAB = 2;

interface ProfileDispatch {
    loadFullProfile(initials: string): void;

    preFetchSuggestions(): void;
}

class ProfileModule extends React.Component<ProfileProps & ProfileLocalProps & ProfileDispatch, ProfileLocalState> {

    constructor(props: ProfileProps & ProfileLocalProps & ProfileDispatch) {
        super(props);
        this.state = {};
    }

    static mapStateToProps(state: ApplicationState, ownProps: ProfileLocalProps): ProfileProps {
        const profilePictureSrc = ProfileServiceClient.instance().getProfilePictureUrl(state.profileStore.consultant.profilePictureId);
        return {
            suggestions: state.suggestionStore,
            activeConsultant: state.profileStore.consultant,
            profile: state.profileStore.profile,
            profilePictureSrc,
            projectsTabUrl: projectsUrl(ownProps.match.params.initials, state.profileStore)
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): ProfileDispatch {
        return {
            loadFullProfile: (initials) => dispatch(ProfileDataAsyncActionCreator.loadFullProfile(initials)),
            preFetchSuggestions: () => dispatch(SuggestionAsyncActionCreator.requestAllNameEntities())
        };
    }

    componentDidUpdate(prevProps: Readonly<ProfileProps & ProfileLocalProps & ProfileDispatch>, prevState: Readonly<ProfileLocalState>, snapshot?: any): void {
        if (prevProps.activeConsultant.initials !== this.props.activeConsultant.initials) {
            this.props.loadFullProfile(this.props.activeConsultant.initials);
        }
    }

    componentDidMount() {
        this.props.preFetchSuggestions();
        if (!!this.props.activeConsultant.initials) {
            this.props.loadFullProfile(this.props.activeConsultant.initials);
        }
    }

    private consultantName(): string {
        const consultant = this.props.activeConsultant;
        return consultant != null ? consultant.firstName + ' ' + consultant.lastName : 'No Name';
    }

    private renderInfo(value: string) {
        return <span>
            {value}
        </span>;
    }

    private renderLanguageInfo = (entry: ProfileEntry) => {
        const language: Language = entry as Language;
        return this.renderInfo(PowerLocalize.langLevelToLocalizedString(language.level));
    };

    private renderTrainingInfo = (entry: ProfileEntry) => {
        const training: FurtherTraining = entry as FurtherTraining;
        return this.renderInfo(`${formatToShortDisplay(training.startDate)} - ${formatToShortDisplay(training.endDate)}`);
    };

    private renderEducationInfo = (entry: ProfileEntry) => {
        const education: Education = entry as Education;
        return this.renderInfo(`${formatToShortDisplay(education.endDate)} | ${education.degree}`);
    };

    private renderQualificationInfo = (entry: ProfileEntry) => {
        const qualification: Qualification = entry as Qualification;
        return this.renderInfo(formatToShortDisplay(qualification.date));
    };

    private renderEmpty = (_: ProfileEntry) => {
        return <span></span>
    };

    private renderCareerInfo = (entry: ProfileEntry) => {
        const career: Career = entry as Career;
        return this.renderInfo(`${formatToShortDisplay(career.startDate)} - ${formatToShortDisplay(career.endDate)}`);
    };

    /**
     * The tab is part of the URL, so a reload or a link shows the same tab
     */
    private tabValue(): number {
        const path = this.props.location.pathname;
        if (matchPath(path, {path: Paths.USER_PROFILE_PROJECTS})) {
            return PROJECTS_TAB;
        }
        if (matchPath(path, {path: Paths.USER_PROFILE_SKILLS})) {
            return SKILLS_TAB;
        }
        return PROFILE_TAB;
    }

    private selectTab = (tab: number) => {
        const initials = this.props.match.params.initials;
        if (tab === PROJECTS_TAB) {
            this.props.history.push(this.props.projectsTabUrl);
        } else {
            this.props.history.push(Paths.build(tab === SKILLS_TAB ? Paths.USER_PROFILE_SKILLS : Paths.USER_PROFILE, {initials}));
        }
    };

    render() {
        const tabValue = this.tabValue();
        return <Paper className="mui-margin">
            <Tabs
                value={tabValue}
                centered
                onChange={(e: any, v: any) => this.selectTab(v)}
            >
                <Tab textColor={'secondary'} value={PROFILE_TAB}
                     label={PowerLocalize.get('ProfileModule.Tabs.Profile.Title')}/>
                <Tab textColor={'primary'} value={PROJECTS_TAB}
                     label={PowerLocalize.get('ProfileModule.Tabs.Projects.Title')}/>
                <Tab value={SKILLS_TAB} label="Skills"/>
            </Tabs>
            <div>
                {tabValue === PROFILE_TAB &&
                <div className="mui-margin">
                    {/* Photo on the left, name, title and promotional text next to it; stacked below md */}
                    <Grid container spacing={2} alignItems={'stretch'}>
                        {this.props.activeConsultant.profilePictureId &&
                        <Grid item xs={12} md={'auto'} className="pwr-profile-picture-cell">
                            {/* Square, centred and cropped to the full height of the header; hidden if it cannot be loaded */}
                            <img className="pwr-profile-picture" src={this.props.profilePictureSrc}
                                 alt={this.consultantName()}
                                 onError={e => e.currentTarget.style.display = 'none'}/>
                        </Grid>}
                        <Grid item xs={12} md>
                            <Typography variant={'h5'}>{this.consultantName()}</Typography>
                            <Typography variant={'subtitle1'} color={'textSecondary'} gutterBottom>
                                {this.props.activeConsultant.title}
                            </Typography>
                            <ProfileDescription/>
                        </Grid>
                    </Grid>
                    <Divider style={{marginTop: '16px'}}/>


                    <Grid container spacing={2} className="mui-margin">
                        <Grid item md={6} xs={12}>
                            <ProfileEntryElement type={'LANGUAGE'}
                                                 renderSingleElementInfo={this.renderLanguageInfo}/>
                        </Grid>
                        < Grid item md={6} xs={12}>
                            <ProfileEntryElement type={'TRAINING'}
                                                 renderSingleElementInfo={this.renderTrainingInfo}/>
                        </Grid>
                        <Grid item md={6} xs={12}>
                            <ProfileEntryElement type={'EDUCATION'}
                                                 renderSingleElementInfo={this.renderEducationInfo}/>
                        </Grid>
                        <Grid item md={6} xs={12}>
                            <ProfileEntryElement type={'QUALIFICATION'}
                                                 renderSingleElementInfo={this.renderQualificationInfo}/>
                        </Grid>
                        <Grid item md={6} xs={12}>
                            <ProfileEntryElement type={'SECTOR'} renderSingleElementInfo={this.renderEmpty}/>
                        </Grid>
                        <Grid item md={6} xs={12}>
                            <ProfileEntryElement type={'SPECIAL_FIELD'} renderSingleElementInfo={this.renderEmpty}/>
                        </Grid>
                        <Grid item md={6} xs={12}>
                            <ProfileEntryElement type={'CAREER'} renderSingleElementInfo={this.renderCareerInfo}/>
                        </Grid>
                    </Grid>

                </div>
                }

                {tabValue === PROJECTS_TAB &&
                <div className="mui-margin">
                    <Projects/>
                </div>
                }

                {tabValue === SKILLS_TAB &&
                <div className="mui-margin">
                    <ProfileSkills/>
                </div>
                }
            </div>
        </Paper>;
    }
}

export const ConsultantProfile: React.ComponentClass<ProfileLocalProps> = connect(ProfileModule.mapStateToProps, ProfileModule.mapDispatchToProps)(ProfileModule) as any;
