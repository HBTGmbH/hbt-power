import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState, ProfileElementType} from '../../../../Store';
import {ViewProfile} from '../../../../model/viewprofile/ViewProfile';
import {NameEntity} from '../../../../model/NameEntity';
import {ViewElement} from '../../../../model/viewprofile/ViewElement';
import {
    Checkbox,
    FontIcon,
    Table,
    TableBody,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn
} from 'material-ui';
import {NameEntityUtil} from '../../../../utils/NameEntityUtil';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {ConnectedAscDescButton} from './connected-asc-desc-button_module';
import {ProfileAsyncActionCreator} from '../../../../reducers/profile/ProfileAsyncActionCreator';
import {ReduxDragIndicator} from './drag/redux-drag-row-indicator_module';

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
    filterTable(indexes: number, enabled: boolean, viewProfileId: string, lookup: Immutable.List<ViewElement>): void;
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
            filterTable: (index, enabled, viewProfileId, lookup) => {
                dispatch(ProfileAsyncActionCreator.filterViewElements(ProfileElementType.SectorEntry, viewProfileId, index, enabled, lookup));
            }
        }
    }

    private getHandleOnCheck = (index: number) => {
        return (event: any, isInputChecked: boolean) => {
            this.props.filterTable(index, isInputChecked, this.props.viewProfileId, this.props.viewProfile.viewSectorEntries());
        };
    };

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
                selected={false}
                selectable={false}
            >
                <TableHeaderColumn
                    style={{width: "50px"}}>
                    <Checkbox
                        checked={this.isSelected(index)}
                        onCheck={this.getHandleOnCheck(index)}
                    />
                </TableHeaderColumn>
                <TableRowColumn style={{width: "50px"}} >
                    <ReduxDragIndicator
                        viewProfileId={this.props.viewProfileId}
                        elementType={ProfileElementType.SectorEntry}
                        viewElementIndex={index}
                    />
                </TableRowColumn>
                <TableRowColumn>
                    {NameEntityUtil.getNullTolerantName(entry.sectorId(), this.props.sectors)}
                </TableRowColumn>
            </TableRow>
        );
    };

    render() {
        return (
            <div id="ViewTable.SectorTable">
                <Table>
                    <TableHeader
                        displaySelectAll={false}
                        adjustForCheckbox={false}
                    >
                        <TableRow>
                            <TableHeaderColumn style={{width: '50px'}}/>
                            <TableHeaderColumn style={{width: "50px"}}><FontIcon className="material-icons">drag_handle</FontIcon></TableHeaderColumn>
                            <TableHeaderColumn>
                                <ConnectedAscDescButton
                                    label={PowerLocalize.get('Sector.Singular')}
                                    viewProfileId={this.props.viewProfileId}
                                    entryField="NAME"
                                    elementType={ProfileElementType.SectorEntry}
                                />
                            </TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody deselectOnClickaway={false} displayRowCheckbox={false}>
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