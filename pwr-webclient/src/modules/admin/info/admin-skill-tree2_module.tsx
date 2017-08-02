import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import * as Immutable from 'immutable';
import {ApplicationState} from '../../../Store';
import {SkillCategory} from '../../../model/skill/SkillCategory';
import {SkillActionCreator} from '../../../reducers/skill/SkillActionCreator';
import {SkillTree} from '../../general/skill/skill-tree_module';
import {Checkbox, FontIcon, Paper, Subheader} from 'material-ui';
import {InfoPaper} from '../../general/info-paper_module.';
import {PowerLocalize} from '../../../localization/PowerLocalizer';

interface AdminSkillTree2Props {
    root: SkillCategory;
    categoriesById: Immutable.Map<number, SkillCategory>;
}

interface AdminSkillTree2LocalProps {

}

interface AdminSkillTree2LocalState {
    selectedCategoryId: number;
    selectedSkillId: number;
}

interface AdminSkillTree2Dispatch {
    loadTree(): void;
    loadSkillsForCategory(categoryId: number): void;
    whitelistCategory(categoryId: number): void;
    blacklistCategory(categoryId: number): void;
}

class AdminSkillTree2Module extends React.Component<
    AdminSkillTree2Props
    & AdminSkillTree2LocalProps
    & AdminSkillTree2Dispatch, AdminSkillTree2LocalState> {

    private readonly NO_ID = -99999;

    constructor(props: any) {
        super(props);
        this.state = {
            selectedCategoryId: this.NO_ID,
            selectedSkillId: this.NO_ID
        }
    }



    static mapStateToProps(state: ApplicationState, localProps: AdminSkillTree2LocalProps): AdminSkillTree2Props {
        return {
            root: state.skillReducer.skillTreeRoot(),
            categoriesById: state.skillReducer.categoriesById()
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): AdminSkillTree2Dispatch {
        return {
            loadTree: () => dispatch(SkillActionCreator.AsyncLoadRootChildrenIntoTree()),
            loadSkillsForCategory: categoryId => {
                dispatch(SkillActionCreator.AsyncLoadChildrenIntoTree(categoryId, 2))
            },
            whitelistCategory: categoryId => dispatch(SkillActionCreator.AsyncWhitelistCategory(categoryId)),
            blacklistCategory: categoryId => dispatch(SkillActionCreator.AsyncBlacklistCategory(categoryId)),
        }
    }

    public componentDidMount() {
        this.props.loadTree();
    }

    private handleCategorySelect = (categoryId: number) => {
        this.setState({
            selectedCategoryId: categoryId,
            selectedSkillId: this.NO_ID
        })
    };

    private handleSkillSelect = (skillId: number) => {
        this.setState({
            selectedCategoryId: this.NO_ID,
            selectedSkillId: skillId
        })
    };

    private handleCategoryBlacklistCheck = (event: any, isChecked: boolean) => {
        if(isChecked) {
            this.props.blacklistCategory(this.state.selectedCategoryId);
        } else {
            this.props.whitelistCategory(this.state.selectedCategoryId);
        }
    };

    private SkillInfo = () => {
        return <div/>
    };

    private CategoryInfo = () => {
        console.log(this.state.selectedCategoryId);
        let selectedCategory = this.props.categoriesById.get(this.state.selectedCategoryId);
        return <div>
            <Subheader style={{textAlign: "center"}}>{selectedCategory.qualifier()}</Subheader>
            <div className="vertical-align">
                <Checkbox
                    label={PowerLocalize.get("AdminClient.Info.SkillTree.Category.IsBlacklisted")}
                    checked={selectedCategory.blacklisted()}
                    onCheck={this.handleCategoryBlacklistCheck}
                />
            </div>
        </div>
    };

    private Info = () => {
        if(this.state.selectedCategoryId === this.NO_ID && this.state.selectedSkillId === this.NO_ID) {
            return <span/>
        } else if(this.state.selectedCategoryId === this.NO_ID) {
            return <this.SkillInfo/>
        } else {
            return <this.CategoryInfo/>
        }
    }



    render() {
        return (
        <div style={{marginTop: "56px"}}>
            <div className="row">
                <Paper className="col-md-8">
                    <SkillTree
                        root={this.props.root}
                        onLoadChildren={this.props.loadSkillsForCategory}
                        onCategorySelect={this.handleCategorySelect}
                        onSkillSelect={this.handleSkillSelect}
                        expandOnClick={false}
                    />
                </Paper>
                <div className="col-md-4">
                    <div className="sticky-top">
                        <InfoPaper minHeight="200px" sticky={false}>
                            <this.Info/>
                        </InfoPaper>
                        <div className="margin-5px"/>
                        <InfoPaper
                            minHeight="100px"
                            title={PowerLocalize.get("AdminClient.Info.SkillTree.Legend")}
                            sticky={false}
                        >
                            <div style={{marginLeft: "8px"}}>
                                <FontIcon
                                    className="material-icons blacklisted-icon"
                                    style={{top: "6px", marginRight: "24px"}}
                                >
                                    warning
                                </FontIcon>
                                {PowerLocalize.get("AdminClient.Info.SkillTree.Category.IsBlacklisted")}
                            </div>
                        </InfoPaper>
                    </div>
                </div>
            </div>

        </div>);
    }
}

/**
 * @see AdminSkillTree2Module
 * @author nt
 * @since 17.07.2017
 */
export const AdminSkillTree2: React.ComponentClass<AdminSkillTree2LocalProps> = connect(AdminSkillTree2Module.mapStateToProps, AdminSkillTree2Module.mapDispatchToProps)(AdminSkillTree2Module);