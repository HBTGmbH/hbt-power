import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import {newProfileSkill, ProfileSkill} from '../../../../../reducers/profile-new/profile/model/ProfileSkill';
import {SkillChip} from './skill-chip_module';
import {noOp} from '../../../../../utils/ObjectUtil';
import {PROFILE_SKILLS_BY_NAME} from '../../../../../utils/Comparators';
import {AddSkill} from './add-skill_module';
import {Grid} from '@material-ui/core';
import {PwrFormSubCaption} from '../../../../general/pwr-typography';
import {ProfileDataAsyncActionCreator} from '../../../../../reducers/profile-new/profile/ProfileDataAsyncActionCreator';

interface ProfileSkillsProps {
    skills: Array<ProfileSkill>;
    initials: string;
}

interface ProfileSkillsLocalProps {

}

interface ProfileSkillsLocalState {

}

interface ProfileSkillsDispatch {
    saveSkill(initials: string, skill: ProfileSkill);
    deleteSkill(initials: string, skill: ProfileSkill);
}

class ProfileSkillsModule extends React.Component<ProfileSkillsProps & ProfileSkillsLocalProps & ProfileSkillsDispatch, ProfileSkillsLocalState> {

    constructor(props: ProfileSkillsProps & ProfileSkillsLocalProps & ProfileSkillsDispatch) {
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
        this.props.saveSkill(this.props.initials, newProfileSkill(name, rating))
    };

    private handleDeleteSkill = (skill: ProfileSkill) => {
        this.props.deleteSkill(this.props.initials, skill);
    };

    private toSkillChip = (skill: ProfileSkill) => {
        return  <SkillChip className="mui-margin"
                           showRating={true}
                           canChangeRating={true}
                           onRatingChange={this.handleChangeRating}
                           key={skill.id}
                           skill={skill}
                           onDelete={this.handleDeleteSkill}/>;
    };

    render() {
        return (<div>
            <PwrFormSubCaption>Add A Skill</PwrFormSubCaption>
            <div className="Pwr-Content-Container">
                <AddSkill onAddSkill={this.handleAddSkill}/>
            </div>
            <PwrFormSubCaption>My Skills</PwrFormSubCaption>
            <div className="Pwr-Content-Container">
                {this.props.skills.map(skill => this.toSkillChip(skill))}
            </div>
        </div>);
    }
}

/**
 * @see ProfileSkillsModule
 * @author Niklas
 * @since 09.08.2019
 */
export const ProfileSkills: React.ComponentClass<ProfileSkillsLocalProps> = connect(ProfileSkillsModule.mapStateToProps, ProfileSkillsModule.mapDispatchToProps)(ProfileSkillsModule);
