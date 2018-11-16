import * as React from 'react';
import {Button, Dialog, DialogContent, DialogTitle, TextField} from '@material-ui/core';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';

interface SetValueDialogProps {
    open: boolean;

    onClose(): void;

    onOk(value: string): void;

    label?: string;
}

interface SetValueDialogState {
    value: string;
}

export class SetValueDialog extends React.Component<SetValueDialogProps, SetValueDialogState> {

    public static defaultProps: Partial<SetValueDialogProps> = {
        label: ''
    };

    constructor(props: SetValueDialogProps) {
        super(props);
        this.state = {
            value: ''
        };
    }

    private invokeOk = () => {
        this.props.onOk(this.state.value);
        this.setState({
            value: ''
        });
    };

    render() {
        return (<Dialog
            open={this.props.open}
            onClose={this.props.onClose}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title">{this.props.label}</DialogTitle>
            <DialogContent>
                <TextField
                    label={this.props.label}
                    onChange={(e) => this.setState({value: e.target.value})}
                    value={this.state.value}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    variant={'flat'}
                    color={'primary'}
                    onClick={this.invokeOk}

                >
                    {PowerLocalize.get('Action.OK')}
                </Button>
                <Button
                    variant={'flat'}
                    color={'secondary'}
                    onClick={this.props.onClose}
                >{PowerLocalize.get('Action.Close')}</Button>
            </DialogActions>
        </Dialog>);
    }
}
