import {connect} from 'react-redux';
import * as React from 'react';
import {CSSProperties} from 'react';
import * as redux from 'redux';
import {InternalDatabase} from '../../../../../model/InternalDatabase';
import {ApplicationState} from '../../../../../Store';
import {List, Subheader} from 'material-ui';
import {ProfileActionCreator} from '../../../../../reducers/profile/ProfileActionCreator';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {SkillChip} from './skill-chip_module';
import {Skill} from '../../../../../model/Skill';
import * as Immutable from 'immutable';
import {Comparators} from '../../../../../utils/Comparators';
import {AddSkillDialog} from './add-skill-dialog_module';

const distance = require("jaro-winkler");

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link SkillTree.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface SkillTreeProps {
    skills: Immutable.Map<string, Skill>;
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link SkillTreeProps} and will then be
 * managed by redux.
 */
interface SkillTreeLocalProps {

}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface SkillTreeLocalState {
    skills: Immutable.Map<string, Skill>;
}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface SkillTreeDispatch {
    changeSkillRating(rating: number, id: string): void;
    onSkillDelete(id: string): void;
}

class SkillTreeModule extends React.Component<
    SkillTreeProps
    & SkillTreeLocalProps
    & SkillTreeDispatch, SkillTreeLocalState> {

    constructor(props: SkillTreeProps& SkillTreeLocalProps& SkillTreeDispatch) {
        super(props);
        this.state = {
            skills: this.props.skills
        };
    }

    private chipContainerStyle: CSSProperties = {
        display: 'flex',
        flexWrap: 'wrap',
    };

    public componentWillReceiveProps(nextProps: SkillTreeProps & SkillTreeLocalProps & SkillTreeDispatch){
        this.setState({
            skills: nextProps.skills
        })
    }


    static mapStateToProps(state: ApplicationState, localProps: SkillTreeLocalProps): SkillTreeProps {
        return {
            skills: state.databaseReducer.profile().skills()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<InternalDatabase>): SkillTreeDispatch {
        return {
            changeSkillRating: (rating: number, id: string) => {
                dispatch(ProfileActionCreator.updateSkillRating(rating, id));
            },
            onSkillDelete: (id: string) => {
                dispatch(ProfileActionCreator.deleteSkill(id));
            }
        };
    }

    private filterSkills = (searchText: string) => {
        console.log(searchText.length);
        let skills = this.props.skills;
        if(searchText.trim().length != 0) {
            skills = Immutable.Map<string, Skill>(skills.filter((skill: Skill, key:string) => {
                return distance(searchText, skill.name(), { caseSensitive: false }) >= 0.6;
            }));
        }
        this.setState({
            skills: skills
        });
    };

    private renderSkills = () => {
        return this.state.skills.sort(Comparators.compareSkills).map(skill => {
            return (<SkillChip
                style={{margin: "4px"}}
                key={skill.id()}
                skill={skill}
                onDelete={this.props.onSkillDelete}
                onRatingChange={this.props.changeSkillRating}
            />)
        });
    };

    private getSkillSearcherHeight = () => {
        if(this.state.skills.size > 10) return 800;
        return this.state.skills.size * 80;
    };

    render() {
        return (
            <div className="vertical-align">
                <div>
                    <AddSkillDialog/>
                    <List>
                        <Subheader>{PowerLocalize.get('Category.Plural')}</Subheader>
                        {this.renderSkills()}
                    </List>
                </div>
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