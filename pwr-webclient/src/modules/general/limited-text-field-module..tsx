import * as React from 'react';
import {FormEvent} from 'react';
import {FontIcon, IconButton, LinearProgress, TextField} from 'material-ui';

interface LimitedTextFieldProps {
    maxCharacters: number;
    value: string;
    onChange(e: FormEvent<{}>, newValue: string): void;

    /**
     * Text input disabled or not.
     */
    disabled?: boolean;

    /**
     * Error text that is displayed when too many characters are present, or the character limit is reached.
     * <code>null</code> means that no text will be displayed. Note: ""(empty string) will be displayed.
     */
    errorText?: string;

    /**
     * Default:false
     */
    multiLine?: boolean;
    /**
     * Default:false
     */
    fullWidth?: boolean;

    floatingLabelText?: string;

    /**
     * Shows the toggle edit button. Only works as controlled component. Edit button will forward the toggle request
     * via {@link LimitedTextFieldProps#onToggleEdit}. Consumers of this button will have to set {@link LimitedTextFieldProps#disabled}
     * manually.
     */
    useToggleEditButton?: boolean;

    onToggleEdit?(disabled: boolean): void;
}

interface LimitedTextFieldState {
    errorText: string;
}

/**
 * Text field with limited input possibilites. Only available as controlled component
 */
export class LimitedTextField extends React.Component<LimitedTextFieldProps, LimitedTextFieldState> {

    constructor(props: LimitedTextFieldProps) {
        super(props);
        this.state = {
            errorText: null
        };
    }

    public componentWillReceiveProps(newProps: LimitedTextFieldProps) {
        if(newProps.value.length <= newProps.maxCharacters) {
            this.setState({
                errorText: null
            });
        }
    }

    public static defaultProps: Partial<LimitedTextFieldProps> = {
        multiLine: false,
        fullWidth: false,
        errorText: '',
        floatingLabelText: null,
        useToggleEditButton: false,
        onToggleEdit: () => {},
        disabled:false
    };

    private interceptOnChange = (e: FormEvent<{}>, newValue: string) => {
        if(newValue.length > this.props.maxCharacters) {
            this.setState({
                errorText: this.props.errorText
            });
        } else {
            this.props.onChange(e, newValue);
        }
    };


    private handleEditButtonPress = (evt: any) => {
        if(this.props.disabled)
            this.props.onToggleEdit(false);
        else
            this.props.onToggleEdit(true);
    };

    render() {
        return (
            <div>
                <div style={{width: this.props.fullWidth ? '100%' : 350}}>
                    <div style={{width:this.props.fullWidth ? '85%' : 256, float:'left'}}>
                        <TextField
                            value={this.props.value}
                            disabled={this.props.disabled}
                            onChange={this.interceptOnChange}
                            multiLine={this.props.multiLine}
                            fullWidth={this.props.fullWidth}
                            errorText={this.state.errorText}
                            floatingLabelText={this.props.floatingLabelText}
                        />
                    </div>

                    {
                        this.props.useToggleEditButton ?
                            <div style={{width:this.props.fullWidth ? '15%' : 72, paddingTop: "30px", float:'left'}}>
                                <IconButton tooltip="Font Icon" onClick={this.handleEditButtonPress}>
                                    <FontIcon className="material-icons" size={72} >
                                        {this.props.disabled ? "edit" : "save"}
                                    </FontIcon>
                                </IconButton>
                            </div>
                            :
                            null
                    }
                </div>
                <div style={{width: this.props.fullWidth ? "100%" : 256}}>
                    <div style={{width:'85%', float:'left', marginTop:'7px'}}>
                        <LinearProgress mode="determinate" max={this.props.maxCharacters} value={this.props.value.length}/>
                    </div>
                    <div style={{width: '10%', float:'left'}}>
                        {this.props.value.length + '/' + this.props.maxCharacters}
                    </div>
                </div>

            </div>
        );
    }
}
