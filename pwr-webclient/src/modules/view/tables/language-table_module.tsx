import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState, ProfileElementType} from '../../../Store';
import {LanguageSkill} from '../../../model/LanguageSkill';
import {NameEntity} from '../../../model/NameEntity';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui';
import {NameEntityUtil} from '../../../utils/NameEntityUtil';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {Profile} from '../../../model/Profile';
import {ProfileActionCreator} from '../../../reducers/singleProfile/ProfileActionCreator';
import * as Immutable from 'immutable';
import {ViewElement} from '../../../model/viewprofile/ViewElement';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link LanguageTable.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface LanguageTableProps {
    profile: Profile;
    viewLanguageEntries: Immutable.Map<string, ViewElement>;
    languageEntries: Immutable.Map<string, LanguageSkill>;
    languages: Immutable.Map<string, NameEntity>;
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link LanguageTableProps} and will then be
 * managed by redux.
 */
interface LanguageTableLocalProps {

}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface LanguageTableLocalState {

}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface LanguageTableDispatch {
    selectIds(ids: Immutable.Map<string, ViewElement>): void;
}

export class LanguageTableModule extends React.Component<
    LanguageTableProps
    & LanguageTableLocalProps
    & LanguageTableDispatch, LanguageTableLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: LanguageTableLocalProps): LanguageTableProps {
        return {
            viewLanguageEntries: state.databaseReducer.viewProfiles().get(state.databaseReducer.activeViewProfileId()).viewLanguageEntries(),
            languageEntries: state.databaseReducer.profile().languageSkills(),
            languages:state.databaseReducer.languages(),
            profile: state.databaseReducer.profile()
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): LanguageTableDispatch {
        return {
            selectIds: (ids) => dispatch(ProfileActionCreator.SetSelectedIds(ProfileElementType.LanguageEntry, ids))
        };
    }

    private isSelected = (sectorEntryId: string) => {
        return this.props.viewLanguageEntries.get(sectorEntryId).enabled();
    };

    private renderTableRow = (entry: LanguageSkill) => {
        return (
            <TableRow key={"LanguageTable.LanguageRow." + entry.id()} selected={this.isSelected(entry.id())}>
                <TableRowColumn>
                    {NameEntityUtil.getNullTolerantName(entry.languageId(), this.props.languages)}
                </TableRowColumn>
                <TableRowColumn>
                    {entry.level()}
                </TableRowColumn>
            </TableRow>
        );
    };

    private handleRowSelection = (selectedRows: Array<number> | string) => {

    };

    render() {
        return (
            <div id="ViewTable.LanguageTable">
                <Table multiSelectable={true} onRowSelection={this.handleRowSelection}>
                    <TableHeader>
                        <TableRow>
                            <TableHeaderColumn>{PowerLocalize.get("Language.Singular")}</TableHeaderColumn>
                            <TableHeaderColumn>{PowerLocalize.get("LanguageLevel.Singular")}</TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody deselectOnClickaway={false}>
                        {
                            this.props.profile.languageSkills().map(entry => this.renderTableRow(entry)).toArray()
                        }
                    </TableBody>
                </Table>
            </div>
        );
    }
}

/**
 * @see LanguageTableModule
 * @author nt
 * @since 29.05.2017
 */
export const LanguageTable: React.ComponentClass<LanguageTableLocalProps> = connect(LanguageTableModule.mapStateToProps, LanguageTableModule.mapDispatchToProps)(LanguageTableModule);