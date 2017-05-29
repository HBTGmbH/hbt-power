import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState, ProfileElementType} from '../../../Store';
import {NameEntity} from '../../../model/NameEntity';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui';
import {Profile} from '../../../model/Profile';
import {QualificationEntry} from '../../../model/QualificationEntry';
import {NameEntityUtil} from '../../../utils/NameEntityUtil';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {formatToShortDisplay} from '../../../utils/DateUtil';
import {ProfileActionCreator} from '../../../reducers/singleProfile/ProfileActionCreator';
import * as Immutable from 'immutable';
import {ViewElement} from '../../../model/viewprofile/ViewElement';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link QualificationTable.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface QualificationTableProps {
    profile: Profile;
    viewQualificationEntries: Immutable.Map<string, ViewElement>;
    qualificationEntries: Immutable.Map<string, QualificationEntry>;
    qualifications: Immutable.Map<string, NameEntity>;
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link QualificationTableProps} and will then be
 * managed by redux.
 */
interface QualificationTableLocalProps {

}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface QualificationTableLocalState {

}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface QualificationTableDispatch {
    selectIds(ids: Immutable.Map<string, ViewElement>): void;
}

class QualificationTableModule extends React.Component<
    QualificationTableProps
    & QualificationTableLocalProps
    & QualificationTableDispatch, QualificationTableLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: QualificationTableLocalProps): QualificationTableProps {
        return {
            viewQualificationEntries: state.databaseReducer.viewProfiles().get(state.databaseReducer.activeViewProfileId()).viewQualificationEntries(),
            qualificationEntries: state.databaseReducer.profile().qualificationEntries(),
            qualifications:state.databaseReducer.qualifications(),
            profile: state.databaseReducer.profile()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): QualificationTableDispatch {
        return {
            selectIds: (ids) => dispatch(ProfileActionCreator.SetSelectedIds(ProfileElementType.QualificationEntry, ids))
        };
    }

    private isSelected = (entryId: string) => {
        return this.props.viewQualificationEntries.get(entryId).enabled();
    };

    private renderTableRow = (entry: QualificationEntry) => {
        return (
            <TableRow key={'TrainingEntry.TrainingRow.' + entry.id()} selected={this.isSelected(entry.id())}>
                <TableRowColumn>
                    {NameEntityUtil.getNullTolerantName(entry.qualificationId(), this.props.qualifications)}
                </TableRowColumn>
                <TableRowColumn>
                    {formatToShortDisplay(entry.date())}
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
                            <TableHeaderColumn>{PowerLocalize.get('Date.Singular')}</TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody deselectOnClickaway={false}>
                        {
                            this.props.qualificationEntries.map(entry => this.renderTableRow(entry)).toArray()
                        }
                    </TableBody>
                </Table>
            </div>
        );
    }
}

/**
 * @see QualificationTableModule
 * @author nt
 * @since 29.05.2017
 */
export const QualificationTable: React.ComponentClass<QualificationTableLocalProps> = connect(QualificationTableModule.mapStateToProps, QualificationTableModule.mapDispatchToProps)(QualificationTableModule);