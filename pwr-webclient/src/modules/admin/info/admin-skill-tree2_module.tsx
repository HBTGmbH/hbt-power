import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../Store';
import {SkillCategory} from '../../../model/skill/SkillCategory';
import {SkillActionCreator} from '../../../reducers/skill/SkillActionCreator';
import {SkillTree} from '../../general/skill/skill-tree_module';
import {Paper} from 'material-ui';

interface AdminSkillTree2Props {
    root: SkillCategory;
}

interface AdminSkillTree2LocalProps {

}

interface AdminSkillTree2LocalState {
    selectedIndex: number | string;
}

interface AdminSkillTree2Dispatch {
    loadTree(): void;
    loadSkillsForCategory(categoryId: number): void;
}

class AdminSkillTree2Module extends React.Component<
    AdminSkillTree2Props
    & AdminSkillTree2LocalProps
    & AdminSkillTree2Dispatch, AdminSkillTree2LocalState> {

    constructor(props: any) {
        super(props);
        this.state = {
            selectedIndex: 0
        }
    }


    private handleSelectIndex = (index: number | string) => {
        this.setState({
            selectedIndex: index
        });
    };

    static mapStateToProps(state: ApplicationState, localProps: AdminSkillTree2LocalProps): AdminSkillTree2Props {
        return {
            root: state.skillReducer.skillTreeRoot()
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): AdminSkillTree2Dispatch {
        return {
            loadTree: () => dispatch(SkillActionCreator.AsyncLoadRootChildrenIntoTree()),
            loadSkillsForCategory: categoryId => {
                console.log("Loading skills for categoryId " + categoryId);
                dispatch(SkillActionCreator.AsyncLoadChildrenIntoTree(categoryId, 2))
            }
        }
    }

    public componentDidMount() {
        this.props.loadTree();
    }

    render() {
        return (
        <Paper style={{marginTop: "56px"}}>
            <SkillTree root={this.props.root} selectedIndex={this.state.selectedIndex} onIndexSelect={this.handleSelectIndex} onLoadChildren={this.props.loadSkillsForCategory}/>
        </Paper>);
    }
}

/**
 * @see AdminSkillTree2Module
 * @author nt
 * @since 17.07.2017
 */
export const AdminSkillTree2: React.ComponentClass<AdminSkillTree2LocalProps> = connect(AdminSkillTree2Module.mapStateToProps, AdminSkillTree2Module.mapDispatchToProps)(AdminSkillTree2Module);