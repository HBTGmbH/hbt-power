import {connect} from 'react-redux';
import * as React from 'react';
import {CSSProperties} from 'react';
import * as redux from 'redux';
import {ListSubheader} from '@material-ui/core';
import {ProfileActionCreator} from '../../../../../reducers/profile/ProfileActionCreator';
import {SkillChip} from './skill-chip_module';
import {Skill} from '../../../../../model/Skill';
import * as Immutable from 'immutable';
import {Comparators} from '../../../../../utils/Comparators';
import {AddSkillDialog} from './add-skill-dialog_module';
import {SkillServiceSkill} from '../../../../../model/skill/SkillServiceSkill';
import {SkillActionCreator} from '../../../../../reducers/skill/SkillActionCreator';
import {isNullOrUndefined} from 'util';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import {Color} from '../../../../../utils/ColorUtil';
import {AddSkill} from './add-skill_module';
import {StarRating} from '../../../../star-rating_module.';
import Grid from '@material-ui/core/Grid/Grid';

const distance = require('jaro-winkler');

interface SkillTreeProps {
    skills: Immutable.Map<string, Skill>;
    serviceSkillsByQualifier: Immutable.Map<string, SkillServiceSkill>;
}

interface SkillTreeLocalProps {

}

interface SkillTreeLocalState {
    searchText: string;
    selectedSkill: Skill;
}

interface SkillTreeDispatch {
    changeSkillRating(rating: number, id: string): void;

    onSkillDelete(id: string): void;

    getSkillServiceSkills(qualifiers: Array<string>): void;
}

class SkillTreeModule extends React.Component<SkillTreeProps
    & SkillTreeLocalProps
    & SkillTreeDispatch, SkillTreeLocalState> {

    constructor(props: SkillTreeProps & SkillTreeLocalProps & SkillTreeDispatch) {
        super(props);
        this.state = {
            searchText: '',
            selectedSkill: null,
        };
    }

    private chipContainerStyle: CSSProperties = {
        display: 'flex',
        flexWrap: 'wrap',
    };

    public componentDidMount() {
        this.props.getSkillServiceSkills(this.props.skills.toArray().map(skill => skill.name()));
    }

    public componentDidUpdate(oldProps: SkillTreeProps) {
        if (this.props.skills !== oldProps.skills) {
            this.props.getSkillServiceSkills(this.props.skills.toArray().map(skill => skill.name()));
        }
    }


    static mapStateToProps(state: ApplicationState, localProps: SkillTreeLocalProps): SkillTreeProps {
        return {
            skills: state.databaseReducer.profile().skills(),
            serviceSkillsByQualifier: state.skillReducer.skillsByQualifier(),
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): SkillTreeDispatch {
        return {
            changeSkillRating: (rating: number, id: string) => {
                dispatch(ProfileActionCreator.updateSkillRating(rating, id));
            },
            onSkillDelete: (id: string) => {
                dispatch(ProfileActionCreator.deleteSkill(id));
            },
            getSkillServiceSkills: skillQualifiers => dispatch(SkillActionCreator.Skill.AsyncGetSkillsByName(skillQualifiers))
        };
    }

    private filterSkills = (searchText: string) => {
        let skills = this.props.skills;
        if (searchText.trim().length != 0) {
            return skills.filter((skill: Skill, key: string) => {
                return distance(searchText, skill.name(), {caseSensitive: false}) >= 0.6;
            });
        }
        return null;
    };

    private mapSkill = (skill: Skill) => {
        // Retreive it from the map; If it doesn't exist, it's custom
        let custom = isNullOrUndefined(this.props.serviceSkillsByQualifier.get(skill.name()));
        let style = {
            margin: '4px',
            backgroundColor: custom ? 'red' : '',
        };
        return <Grid item key={skill.id()}>
            <SkillChip
                style={style}
                skill={skill}
                textColor={'white'}
                onDelete={this.props.onSkillDelete}
                onRatingChange={this.props.changeSkillRating}
                canChangeRating
                canDelete
                showRating
            />
        </Grid>;
    };

    private renderSkills = () => {
        return this.props.skills.sort(Comparators.compareSkills).map(this.mapSkill).toArray();
    };

    private getSkillSearcherHeight = () => {
        return 800;
    };

    render() {
        return (
            <div>
                {/*<AddSkillDialog/><ListSubheader>Rot hinterlegte Skills sind noch in der Prüfung</ListSubheader>*/}
                <div className={"col-md-12"}>
                    <AddSkill/>
                </div>
                <Grid spacing={8} container className="row">
                    {this.renderSkills()}
                </Grid>
            </div>
        );
    }
}

/**
 * @see SkillTreeModule
 * @author nt
 * @since 15.05.2017
 */
export const SkillTree: React.ComponentClass<SkillTreeLocalProps> = connect(SkillTreeModule.mapStateToProps, SkillTreeModule.mapDispatchToProps)(SkillTreeModule);