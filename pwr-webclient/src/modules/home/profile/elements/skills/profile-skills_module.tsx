import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import {newProfileSkill, ProfileSkill} from '../../../../../reducers/profile-new/profile/model/ProfileSkill';
import {SkillChip} from './skill-chip_module';
import {PROFILE_SKILLS_BY_NAME} from '../../../../../utils/Comparators';
import {AddSkill} from './add-skill_module';
import {Grid, Theme, withTheme} from '@material-ui/core';
import {PwrFormSubCaption} from '../../../../general/pwr-typography';
import {ProfileDataAsyncActionCreator} from '../../../../../reducers/profile-new/profile/ProfileDataAsyncActionCreator';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import Typography from '@material-ui/core/Typography';
import {StarRating} from '../../../../star-rating_module.';
import {noOp} from '../../../../../utils/ObjectUtil';
import Divider from '@material-ui/core/Divider';
import {PwrIconButton} from '../../../../general/pwr-icon-button';

interface ProfileSkillsProps {
    skills: Array<ProfileSkill>;
    initials: string;
}

interface ThemeProps {
    theme: Theme;
}

interface ProfileSkillsLocalProps {

}

interface ProfileSkillsLocalState {

}

interface ProfileSkillsDispatch {
    saveSkill(initials: string, skill: ProfileSkill);

    deleteSkill(initials: string, skill: ProfileSkill);
}

class ProfileSkillsModule extends React.Component<ProfileSkillsProps & ThemeProps & ProfileSkillsLocalProps & ProfileSkillsDispatch, ProfileSkillsLocalState> {

    constructor(props: ProfileSkillsProps & ProfileSkillsLocalProps & ThemeProps & ProfileSkillsDispatch) {
        super(props);
    }

    static mapStateToProps(state: ApplicationState, localProps: ProfileSkillsLocalProps): ProfileSkillsProps {
        return {
            skills: state.profileStore.profile.skills.sort(PROFILE_SKILLS_BY_NAME),
            initials: state.profileStore.consultant.initials
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ProfileSkillsDispatch {
        return {
            deleteSkill: (initials, skill) => dispatch(ProfileDataAsyncActionCreator.deleteProfileSkill(initials, skill)),
            saveSkill: (initials, skill) => dispatch(ProfileDataAsyncActionCreator.saveProfileSkill(initials, skill)),
        };
    }

    private handleChangeRating = (newRating: number, skill: ProfileSkill) => {
        const skillToSave: ProfileSkill = {...skill, ...{rating: newRating}};
        this.props.saveSkill(this.props.initials, skillToSave);
    };

    private handleAddSkill = (name: string, rating: number) => {
        this.props.saveSkill(this.props.initials, newProfileSkill(name, rating));
    };

    private handleDeleteSkill = (skill: ProfileSkill) => {
        this.props.deleteSkill(this.props.initials, skill);
    };

    private toSkill = (skill: ProfileSkill) => {
        return <Grid key={skill.id} xs={12} sm={6} md={3} lg={3} xl={3} container item spacing={0}>
            <Grid item xs={2} sm={2} md={2} lg={2} xl={2} alignItems={'flex-start'} >
                <PwrIconButton style={{paddingTop: "2px"}} iconName='delete' tooltip={PowerLocalize.get('Action.Delete')}
                               onClick={() => this.handleDeleteSkill(skill)}/>
            </Grid>
            <Grid xs={10} sm={10} md={10} lg={10} xl={10} item container spacing={0}>
                <Grid item className="pwr-profile-entry-name" xs={12} sm={12} md={12} lg={12} xl={12}>
                    <Typography className="pwr-profile-entry-name" variant={'subtitle1'}>
                        {skill.name}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <StarRating rating={skill.rating} onRatingChange={newRating => this.handleChangeRating(newRating, skill)}/>
                </Grid>
            </Grid>
        </Grid>
    };

    render() {
        return (<Grid container spacing={8}>
            <Grid item md={12} sm={12} xs={12} lg={12} xl={12} >
                <PwrFormSubCaption>{PowerLocalize.get('Profile.Skills.AddSkillCaption')}</PwrFormSubCaption>
            </Grid>
            <Grid item md={12} sm={12} xs={12} lg={12} xl={12} >
                <Divider variant={'fullWidth'} style={{height: "2px", backgroundColor: this.props.theme.palette.primary.dark}}/>
            </Grid>
            <Grid item md={12} sm={12} xs={12} lg={12} xl={12} >
                <div className="Pwr-Content-Container">
                    <AddSkill onAddSkill={this.handleAddSkill}/>
                </div>
            </Grid>
            <Grid item md={12} sm={12} xs={12} lg={12} xl={12} >
                <PwrFormSubCaption>{PowerLocalize.get("Profile.Skills.MySkillsCaption")}</PwrFormSubCaption>
            </Grid>
            <Grid item md={12} sm={12} xs={12} lg={12} xl={12} >
                <Divider variant={'fullWidth'} style={{height: "2px", backgroundColor: this.props.theme.palette.primary.dark}}/>
            </Grid>
            <Grid item md={12} sm={12} xs={12} lg={12} xl={12} >
                <div className="Pwr-Content-Container">
                    <Grid container spacing={16}>
                        {this.props.skills.map(skill => this.toSkill(skill))}
                    </Grid>
                </div>
            </Grid>
        </Grid>);
    }
}

export const ProfileSkills = withTheme()(connect(ProfileSkillsModule.mapStateToProps, ProfileSkillsModule.mapDispatchToProps)(ProfileSkillsModule));
