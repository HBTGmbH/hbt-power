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
import {ProfileActionCreator} from '../../../reducers/singleProfile/ProfileActionCreator';
import * as Immutable from 'immutable';
import {ViewElement} from '../../../model/viewprofile/ViewElement';


/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link TrainingTable.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface TrainingTableProps {
    profile: Profile;
    viewTrainingEntries: Immutable.Map<string, ViewElement>;
    trainingEntries: Immutable.Map<string, TrainingEntry>;
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
    selectIds(ids: Immutable.Map<string, ViewElement>): void;
}

class TrainingTableModule extends React.Component<
    TrainingTableProps
    & TrainingTableLocalProps
    & TrainingTableDispatch, TrainingTableLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: TrainingTableLocalProps): TrainingTableProps {
        return {
            profile: state.databaseReducer.profile(),
            viewTrainingEntries: state.databaseReducer.viewProfiles().get(state.databaseReducer.activeViewProfileId()).viewTrainingEntries(),
            trainingEntries: state.databaseReducer.profile().trainingEntries(),
            trainings: state.databaseReducer.trainings()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): TrainingTableDispatch {
        return {
            selectIds: (ids) => dispatch(ProfileActionCreator.SetSelectedIds(ProfileElementType.TrainingEntry, ids))
        };
    }

    private isSelected = (entryId: string) => {
        return this.props.viewTrainingEntries.get(entryId).enabled();
    };

    private renderTableRow = (entry: TrainingEntry) => {
        return (
            <TableRow key={'TrainingEntry.TrainingRow.' + entry.id()} selected={this.isSelected(entry.id())}>
                <TableRowColumn>
                    {NameEntityUtil.getNullTolerantName(entry.trainingId(), this.props.trainings)}
                </TableRowColumn>
            </TableRow>
        );
    };


    private handleRowSelection = (selectedRows: Array<number> | string) => {

    };

    render() {
        return (
            <div id="ViewTable.TrainingTable">
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
                            this.props.trainingEntries.map(entry => this.renderTableRow(entry)).toArray()
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