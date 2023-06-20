import {connect} from 'react-redux';
import * as React from 'react';
import {Divider, Paper, Tab, Tabs} from '@material-ui/core';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ApplicationState} from '../../../reducers/reducerIndex';
import Avatar from '@material-ui/core/Avatar/Avatar';
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


interface ProfileProps {
    suggestions: SuggestionStore;
    activeConsultant: Consultant;
    profile: Profile;
    profilePictureSrc: string;
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
    loadFullProfile(initials: string): void;

    preFetchSuggestions(): void;
}

class ProfileModule extends React.Component<ProfileProps & ProfileLocalProps & ProfileDispatch, ProfileLocalState> {

    constructor(props: ProfileProps & ProfileLocalProps & ProfileDispatch) {
        super(props);
        this.state = {
            tabValue: 0,
        };
    }

    static mapStateToProps(state: ApplicationState): ProfileProps {
        const profilePictureSrc = ProfileServiceClient.instance().getProfilePictureUrl(state.profileStore.consultant.profilePictureId);
        return {
            suggestions: state.suggestionStore,
            activeConsultant: state.profileStore.consultant,
            profile: state.profileStore.profile,
            profilePictureSrc
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

    render() {
        return <Paper className="mui-margin">
            <Tabs
                value={this.state.tabValue}
                centered
                onChange={(e: any, v: any) => {
                    this.setState({tabValue: v});
                }}
            >
                <Tab textColor={'secondary'} value={0}
                     label={PowerLocalize.get('ProfileModule.Tabs.Profile.Title')}/>
                <Tab textColor={'primary'} value={1}
                     label={PowerLocalize.get('ProfileModule.Tabs.Projects.Title')}/>
                <Tab value={2} label="Skills"/>
            </Tabs>
            <div>
                {this.state.tabValue === 0 &&
                <div className="mui-margin">
                    <Grid container direction={'row'} justify={'flex-start'} alignItems={'center'} spacing={8}>
                        <Grid
                            item
                            container
                            direction={'column'}
                            justify={'flex-start'}
                            alignItems={'flex-start'}
                            spacing={8}
                            md={2}
                            xs={12}
                        >
                            <Grid item md={12}>
                                <Typography
                                    className={'fullWidth'}
                                    variant={'h6'}
                                >
                                    {
                                        this.props.activeConsultant != null
                                            ? this.props.activeConsultant.firstName + ' ' + this.props.activeConsultant.lastName
                                            : 'No Name'
                                    }
                                </Typography>
                            </Grid>
                            <Grid item md={12}>
                                <Avatar
                                    src={this.props.profilePictureSrc}
                                    style={{width: 90, height: 90}}
                                />
                            </Grid>
                        </Grid>

                        <Grid item md={6} xs={12}>
                            <ProfileDescription/>
                        </Grid>
                        <Grid item md={11}>
                            <Divider/>
                        </Grid>
                    </Grid>


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

                {this.state.tabValue === 1 &&
                <div className="mui-margin">
                    <Projects/>
                </div>
                }

                {this.state.tabValue === 2 &&
                <div className="mui-margin">
                    <ProfileSkills/>
                </div>
                }
            </div>
        </Paper>;
    }
}

export const ConsultantProfile: React.ComponentClass<ProfileLocalProps> = connect(ProfileModule.mapStateToProps, ProfileModule.mapDispatchToProps)(ProfileModule) as any;
