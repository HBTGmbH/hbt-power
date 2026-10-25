import {connect} from 'react-redux';
import * as React from 'react';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import {ProfileSkill} from '../../../../../reducers/profile-new/profile/model/ProfileSkill';
import {PROFILE_SKILLS_BY_NAME} from '../../../../../utils/Comparators';
import {Grid, Icon} from '@material-ui/core';
import {PwrFormSubCaption} from '../../../../general/pwr-typography';
import {ProfileDataAsyncActionCreator} from '../../../../../reducers/profile-new/profile/ProfileDataAsyncActionCreator';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import Typography from '@material-ui/core/Typography';
import {StarRating} from '../../../../star-rating_module';
import {PwrIconButton} from '../../../../general/pwr-icon-button';
import Button from '@material-ui/core/Button';
import Badge from '@material-ui/core/Badge';
import {ThunkDispatch} from 'redux-thunk';
import {PwrButton} from '../../../../general/pwr-button';
import {ProfileSkillDialog} from './profile-skill-dialog_module';
import {Project} from '../../../../../reducers/profile-new/profile/model/Project';
import {formatSkillUsage, skillUsage} from '../../../../../utils/SkillUsage';

interface ProfileSkillsProps {
    skills: Array<ProfileSkill>;
    /** The saved projects, for the time each skill was used in them (#312) */
    projects: Array<Project>;
    initials: string;
}

interface ProfileSkillsLocalProps {

}

interface ProfileSkillsLocalState {
    /** The skill being edited in the dialog */
    selectedSkill: ProfileSkill;
    addOpen: boolean;
    /**
     * Per skill id the rating last clicked while it is being saved (#320), shown in place of the saved one; with a
     * number per click, so only the answer to the last click ends it
     */
    pendingRatings: Map<number, {rating: number, click: number}>;
}

interface ProfileSkillsDispatch {
    saveSkill(initials: string, skill: ProfileSkill);
    saveRating(initials: string, skillId: number, rating: number, onSettled: () => void);
    deleteSkill(initials: string, skill: ProfileSkill);
}

class ProfileSkillsModule extends React.Component<ProfileSkillsProps & ProfileSkillsLocalProps & ProfileSkillsDispatch, ProfileSkillsLocalState> {

    constructor(props: ProfileSkillsProps & ProfileSkillsLocalProps & ProfileSkillsDispatch) {
        super(props);
        this.state = {
            selectedSkill: null,
            addOpen: false,
            pendingRatings: new Map(),
        };
    }

    private clicks = 0;
    private mounted = false;

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    static mapStateToProps(state: ApplicationState): ProfileSkillsProps {
        return {
            skills: state.profileStore.profile.skills.sort(PROFILE_SKILLS_BY_NAME),
            projects: state.profileStore.profile.projects,
            initials: state.profileStore.consultant.initials
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): ProfileSkillsDispatch {
        return {
            deleteSkill: (initials, skill) => dispatch(ProfileDataAsyncActionCreator.deleteProfileSkill(initials, skill)),
            saveSkill: (initials, skill) => dispatch(ProfileDataAsyncActionCreator.saveProfileSkill(initials, skill)),
            saveRating: (initials, skillId, rating, onSettled) =>
                dispatch(ProfileDataAsyncActionCreator.saveProfileSkillRating(initials, skillId, rating, onSettled)),
        };
    }

    private handleSelectSkill = (skill: ProfileSkill) => {
        this.setState({
            selectedSkill: skill
        });
    };

    /**
     * Saved right away, shown faded until the answer (#320); then the stars show the saved rating, after an error the
     * one before
     */
    private handleChangeRating = (newRating: number, skill: ProfileSkill) => {
        const click = ++this.clicks;
        this.setState(state => ({pendingRatings: new Map(state.pendingRatings).set(skill.id, {rating: newRating, click})}));
        this.props.saveRating(this.props.initials, skill.id, newRating, () => {
            if (!this.mounted) {
                return;
            }
            this.setState(state => {
                const pending = state.pendingRatings.get(skill.id);
                if (!pending || pending.click !== click) {
                    return null;
                }
                const pendingRatings = new Map(state.pendingRatings);
                pendingRatings.delete(skill.id);
                return {pendingRatings};
            });
        });
    };

    private handleSaveSkill = (skill: ProfileSkill) => {
        this.props.saveSkill(this.props.initials, skill);
    };

    private closeDialog = () => {
        this.setState({
            selectedSkill: null,
            addOpen: false,
        });
    };

    private ratingIsValid = (rating) => {
        return (!isNaN(rating) && rating >= 1 && rating <= 5)
    }

    private handleDeleteSkill = (skill: ProfileSkill) => {
        this.props.deleteSkill(this.props.initials, skill);
    };

    private toSkill = (skill: ProfileSkill) => {
        const pending = this.state.pendingRatings.get(skill.id);
        return <Grid key={skill.id} xs={12} sm={6} md={3} lg={3} xl={3} container item spacing={0}
                     alignItems={'center'} style={{marginBottom: '15px'}}>
            <Grid item container xs={2} sm={2} md={2} lg={2} xl={2} justify={'flex-end'}>
                <PwrIconButton style={{right: 0}} iconName='delete'
                               tooltip={PowerLocalize.get('Action.Delete')}
                               onClick={() => this.handleDeleteSkill(skill)}/>
            </Grid>
            <Grid xs={10} sm={10} md={10} lg={10} xl={10} item container spacing={0}>
                <Grid item className="pwr-profile-entry-name" xs={12} sm={12} md={12} lg={12} xl={12}>
                    <Button onClick={() => this.handleSelectSkill(skill)} style={{textTransform: 'none'}}>
                        <Badge
                            color={'primary'}
                            badgeContent={skill.versions.length}
                            variant={'dot'}
                        >
                            <Typography className="pwr-profile-entry-name" variant={'subtitle1'}>
                                {skill.name}
                            </Typography>
                        </Badge>
                    </Button>

                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <StarRating rating={pending ? pending.rating : skill.rating} pending={!!pending}
                                onRatingChange={newRating => this.handleChangeRating(newRating, skill)}/>
                    <Typography variant="caption" color="textSecondary" component="div">
                        {formatSkillUsage(skillUsage(skill.name, this.props.projects))}
                    </Typography>
                </Grid>
            </Grid>
        </Grid>;
    };

    /** The caption only where unrated and rated skills are shown apart */
    private toSkillList = (skills: Array<ProfileSkill>, caption?: string) => {
        return (<React.Fragment>
            {caption && <Grid item md={12} sm={12} xs={12} lg={12} xl={12}>
                <PwrFormSubCaption>{caption}</PwrFormSubCaption>
            </Grid>}
            <Grid item md={12} sm={12} xs={12} lg={12} xl={12}>
                <div className="Pwr-Content-Container">
                    <Grid container spacing={1}>
                        {skills.map(s => this.toSkill(s))}
                    </Grid>
                </div>
            </Grid>
        </React.Fragment>);
    }

    private toSkillOverview = () => {
        let pendingSkills: Array<ProfileSkill> = this.props.skills.filter(s => !this.ratingIsValid(s.rating));
        if (pendingSkills.length) {
            let ratedSkills: Array<ProfileSkill> = this.props.skills.filter(s => this.ratingIsValid(s.rating));
            return <div>
                {this.toSkillList(pendingSkills, PowerLocalize.get('Profile.Skills.UnassessedSkillsCaption'))}
                {this.toSkillList(ratedSkills, PowerLocalize.get('Profile.Skills.RatedSkillsCaption'))}
            </div>
        }
        return this.toSkillList(this.props.skills);
    }

    render() {
        return (<Grid container spacing={1}>
            {(this.state.addOpen || this.state.selectedSkill) &&
            <ProfileSkillDialog skill={this.state.selectedSkill} profileSkills={this.props.skills}
                                projects={this.props.projects}
                                onSave={this.handleSaveSkill} onClose={this.closeDialog}/>}
            <Grid item container xs={12} justify="flex-end">
                <PwrButton color="primary" variant="contained" text={PowerLocalize.get('Profile.Skills.Dialog.AddTitle')}
                           icon={<Icon className="material-icons">add</Icon>}
                           onClick={() => this.setState({addOpen: true})}/>
            </Grid>
            {this.toSkillOverview()}
        </Grid>);
    }
}

export const ProfileSkills = connect(ProfileSkillsModule.mapStateToProps, ProfileSkillsModule.mapDispatchToProps)(ProfileSkillsModule);
