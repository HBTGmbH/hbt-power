import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import * as Immutable from 'immutable';
import {ProfileElementType} from '../../../../../Store';
import {IconButton} from 'material-ui';
import {KeySkillDialog} from './keySkill-entry-dialog_module';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {KeySkillEntry} from '../../../../../model/KeySkillEntry';
import {ProfileActionCreator} from '../../../../../reducers/profile/ProfileActionCreator';
import {NameEntityUtil} from '../../../../../utils/NameEntityUtil';
import {NameEntity} from '../../../../../model/NameEntity';
import {ApplicationState} from '../../../../../reducers/reducerIndex';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link SingleKeySkill.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface SingleKeySkillProps {
    keySkillEntry: KeySkillEntry;
    keySkills: Immutable.Map<string, NameEntity>;
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link SingleKeySkillProps} and will then be
 * managed by redux.
 */
interface SingleKeySkillLocalProps {
    keySkillEntryId: string;
}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface SingleKeySkillLocalState {
    dialogOpen: boolean;
}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface SingleKeySkillDispatch {
    deleteEntry(id: string): void;
}

class SingleKeySkillModule extends React.Component<
    SingleKeySkillProps
    & SingleKeySkillLocalProps
    & SingleKeySkillDispatch, SingleKeySkillLocalState> {

    constructor(props: SingleKeySkillProps & SingleKeySkillLocalProps & SingleKeySkillDispatch) {
        super(props);
        this.state = {
            dialogOpen: props.keySkillEntry.isNew()
        }
    }

    static mapStateToProps(state: ApplicationState, localProps: SingleKeySkillLocalProps): SingleKeySkillProps {
        return {
            keySkillEntry: state.databaseReducer.profile().keySkillEntries().get(localProps.keySkillEntryId),
            keySkills: state.databaseReducer.keySkills()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): SingleKeySkillDispatch {
        return {
            deleteEntry: (id: string) => dispatch(ProfileActionCreator.deleteEntry(id, ProfileElementType.KeySkill))
        }
    }

    private openDialog = () => {
        this.setState({
            dialogOpen: true
        });
    };

    private closeDialog = () => {
        this.setState({
            dialogOpen: false
        });
    };

    private deleteEntry = () => {
        this.props.deleteEntry(this.props.keySkillEntryId);
    };

    private getKeySkillName = () => {
        return NameEntityUtil.getNullTolerantName(this.props.keySkillEntry.nameEntityId(), this.props.keySkills);
    };

    render() {
        return (
            <tr>
            <td>
                <IconButton iconClassName="material-icons icon-size-20" onClick={this.openDialog} tooltip={PowerLocalize.get('Action.Edit')}>edit</IconButton>
                <IconButton iconClassName="material-icons icon-size-20" onClick={this.deleteEntry} tooltip={PowerLocalize.get('Action.Delete')}>delete</IconButton>
                <KeySkillDialog
                    open={this.state.dialogOpen}
                    keySkillEntry={this.props.keySkillEntry}
                    requestClose={this.closeDialog}
                />
            </td>
            <td>
                <div className="fittingContainer" onClick={this.openDialog}>
                    {this.getKeySkillName()}
                </div>
            </td>
        </tr>);
    }
}

/**
 * @see SingleKeySkillModule
 * @author nt
 * @since 13.06.2017
 */
export const SingleKeySkill: React.ComponentClass<SingleKeySkillLocalProps> = connect(SingleKeySkillModule.mapStateToProps, SingleKeySkillModule.mapDispatchToProps)(SingleKeySkillModule);