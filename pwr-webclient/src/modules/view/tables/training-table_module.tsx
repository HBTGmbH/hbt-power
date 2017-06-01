import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {TrainingEntry} from '../../../model/TrainingEntry';
import {Profile} from '../../../model/Profile';
import {NameEntity} from '../../../model/NameEntity';
import {ApplicationState, ProfileElementType} from '../../../Store';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui';
import {NameEntityUtil} from '../../../utils/NameEntityUtil';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import * as Immutable from 'immutable';
import {ViewElement} from '../../../model/viewprofile/ViewElement';
import {ViewProfile} from '../../../model/viewprofile/ViewProfile';
import {formatToShortDisplay} from '../../../utils/DateUtil';
import {ProfileActionCreator} from '../../../reducers/profile/ProfileActionCreator';


/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link TrainingTable.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface TrainingTableProps {
    viewProfile: ViewProfile;
    trainings: Immutable.Map<string, NameEntity>;
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link TrainingTableProps} and will then be
 * managed by redux.
 */
interface TrainingTableLocalProps {
    viewProfileId: string;
}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface TrainingTableLocalState {

}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface TrainingTableDispatch {
    selectIndexes(indexes: Array<number>|string, viewProfileId: string): void;
}

class TrainingTableModule extends React.Component<
    TrainingTableProps
    & TrainingTableLocalProps
    & TrainingTableDispatch, TrainingTableLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: TrainingTableLocalProps): TrainingTableProps {
        return {
            viewProfile: state.databaseReducer.viewProfiles().get(localProps.viewProfileId),
            trainings: state.databaseReducer.trainings()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): TrainingTableDispatch {
        return {
            selectIndexes: (indexes, viewProfileId) => {
                dispatch(ProfileActionCreator.SelectIndexes(ProfileElementType.TrainingEntry, indexes, viewProfileId))
            }
        };
    }


    private isSelected = (index: number) => {
        return this.props.viewProfile.viewTrainingEntries().get(index).enabled();
    };

    private getEntry = (viewElement: ViewElement) => {
        return this.props.viewProfile.profile().trainingEntries().get(viewElement.elementId());
    };

    private renderTableRow = (viewElement: ViewElement, index: number) => {
        let entry = this.getEntry(viewElement);
        return (
            <TableRow
                key={'EducationTable.EducationRow.' + index}
                selected={this.isSelected(index)}
            >
                <TableRowColumn>
                    {NameEntityUtil.getNullTolerantName(entry.trainingId(), this.props.trainings)}
                </TableRowColumn>
                <TableRowColumn>
                    {formatToShortDisplay(entry.startDate())}
                </TableRowColumn>
                <TableRowColumn>
                    {formatToShortDisplay(entry.endDate())}
                </TableRowColumn>
            </TableRow>
        );
    };

    private handleRowSelection = (selectedRows: Array<number> | string) => {
        this.props.selectIndexes(selectedRows, this.props.viewProfileId);
    };


    render() {
        return (
            <div id="ViewTable.TrainingTable">
                <Table multiSelectable={true}
                       onRowSelection={this.handleRowSelection}
                >
                    <TableHeader>
                        <TableRow>
                            <TableHeaderColumn>{PowerLocalize.get('Training.Singular')}</TableHeaderColumn>
                            <TableHeaderColumn>{PowerLocalize.get('Begin')}</TableHeaderColumn>
                            <TableHeaderColumn>{PowerLocalize.get('End')}</TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody deselectOnClickaway={false}>
                        {
                            this.props.viewProfile.viewTrainingEntries().map(this.renderTableRow)
                        }
                    </TableBody>
                </Table>
            </div>
        );
    }
}

/**
 * @see TrainingTableModule
 * @author nt
 * @since 29.05.2017
 */
export const TrainingTable: React.ComponentClass<TrainingTableLocalProps> = connect(TrainingTableModule.mapStateToProps, TrainingTableModule.mapDispatchToProps)(TrainingTableModule);