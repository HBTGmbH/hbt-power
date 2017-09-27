import {connect} from 'react-redux';
import * as React from 'react';
import {CSSProperties} from 'react';
import * as redux from 'redux';
import {Subheader} from 'material-ui';
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

const distance = require("jaro-winkler");

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link SkillTree.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface SkillTreeProps {
    skills: Immutable.Map<string, Skill>;
    serviceSkillsByQualifier: Immutable.Map<string, SkillServiceSkill>;
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
    searchText: string;
}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface SkillTreeDispatch {
    changeSkillRating(rating: number, id: string): void;
    onSkillDelete(id: string): void;
    getSkillServiceSkills(qualifiers: Array<string>): void;
}

class SkillTreeModule extends React.Component<
    SkillTreeProps
    & SkillTreeLocalProps
    & SkillTreeDispatch, SkillTreeLocalState> {

    constructor(props: SkillTreeProps& SkillTreeLocalProps& SkillTreeDispatch) {
        super(props);
        this.state = {
            searchText: "",
        }
    }

    private chipContainerStyle: CSSProperties = {
        display: 'flex',
        flexWrap: 'wrap',
    };


    public componentDidUpdate(oldProps: SkillTreeProps) {
        if(this.props.skills !== oldProps.skills) {
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
        if(searchText.trim().length != 0) {
            return skills.filter((skill: Skill, key:string) => {
                return distance(searchText, skill.name(), { caseSensitive: false }) >= 0.6;
            });
        }
        return null;
    };

    private mapSkill = (skill: Skill) => {
        // Retreive it from the map; If it doesn't exist, it's custom
        let custom = isNullOrUndefined(this.props.serviceSkillsByQualifier.get(skill.name()));
        let style = {
            margin: "4px",
            backgroundColor: custom ? "red" : Color.HBT_2017_GRAY.toCSSRGBString()
        };
        return (<div className="col-md-12"><SkillChip
            style={style}
            key={skill.id()}
            skill={skill}
            textColor={"white"}
            onDelete={this.props.onSkillDelete}
            onRatingChange={this.props.changeSkillRating}
        /></div>)
    };

    private renderSkills = () => {
        return this.props.skills.sort(Comparators.compareSkills).map(skill => this.mapSkill(skill));
    };

    private getSkillSearcherHeight = () => {
        return 800;
    };

    render() {
        return (
            <div>
                <AddSkillDialog/>
                <div>
                    <Subheader>Rot = Unbekannter Skill</Subheader>
                    <div className="row">
                    {this.renderSkills()}
                    </div>
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