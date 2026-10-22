import {connect} from 'react-redux';
import * as React from 'react';
import {Button, Divider, Icon, Paper} from '@material-ui/core';
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
import {PwrProfilePicture} from '../../general/pwr-profile-picture';
import {PwrSpacer} from '../../general/pwr-spacer_module';
import {Link, matchPath} from 'react-router-dom';
import {Paths} from '../../../Paths';
import {profileSectionAnchor} from '../../general/profile-check/profile-check-hints';
import {ProfileSection} from '../../../model/check/ProfileCheck';
import {projectsUrl} from './elements/project/project-url-sync';
import {ProfileStore} from '../../../reducers/profile-new/ProfileStore';


interface ProfileProps {
    suggestions: SuggestionStore;
    activeConsultant: Consultant;
    profile: Profile;
    profileStore: ProfileStore;
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

    static mapStateToProps(state: ApplicationState, _: ProfileLocalProps): ProfileProps {
        return {
            suggestions: state.suggestionStore,
            activeConsultant: state.profileStore.consultant,
            profile: state.profileStore.profile,
            profileStore: state.profileStore
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
        // Again once the profile is there: the sections above grow and push the target down
        if (this.hash(prevProps) !== this.hash(this.props) || prevProps.profile !== this.props.profile) {
            this.scrollToSection();
        }
    }

    componentDidMount() {
        this.props.preFetchSuggestions();
        if (!!this.props.activeConsultant.initials) {
            this.props.loadFullProfile(this.props.activeConsultant.initials);
        }
        this.scrollToSection();
    }

    private hash(props: ProfileLocalProps): string {
        return (props.location && props.location.hash) || '';
    }

    /**
     * A hint of the profile check (#139) links a section as #profile-section-…
     */
    private scrollToSection() {
        const id = this.hash(this.props).replace(/^#/, '');
        if (!id) {
            return;
        }
        window.setTimeout(() => {
            const section = document.getElementById(id);
            if (section) {
                section.scrollIntoView({behavior: 'smooth', block: 'start'});
            }
        }, 0);
    }

    private consultantName(): string {
        const consultant = this.props.activeConsultant;
        return consultant != null ? consultant.firstName + ' ' + consultant.lastName : 'No Name';
    }

    /**
     * Jumps to the projects and skills of the profile (#189), like the jumps in the head of a view profile: buttons that
     * are links, so the router navigates (and asks about unsaved changes) and a middle click opens a new tab
     */
    private renderJumps() {
        const initials = this.props.match.params.initials;
        const jump = (to: string, icon: string, localizationKey: string) =>
            // Material-UI marks anything but a plain <a> as a button; this is a link
            <Button color="primary" component={Link} to={to} role="link"
                    endIcon={<Icon className="material-icons">{icon}</Icon>}>
                {PowerLocalize.get(localizationKey)}
            </Button>;
        return <nav className="pwr-profile-nav" aria-label={PowerLocalize.get('Profile.Jumps')}>
            {jump(projectsUrl(initials, this.props.profileStore), 'work', 'Menu.BaseData.Projects')}
            {jump(Paths.build(Paths.USER_PROFILE_SKILLS, {initials}), 'star', 'Menu.BaseData.Skills')}
        </nav>;
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
     * The section is part of the URL; the menu (power-toolbar_module) navigates between them
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

    render() {
        const tabValue = this.tabValue();
        if (tabValue === PROJECTS_TAB) {
            // List and form are cards of their own (#145), not one card around both
            return <div className="mui-margin">
                <Projects/>
            </div>;
        }
        return <Paper className="mui-margin">
            <div>
                {tabValue === PROFILE_TAB &&
                <div className="mui-margin">
                    {/* Photo on the left, name, title and promotional text next to it; stacked below md */}
                    <Grid container spacing={2} alignItems={'stretch'}>
                        {this.props.activeConsultant.profilePictureId &&
                        <Grid item xs={12} md={'auto'} className="pwr-profile-picture-cell">
                            {/* Square, centred and cropped to the full height of the header */}
                            <PwrProfilePicture className="pwr-profile-picture" variant={'rounded'}
                                               pictureId={this.props.activeConsultant.profilePictureId}
                                               alt={this.consultantName()}/>
                        </Grid>}
                        <Grid item xs={12} md>
                            {/* Name and title on the left, the jumps on the right; on a narrow screen they wrap below */}
                            <div className="pwr-profile-title-row">
                                <div>
                                    <Typography variant={'h5'}>{this.consultantName()}</Typography>
                                    <Typography variant={'subtitle1'} color={'textSecondary'} gutterBottom>
                                        {this.props.activeConsultant.title}
                                    </Typography>
                                </div>
                                {this.renderJumps()}
                            </div>
                            <div id={profileSectionAnchor(ProfileSection.DESCRIPTION)} className="pwr-profile-section-anchor">
                                <ProfileDescription/>
                            </div>
                        </Grid>
                    </Grid>
                    {/* Spacing scale (#40): the entry blocks are sections, 32 px apart (16 px grid gap + 16 px below each) */}
                    <PwrSpacer/>
                    <Divider/>
                    <PwrSpacer/>
                    <Grid container spacing={2}>
                        <Grid item md={6} xs={12}>
                            <div id={profileSectionAnchor(ProfileSection.LANGUAGES)} className="pwr-profile-section-anchor">
                                <ProfileEntryElement type={'LANGUAGE'}
                                                     renderSingleElementInfo={this.renderLanguageInfo}/>
                            </div>
                            <PwrSpacer/>
                        </Grid>
                        < Grid item md={6} xs={12}>
                            <div id={profileSectionAnchor(ProfileSection.TRAININGS)} className="pwr-profile-section-anchor">
                                <ProfileEntryElement type={'TRAINING'}
                                                     renderSingleElementInfo={this.renderTrainingInfo}/>
                            </div>
                            <PwrSpacer/>
                        </Grid>
                        <Grid item md={6} xs={12}>
                            <div id={profileSectionAnchor(ProfileSection.EDUCATION)} className="pwr-profile-section-anchor">
                                <ProfileEntryElement type={'EDUCATION'}
                                                     renderSingleElementInfo={this.renderEducationInfo}/>
                            </div>
                            <PwrSpacer/>
                        </Grid>
                        <Grid item md={6} xs={12}>
                            <div id={profileSectionAnchor(ProfileSection.QUALIFICATIONS)} className="pwr-profile-section-anchor">
                                <ProfileEntryElement type={'QUALIFICATION'}
                                                     renderSingleElementInfo={this.renderQualificationInfo}/>
                            </div>
                            <PwrSpacer/>
                        </Grid>
                        <Grid item md={6} xs={12}>
                            <div id={profileSectionAnchor(ProfileSection.SECTORS)} className="pwr-profile-section-anchor">
                                <ProfileEntryElement type={'SECTOR'} renderSingleElementInfo={this.renderEmpty}/>
                            </div>
                            <PwrSpacer/>
                        </Grid>
                        <Grid item md={6} xs={12}>
                            <div id={profileSectionAnchor(ProfileSection.SPECIAL_FIELDS)} className="pwr-profile-section-anchor">
                                <ProfileEntryElement type={'SPECIAL_FIELD'} renderSingleElementInfo={this.renderEmpty}/>
                            </div>
                            <PwrSpacer/>
                        </Grid>
                        <Grid item md={6} xs={12}>
                            <div id={profileSectionAnchor(ProfileSection.CAREER)} className="pwr-profile-section-anchor">
                                <ProfileEntryElement type={'CAREER'} renderSingleElementInfo={this.renderCareerInfo}/>
                            </div>
                            <PwrSpacer/>
                        </Grid>
                    </Grid>

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
