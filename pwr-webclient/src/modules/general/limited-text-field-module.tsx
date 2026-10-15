import * as React from 'react';
import {FormEvent} from 'react';
import {Icon, IconButton, LinearProgress, TextField} from '@material-ui/core';

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

    overrideErrorText?: string;

    /**
     * Default:false
     */
    multiLine?: boolean;
    /**
     * Default:false
     */
    fullWidth?: boolean;

    label?: string;

    /**
     * Shows the toggle edit button. Only works as controlled component. Edit button will forward the toggle request
     * via {@link LimitedTextFieldProps#onToggleEdit}. Consumers of this button will have to set {@link LimitedTextFieldProps#disabled}
     * manually.
     */
    useToggleEditButton?: boolean;

    onToggleEdit?(disabled: boolean): void;

    id?: string;

    rows?: number;

    hideProgress?: boolean;

    className?: string;
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
        if (!(newProps.overrideErrorText) && (newProps.value.length <= newProps.maxCharacters)) {
            this.setState({
                errorText: null
            });
        }
    }

    public static defaultProps: Partial<LimitedTextFieldProps> = {
        multiLine: false,
        fullWidth: false,
        errorText: '',
        label: null,
        useToggleEditButton: false,
        onToggleEdit: () => {
        },
        disabled: false,
        rows: 1,
        hideProgress: false,
    };

    private interceptOnChange = (e: any) => {
        let newString: string = e.target.value.substring(0, this.props.maxCharacters);
        this.props.onChange(e, newString);
    };


    private handleEditButtonPress = () => {
        if (this.props.disabled)
            this.props.onToggleEdit(false);
        else
            this.props.onToggleEdit(true);
    };

    render() {
        let progressBar = <React.Fragment/>
        if (!this.props.hideProgress) {
            progressBar = <div style={{width: this.props.fullWidth ? '100%' : 256}}>
                <div style={{width: '85%', float: 'left', marginTop: '7px'}}>
                    <LinearProgress
                        variant={'determinate'}
                        value={(this.props.value.length / this.props.maxCharacters) * 100}
                    />
                </div>
                <div style={{width: '10%', float: 'left'}}>
                    {this.props.value.length + '/' + this.props.maxCharacters}
                </div>
            </div>
        }
        return (
            <div>
                <div style={{width: this.props.fullWidth ? '100%' : 350}}>
                    <div style={{width: this.props.fullWidth ? '85%' : 256, float: 'left'}}>
                        <TextField
                            className={this.props.className}
                            rows={this.props.rows}
                            id={this.props.id}
                            value={(this.state.errorText !== null) ? this.state.errorText : this.props.value}
                            disabled={this.props.disabled}
                            onChange={this.interceptOnChange}
                            multiline={this.props.multiLine}
                            fullWidth={this.props.fullWidth}
                            error={this.state.errorText !== null}
                            label={this.props.label}
                        />
                    </div>

                    {
                        this.props.useToggleEditButton ?
                            <div style={{width: this.props.fullWidth ? '15%' : 72, paddingTop: '30px', float: 'left'}}>
                                <IconButton
                                    onClick={this.handleEditButtonPress}>
                                    <Icon className="material-icons icon-size-70">
                                        {this.props.disabled ? 'edit' : 'save'}
                                    </Icon>
                                </IconButton>
                            </div>
                            :
                            null
                    }
                </div>
                {progressBar}
            </div>
        );
    }
}
