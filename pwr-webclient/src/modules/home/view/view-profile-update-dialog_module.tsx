import * as react from 'react';
import React from 'react';
import * as redux from 'redux';
import {connect} from 'react-redux';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {ViewProfileActionCreator} from '../../../reducers/view/ViewProfileActionCreator';
import {Dialog} from '@material-ui/core';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

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

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): UpdateDispatch {
        return {
            updateViewProfile: (initials, oldId, newName, newDescription, keepOld) =>
                dispatch(ViewProfileActionCreator.AsyncCreateChangedViewProfile(initials, oldId, newName, newDescription, keepOld)),
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: UpdateLocalProps): UpdateProps {
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
                    ViewProfile mit den neuen Daten aktualisieren!
                </DialogTitle>
                <DialogContent>
                    <TextField
                        className={'col-md-12'}
                        variant={'outlined'}
                        placeholder={'Neuer Name'}
                        value={this.state.name}
                        onChange={this.changeName}
                    />
                    <TextField
                        className={'col-md-12'}
                        variant={'outlined'}
                        placeholder={'Neue Beschreibung'}
                        value={this.state.description}
                        onChange={this.changeDescription}
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={this.state.keepOld}
                                onChange={this.toggleKeepOld}
                                value="keepOld"
                                color="primary"
                            />
                        }
                        label="Dieses ViewProfil behalten"
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        variant={'contained'}
                        color={'primary'}
                        onClick={() => this.updateViewProfile()}
                        disabled={this.state.name.length == 0 || this.state.description.length == 0}
                    >Confirm</Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export const ViewProfileUpdateDialog: React.ComponentClass<UpdateLocalProps> = connect(ViewProfileUpdateDialog_module.mapStateToProps, ViewProfileUpdateDialog_module.mapDispatchToProps)(ViewProfileUpdateDialog_module);
