import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {CareerEntry} from '../../../../../model/CareerEntry';
import {ProfileElementType} from '../../../../../Store';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {IconButton} from '@material-ui/core';
import {formatToYear} from '../../../../../utils/DateUtil';
import {NameEntityUtil} from '../../../../../utils/NameEntityUtil';
import {NameEntity} from '../../../../../model/NameEntity';
import * as Immutable from 'immutable';
import {ProfileActionCreator} from '../../../../../reducers/profile/ProfileActionCreator';
import {CareerEntryDialog} from './career-entry-dialog_module';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link SingleCareerEntry.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface SingleCareerEntryProps {
    careerEntry: CareerEntry;
    careers: Immutable.Map<string, NameEntity>;
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link SingleCareerEntryProps} and will then be
 * managed by redux.
 */
interface SingleCareerEntryLocalProps {
    careerEntryId: string;
}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface SingleCareerEntryLocalState {
    dialogOpen: boolean;
}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface SingleCareerEntryDispatch {
    deleteEntry(id: string): void;
}

class SingleCareerEntryModule extends React.Component<
    SingleCareerEntryProps
    & SingleCareerEntryLocalProps
    & SingleCareerEntryDispatch, SingleCareerEntryLocalState> {

    constructor(props: SingleCareerEntryProps & SingleCareerEntryLocalProps & SingleCareerEntryDispatch) {
        super(props);
        this.state = {
            dialogOpen: props.careerEntry.isNew()
        }
    }

    static mapStateToProps(state: ApplicationState, localProps: SingleCareerEntryLocalProps): SingleCareerEntryProps {
        return {
            careerEntry: state.databaseReducer.profile().careerEntries().get(localProps.careerEntryId),
            careers: state.databaseReducer.careers()
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): SingleCareerEntryDispatch {
        return {
            deleteEntry: (id) => dispatch(ProfileActionCreator.deleteEntry(id, ProfileElementType.CareerEntry))
        }
    }

    private closeDialog = () => {
        this.setState({
            dialogOpen: false
        });
    };

    private openDialog = () => {
        this.setState({
            dialogOpen: true
        })
    };

    private handleDeleteButtonPress = () => {
        this.props.deleteEntry(this.props.careerEntryId);
    };

    private getCareerName = () => {
        return NameEntityUtil.getNullTolerantName(this.props.careerEntry.nameEntityId(), this.props.careers);
    };

    render() {
        return (<tr>
            <td>
                <Tooltip title={PowerLocalize.get('Action.Edit')} >
                    <IconButton className="material-icons icon-size-20" onClick={this.openDialog}>edit</IconButton>
                </Tooltip>
                <Tooltip title={PowerLocalize.get('Action.Delete')}>
                    <IconButton className="material-icons icon-size-20" onClick={this.handleDeleteButtonPress} >delete</IconButton>
                </Tooltip>
                    {<CareerEntryDialog
                    open={this.state.dialogOpen}
                    requestClose={this.closeDialog}
                    careerEntry={this.props.careerEntry}
                />}
            </td>
            <td>
                <div className="fittingContainer" onClick={this.openDialog}>
                    {formatToYear(this.props.careerEntry.startDate())}
                </div>
            </td>
            <td>
                <div className="fittingContainer" onClick={this.openDialog}>
                    {formatToYear(this.props.careerEntry.endDate())}
                </div>
            </td>
            <td>
                <div className="fittingContainer" onClick={this.openDialog}>
                    {this.getCareerName()}
                </div>
            </td>
        </tr>);
    }
}

/**
 * @see SingleCareerEntryModule
 * @author nt
 * @since 12.06.2017
 */
export const SingleCareerEntry: React.ComponentClass<SingleCareerEntryLocalProps> = connect(SingleCareerEntryModule.mapStateToProps, SingleCareerEntryModule.mapDispatchToProps)(SingleCareerEntryModule);