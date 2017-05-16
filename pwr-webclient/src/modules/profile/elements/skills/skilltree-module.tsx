import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {InternalDatabase} from '../../../../model/InternalDatabase';
import {SkillCategory} from '../../../../model/SkillCategory';
import {ApplicationState} from '../../../../Store';
import {SkillCategoryItem} from './skill-category-item_module';
import {Chip, List, ListItem} from 'material-ui';
import {CSSProperties} from 'react';
import {Skill} from '../../../../model/Skill';
import {Profile} from '../../../../model/Profile';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link SkillTree.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface SkillTreeProps {
    rootCategory: SkillCategory;
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
    selectedCategory: SkillCategory;
}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface SkillTreeDispatch {

}

class SkillTreeModule extends React.Component<
    SkillTreeProps
    & SkillTreeLocalProps
    & SkillTreeDispatch, SkillTreeLocalState> {

    constructor(props: SkillTreeProps& SkillTreeLocalProps& SkillTreeDispatch) {
        super(props);
        this.state = {
            selectedCategory: props.rootCategory
        }
    }

    private chipContainerStyle: CSSProperties = {
        display: 'flex',
        flexWrap: 'wrap',
    };

    static mapStateToProps(state: ApplicationState, localProps: SkillTreeLocalProps): SkillTreeProps {
        return {
            rootCategory: state.databaseReducer.profile().rootCategory(),
            profile: state.databaseReducer.profile()
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<InternalDatabase>): SkillTreeDispatch {
        return {}
    }

    private renderSkillsForSelectedCategory = () => {
        return this.state.selectedCategory.skillIds().map(skillId => {
            return <Chip key={skillId} style={{margin: 4}}>{this.props.profile.getSkillName(skillId)}</Chip>
        })
    };

    private showSkillsForCategory = (category: SkillCategory) => {
        this.setState({
            selectedCategory: category
        })
    };

    render() {
        return (
            <div className="row">
                <div className="col-md-4">
                    <List>
                        <SkillCategoryItem
                            key={this.props.rootCategory.id()}
                            categoryId={this.props.rootCategory.id()}
                            onItemSelect={this.showSkillsForCategory}
                        />
                    </List>
                </div>
                <div className="col-md-8">
                    <div style={this.chipContainerStyle}>
                        {this.renderSkillsForSelectedCategory()}
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