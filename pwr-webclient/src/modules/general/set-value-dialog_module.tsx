import * as React from 'react';
import {Dialog, Button, TextField} from '@material-ui/core';
import {PowerLocalize} from '../../localization/PowerLocalizer';

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
        label: ""
    };

    constructor(props: SetValueDialogProps) {
        super(props);
        this.state = {
            value: ""
        }
    }

    private invokeOk = () => {
        this.props.onOk(this.state.value);
        this.setState({
            value: ""
        });
    }

    render() {
        return (<Dialog
            open={this.props.open}
            onClose={this.props.onClose}
            actions={[
                <Button
                    variant={'flat'}
                    color={'primary'}
                    label={PowerLocalize.get('Action.OK')}
                    onClick={this.invokeOk}

                />,
                <Button
                    variant={'flat'}
                    secondary={true}
                    label={PowerLocalize.get('Action.Close')}
                    onClick={this.props.onClose}
                />
            ]}
        >
            <TextField
                label={this.props.label}
                onChange={(e) => this.setState({value: e.target.value})}
                value={this.state.value}
            />
        </Dialog>);
    }
}
