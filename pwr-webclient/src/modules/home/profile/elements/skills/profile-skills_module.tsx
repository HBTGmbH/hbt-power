import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import {newProfileSkill, ProfileSkill} from '../../../../../reducers/profile-new/profile/model/ProfileSkill';
import {PROFILE_SKILLS_BY_NAME} from '../../../../../utils/Comparators';
import {AddSkill} from './add-skill_module';
import {Grid, Theme, withTheme} from '@material-ui/core';
import {PwrFormSubCaption} from '../../../../general/pwr-typography';
import {ProfileDataAsyncActionCreator} from '../../../../../reducers/profile-new/profile/ProfileDataAsyncActionCreator';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import Typography from '@material-ui/core/Typography';
import {StarRating} from '../../../../star-rating_module.';
import Divider from '@material-ui/core/Divider';
import {PwrIconButton} from '../../../../general/pwr-icon-button';
import Button from '@material-ui/core/Button';
import {SkillInfo} from './skill-info_module';
import Badge from '@material-ui/core/Badge';
import {SkillActionCreator} from '../../../../../reducers/skill/SkillActionCreator';

const defaultCategory: number = 152;

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
    selectedSkill: ProfileSkill;
}

interface ProfileSkillsDispatch {
    saveSkill(initials: string, skill: ProfileSkill);
    createSkill(qualifier: string, category: number): void;
    deleteSkill(initials: string, skill: ProfileSkill);
}

class ProfileSkillsModule extends React.Component<ProfileSkillsProps & ThemeProps & ProfileSkillsLocalProps & ProfileSkillsDispatch, ProfileSkillsLocalState> {



    constructor(props: ProfileSkillsProps & ProfileSkillsLocalProps & ThemeProps & ProfileSkillsDispatch) {
        super(props);
        this.state = {
            selectedSkill: null
        };
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
            createSkill: (qualifier, category) => dispatch(SkillActionCreator.AsyncCreateSkill(qualifier, category)),
            saveSkill: (initials, skill) => dispatch(ProfileDataAsyncActionCreator.saveProfileSkill(initials, skill)),
        };
    }

    private handleSelectSkill = (skill: ProfileSkill) => {
        this.setState({
            selectedSkill: skill
        });
    };

    private handleChangeRating = (newRating: number, skill: ProfileSkill) => {
        const skillToSave: ProfileSkill = {...skill, ...{rating: newRating}};
        this.props.saveSkill(this.props.initials, skillToSave);
    };

    private handleAddSkill = (name: string, rating: number) => {
        if (!this.props.skills.some(skill => skill.name === name)) {
            this.props.createSkill(name, defaultCategory);
            this.props.saveSkill(this.props.initials, newProfileSkill(name, rating, []));
        }
    };

    private handleDeleteSkill = (skill: ProfileSkill) => {
        this.props.deleteSkill(this.props.initials, skill);
    };

    private getCurrentSkill = () => {
        return this.state.selectedSkill;
    };

    componentDidUpdate(prevProps: Readonly<ProfileSkillsProps & ThemeProps & ProfileSkillsLocalProps & ProfileSkillsDispatch>,
                       prevState: Readonly<ProfileSkillsLocalState>): void {
        if (prevProps.skills != this.props.skills) {
            if (prevState.selectedSkill != null) {
                const newSkill: ProfileSkill = this.props.skills.filter(skill => prevState.selectedSkill.name == skill.name)[0];
                this.setState({
                    selectedSkill: newSkill
                });
            }
        }
    }

    private toSkill = (skill: ProfileSkill) => {
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
                    <StarRating rating={skill.rating}
                                onRatingChange={newRating => this.handleChangeRating(newRating, skill)}/>
                </Grid>
            </Grid>
        </Grid>;
    };

    render() {
        return (<Grid container spacing={8}>
            <Grid item md={12} sm={12} xs={12} lg={12} xl={12}>
                <PwrFormSubCaption>{PowerLocalize.get('Profile.Skills.AddSkillCaption')}</PwrFormSubCaption>
            </Grid>
            <Grid item md={12} sm={12} xs={12} lg={12} xl={12}>
                <Divider variant={'fullWidth'}
                         style={{height: '2px', backgroundColor: this.props.theme.palette.primary.dark}}/>
            </Grid>
            <Grid item md={6} sm={12} xs={12} lg={6} xl={6}>
                <div className="Pwr-Content-Container">
                    <AddSkill onAddSkill={this.handleAddSkill}/>
                </div>
            </Grid>
            <Grid item md={6} sm={12} xs={12} lg={6} xl={6}>
                <div className="Pwr-Content-Container">
                    <SkillInfo selectedSkill={this.getCurrentSkill()} handleChangeRating={this.handleChangeRating}/>
                </div>
            </Grid>
            <Grid item md={12} sm={12} xs={12} lg={12} xl={12}>
                <PwrFormSubCaption>{PowerLocalize.get('Profile.Skills.MySkillsCaption')}</PwrFormSubCaption>
            </Grid>
            <Grid item md={12} sm={12} xs={12} lg={12} xl={12}>
                <Divider variant={'fullWidth'}
                         style={{height: '2px', backgroundColor: this.props.theme.palette.primary.dark}}/>
            </Grid>
            <Grid item md={12} sm={12} xs={12} lg={12} xl={12}>
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
