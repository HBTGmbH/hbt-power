import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState, ProfileElementType} from '../../../../Store';
import {ViewProfile} from '../../../../model/viewprofile/ViewProfile';
import {NameEntity} from '../../../../model/NameEntity';
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
import {formatToShortDisplay} from '../../../../utils/DateUtil';
import {NameEntityUtil} from '../../../../utils/NameEntityUtil';
import {ConnectedAscDescButton} from './connected-asc-desc-button_module';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';

interface CareerTableProps {
    viewProfile: ViewProfile;
    careers: Immutable.Map<string, NameEntity>;
}

interface CareerTableLocalProps {
    viewProfileId: string;
}
interface CareerTableLocalState {

}
interface CareerTableDispatch {
    filterTable(indexes: number, enabled: boolean, viewProfileId: string, lookup: Immutable.List<ViewElement>): void;
}

class CareerTableModule extends React.Component<
    CareerTableProps
    & CareerTableLocalProps
    & CareerTableDispatch, CareerTableLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: CareerTableLocalProps): CareerTableProps {
        return {
            viewProfile: state.databaseReducer.viewProfiles().get(localProps.viewProfileId),
            careers: state.databaseReducer.careers()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): CareerTableDispatch {
        return {
            filterTable: (index, enabled, viewProfileId, lookup) => {
                dispatch(ProfileAsyncActionCreator.filterViewElements(ProfileElementType.CareerEntry, viewProfileId, index, enabled, lookup));
            }
        };
    }

    private getHandleOnCheck = (index: number) => {
        return (event: any, isInputChecked: boolean) => {
            this.props.filterTable(index, isInputChecked, this.props.viewProfileId, this.props.viewProfile.viewCareerEntries());
        };
    };

    private isSelected = (index: number) => {
        return this.props.viewProfile.viewCareerEntries().get(index).enabled();
    };

    private getEntry = (viewElement: ViewElement) => {
        return this.props.viewProfile.profile().careerEntries().get(viewElement.elementId());
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
                        elementType={ProfileElementType.CareerEntry}
                        viewElementIndex={index}
                    />
                </TableRowColumn>
                <TableRowColumn>
                    {NameEntityUtil.getNullTolerantName(entry.nameEntityId(), this.props.careers)}
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



    render() {
        return (<div id="ViewTable.CareerTable">
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
                                label={PowerLocalize.get('Career.Singular')}
                                viewProfileId={this.props.viewProfileId}
                                entryField="NAME"
                                elementType={ProfileElementType.CareerEntry}
                            />
                        </TableHeaderColumn>
                        <TableHeaderColumn>
                            <ConnectedAscDescButton
                                label={PowerLocalize.get('Begin')}
                                viewProfileId={this.props.viewProfileId}
                                entryField="DATE_START"
                                elementType={ProfileElementType.CareerEntry}
                            />
                        </TableHeaderColumn>
                        <TableHeaderColumn>
                            <ConnectedAscDescButton
                                label={PowerLocalize.get('End')}
                                viewProfileId={this.props.viewProfileId}
                                entryField="DATE_END"
                                elementType={ProfileElementType.CareerEntry}
                            />
                        </TableHeaderColumn>
                    </TableRow>
                </TableHeader>
                <TableBody deselectOnClickaway={false} displayRowCheckbox={false}>
                    {
                        this.props.viewProfile.viewCareerEntries().map(this.renderTableRow)
                    }
                </TableBody>
            </Table>
        </div>);
    }
}

/**
 * @see CareerTableModule
 * @author nt
 * @since 13.06.2017
 */
export const CareerTable: React.ComponentClass<CareerTableLocalProps> = connect(CareerTableModule.mapStateToProps, CareerTableModule.mapDispatchToProps)(CareerTableModule);