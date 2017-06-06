import {connect} from 'react-redux';
import * as React from 'react';
import {CSSProperties} from 'react';
import * as redux from 'redux';
import {InternalDatabase} from '../../../../model/InternalDatabase';
import {ApplicationState} from '../../../../Store';
import {List, Subheader} from 'material-ui';
import {Profile} from '../../../../model/Profile';
import {ProfileActionCreator} from '../../../../reducers/profile/ProfileActionCreator';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {SkillChip} from './skill-chip_module';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link SkillTree.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface SkillTreeProps {
    profile: Profile;
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
        };
    }

    private chipContainerStyle: CSSProperties = {
        display: 'flex',
        flexWrap: 'wrap',
    };

    static mapStateToProps(state: ApplicationState, localProps: SkillTreeLocalProps): SkillTreeProps {
        return {
            profile: state.databaseReducer.profile()
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

    private renderSkills = () => {
        return this.props.profile.skills().map(skill => {
            return (<SkillChip
                key={skill.id()}
                skill={skill}
                onDelete={this.props.onSkillDelete}
                onRatingChange={this.props.changeSkillRating}
            />)
        }).toArray();
    };

    render() {
        return (
            <div className="row">
                <div className="col-md-12">
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