import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState, ProfileElementType} from '../../../Store';
import {ViewProfile} from '../../../model/viewprofile/ViewProfile';
import {NameEntity} from '../../../model/NameEntity';
import {ProfileActionCreator} from '../../../reducers/profile/ProfileActionCreator';
import {ViewElement} from '../../../model/viewprofile/ViewElement';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui';
import {NameEntityUtil} from '../../../utils/NameEntityUtil';
import {PowerLocalize} from '../../../localization/PowerLocalizer';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link SectorTable.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface SectorTableProps {
    viewProfile: ViewProfile;
    sectors: Immutable.Map<string, NameEntity>;
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link SectorTableProps} and will then be
 * managed by redux.
 */
interface SectorTableLocalProps {
    viewProfileId: string;
}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface SectorTableLocalState {

}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface SectorTableDispatch {
    selectIndexes(indexes: Array<number>|string, viewProfileId: string): void;
}

class SectorTableModule extends React.Component<
    SectorTableProps
    & SectorTableLocalProps
    & SectorTableDispatch, SectorTableLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: SectorTableLocalProps): SectorTableProps {
        return {
            viewProfile: state.databaseReducer.viewProfiles().get(localProps.viewProfileId),
            sectors: state.databaseReducer.sectors()
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): SectorTableDispatch {
        return {
            selectIndexes: (indexes, viewProfileId) => {
                dispatch(ProfileActionCreator.SelectIndexes(ProfileElementType.SectorEntry, indexes, viewProfileId))
            }
        }
    }

    private isSelected = (index: number) => {
        return this.props.viewProfile.viewSectorEntries().get(index).enabled();
    };

    private getEntry = (viewElement: ViewElement) => {
        return this.props.viewProfile.profile().sectorEntries().get(viewElement.elementId());
    };

    private renderTableRow = (viewElement: ViewElement, index: number) => {
        let entry = this.getEntry(viewElement);
        return (
            <TableRow
                key={'SectorTable.SectorRow.' + index}
                selected={this.isSelected(index)}
            >
                <TableRowColumn>
                    {NameEntityUtil.getNullTolerantName(entry.sectorId(), this.props.sectors)}
                </TableRowColumn>
            </TableRow>
        );
    };

    private handleRowSelection = (selectedRows: Array<number> | string) => {
        this.props.selectIndexes(selectedRows, this.props.viewProfileId);
    };

    render() {
        return (
            <div id="ViewTable.SectorTable">
                <Table multiSelectable={true}
                       onRowSelection={this.handleRowSelection}
                >
                    <TableHeader>
                        <TableRow>
                            <TableHeaderColumn>{PowerLocalize.get('Sector.Singular')}</TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody deselectOnClickaway={false}>
                        {
                            this.props.viewProfile.viewSectorEntries().map(this.renderTableRow)
                        }
                    </TableBody>
                </Table>
            </div>
        );
    }
}

/**
 * @see SectorTableModule
 * @author nt
 * @since 01.06.2017
 */
export const SectorTable: React.ComponentClass<SectorTableLocalProps> = connect(SectorTableModule.mapStateToProps, SectorTableModule.mapDispatchToProps)(SectorTableModule);