import * as React from 'react';
import {Dialog, FlatButton, TextField} from 'material-ui';
import {PowerLocalize} from '../../localization/PowerLocalizer';

interface SetValueDialogProps {
    open: boolean;
    onRequestClose(): void;
    onOk(value: string): void;
    floatingLabelText?: string;
}

interface SetValueDialogState {
    value: string;
}

export class SetValueDialog extends React.Component<SetValueDialogProps, SetValueDialogState> {

    public static defaultProps: Partial<SetValueDialogProps> = {
        floatingLabelText: ""
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
            onRequestClose={this.props.onRequestClose}
            actions={[
                <FlatButton
                    primary={true}
                    label={PowerLocalize.get('Action.OK')}
                    onClick={this.invokeOk}

                />,
                <FlatButton
                    secondary={true}
                    label={PowerLocalize.get('Action.Close')}
                    onClick={this.props.onRequestClose}
                />
            ]}
        >
            <TextField
                floatingLabelText={this.props.floatingLabelText}
                onChange={(e, v) => this.setState({value: v})}
                value={this.state.value}
            />
        </Dialog>);
    }
}
