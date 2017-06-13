import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState, ProfileElementType} from '../../../../Store';
import {ViewProfile} from '../../../../model/viewprofile/ViewProfile';
import {NameEntity} from '../../../../model/NameEntity';
import {ViewElement} from '../../../../model/viewprofile/ViewElement';
import {ProfileAsyncActionCreator} from '../../../../reducers/profile/ProfileAsyncActionCreator';
import {
    Checkbox, FontIcon, Table, TableBody, TableHeader, TableHeaderColumn, TableRow,
    TableRowColumn
} from 'material-ui';
import {ReduxDragIndicator} from './drag/redux-drag-row-indicator_module';
import {NameEntityUtil} from '../../../../utils/NameEntityUtil';
import {formatToShortDisplay} from '../../../../utils/DateUtil';
import {ConnectedAscDescButton} from './connected-asc-desc-button_module';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';

interface KeySkillTableProps {
    viewProfile: ViewProfile;
    keySkills: Immutable.Map<string, NameEntity>;
}

interface KeySkillTableLocalProps {
    viewProfileId: string;
}

interface KeySkillTableLocalState {

}

interface KeySkillTableDispatch {
    filterTable(indexes: number, enabled: boolean, viewProfileId: string, lookup: Immutable.List<ViewElement>): void;
}

class KeySkillTableModule extends React.Component<
    KeySkillTableProps
    & KeySkillTableLocalProps
    & KeySkillTableDispatch, KeySkillTableLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: KeySkillTableLocalProps): KeySkillTableProps {
        return {
            viewProfile: state.databaseReducer.viewProfiles().get(localProps.viewProfileId),
            keySkills: state.databaseReducer.keySkills()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): KeySkillTableDispatch {
        return {
            filterTable: (index, enabled, viewProfileId, lookup) => {
                dispatch(ProfileAsyncActionCreator.filterViewElements(ProfileElementType.KeySkill, viewProfileId, index, enabled, lookup));
            }
        };
    }

    private getHandleOnCheck = (index: number) => {
        return (event: any, isInputChecked: boolean) => {
            this.props.filterTable(index, isInputChecked, this.props.viewProfileId, this.props.viewProfile.viewKeySkills());
        };
    };

    private isSelected = (index: number) => {
        return this.props.viewProfile.viewKeySkills().get(index).enabled();
    };

    private getEntry = (viewElement: ViewElement) => {
        return this.props.viewProfile.profile().keySkillEntries().get(viewElement.elementId());
    };

    private renderTableRow = (viewElement: ViewElement, index: number) => {
        let entry = this.getEntry(viewElement);
        return (
            <TableRow
                key={'CareerTable.CareerRow.' + index}
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
                        elementType={ProfileElementType.KeySkill}
                        viewElementIndex={index}
                    />
                </TableRowColumn>
                <TableRowColumn>
                    {NameEntityUtil.getNullTolerantName(entry.nameEntityId(), this.props.keySkills)}
                </TableRowColumn>
            </TableRow>
        );
    };



    render() {
        return (<div id="ViewTable.KeySkillTable">
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
                                label={PowerLocalize.get('KeySkill.Singular')}
                                viewProfileId={this.props.viewProfileId}
                                entryField="NAME"
                                elementType={ProfileElementType.KeySkill}
                            />
                        </TableHeaderColumn>
                    </TableRow>
                </TableHeader>
                <TableBody deselectOnClickaway={false} displayRowCheckbox={false}>
                    {
                        this.props.viewProfile.viewKeySkills().map(this.renderTableRow)
                    }
                </TableBody>
            </Table>
        </div>);
    }
}

/**
 * @see KeySkillTableModule
 * @author nt
 * @since 13.06.2017
 */
export const KeySkillTable: React.ComponentClass<KeySkillTableLocalProps> = connect(KeySkillTableModule.mapStateToProps, KeySkillTableModule.mapDispatchToProps)(KeySkillTableModule);