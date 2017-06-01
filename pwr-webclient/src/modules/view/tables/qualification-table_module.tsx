import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState, ProfileElementType} from '../../../Store';
import {NameEntity} from '../../../model/NameEntity';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui';
import {NameEntityUtil} from '../../../utils/NameEntityUtil';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {formatToShortDisplay} from '../../../utils/DateUtil';
import * as Immutable from 'immutable';
import {ViewElement} from '../../../model/viewprofile/ViewElement';
import {ViewProfile} from '../../../model/viewprofile/ViewProfile';
import {ProfileActionCreator} from '../../../reducers/profile/ProfileActionCreator';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link QualificationTable.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface QualificationTableProps {
    viewProfile: ViewProfile;
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
    viewProfileId: string;
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
    selectIndexes(indexes: Array<number>|string, viewProfileId: string): void;
}

class QualificationTableModule extends React.Component<
    QualificationTableProps
    & QualificationTableLocalProps
    & QualificationTableDispatch, QualificationTableLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: QualificationTableLocalProps): QualificationTableProps {
        return {
            viewProfile: state.databaseReducer.viewProfiles().get(localProps.viewProfileId),
            qualifications: state.databaseReducer.qualifications()
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): QualificationTableDispatch {
        return {
            selectIndexes: (indexes, viewProfileId) => {
                dispatch(ProfileActionCreator.SelectIndexes(ProfileElementType.QualificationEntry, indexes, viewProfileId))
            }
        };
    }

    private isSelected = (index: number) => {
        return this.props.viewProfile.viewQualificationEntries().get(index).enabled();
    };

    private getEntry = (viewElement: ViewElement) => {
        return this.props.viewProfile.profile().qualificationEntries().get(viewElement.elementId());
    };

    private renderTableRow = (viewElement: ViewElement, index: number) => {
        let entry = this.getEntry(viewElement);
        return (
            <TableRow
                key={'EducationTable.EducationRow.' + index}
                selected={this.isSelected(index)}
            >
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
                            <TableHeaderColumn>{PowerLocalize.get('Qualification.Singular')}</TableHeaderColumn>
                            <TableHeaderColumn>{PowerLocalize.get('Date.Singular')}</TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody deselectOnClickaway={false}>
                        {
                            this.props.viewProfile.viewQualificationEntries().map(this.renderTableRow)
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