import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../Store';
import {SkillCategoryNode} from '../../../model/admin/SkillTree';
import {AdminActionCreator} from '../../../reducers/admin/AdminActionCreator';
import {isNullOrUndefined} from 'util';
import {AutoComplete} from 'material-ui';

const SortableTree = require('react-sortable-tree').default;

interface AdminSkillTreeProps {
    rootNode: SkillCategoryNode;
}

interface AdminSkillTreeLocalProps {

}

interface AdminSkillTreeLocalState {
}

interface AdminSkillTreeDispatch {
    loadTree(): void;
    setSkillTree(rootNode: SkillCategoryNode): void;
    loadSkillsForCategory(categoryId: number): void;
}

class AdminSkillTreeModule extends React.Component<
    AdminSkillTreeProps
    & AdminSkillTreeLocalProps
    & AdminSkillTreeDispatch, AdminSkillTreeLocalState> {

    constructor(props:AdminSkillTreeProps & AdminSkillTreeLocalProps & AdminSkillTreeDispatch) {
        super(props);
        this.state = {
        }
    }

    static mapStateToProps(state: ApplicationState, localProps: AdminSkillTreeLocalProps): AdminSkillTreeProps {
        return {
            rootNode: state.adminReducer.skillCategoryTreeRoot()
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): AdminSkillTreeDispatch {
        return {
            loadTree: () => dispatch(AdminActionCreator.AsyncLoadCategoryTree()),
            setSkillTree: rootNode => dispatch(AdminActionCreator.SetSkillTree(rootNode)),
            loadSkillsForCategory: categoryId => dispatch(AdminActionCreator.AsyncLoadSkillsForCategory(categoryId))
        }
    }

    public componentDidMount = () => {
        this.props.loadTree();
    };

    private handleVisibilityToggle = (data: {treeData: SkillCategoryNode[], node: SkillCategoryNode, expanded: boolean}) => {
        if(!isNullOrUndefined(data.node) && SkillCategoryNode.isCategory(data.node) && data.expanded) {
            // It is a category. Load all subcategory skills.
            data.node.children.forEach((value, index, array) => {
                if(SkillCategoryNode.isCategory(value)) {
                    this.props.loadSkillsForCategory(value.id);
                }
            });
        }
    };

    private treeSearchMethod = (data: { node: SkillCategoryNode, path: number[] | string[], treeIndex: number, searchQuery: string }) => {
        if(isNullOrUndefined(data.searchQuery)) return false;
        return AutoComplete.fuzzyFilter(data.searchQuery, data.node.qualifier);
    };

    render() {
        return (
            <div>
                <SortableTree
                    treeData={[this.props.rootNode]}
                    style={{height: "800px", paddingTop: "50px"}}
                    onChange={(tree: Array<SkillCategoryNode>) => this.props.setSkillTree(tree[0])}
                    onVisibilityToggle={this.handleVisibilityToggle}
                    canDrag={false}
                    canDrop={false}
                />
            </div>
   );
    }
}

/**
 * @see AdminSkillTreeModule
 * @author nt
 * @since 30.06.2017
 */
export const AdminSkillTree: React.ComponentClass<AdminSkillTreeLocalProps> = connect(AdminSkillTreeModule.mapStateToProps, AdminSkillTreeModule.mapDispatchToProps)(AdminSkillTreeModule);