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
import * as Immutable from 'immutable';
import {ViewElement} from '../../../../model/viewprofile/ViewElement';
import {ViewProfile} from '../../../../model/viewprofile/ViewProfile';
import {ConnectedAscDescButton} from './connected-asc-desc-button_module';
import {ProfileAsyncActionCreator} from '../../../../reducers/profile/ProfileAsyncActionCreator';
import {ReduxDragIndicator} from './drag/redux-drag-row-indicator_module';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link LanguageTable.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface LanguageTableProps {
    viewProfile: ViewProfile;
    languages: Immutable.Map<string, NameEntity>;
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link LanguageTableProps} and will then be
 * managed by redux.
 */
interface LanguageTableLocalProps {
    viewProfileId: string;
}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface LanguageTableLocalState {

}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface LanguageTableDispatch {
    filterTable(indexes: number, enabled: boolean, viewProfileId: string, lookup: Immutable.List<ViewElement>): void;
}

export class LanguageTableModule extends React.Component<
    LanguageTableProps
    & LanguageTableLocalProps
    & LanguageTableDispatch, LanguageTableLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: LanguageTableLocalProps): LanguageTableProps {
        return {
            viewProfile: state.databaseReducer.viewProfiles().get(localProps.viewProfileId),
            languages: state.databaseReducer.languages()
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): LanguageTableDispatch {
        return {
            filterTable: (index, enabled, viewProfileId, lookup) => {
                dispatch(ProfileAsyncActionCreator.filterViewElements(ProfileElementType.LanguageEntry, viewProfileId, index, enabled, lookup));
            }
        };
    }

    private isSelected = (index: number) => {
        return this.props.viewProfile.viewLanguageEntries().get(index).enabled();
    };

    private getEntry = (viewElement: ViewElement) => {
        return this.props.viewProfile.profile().languageSkills().get(viewElement.elementId());
    };

    private getHandleOnCheck = (index: number) => {
        return (event: any, isInputChecked: boolean) => {
            this.props.filterTable(index, isInputChecked, this.props.viewProfileId, this.props.viewProfile.viewLanguageEntries());
        };
    };

    private renderTableRow = (viewElement: ViewElement, index: number) => {
        let entry = this.getEntry(viewElement);
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
                <TableRowColumn style={{width: "50px"}} >
                    <ReduxDragIndicator
                        viewProfileId={this.props.viewProfileId}
                        elementType={ProfileElementType.LanguageEntry}
                        viewElementIndex={index}
                    />
                </TableRowColumn>
                <TableRowColumn>
                    {NameEntityUtil.getNullTolerantName(entry.languageId(), this.props.languages)}
                </TableRowColumn>
                <TableRowColumn>
                    {entry.level()}
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
                                <ConnectedAscDescButton label={PowerLocalize.get("Language.Singular")}
                                    viewProfileId={this.props.viewProfileId}
                                    entryField="NAME"
                                    elementType={ProfileElementType.LanguageEntry}
                                />
                            </TableHeaderColumn>
                            <TableHeaderColumn>
                                {PowerLocalize.get("LanguageLevel.Singular")}
                                </TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody deselectOnClickaway={false} displayRowCheckbox={false}>
                        {
                            this.props.viewProfile.viewLanguageEntries().map(this.renderTableRow)
                        }
                    </TableBody>
                </Table>
            </div>
        );
    }
}

/**
 * @see LanguageTableModule
 * @author nt
 * @since 29.05.2017
 */
export const LanguageTable: React.ComponentClass<LanguageTableLocalProps> = connect(LanguageTableModule.mapStateToProps, LanguageTableModule.mapDispatchToProps)(LanguageTableModule);