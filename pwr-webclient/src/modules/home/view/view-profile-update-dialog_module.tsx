import * as react from 'react';
import React from 'react';
import {connect} from 'react-redux';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {ViewProfileActionCreator} from '../../../reducers/view/ViewProfileActionCreator';
import {Dialog} from '@material-ui/core';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import {PwrButton} from '../../general/pwr-button';
import {PwrSpacer} from '../../general/pwr-spacer_module';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import {ThunkDispatch} from 'redux-thunk';

interface UpdateProps {
    initials: string;
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
        this.state = {
            name: '',
            description: '',
            keepOld: true
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): UpdateDispatch {
        return {
            updateViewProfile: (initials, oldId, newName, newDescription, keepOld) =>
                dispatch(ViewProfileActionCreator.AsyncCreateChangedViewProfile(initials, oldId, newName, newDescription, keepOld)),
        };
    }

    static mapStateToProps(state: ApplicationState): UpdateProps {
        const initials = state.profileStore.consultant.initials;
        return {
            initials: initials,
        };
    }

    private changeName = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            name: event.target.value
        });
    };
    private changeDescription = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            description: event.target.value
        });
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
            <Dialog open={this.props.open} onClose={this.props.onClose}>
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
                    <TextField
                        fullWidth
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
                    <PwrButton color={'primary'} text={PowerLocalize.get('Action.Cancel')} onClick={this.props.onClose}/>
                    <PwrButton variant={'contained'} color={'primary'} text={PowerLocalize.get('ViewProfileUpdate.Update')}
                               onClick={() => this.updateViewProfile()}
                               disabled={this.state.name.length === 0 || this.state.description.length === 0}/>
                </DialogActions>
            </Dialog>
        );
    }
}

export const ViewProfileUpdateDialog: React.ComponentClass<UpdateLocalProps> = connect(ViewProfileUpdateDialog_module.mapStateToProps, ViewProfileUpdateDialog_module.mapDispatchToProps)(ViewProfileUpdateDialog_module) as any;
