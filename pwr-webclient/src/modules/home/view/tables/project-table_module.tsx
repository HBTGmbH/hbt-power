import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState, ProfileElementType} from '../../../../Store';
import {
    Checkbox, FontIcon, Table, TableBody, TableHeader, TableHeaderColumn, TableRow,
    TableRowColumn
} from 'material-ui';
import {ViewElement} from '../../../../model/viewprofile/ViewElement';
import {ViewProfile} from '../../../../model/viewprofile/ViewProfile';
import {NameEntity} from '../../../../model/NameEntity';
import {NameEntityUtil} from '../../../../utils/NameEntityUtil';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {ProfileAsyncActionCreator} from '../../../../reducers/profile/ProfileAsyncActionCreator';
import {ConnectedAscDescButton} from './connected-asc-desc-button_module';
import {Project} from '../../../../model/Project';
import {formatToShortDisplay} from '../../../../utils/DateUtil';
import {ReduxDragIndicator} from './drag/redux-drag-row-indicator_module';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link ProjectTable.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface ProjectTableProps {
    viewProfile: ViewProfile;
    companies: Immutable.Map<string, NameEntity>;
    projectRoles: Immutable.Map<string, NameEntity>;
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link ProjectTableProps} and will then be
 * managed by redux.
 */
interface ProjectTableLocalProps {
    viewProfileId: string;
}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface ProjectTableLocalState {

}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface ProjectTableDispatch {
    filterTable(indexes: number, enabled: boolean, viewProfileId: string, lookup: Immutable.List<ViewElement>): void;
}

class ProjectTableModule extends React.Component<
    ProjectTableProps
    & ProjectTableLocalProps
    & ProjectTableDispatch, ProjectTableLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: ProjectTableLocalProps): ProjectTableProps {
        return {
            viewProfile: state.databaseReducer.viewProfiles().get(localProps.viewProfileId),
            projectRoles: state.databaseReducer.projectRoles(),
            companies: state.databaseReducer.companies()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ProjectTableDispatch {
        return {
            filterTable: (index, enabled, viewProfileId, lookup) => {
                dispatch(ProfileAsyncActionCreator.filterViewElements(ProfileElementType.Project, viewProfileId, index, enabled, lookup));
            }
        };
    }


    private getHandleOnCheck = (index: number) => {
        return (event: any, isInputChecked: boolean) => {
            this.props.filterTable(index, isInputChecked, this.props.viewProfileId, this.props.viewProfile.viewProjects());
        };
    };

    private getEntry = (viewElement: ViewElement) => {

        return this.props.viewProfile.profile().projects().get(viewElement.elementId());
    };

    private isSelected = (index: number) => {
        return this.props.viewProfile.viewProjects().get(index).enabled();
    };

    private renderTableRow = (viewElement: ViewElement, index: number) => {
        let entry: Project = this.getEntry(viewElement);
        return (
            <TableRow
                key={'EducationTable.EducationRow.' + index}
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
                <TableRowColumn style={{width: '50px'}} >
                    <ReduxDragIndicator
                        viewProfileId={this.props.viewProfileId}
                        elementType={ProfileElementType.Project}
                        viewElementIndex={index}
                    />
                </TableRowColumn>
                <TableRowColumn>
                    {entry.name()}
                </TableRowColumn>
                <TableRowColumn>
                    {NameEntityUtil.getNullTolerantName(entry.brokerId(), this.props.companies)}
                </TableRowColumn>
                <TableRowColumn>
                    {NameEntityUtil.getNullTolerantName(entry.endCustomerId(), this.props.companies)}
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
        return (
            <div id="ViewTable.LanguageTable">
                <Table>
                    <TableHeader
                        displaySelectAll={false}
                        adjustForCheckbox={false}
                    >
                        <TableRow>
                            <TableHeaderColumn style={{width: '50px'}}/>
                            <TableHeaderColumn style={{width: "50px"}}><FontIcon className="material-icons">drag_handle</FontIcon></TableHeaderColumn>
                            <TableHeaderColumn>
                                {PowerLocalize.get('ProjectName.Singular')}
                            </TableHeaderColumn>
                            <TableHeaderColumn>
                                {PowerLocalize.get('Broker.Singular')}
                            </TableHeaderColumn>
                            <TableHeaderColumn>
                                {PowerLocalize.get('Customer.Singular')}
                            </TableHeaderColumn>
                            <TableHeaderColumn>
                                <ConnectedAscDescButton label={PowerLocalize.get('Project.StartDate')}
                                                        viewProfileId={this.props.viewProfileId}
                                                        entryField="DATE_START"
                                                        elementType={ProfileElementType.Project}
                                />
                            </TableHeaderColumn>
                            <TableHeaderColumn>
                                <ConnectedAscDescButton label={PowerLocalize.get('Project.EndDate')}
                                                        viewProfileId={this.props.viewProfileId}
                                                        entryField="DATE_END"
                                                        elementType={ProfileElementType.Project}
                                />
                            </TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody deselectOnClickaway={false} displayRowCheckbox={false}>
                        {
                            this.props.viewProfile.viewProjects().map(this.renderTableRow)
                        }
                    </TableBody>
                </Table>
            </div>
        );
    }
}

/**
 * @see ProjectTableModule
 * @author nt
 * @since 06.06.2017
 */
export const ProjectTable: React.ComponentClass<ProjectTableLocalProps> = connect(ProjectTableModule.mapStateToProps, ProjectTableModule.mapDispatchToProps)(ProjectTableModule);