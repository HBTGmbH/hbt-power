import * as React from 'react';
import {FormEvent} from 'react';
import {Collapse, Icon, IconButton, LinearProgress, TextField, Tooltip} from '@material-ui/core';
import {PwrButton} from './pwr-button';
import {PwrSpacer} from './pwr-spacer_module';

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

    /**
     * Help for filling in the field (#147): a help icon in the lower right corner of the field, which shows this
     * content below the field. Only while the field is enabled.
     */
    help?: React.ReactNode;
    helpOpenLabel?: string;
    helpCloseLabel?: string;
}

interface LimitedTextFieldState {
    errorText: string;
    helpOpen: boolean;
}

/**
 * Text field with limited input possibilites. Only available as controlled component
 */
export class LimitedTextField extends React.Component<LimitedTextFieldProps, LimitedTextFieldState> {

    constructor(props: LimitedTextFieldProps) {
        super(props);
        this.state = {
            errorText: null,
            helpOpen: false,
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

    private toggleHelp = () => {
        this.setState({helpOpen: !this.state.helpOpen});
    };

    private hasHelp(): boolean {
        return !!this.props.help && !this.props.disabled;
    }

    private renderHelpButton() {
        const label = this.state.helpOpen ? this.props.helpCloseLabel : this.props.helpOpenLabel;
        // Lower right corner, left of the resize handle of a text area
        return <div className="pwr-limited-text-field-help-button">
            <Tooltip title={label || ''}>
                <IconButton size="small" color={this.state.helpOpen ? 'primary' : 'default'} aria-label={label}
                            aria-expanded={this.state.helpOpen} onClick={this.toggleHelp}>
                    <Icon className="material-icons">{this.state.helpOpen ? 'help' : 'help_outline'}</Icon>
                </IconButton>
            </Tooltip>
        </div>;
    }

    private renderHelp() {
        return <Collapse in={this.state.helpOpen}>
            <div className="pwr-limited-text-field-help" style={{width: this.props.fullWidth ? '100%' : 256}}>
                {this.props.help}
                <PwrSpacer size="tight"/>
                <PwrButton color="primary" text={this.props.helpCloseLabel || ''} onClick={this.toggleHelp}/>
            </div>
        </Collapse>;
    }

    render() {
        // A full-width field only leaves room on the right for the toggle edit button
        const fieldWidth = this.props.fullWidth ? (this.props.useToggleEditButton ? '85%' : '100%') : 256;
        let progressBar = <React.Fragment/>
        if (!this.props.hideProgress) {
            // Below the field and as wide as it, the counter at its right end
            progressBar = <div style={{width: fieldWidth, clear: 'both', display: 'flex', alignItems: 'center'}}>
                <div style={{flex: 1}}>
                    <LinearProgress
                        variant={'determinate'}
                        value={(this.props.value.length / this.props.maxCharacters) * 100}
                    />
                </div>
                <div style={{marginLeft: '8px'}}>
                    {this.props.value.length + '/' + this.props.maxCharacters}
                </div>
            </div>
        }
        return (
            // flow-root: the box encloses its floated field, so the space around it counts (#40)
            <div style={{display: 'flow-root'}}>
                <div style={{width: this.props.fullWidth ? '100%' : 350}}>
                    <div style={{width: fieldWidth, float: 'left', position: 'relative'}}>
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
                            // Room for the help icon, so the text never runs under it
                            inputProps={this.hasHelp() ? {style: {paddingRight: 40}} : undefined}
                        />
                        {this.hasHelp() && this.renderHelpButton()}
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
                {this.hasHelp() && this.renderHelp()}
            </div>
        );
    }
}
