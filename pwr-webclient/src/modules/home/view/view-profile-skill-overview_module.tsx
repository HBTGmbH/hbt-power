import {connect} from 'react-redux';
import * as React from 'react';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {ViewProfile} from '../../../model/view/ViewProfile';
import {ViewProfileActionCreator} from '../../../reducers/view/ViewProfileActionCreator';
import {ViewSkill} from '../../../model/view/ViewSkill';
import {SortedColumn, ViewEntryColumn, ViewProfileEntries} from './entries/view-profile-entries_module';
import {RATING_WIDTH, VERSIONS_WIDTH} from './entries/EntryRenderers';
import {SortableEntryType} from '../../../model/view/NameComparableType';
import {ViewCategory} from '../../../model/view/ViewCategory';
import {ComparableNestedEntryButton} from './entries/comparable-nested-entry-button_module';
import {EditViewSkillDialog} from './entries/edit-view-skill-dialog_module';
import {MoveAllSkillsDialog} from './entries/move-all-skills-dialog_module';
import {Chip, Typography} from '@material-ui/core';
import {PwrSpacer} from '../../general/pwr-spacer_module';
import {PwrIconButton} from '../../general/pwr-icon-button';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {PwrRow} from '../../general/pwr-form-section';
import {ThunkDispatch} from 'redux-thunk';

interface ViewProfileSkillOverviewProps {
    viewProfile: ViewProfile;
}

interface ViewProfileSkillOverviewLocalProps {
    viewProfileId: string;
    /** The sorting of the categories sits in the heading of the section */
    sortedColumn: SortedColumn;
    /** Opened categories, which the heading can open and close all at once (#165) */
    expanded: Array<string>;

    onExpandedChange(update: (expanded: Array<string>) => Array<string>): void;
}

interface ViewProfileSkillOverviewLocalState {
    editSkillOpen: boolean;
    editSkill: ViewSkill;
    /** Index of the category whose skills are being moved all at once (#171) */
    moveAllIndex: number;
}

interface ViewProfileSkillOverviewDispatch {
    moveEntry(id: string, type: string, sourceIndex: number, targetIndex: number): void;

    toggleEntry(id: string, type: string, index: number, isEnabled: boolean): void;

    toggleVersion(id: string, skillName: string, versionName: string, isEnabled: boolean): void;

    toggleSkill(id: string, skillName: string, isEnabled: boolean): void;

    setDisplayCategory(id: string, skillName: string, newDisplayCategoryName: string): void;

    getParentCategories(skill: ViewSkill): void;

    moveNestedEntry(id: string, container: 'PROJECT' | 'DISPLAY_CATEGORY', containerIndex: number, type: string, sourceIndex: number, targetIndex: number): void;
}

class ViewProfileSkillOverviewModule extends React.Component<ViewProfileSkillOverviewProps
    & ViewProfileSkillOverviewLocalProps
    & ViewProfileSkillOverviewDispatch, ViewProfileSkillOverviewLocalState> {

    constructor(props: any) {
        super(props);
        this.state = {
            editSkillOpen: false,
            moveAllIndex: null,
            editSkill: null
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: ViewProfileSkillOverviewLocalProps): ViewProfileSkillOverviewProps {
        return {
            viewProfile: state.viewProfileSlice.viewProfiles.get(localProps.viewProfileId)
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): ViewProfileSkillOverviewDispatch {
        return {
            moveEntry: (id, type, sourceIndex, targetIndex) => dispatch(ViewProfileActionCreator.AsyncMoveEntry(id, type, sourceIndex, targetIndex)),
            toggleEntry: (id, type, index, isEnabled) => {
                dispatch(ViewProfileActionCreator.AsyncToggleEntry(id, type, index, isEnabled));
            },
            toggleVersion: (id: string, skillName: string, versionName: string, isEnabled: boolean) => dispatch(ViewProfileActionCreator.AsyncToggleVersion(id, skillName, versionName, isEnabled)),
            moveNestedEntry: (id, container, containerIndex, type, sourceIndex, targetIndex) => {
                dispatch(ViewProfileActionCreator.AsyncMoveNestedEntry(id, container, containerIndex, type, sourceIndex, targetIndex));
            },
            toggleSkill: (id, skillName, isEnabled) => dispatch(ViewProfileActionCreator.AsyncToggleSkill(id, skillName, isEnabled)),
            setDisplayCategory: (id, skillName, newDisplayCategoryName) => dispatch(ViewProfileActionCreator.AsyncSetDisplayCategory(id, skillName, newDisplayCategoryName)),
            getParentCategories: (skill) => dispatch(ViewProfileActionCreator.AsyncGetParentCategories(skill)),
        };
    }

    private editSkill = (skill: ViewSkill) => {
        this.setState({
            editSkillOpen: true,
            editSkill: skill
        });
    };

    private closeEditSkillDialog = () => {
        this.setState({
            editSkillOpen: false,
            editSkill: null
        });
    };

    private handleNestedMove = (container: 'PROJECT' | 'DISPLAY_CATEGORY', containerIndex: number, type: string, sourceIndex: number, targetIndex: number) => {
        this.props.moveNestedEntry(this.props.viewProfileId, container, containerIndex, type, sourceIndex, targetIndex);
    };

    private handleSkillToggle = (skills: Array<ViewSkill>, index: number, isEnabled: boolean) => {
        let skill = skills[index];
        this.props.toggleSkill(this.props.viewProfileId, skill.name, isEnabled);
    };

    private handleMove = (type: string, sourceIndex: number, targetIndex: number) => {
        this.props.moveEntry(this.props.viewProfileId, type, sourceIndex, targetIndex);
    };

    private handleToggle = (type: string, index: number, isEnabled: boolean) => {
        this.props.toggleEntry(this.props.viewProfileId, type, index, isEnabled);
    };

    private handleVersionToggle = (skillName: string, versionName: string, isEnabled: boolean) => {
        this.props.toggleVersion(this.props.viewProfileId, skillName, versionName, isEnabled);
    };

    private renderVersions(skill: ViewSkill, locked: boolean) {
        if (!skill.versions || skill.versions.length === 0) {
            return '–';
        }
        // Click a version to show or hide it in the export; a hidden one is grey and struck through
        return <PwrRow>
            {skill.versions.map(version =>
                <Chip key={version.name} size="small" clickable variant="outlined" label={version.name} disabled={locked}
                      className={version.enabled ? undefined : 'pwr-view-version-hidden'}
                      aria-label={PowerLocalize.getFormatted('ViewProfileOverview.Version', version.name)}
                      aria-pressed={version.enabled}
                      onClick={() => this.handleVersionToggle(skill.name, version.name, !version.enabled)}/>)}
        </PwrRow>;
    }

    private skillColumns(categoryIndex: number): Array<ViewEntryColumn<ViewSkill>> {
        const locked = !this.props.viewProfile.displayCategories[categoryIndex].enabled;
        const columns: Array<ViewEntryColumn<ViewSkill>> = [
            {
                header: <ComparableNestedEntryButton
                    container="DISPLAY_CATEGORY"
                    sortableEntryType={SortableEntryType.SKILL}
                    sortableEntryField="name"
                    viewProfileId={this.props.viewProfileId}
                    label={PowerLocalize.get('ViewEntryField.Name')}
                    containerIndex={categoryIndex}/>,
                render: skill => skill.name,
            },
            {
                header: <ComparableNestedEntryButton
                    container="DISPLAY_CATEGORY"
                    sortableEntryType={SortableEntryType.SKILL}
                    sortableEntryField="rating"
                    viewProfileId={this.props.viewProfileId}
                    label={PowerLocalize.get('ViewEntryField.Rating')}
                    containerIndex={categoryIndex}/>,
                width: RATING_WIDTH,
                render: skill => skill.rating,
            },
            {...this.versionsColumn, render: skill => this.renderVersions(skill, locked)},
            {
                // The name switches the skill (#152), so the choice of the display category has its own button
                header: null,
                width: '40px',
                render: skill => <PwrIconButton iconName="account_tree"
                                                tooltip={PowerLocalize.get('ViewProfileOverview.DisplayCategory')}
                                                iconButtonProps={{size: 'small'}}
                                                onClick={() => this.editSkill(skill)}/>,
            },
        ];
        // Versions off for the whole view profile (#151): no column, the others get its width
        return this.props.viewProfile.showSkillVersions ? columns : columns.filter(column => column.header !== this.versionsColumn.header);
    }

    private readonly versionsColumn: ViewEntryColumn<ViewSkill> = {
        header: PowerLocalize.get('ViewEntryField.Versions'),
        // Fixed like the other columns, so header and rows line up (each row is a grid of its own): three versions
        // fit in a line, more wrap; the name gets the rest
        width: VERSIONS_WIDTH,
        render: skill => this.renderVersions(skill, false),
    };

    private renderDetails = (category: ViewCategory, categoryIndex: number) => <>
        {/* Switched off, the category brings none of its skills into the export (#159); their own state stays */}
        {!category.enabled && <>
            <Typography variant="body2" color="textSecondary">{PowerLocalize.get('ViewProfileOverview.CategoryOff')}</Typography>
            <PwrSpacer size="tight"/>
        </>}
        <ViewProfileEntries
        locked={!category.enabled}
        movableEntryType="SKILL"
        toggleableEntryType="SKILL"
        columns={this.skillColumns(categoryIndex)}
        entries={category.displaySkills}
        onMove={(type, sourceIndex, targetIndex) => this.handleNestedMove('DISPLAY_CATEGORY', categoryIndex, type, sourceIndex, targetIndex)}
        onToggle={(type, index, isEnabled) => this.handleSkillToggle(category.displaySkills, index, isEnabled)}
    />
    </>;

    private categoryColumns(): Array<ViewEntryColumn<ViewCategory>> {
        return [
            {
                // Sorted from the heading of the section
                header: null,
                render: category => <span className="pwr-view-entry-title">{category.name}</span>,
            },
            {
                header: '',
                width: '72px',
                render: category => skillCount(category.displaySkills.length),
            },
            {
                // All skills of the category into another one (#171)
                header: null,
                width: '40px',
                render: (category, index) => <PwrIconButton iconName="drive_file_move"
                                                            tooltip={PowerLocalize.get('ViewProfileOverview.MoveAll.Tooltip')}
                                                            iconButtonProps={{size: 'small'}}
                                                            onClick={() => this.setState({moveAllIndex: index})}/>,
            },
        ];
    }

    render() {
        return <div>
            {this.state.moveAllIndex != null && this.props.viewProfile.displayCategories[this.state.moveAllIndex] &&
            <MoveAllSkillsDialog viewProfileId={this.props.viewProfileId}
                                 category={this.props.viewProfile.displayCategories[this.state.moveAllIndex]}
                                 categoryIndex={this.state.moveAllIndex}
                                 onClose={() => this.setState({moveAllIndex: null})}/>}
            {
                !!(this.state.editSkill) ?
                    <EditViewSkillDialog
                        skill={this.state.editSkill}
                        open={this.state.editSkillOpen}
                        onClose={this.closeEditSkillDialog}
                        viewProfile={this.props.viewProfile}
                    />
                    :
                    null
            }
            <ViewProfileEntries
                cards
                hideHeader
                sortedColumn={this.props.sortedColumn}
                expanded={this.props.expanded}
                onExpandedChange={this.props.onExpandedChange}
                movableEntryType="DISPLAY_CATEGORY"
                toggleableEntryType="DISPLAY_CATEGORY"
                columns={this.categoryColumns()}
                renderDetails={this.renderDetails}
                entries={this.props.viewProfile.displayCategories}
                emptyText={PowerLocalize.get('ViewProfileOverview.Empty')}
                onMove={this.handleMove}
                onToggle={this.handleToggle}
            />
        </div>;
    }
}

/** „1 Skill“, „3 Skills“ */
export function skillCount(count: number): string {
    return count === 1 ? PowerLocalize.get('ViewProfileOverview.SkillCount.One')
        : PowerLocalize.getFormatted('ViewProfileOverview.SkillCount.Other', count);
}

/**
 * @see ViewProfileSkillOverviewModule
 * @author nt
 * @since 12.09.2017
 */
export const ViewProfileSkillOverview: React.ComponentClass<ViewProfileSkillOverviewLocalProps> = connect(ViewProfileSkillOverviewModule.mapStateToProps, ViewProfileSkillOverviewModule.mapDispatchToProps)(ViewProfileSkillOverviewModule) as any;
