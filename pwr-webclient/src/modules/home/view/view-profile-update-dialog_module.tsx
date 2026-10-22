import * as react from 'react';
import React from 'react';
import {connect} from 'react-redux';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {ViewProfileActionCreator} from '../../../reducers/view/ViewProfileActionCreator';
import {Dialog} from '@material-ui/core';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import {PwrFormActions} from '../../general/pwr-form-actions';
import {PwrSpacer} from '../../general/pwr-spacer_module';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import {ThunkDispatch} from 'redux-thunk';
import {LimitedTextField} from '../../general/limited-text-field-module';
import {PROFILE_DESCRIPTION_LENGTH} from '../../../model/PwrConstants';

interface UpdateProps {
    initials: string;
    /** Name and description of the view profile now, to start the fields with (#167) */
    currentName: string;
    currentDescription: string;
}

interface UpdateLocalProps {
    open: boolean;

    onClose(): void;

    viewProfileId: string;
}

interface UpdateState {
    name: string;
    description: string;
    keepOld: boolean;
}

interface UpdateDispatch {
    updateViewProfile(initials: string, oldId: string, newName: string, newDescription: string, keepOld: boolean): void;
}

class ViewProfileUpdateDialog_module extends react.Component<UpdateLocalProps & UpdateProps & UpdateDispatch, UpdateState> {


    constructor(props) {
        super(props);
        this.state = this.initialState(props);
    }

    private initialState(props: UpdateProps): UpdateState {
        return {
            name: props.currentName,
            description: props.currentDescription,
            keepOld: true
        };
    }

    /** Opened again: the values of the view profile, not what was typed and cancelled before */
    componentDidUpdate(prevProps: UpdateLocalProps & UpdateProps & UpdateDispatch) {
        if (this.props.open && !prevProps.open) {
            this.setState(this.initialState(this.props));
        }
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): UpdateDispatch {
        return {
            updateViewProfile: (initials, oldId, newName, newDescription, keepOld) =>
                dispatch(ViewProfileActionCreator.AsyncCreateChangedViewProfile(initials, oldId, newName, newDescription, keepOld)),
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: UpdateLocalProps): UpdateProps {
        const initials = state.profileStore.consultant.initials;
        const viewProfile = state.viewProfileSlice.viewProfiles.get(localProps.viewProfileId);
        const info = viewProfile && viewProfile.viewProfileInfo;
        return {
            initials: initials,
            currentName: (info && info.name) || '',
            currentDescription: (info && info.viewDescription) || '',
        };
    }

    private changeName = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            name: event.target.value
        });
    };
    private changeDescription = (event: any, description: string) => {
        this.setState({description});
    };

    private toggleKeepOld = () => {
        this.setState({
            keepOld: !this.state.keepOld
        });
    };

    private updateViewProfile = () => {
        this.props.onClose();
        this.props.updateViewProfile(
            this.props.initials,
            this.props.viewProfileId,
            this.state.name,
            this.state.description,
            this.state.keepOld);
    };


    render() {
        return (
            <Dialog open={this.props.open} onClose={this.props.onClose} fullWidth>
                <DialogTitle>
                    {PowerLocalize.get('ViewProfileUpdate.Title')}
                </DialogTitle>
                <DialogContent>
                    {/* Fields 16 px apart (#40) */}
                    <TextField
                        fullWidth
                        label={PowerLocalize.get('ViewProfileUpdate.NewName')}
                        value={this.state.name}
                        onChange={this.changeName}
                    />
                    <PwrSpacer/>
                    {/* Optional, multi-line like when creating a view profile (#167) */}
                    <LimitedTextField
                        fullWidth={true}
                        multiLine={true}
                        rows={4}
                        maxCharacters={PROFILE_DESCRIPTION_LENGTH}
                        label={PowerLocalize.get('ViewProfileUpdate.NewDescription')}
                        value={this.state.description}
                        onChange={this.changeDescription}
                    />
                    <PwrSpacer/>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={this.state.keepOld}
                                onChange={this.toggleKeepOld}
                                value="keepOld"
                                color="primary"
                            />
                        }
                        label={PowerLocalize.get('ViewProfileUpdate.KeepOld')}
                    />
                </DialogContent>
                <DialogActions>
                    {/* The same button bar as the forms (#41) */}
                    <PwrFormActions editing noSpace
                                    saveText={PowerLocalize.get('ViewProfileUpdate.Update')} saveIcon={'refresh'}
                                    saveDisabled={this.state.name.trim().length === 0}
                                    onSave={() => this.updateViewProfile()}
                                    onCancel={this.props.onClose}/>
                </DialogActions>
            </Dialog>
        );
    }
}

export const ViewProfileUpdateDialog: React.ComponentClass<UpdateLocalProps> = connect(ViewProfileUpdateDialog_module.mapStateToProps, ViewProfileUpdateDialog_module.mapDispatchToProps)(ViewProfileUpdateDialog_module) as any;
