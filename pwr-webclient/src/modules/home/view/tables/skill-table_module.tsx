import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState, ProfileElementType} from '../../../../Store';
import {ViewProfile} from '../../../../model/viewprofile/ViewProfile';
import {ViewElement} from '../../../../model/viewprofile/ViewElement';
import {ProfileAsyncActionCreator} from '../../../../reducers/profile/ProfileAsyncActionCreator';
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
import {ReduxDragIndicator} from './drag/redux-drag-row-indicator_module';
import {ConnectedAscDescButton} from './connected-asc-desc-button_module';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';


interface SkillViewTableProps {
    viewProfile: ViewProfile;
}

interface SkillViewTableLocalProps {
    viewProfileId: string;
}

interface SkillViewTableLocalState {

}

interface SkillViewTableDispatch {
    filterTable(indexes: number, enabled: boolean, viewProfileId: string, lookup: Immutable.List<ViewElement>): void;
}

class SkillViewTableModule extends React.Component<
    SkillViewTableProps
    & SkillViewTableLocalProps
    & SkillViewTableDispatch, SkillViewTableLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: SkillViewTableLocalProps): SkillViewTableProps {
        return {
            viewProfile: state.databaseReducer.viewProfiles().get(localProps.viewProfileId)
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): SkillViewTableDispatch {
        return {
            filterTable: (index, enabled, viewProfileId, lookup) => {
                dispatch(ProfileAsyncActionCreator.filterViewElements(ProfileElementType.SkillEntry, viewProfileId, index, enabled, lookup));
            }
        };
    }

    private getHandleOnCheck = (index: number) => {
        return (event: any, isInputChecked: boolean) => {
            this.props.filterTable(index, isInputChecked, this.props.viewProfileId, this.props.viewProfile.viewSkills());
        };
    };

    private isSelected = (index: number) => {
        return this.props.viewProfile.viewSkills().get(index).enabled();
    };

    private getEntry = (viewElement: ViewElement) => {
        return this.props.viewProfile.profile().skills().get(viewElement.elementId());
    };


    private renderTableRow = (viewElement: ViewElement, index: number) => {

        let entry = this.getEntry(viewElement);
        return (
            <TableRow
                key={'SkillTable.SkillRow.' + index}
                selected={false}
                selectable={false}
            >
                <TableHeaderColumn
                    style={{width: '50px'}}>
                    <Checkbox
                        checked={this.isSelected(index)}
                        onCheck={this.getHandleOnCheck(index)}
                    />
                </TableHeaderColumn>
                <TableRowColumn style={{width: '50px'}} >
                    <ReduxDragIndicator
                        viewProfileId={this.props.viewProfileId}
                        elementType={ProfileElementType.SkillEntry}
                        viewElementIndex={index}
                    />
                </TableRowColumn>
                <TableRowColumn>
                    {entry.name()}
                </TableRowColumn>
            </TableRow>
        );
    };

    render() {
        return (
            <div id="ViewTable.SkillTable">
                <Table>
                    <TableHeader
                        displaySelectAll={false}
                        adjustForCheckbox={false}
                    >
                        <TableRow>
                            <TableHeaderColumn style={{width: '50px'}}/>
                            <TableHeaderColumn style={{width: '50px'}}><FontIcon className="material-icons">drag_handle</FontIcon></TableHeaderColumn>
                            <TableHeaderColumn>
                                <ConnectedAscDescButton
                                    label={PowerLocalize.get('Skill.Singular')}
                                    viewProfileId={this.props.viewProfileId}
                                    entryField="NAME"
                                    elementType={ProfileElementType.SkillEntry}
                                />
                            </TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody deselectOnClickaway={false} displayRowCheckbox={false}>
                        {
                            this.props.viewProfile.viewSkills().map(this.renderTableRow)
                        }
                    </TableBody>
                </Table>
            </div>
        );
    }
}

/**
 * @see SkillViewTableModule
 * @author nt
 * @since 27.06.2017
 */
export const SkillViewTable: React.ComponentClass<SkillViewTableLocalProps> = connect(SkillViewTableModule.mapStateToProps, SkillViewTableModule.mapDispatchToProps)(SkillViewTableModule);