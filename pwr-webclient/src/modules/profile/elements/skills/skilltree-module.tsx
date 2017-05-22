import {connect} from 'react-redux';
import * as React from 'react';
import {CSSProperties} from 'react';
import * as redux from 'redux';
import {InternalDatabase} from '../../../../model/InternalDatabase';
import {SkillCategory} from '../../../../model/SkillCategory';
import {ApplicationState} from '../../../../Store';
import {SkillCategoryItem} from './skill-category-item_module';
import {List, ListItem, RaisedButton, Subheader, FontIcon, TextField} from 'material-ui';
import {Profile} from '../../../../model/Profile';
import {SkillChip} from './skill-chip_module';
import {ProfileActionCreator} from '../../../../reducers/singleProfile/ProfileActionCreator';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {formatString} from '../../../../utils/StringUtil';
import {SkillSearcher} from '../../../general/skill-search_module';

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
    changeSkillRating(rating: number, id: string): void;
}

class SkillTreeModule extends React.Component<
    SkillTreeProps
    & SkillTreeLocalProps
    & SkillTreeDispatch, SkillTreeLocalState> {

    constructor(props: SkillTreeProps& SkillTreeLocalProps& SkillTreeDispatch) {
        super(props);
        this.state = {
            selectedCategory: props.rootCategory
        };
    }

    private chipContainerStyle: CSSProperties = {
        display: 'flex',
        flexWrap: 'wrap',
    };

    static mapStateToProps(state: ApplicationState, localProps: SkillTreeLocalProps): SkillTreeProps {
        return {
            rootCategory: state.databaseReducer.profile().getCategory(state.databaseReducer.profile().rootCategoryId()),
            profile: state.databaseReducer.profile()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<InternalDatabase>): SkillTreeDispatch {
        return {
            changeSkillRating: (rating: number, id: string) => {
                dispatch(ProfileActionCreator.updateSkillRating(rating, id));
            }
        };
    }


    /*private renderSkillsForSelectedCategory = () => {
        let skillIds: Array<string> = this.props.profile.getAllNestedSkillIds(this.state.selectedCategory);
        return skillIds.map(skillId => {
            return(
                    <SkillChip
                            key={skillId}
                            style={{margin: '5px'}}
                            skill={this.props.profile.getSkill(skillId)}
                            onRatingChange={this.props.changeSkillRating}
                    >
                        {this.props.profile.getSkillName(skillId)}
                    </SkillChip>
            );
        });
    };*/

    private showSkillsForCategory = (category: SkillCategory) => {
        this.setState({
            selectedCategory: category
        });
    };

    render() {
        return (
            <div className="row">
                <div className="col-md-12">
                    <List>
                        <Subheader>{PowerLocalize.get('Category.Plural')}</Subheader>
                        <SkillCategoryItem
                            key={this.props.rootCategory.id()}
                            categoryId={this.props.rootCategory.id()}
                            onRatingChange={this.props.changeSkillRating}
                        />
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