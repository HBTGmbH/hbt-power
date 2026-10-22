import {connect} from 'react-redux';
import * as React from 'react';
import * as Immutable from 'immutable';
import {SkillCategory} from '../../../../model/skill/SkillCategory';
import {SkillActionCreator} from '../../../../reducers/skill/SkillActionCreator';
import {SkillTree} from '../../../general/skill/skill-tree_module';
import {Checkbox, FormControlLabel, Icon, List, ListItem, ListItemIcon, ListItemText, Paper, TextField, Typography} from '@material-ui/core';
import {InfoPaper} from '../../../general/info-paper_module.';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {LocalizationTable} from '../../../general/skill/localization-table_module';
import {SkillServiceSkill} from '../../../../model/skill/SkillServiceSkill';
import {CategoryDeleteConfirmation} from '../../../general/skill/category-delete-confirmation_module';
import {SkillTreeNode} from '../../../../model/skill/SkillTreeNode';
import {CategorySearcher} from '../category-searcher_module';
import {SetValueDialog} from '../../../general/set-value-dialog_module';
import {ApplicationState} from '../../../../reducers/reducerIndex';
import {SkillStore} from '../../../../model/skill/SkillStore';
import {AdminActionCreator} from '../../../../reducers/admin/AdminActionCreator';
import {PwrSkillVersionInfo} from '../../../general/pwr-skill-version-info_module';
import {AliasList} from '../../../general/skill/alias-list_module';
import {ThunkDispatch} from 'redux-thunk';
import {PwrFormSection, PwrRow} from '../../../general/pwr-form-section';
import {PwrSpacer} from '../../../general/pwr-spacer_module';
import {PwrButton} from '../../../general/pwr-button';
import {PwrFormSubtitle} from '../../../general/pwr-typography';
import {matchPath, RouteComponentProps, withRouter} from 'react-router-dom';
import {Paths} from '../../../../Paths';
import {StringUtils} from '../../../../utils/StringUtil';

interface AdminSkillTree2Props {
    root: SkillTreeNode;
    skillStore: SkillStore;
    categoriesById: Immutable.Map<number, SkillCategory>;
    skillsById: Immutable.Map<number, SkillServiceSkill>;
    filterNonCustomSkills: boolean;
}

interface AdminSkillTree2LocalState {
    selectedCategoryId: number;
    selectedSkillId: number;
    categoryNameOpen: boolean;
    skillNameOpen: boolean;
    deleteConfirmationOpen: boolean;
    categoryToDeleteId: number;
    categorySearcherOpen: boolean;
    moveCategorySearcher: boolean;

    newVersionText: string;

}

interface AdminSkillTree2Dispatch {
    loadTree(): void;

    setIsDisplayCategory(categoryId: number, isDisplay: boolean): void;

    addLocalization(categoryId: number, language: string, qualifier: string): void;

    deleteLocalization(categoryId: number, language: string): void;

    addSkillLocalization(skillId: number, language: string, qualifier: string): void;

    deleteSkillLocalization(skillId: number, language: string): void;

    addSkillAlias(skillId: number, alias: string): void;

    deleteSkillAlias(skillId: number, alias: string): void;

    createCategory(parentId: number, qualifier: string): void;

    deleteCategory(categoryId: number): void;

    moveCategory(newCategoryId: number, selectedCategoryId: number): void;

    moveSkill(newCategory: number, oldCategory: number, skillId: number): void;

    createSkill(qualifier: string, categoryId: number): void;

    deleteSkill(skillId: number): void;

    toggleOpen(categoryId: number): void;

    filter(searchTerm: string): void;

    changeFilterNonCustomSkills(doFiltering: boolean): void;
}


/**
 * IDs of the categories from the root down to the entry, null if the tree doesn't contain it
 */
function pathTo(node: SkillTreeNode, categoryId: number | null, skillId: number | null): Array<number> | null {
    if (categoryId !== null && node.skillCategoryId === categoryId) {
        return [];
    }
    if (skillId !== null && node.skillNodes.some(skillNode => skillNode.skillId === skillId)) {
        return [node.skillCategoryId];
    }
    for (const child of node.childNodes) {
        const path = pathTo(child, categoryId, skillId);
        if (path !== null) {
            return [node.skillCategoryId, ...path];
        }
    }
    return null;
}

type AllProps = AdminSkillTree2Props & AdminSkillTree2Dispatch & RouteComponentProps;

/**
 * The selection lives in the URL (#180): .../skilltree/skill/<id>/<slug> or .../skilltree/category/<id>/<slug>, the
 * slug only for reading. Opening such a URL selects the entry and opens the tree down to it.
 */
class AdminSkillTree2Module extends React.Component<AllProps, AdminSkillTree2LocalState> {

    private readonly NO_ID = -99999;

    /** The URL whose entry was last opened in the tree, so it is opened once and the user can close it again */
    private revealedPath: string | null = null;

    constructor(props: any) {
        super(props);
        this.state = {
            selectedCategoryId: this.NO_ID,
            selectedSkillId: this.NO_ID,
            categoryNameOpen: false,
            deleteConfirmationOpen: false,
            categoryToDeleteId: this.NO_ID,
            categorySearcherOpen: false,
            skillNameOpen: false,
            moveCategorySearcher: false,
            newVersionText: '',
        };
    }

    static mapStateToProps(state: ApplicationState): AdminSkillTree2Props {
        return {
            skillStore: state.skillReducer,
            root: state.skillReducer.skillTreeRoot,
            categoriesById: state.skillReducer.categoriesById,
            skillsById: state.skillReducer.skillsById,
            filterNonCustomSkills: state.skillReducer.filterNonCustomSkills
        };
    };

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): AdminSkillTree2Dispatch {
        return {
            loadTree: () => dispatch(SkillActionCreator.AsyncLoadTree()),
            addLocalization: (categoryId, language, qualifier) => dispatch(SkillActionCreator.AsyncAddLocale(categoryId, language, qualifier)),
            deleteLocalization: (categoryId, language) => dispatch(SkillActionCreator.AsyncDeleteLocale(categoryId, language)),
            createCategory: (parentId, qualifier) => dispatch(SkillActionCreator.AsyncCreateCategory(qualifier, parentId)),
            deleteCategory: categoryId => dispatch(SkillActionCreator.AsyncDeleteCategory(categoryId)),
            moveCategory: (newCategoryId, selectedCategoryId) => dispatch(SkillActionCreator.AsyncMoveCategory(newCategoryId, selectedCategoryId)),
            moveSkill: (newCategory, oldCategory, skillId) => dispatch(SkillActionCreator.AsyncMoveSkill(skillId, newCategory, oldCategory)),
            createSkill: (qualifier, categoryId) => dispatch(SkillActionCreator.AsyncCreateSkill(qualifier, categoryId)),
            deleteSkill: skillId => dispatch(SkillActionCreator.AsyncDeleteSkill(skillId)),
            addSkillLocalization: (skillId, language, qualifier) => dispatch(SkillActionCreator.AsyncAddSkillLocale(skillId, language, qualifier)),
            deleteSkillLocalization: (skillId, language) => dispatch(SkillActionCreator.AsyncDeleteSkillLocale(skillId, language)),
            addSkillAlias: (skillId, alias) => dispatch(SkillActionCreator.AsyncAddSkillAlias(skillId, alias)),
            deleteSkillAlias: (skillId, alias) => dispatch(SkillActionCreator.AsyncDeleteSkillAlias(skillId, alias)),
            setIsDisplayCategory: (categoryId, isDisplay) => dispatch(SkillActionCreator.AsyncSetIsDisplay(categoryId, isDisplay)),
            toggleOpen: (categoryId) => dispatch(SkillActionCreator.SetTreeChildrenOpen(categoryId)),
            filter: (searchTerm) => dispatch(SkillActionCreator.FilterTree(searchTerm)),
            changeFilterNonCustomSkills: (doFiltering => dispatch(AdminActionCreator.SetFilterNonCustomSkills(doFiltering))),
        };
    };

    public componentDidMount() {
        this.props.loadTree();
        this.applyUrl();
    };

    public componentDidUpdate(prevProps: Readonly<AllProps>) {
        if (prevProps.location.pathname !== this.props.location.pathname || prevProps.root !== this.props.root) {
            this.applyUrl();
        }
    }

    private selectionFromUrl(): { skillId: number, categoryId: number } {
        const pathname = this.props.location.pathname;
        const skill = matchPath<{ skillId: string }>(pathname, {path: Paths.ADMIN_INFO_SKILLTREE_SKILL, exact: true});
        const category = matchPath<{ categoryId: string }>(pathname, {path: Paths.ADMIN_INFO_SKILLTREE_CATEGORY, exact: true});
        const skillId = skill ? Number(skill.params.skillId) : NaN;
        const categoryId = category ? Number(category.params.categoryId) : NaN;
        return {
            skillId: isNaN(skillId) ? this.NO_ID : skillId,
            categoryId: isNaN(categoryId) ? this.NO_ID : categoryId
        };
    }

    private treeLoaded(): boolean {
        return this.props.root.childNodes.length > 0;
    }

    private applyUrl = () => {
        const {skillId, categoryId} = this.selectionFromUrl();
        if (skillId !== this.state.selectedSkillId || categoryId !== this.state.selectedCategoryId) {
            this.setState({selectedSkillId: skillId, selectedCategoryId: categoryId});
        }
        if (!this.treeLoaded() || (skillId === this.NO_ID && categoryId === this.NO_ID)) {
            return;
        }
        const pathname = this.props.location.pathname;
        const path = pathTo(this.props.root,
            categoryId === this.NO_ID ? null : categoryId, skillId === this.NO_ID ? null : skillId);
        if (path === null) {
            // Unknown or deleted entry: the tree without a selection
            this.props.history.replace(Paths.ADMIN_INFO_SKILLTREE);
            return;
        }
        if (this.revealedPath !== pathname) {
            this.revealedPath = pathname;
            this.openTreeAlong(this.props.root, path);
        }
    };

    private openTreeAlong(root: SkillTreeNode, categoryIds: Array<number>) {
        let node = root;
        // The first ID is the root, which has no list entry
        for (const categoryId of categoryIds.slice(1)) {
            node = node.childNodes.find(child => child.skillCategoryId === categoryId);
            if (!node) {
                return;
            }
            if (!node.open) {
                this.props.toggleOpen(categoryId);
            }
        }
    }

    private handleCategorySelect = (categoryId: number) => {
        const category = this.props.categoriesById.get(categoryId);
        const url = Paths.build(Paths.ADMIN_INFO_SKILLTREE_CATEGORY,
            {categoryId: String(categoryId), slug: StringUtils.slug(category && category.qualifier)});
        // Clicked in the tree: it is open down to the entry already
        this.revealedPath = url;
        this.props.history.push(url);
    };

    private handleSkillSelect = (skillId: number) => {
        const skill = this.props.skillsById.get(skillId);
        const url = Paths.build(Paths.ADMIN_INFO_SKILLTREE_SKILL,
            {skillId: String(skillId), slug: StringUtils.slug(skill && skill.qualifier())});
        this.revealedPath = url;
        this.props.history.push(url);
    };

    private handleCategoryIsDisplayCheck = (event: any, isChecked: boolean) => {
        this.props.setIsDisplayCategory(this.state.selectedCategoryId, isChecked);
    };

    private handleAddCategoryLocale = (language: string, qualifier: string) => {
        this.props.addLocalization(this.state.selectedCategoryId, language, qualifier);
    };

    private handleDeleteCategoryLocale = (language: string) => {
        this.props.deleteLocalization(this.state.selectedCategoryId, language);
    };

    private handleAddSkillLocale = (language: string, qualifier: string) => {
        this.props.addSkillLocalization(this.state.selectedSkillId, language, qualifier);
    };

    private handleDeleteSkillLocale = (language: string) => {
        this.props.deleteSkillLocalization(this.state.selectedSkillId, language);
    };


    private openNameDialog = () => {
        this.setState({
            categoryNameOpen: true
        });
    };

    private closeNameDialog = () => {
        this.setState({
            categoryNameOpen: false
        });
    };

    private openDeleteConfirmation = (categoryId: number) => {
        this.setState({
            categoryToDeleteId: categoryId,
            deleteConfirmationOpen: true
        });
    };

    private closeDeleteConfirmation = () => {
        this.setState({
            deleteConfirmationOpen: false
        });
    };

    private openSkillNameDialog = () => {
        this.setState({
            skillNameOpen: true
        });
    };

    private closeSkillNameDialog = () => {
        this.setState({
            skillNameOpen: false
        });
    };

    private handleCreateCategory = (categoryName: string) => {
        let selectedCategory = this.props.categoriesById.get(this.state.selectedCategoryId);
        this.props.createCategory(selectedCategory.id, categoryName);
        this.closeNameDialog();
    };

    private handleCreateSkill = (skillName: string) => {
        let selectedCategory = this.props.categoriesById.get(this.state.selectedCategoryId);
        this.props.createSkill(skillName, selectedCategory.id);
        this.closeSkillNameDialog();
    };

    private handleDeleteCategory = () => {
        this.props.deleteCategory(this.state.categoryToDeleteId);
        // A selected entry in it goes with it: applyUrl leaves the selection once the tree no longer contains it
        this.setState({
            categoryToDeleteId: this.NO_ID,
            deleteConfirmationOpen: false
        });
    };

    private handleDeleteSkill = (skillId: number) => {
        // Asks first (makeDeferrable); if it was selected, applyUrl leaves the selection once it is gone
        this.props.deleteSkill(skillId);
    };

    private openMoveCategorySearcher = () => {
        this.setState({
            moveCategorySearcher: true
        });
    };

    private invokeMoveSelectedCategory = (newCategoryId: number) => {
        let selectedCategory = this.getSelectedCategory();
        this.props.moveCategory(newCategoryId, selectedCategory.id);
        // Open the tree down to its new place
        this.revealedPath = null;
        this.closeCategorySearcher();
    };

    private handleCheckFilterNonCustom = (event: any, isInputChecked: boolean) => {
        this.props.changeFilterNonCustomSkills(isInputChecked);
    };

    private openCategorySearcher = () => {
        this.setState({
            categorySearcherOpen: true
        });
    };

    private closeCategorySearcher = () => {
        this.setState({
            categorySearcherOpen: false,
            moveCategorySearcher: false,
        });
    };

    private getSelectedCategory = () => {
        return this.props.categoriesById.get(this.state.selectedCategoryId);
    };

    private getSelectedSkill = () => {
        return this.props.skillsById.get(this.state.selectedSkillId);
    };

    private invokeMoveSelectedSkill = (newCategoryId: number) => {
        let selectedSkill = this.getSelectedSkill();
        this.props.moveSkill(newCategoryId, selectedSkill.categoryId(), selectedSkill.id());
        this.revealedPath = null;
        this.closeCategorySearcher();
    };

    private SkillInfo = () => {
        let selectedSkill = this.getSelectedSkill();
        return <>
            <CategorySearcher
                skillStore={this.props.skillStore}
                open={this.state.categorySearcherOpen}
                categories={this.props.categoriesById.toArray()}
                onClose={this.closeCategorySearcher}
                onSelectCategory={this.invokeMoveSelectedSkill}
            />
            <PwrFormSubtitle>{PowerLocalize.get('AdminClient.Info.SkillTree.Info.Skill')}</PwrFormSubtitle>
            <Typography variant="h6">{selectedSkill.qualifier()}</Typography>
            <PwrFormSection title={PowerLocalize.get('AdminClient.Info.SkillTree.Info.Versions')}>
                <PwrSkillVersionInfo skillName={selectedSkill.qualifier()}/>
            </PwrFormSection>
            <PwrFormSection title={PowerLocalize.get('AdminClient.Info.SkillTree.Alias.Title')}>
                <AliasList
                    key={selectedSkill.id()}
                    skillName={selectedSkill.qualifier()}
                    aliases={selectedSkill.aliases()}
                    onAliasAdd={alias => this.props.addSkillAlias(selectedSkill.id(), alias)}
                    onAliasDelete={alias => this.props.deleteSkillAlias(selectedSkill.id(), alias)}
                />
            </PwrFormSection>
            <PwrFormSection title={PowerLocalize.get('AdminClient.Info.SkillTree.Category.Localizations')}>
                <LocalizationTable
                    localizations={selectedSkill.qualifiers()}
                    termToLocalize={selectedSkill.qualifier()}
                    onLocaleDelete={this.handleDeleteSkillLocale}
                    onLocaleAdd={this.handleAddSkillLocale}
                />
            </PwrFormSection>
            <PwrSpacer size="section"/>
            <PwrRow>
                <PwrButton color="primary" text={PowerLocalize.get('Action.ChangeCategory')}
                           icon={<Icon className="material-icons">drive_file_move</Icon>}
                           onClick={this.openCategorySearcher}/>
            </PwrRow>
        </>;
    };

    private CategoryInfo = () => {
        let selectedCategory = this.props.categoriesById.get(this.state.selectedCategoryId);
        return <>
            <CategorySearcher
                skillStore={this.props.skillStore}
                open={this.state.moveCategorySearcher}
                categories={this.props.categoriesById.toArray().filter((value, index) => value.id !== selectedCategory.id)}
                onClose={this.closeCategorySearcher}
                onSelectCategory={this.invokeMoveSelectedCategory}
            />
            <PwrFormSubtitle>{PowerLocalize.get('AdminClient.Info.SkillTree.Info.Category')}</PwrFormSubtitle>
            <Typography variant="h6">{selectedCategory.qualifier}</Typography>
            <PwrSpacer size="tight"/>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={selectedCategory.isDisplay}
                        onChange={this.handleCategoryIsDisplayCheck}
                        color={'primary'}
                    />}
                label={PowerLocalize.get('AdminClient.Info.SkillTree.Category.IsDisplay')}
            />
            <PwrFormSection title={PowerLocalize.get('AdminClient.Info.SkillTree.Category.Localizations')}>
                <LocalizationTable
                    localizations={selectedCategory.qualifiers}
                    termToLocalize={selectedCategory.qualifier}
                    onLocaleAdd={this.handleAddCategoryLocale}
                    onLocaleDelete={this.handleDeleteCategoryLocale}
                />
            </PwrFormSection>
            <PwrSpacer size="section"/>
            <PwrRow>
                <PwrButton color="primary" text={PowerLocalize.get('Action.AddCategory')}
                           icon={<Icon className="material-icons">add</Icon>} onClick={this.openNameDialog}/>
                <PwrButton color="primary" text={PowerLocalize.get('Action.AddSkillToCategory')}
                           icon={<Icon className="material-icons">add</Icon>} onClick={this.openSkillNameDialog}/>
                <PwrButton color="primary" text={PowerLocalize.get('Action.MoveCategory')}
                           icon={<Icon className="material-icons">drive_file_move</Icon>}
                           onClick={this.openMoveCategorySearcher}/>
            </PwrRow>
        </>;
    };

    private Info = () => {
        // Also while the tree loads or right after the selected entry was deleted
        const skillMissing = this.state.selectedSkillId === this.NO_ID || !this.getSelectedSkill();
        const categoryMissing = this.state.selectedCategoryId === this.NO_ID || !this.getSelectedCategory();
        if (skillMissing && categoryMissing) {
            return <Typography variant="body2" color="textSecondary">
                {PowerLocalize.get('AdminClient.Info.SkillTree.Info.NothingSelected')}
            </Typography>;
        } else if (!skillMissing) {
            return <this.SkillInfo/>;
        } else {
            return <this.CategoryInfo/>;
        }
    };

    private static LegendEntry = (props: { iconName: string, text: string }) => <ListItem>
        <ListItemIcon><Icon className="material-icons">{props.iconName}</Icon></ListItemIcon>
        <ListItemText primary={props.text}/>
    </ListItem>;

    render() {
        const categoryToDelete = this.props.categoriesById.get(this.state.categoryToDeleteId);
        return (
            <div>
                <SetValueDialog
                    open={this.state.categoryNameOpen}
                    label={PowerLocalize.get('AdminClient.Info.SkillTree.NewCategory.Name')}
                    onClose={this.closeNameDialog}
                    onOk={this.handleCreateCategory}
                />
                <SetValueDialog
                    open={this.state.skillNameOpen}
                    label={PowerLocalize.get('AdminClient.Info.SkillTree.NewSkill.Name')}
                    onClose={this.closeSkillNameDialog}
                    onOk={this.handleCreateSkill}
                />
                {categoryToDelete && <CategoryDeleteConfirmation
                    category={categoryToDelete}
                    open={this.state.deleteConfirmationOpen}
                    onDeclineDelete={this.closeDeleteConfirmation}
                    onAcceptDelete={this.handleDeleteCategory}
                />}
                <div className="row ">
                    <Paper className="col-md-8">
                        <TextField
                            label={PowerLocalize.get('Action.Search')}
                            margin={'dense'}
                            style={{verticalAlign: 'middle'}}
                            onChange={(e: any) => {
                                this.props.filter(e.target.value);
                            }}
                        />
                        <FormControlLabel
                            style={{marginLeft: '5px'}}
                            control={
                                <Checkbox
                                    onChange={this.handleCheckFilterNonCustom}
                                    checked={this.props.filterNonCustomSkills}
                                    color={'primary'}
                                />
                            }
                            label={PowerLocalize.get('AdminClient.Info.SkillTree.Filter.OnlyCustom')}
                        />


                        <SkillTree
                            root={this.props.root}
                            onCategorySelect={this.handleCategorySelect}
                            onNestedListToggle={this.props.toggleOpen}
                            onSkillSelect={this.handleSkillSelect}
                            onSkillDelete={this.handleDeleteSkill}
                            onCategoryDelete={this.openDeleteConfirmation}
                            categoriesById={this.props.categoriesById}
                            skillsById={this.props.skillsById}
                            selectedSkillId={this.state.selectedSkillId}
                            selectedCategoryId={this.state.selectedCategoryId}
                        />
                    </Paper>
                    <div className="col-md-4">
                        <div id="skill-tree-info-panel">
                            <InfoPaper minHeight="200px">
                                <div className="pwr-skill-tree-info">
                                    <this.Info/>
                                </div>
                            </InfoPaper>
                            <PwrSpacer size="tight"/>
                            <InfoPaper minHeight="100px" title={PowerLocalize.get('AdminClient.Info.SkillTree.Legend')}>
                                <List dense>
                                    <AdminSkillTree2Module.LegendEntry iconName="label"
                                                                       text={PowerLocalize.get('AdminClient.Info.SkillTree.Legend.Category')}/>
                                    <AdminSkillTree2Module.LegendEntry iconName="label_outline"
                                                                       text={PowerLocalize.get('AdminClient.Info.SkillTree.Legend.Skill')}/>
                                    <AdminSkillTree2Module.LegendEntry iconName="extension"
                                                                       text={PowerLocalize.get('AdminClient.Info.SkillTree.Legend.OwnItem')}/>
                                    <AdminSkillTree2Module.LegendEntry iconName="airplay"
                                                                       text={PowerLocalize.get('AdminClient.Info.SkillTree.Legend.IsDisplay')}/>
                                </List>
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
export const AdminSkillTree2 = withRouter(connect(AdminSkillTree2Module.mapStateToProps, AdminSkillTree2Module.mapDispatchToProps)(AdminSkillTree2Module));
