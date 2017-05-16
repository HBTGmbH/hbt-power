import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../../Store';
import {SkillCategory} from '../../../../model/SkillCategory';
import {FontIcon, ListItem} from 'material-ui';
import {Profile} from '../../../../model/Profile';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link SkillCategoryItem.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface SkillCategoryItemProps {
    category: SkillCategory;
    profile: Profile;
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link SkillCategoryItemProps} and will then be
 * managed by redux.
 */
interface SkillCategoryItemLocalProps {
    categoryId: string;
    onItemSelect(category: SkillCategory): void;
}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface SkillCategoryItemLocalState {

}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface SkillCategoryItemDispatch {

}

class SkillCategoryItemModule extends React.Component<
    SkillCategoryItemProps
    & SkillCategoryItemLocalProps
    & SkillCategoryItemDispatch, SkillCategoryItemLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: SkillCategoryItemLocalProps): SkillCategoryItemProps {
        return {
            profile: state.databaseReducer.profile(),
            category: state.databaseReducer.profile().getCategory(localProps.categoryId)
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): SkillCategoryItemDispatch {
        return {}
    }

    private renderSubCategories = () => {
        return this.props.category.categoryIds().map((value, key) => {
            return (<SkillCategoryItem key={"SkillCategoryItem." + value} onItemSelect={this.props.onItemSelect} categoryId={value}/>)
        }).toArray();
    };

    private handleListItemClick = () => {
        this.props.onItemSelect(this.props.category)
    };

    private isLeaf = () => {
        return this.props.category.categoryIds().size <= 0;
    };

    render() {
        return (
            <div key={"SkillCategory.InsetDiv." + this.props.category.id()} className={"indentedSkillCategory"}>
                <ListItem
                        key={"SkillCategory.ListItem." + this.props.category.id()}
                        onClick={this.handleListItemClick}
                        primaryText={this.props.category.name()}
                        nestedItems={this.renderSubCategories()}
                        initiallyOpen={true}
                        leftIcon={<FontIcon className="material-icons">{this.isLeaf() ? "label_outline" : "label"}</FontIcon>}/>
            </div>);
    }
}

/**
 * @see SkillCategoryItemModule
 * @author nt
 * @since 16.05.2017
 */
export const SkillCategoryItem: React.ComponentClass<SkillCategoryItemLocalProps> = connect(SkillCategoryItemModule.mapStateToProps, SkillCategoryItemModule.mapDispatchToProps)(SkillCategoryItemModule);