import * as React from 'react';
import TextField, {TextFieldProps} from '@material-ui/core/TextField';
import {StringUtils} from '../../utils/StringUtil';

export interface PwrInputFieldProps {
    onValueChange?(value: string): void;
}

export class PwrInputField extends React.PureComponent<PwrInputFieldProps & TextFieldProps> {

    private changeHandler = () => {
        if (!this.props.onValueChange) {
            // no change handler, we need to return undefined so materia-ui doesnt accidently switch from controlled
            // to uncontrolled mode
            return undefined;
        }
        return (event) => this.props.onValueChange(event.target.value);
    };

    render() {
        const props = {...this.props};
        // Delete custom props
        delete props.onValueChange;
        let value = this.props.value;
        // Again. We need to make sure not to overwrite an undefined value with a defined one
        // material UI treats undefined value as control logic, which turns the component into an uncontrolled component
        if (value !== undefined && !value) {
            value = '';
        }
        return <TextField {...props} value={value} onChange={this.changeHandler()}>
            {this.props.children}
        </TextField>;
    }
}
