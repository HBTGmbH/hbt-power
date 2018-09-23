import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import * as Immutable from 'immutable';
import {ProfileElementType} from '../../../../../Store';
import {NameEntity} from '../../../../../model/NameEntity';
import {KeySkillEntry} from '../../../../../model/KeySkillEntry';
import {NameEntityUtil} from '../../../../../utils/NameEntityUtil';
import {ProfileActionCreator} from '../../../../../reducers/profile/ProfileActionCreator';
import {ProfileStore} from '../../../../../model/ProfileStore';
import {isNullOrUndefined} from 'util';
import {Dialog, IconButton} from '@material-ui/core';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import TextField from '@material-ui/core/TextField/TextField';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import Typography from '@material-ui/core/Typography/Typography';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link KeySkillDialog.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface KeySkillDialogProps {
    keySkills: Immutable.Map<string, NameEntity>;
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link KeySkillDialogProps} and will then be
 * managed by redux.
 */
interface KeySkillDialogLocalProps {
    open: boolean;
    keySkillEntry: KeySkillEntry;
    requestClose(): void;
}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface KeySkillDialogLocalState {
    keySkillEntry: KeySkillEntry;
    autoCompleteValue: string;
}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface KeySkillDialogDispatch {
    saveEntry(entry: KeySkillEntry, nameEntity: NameEntity): void;
}

class KeySkillDialogModule extends React.Component<
    KeySkillDialogProps
    & KeySkillDialogLocalProps
    & KeySkillDialogDispatch, KeySkillDialogLocalState> {

    constructor(props: KeySkillDialogProps & KeySkillDialogLocalProps & KeySkillDialogDispatch) {
        super(props);
        this.state = {
            keySkillEntry: props.keySkillEntry,
            autoCompleteValue: NameEntityUtil.getNullTolerantName(props.keySkillEntry.nameEntityId(), props.keySkills)
        }
    }

    static mapStateToProps(state: ApplicationState, localProps: KeySkillDialogLocalProps): KeySkillDialogProps {
        return {
            keySkills: state.databaseReducer.keySkills()
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): KeySkillDialogDispatch {
        return {
            saveEntry: (entry, nameEntity) => dispatch(ProfileActionCreator.saveEntry(entry, nameEntity, ProfileElementType.KeySkill))
        }
    }

    private closeDialog = () => {
        this.props.requestClose();
    };

    private handleAutoCompleteInput = (value: string) => {
        this.setState({
            autoCompleteValue: value
        })
    };

    private saveAndExit = () => {
        let name: string = this.state.autoCompleteValue;
        let keySkill: NameEntity = ProfileStore.findNameEntityByName(name, this.props.keySkills);
        let keySkillEntry: KeySkillEntry = this.state.keySkillEntry;
        if(isNullOrUndefined(keySkill)) {
            keySkill = NameEntity.createNew(name);
        }
        keySkillEntry = keySkillEntry.nameEntityId(keySkill.id());
        this.props.saveEntry(keySkillEntry, keySkill);
        this.closeDialog();
    };


    private resetAndExit = () => {
        this.closeDialog();
    };

    render() {
        return (<Dialog
                open={this.props.open}
                onClose={this.closeDialog}
                title={PowerLocalize.get('KeySkillEntry.Dialog.Title')}
                fullWidth
            >
            <DialogTitle>
                <Typography >{PowerLocalize.get('KeySkillEntry.Dialog.Title')}</Typography>
            </DialogTitle>
            <DialogContent>
            <div className="row">
                <div className="col-md-5 col-sm-6 col-md-offset-1 col-sm-offset-0">
                    {/*TODO <AutoComplete
                        label={PowerLocalize.get('KeySkillEntry.Dialog.KeySkillName')}
                        id={'KeySkillEntry.Dialog.KeySkillName  ' + this.props.keySkillEntry.id()}
                        value={this.state.autoCompleteValue}
                        searchText={this.state.autoCompleteValue}
                        dataSource={this.props.keySkills.map(NameEntityUtil.mapToName).toArray()}
                        onUpdateInput={this.handleAutoCompleteInput}
                        onNewRequest={this.handleAutoCompleteInput}
                        filter={AutoComplete.fuzzyFilter}
                    />*/}
                    <TextField
                        label={PowerLocalize.get('KeySkillEntry.Dialog.KeySkillName')}
                        id={'KeySkillEntry.Dialog.KeySkillName  ' + this.props.keySkillEntry.id()}
                        value={this.state.autoCompleteValue}
                        onChange={(e:any) => {this.handleAutoCompleteInput(e.target.value)}}
                    />
                </div>
            </div>
            </DialogContent>
            <DialogActions>
                <Tooltip title={PowerLocalize.get('Action.Save')}><IconButton className="material-icons icon-size-20" onClick={this.saveAndExit} >save</IconButton></Tooltip>
                <Tooltip title={PowerLocalize.get('Action.Exit')}><IconButton className="material-icons icon-size-20" onClick={this.resetAndExit} >close</IconButton></Tooltip>
            </DialogActions>
        </Dialog>);
    }
}

/**
 * @see KeySkillDialogModule
 * @author nt
 * @since 13.06.2017
 */
export const KeySkillDialog: React.ComponentClass<KeySkillDialogLocalProps> = connect(KeySkillDialogModule.mapStateToProps, KeySkillDialogModule.mapDispatchToProps)(KeySkillDialogModule);