import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState, ProfileElementType} from '../../../../Store';
import {NameEntity} from '../../../../model/NameEntity';
import {
    Checkbox, FontIcon, Table, TableBody, TableHeader, TableHeaderColumn, TableRow,
    TableRowColumn
} from 'material-ui';
import {NameEntityUtil} from '../../../../utils/NameEntityUtil';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {formatToShortDisplay} from '../../../../utils/DateUtil';
import * as Immutable from 'immutable';
import {ViewElement} from '../../../../model/viewprofile/ViewElement';
import {isNullOrUndefined} from 'util';
import {ViewProfile} from '../../../../model/viewprofile/ViewProfile';
import {AscDescButton} from '../../../general/asc-desc-button_module';
import {ProfileAsyncActionCreator} from '../../../../reducers/profile/ProfileAsyncActionCreator';
import {DragRowIndicator} from './drag/drag-row-indicator_module.';
import {ReduxDragIndicator} from './drag/redux-drag-row-indicator_module';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link EducationTable.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface EducationTableProps {
    viewProfile: ViewProfile;
    educations: Immutable.Map<string, NameEntity>;
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link EducationTableProps} and will then be
 * managed by redux.
 */
interface EducationTableLocalProps {
    viewProfileId: string;
}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface EducationTableLocalState {

}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface EducationTableDispatch {
    filterTable(indexes: number, enabled: boolean, viewProfileId: string, lookup: Immutable.List<ViewElement>): void;
    sortTable(entryField: 'DATE' | 'DATE_START' | 'DATE_END' | 'NAME' | 'LEVEL' | 'DEGREE', order: 'ASC' | 'DESC', id: string): void;
    swapElements(viewProfileId: string, index1: number, index2: number): void;
}

class EducationTableModule extends React.Component<
    EducationTableProps
    & EducationTableLocalProps
    & EducationTableDispatch, EducationTableLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: EducationTableLocalProps): EducationTableProps {
        return {
            viewProfile: state.databaseReducer.viewProfiles().get(localProps.viewProfileId),
            educations: state.databaseReducer.educations()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): EducationTableDispatch {
        return {
            filterTable: (index, enabled, viewProfileId, lookup) => {
                dispatch(ProfileAsyncActionCreator.filterViewElements(ProfileElementType.EducationEntry, viewProfileId, index, enabled, lookup));
            },
            sortTable: (entryField, order, id) => {
                dispatch(ProfileAsyncActionCreator.sortView(ProfileElementType.EducationEntry, entryField, order, id));
            },
            swapElements: ((viewProfileId, index1, index2) => {
                dispatch(ProfileAsyncActionCreator.swapViewElements(ProfileElementType.EducationEntry, viewProfileId, index1, index2));
            })
        };
    }

    private getHandleOnCheck = (index: number) => {
        return (event: any, isInputChecked: boolean) => {
            this.props.filterTable(index, isInputChecked, this.props.viewProfileId, this.props.viewProfile.viewEducationEntries());
        };
    };

    private isSelected = (index: number) => {
        return this.props.viewProfile.viewEducationEntries().get(index).enabled();
    };

    private getEntry = (viewElement: ViewElement) => {
        return this.props.viewProfile.profile().educationEntries().get(viewElement.elementId());
    };

    public shouldComponentUpdate(nextProps: EducationTableProps) {
        return true;
    }

    private renderTableRow = (viewElement: ViewElement, index: number) => {
        let entry = this.getEntry(viewElement);
        return (
            <TableRow
                key={'EducationTable.DraggableRow.' + viewElement.elementId()}
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
                        elementType={ProfileElementType.EducationEntry}
                        viewElementIndex={index}
                    />
                </TableRowColumn>
                <TableRowColumn>
                    {NameEntityUtil.getNullTolerantName(entry.nameEntityId(), this.props.educations)}
                </TableRowColumn>
                <TableRowColumn>
                    {formatToShortDisplay(entry.startDate())}
                </TableRowColumn>
                <TableRowColumn>
                    {formatToShortDisplay(entry.endDate())}
                </TableRowColumn>
                <TableRowColumn>
                    {isNullOrUndefined(entry.degree() || entry.degree() == 'null') ? 'keiner' : entry.degree()}
                </TableRowColumn>
            </TableRow>
        );
    };


    private handleNameAscDescChange = (state: 'ASC' | 'DESC') => {
        this.props.sortTable('NAME', state, this.props.viewProfileId);
    };

    private handleStartDateAscDescChange =  (state: 'ASC' | 'DESC') => {
        this.props.sortTable('DATE_START', state, this.props.viewProfileId);
    };

    private handleEndDateAscDescChange =  (state: 'ASC' | 'DESC') => {
        this.props.sortTable('DATE_END', state, this.props.viewProfileId);
    };

    render() {
        return (
            <div id="ViewTable.EducationTable" key="ViewTable.EducationTable">
                <Table>
                    <TableHeader
                        displaySelectAll={false}
                        adjustForCheckbox={false}
                    >
                        <TableRow>
                            <TableHeaderColumn style={{width: "50px"}}></TableHeaderColumn>
                            <TableHeaderColumn style={{width: "50px"}}><FontIcon className="material-icons">drag_handle</FontIcon></TableHeaderColumn>
                            <TableHeaderColumn>
                                <AscDescButton label={PowerLocalize.get('Education.Singular')} onAscDescChange={this.handleNameAscDescChange}/>
                            </TableHeaderColumn>
                            <TableHeaderColumn>
                                <AscDescButton label= {PowerLocalize.get('Begin')} onAscDescChange={this.handleStartDateAscDescChange}/>
                            </TableHeaderColumn>
                            <TableHeaderColumn>
                                <AscDescButton label= {PowerLocalize.get('End')} onAscDescChange={this.handleEndDateAscDescChange}/>
                            </TableHeaderColumn>
                            <TableHeaderColumn>{PowerLocalize.get('AcademicDegree.Singular')}</TableHeaderColumn>

                        </TableRow>
                    </TableHeader>
                    <TableBody deselectOnClickaway={false} displayRowCheckbox={false}>
                        {
                            this.props.viewProfile.viewEducationEntries().map(this.renderTableRow).toArray()
                        }
                    </TableBody>
                </Table>
            </div>
        );
    }
}


/**
 * @see EducationTableModule
 * @author nt
 * @since 29.05.2017
 */
export const EducationTable: React.ComponentClass<EducationTableLocalProps> = connect(EducationTableModule.mapStateToProps, EducationTableModule.mapDispatchToProps)(EducationTableModule);