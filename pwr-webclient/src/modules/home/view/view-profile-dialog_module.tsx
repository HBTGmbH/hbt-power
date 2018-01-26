import * as React from 'react';
import {Dialog, FlatButton, FontIcon, Slider, TextField} from 'material-ui';
import {ViewProfile} from '../../../model/view/ViewProfile';
import {LimitedTextField} from '../../general/limited-text-field-module';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {isNullOrUndefined} from 'util';

interface ViewProfileDialogProps {
    open: boolean;
    viewProfile?: ViewProfile;
    type?: "edit" | "new";

    onRequestClose(): void;
    onSave?(name: string, description: string, charsPerLine: number): void;
}

interface ViewProfileDialogState {
    name: string;
    description: string;
    charsPerLine: number;
    locale: string;
}

export class ViewProfileDialog extends React.Component<ViewProfileDialogProps, ViewProfileDialogState> {

    public static defaultProps: Partial<ViewProfileDialogProps> = {
        type: "edit"
    };

    constructor(props: ViewProfileDialogProps) {
        super(props);
        this.resetState(props);
    }

    private resetState = (props: ViewProfileDialogProps) => {
        this.state = {
            name: isNullOrUndefined(props.viewProfile) || isNullOrUndefined(props.viewProfile.viewProfileInfo.name) ? "" : props.viewProfile.viewProfileInfo.name,
            description: isNullOrUndefined(props.viewProfile) || isNullOrUndefined(props.viewProfile.viewProfileInfo.viewDescription) ? "" : props.viewProfile.viewProfileInfo.viewDescription,
            charsPerLine: isNullOrUndefined(props.viewProfile) || isNullOrUndefined(props.viewProfile.viewProfileInfo.charsPerLine) ? 45 : props.viewProfile.viewProfileInfo.charsPerLine,
            locale: isNullOrUndefined(props.viewProfile) || isNullOrUndefined(props.viewProfile.locale) ? "deu": props.viewProfile.locale
        }
    };

    private setField = (field: string, value: any) => {
        let obj = {};
        obj[field] = value;
        this.setState(obj);
    };

    private changeName = (e: any, name: string) => {
        this.setField("name", name);
    };

    private changeDescription = (e: any, description: string) => {
        this.setField("description", description)
    };

    private changeCharsPerLine = (e: any, charsPerLine: number) => {
        this.setField("charsPerLine", charsPerLine);
    };

    private changeLocale = (e: any, locale: string) => {
        this.setField("locale", locale);
    };

    private closeAndReset = () => {
        this.resetState(this.props);
        this.props.onRequestClose();
    };

    private closeAndSave = () => {
        if(!isNullOrUndefined(this.props.onSave)) {
            this.props.onSave(this.state.name, this.state.description, this.state.charsPerLine);
        }
    };

    private renderActions = () => {
        let actions = [];
        let label = "";
        let icon = "";
        if(this.props.type === "edit") {
            label = PowerLocalize.get("Action.Save");
            icon = "save";
        } else {
            label = PowerLocalize.get("Action.Create");
            icon = "add";
        }
        actions.push(<FlatButton
            primary={true}
            label={label}
            onClick={this.closeAndSave}
            icon={<FontIcon className="material-icons">{icon}</FontIcon>}
        />);
        actions.push(<FlatButton
            label={PowerLocalize.get("Action.Close")}
            onClick={this.props.onRequestClose}
            icon={<FontIcon className="material-icons">close</FontIcon>}
        />);
        return actions;
    };

    private renderTitle = () => {
        if(this.props.type === "edit") {
            return PowerLocalize.get("ViewProfileDialog.Title.Edit");
        } else {
            return PowerLocalize.get("ViewProfileDialog.Title.Create");
        }
    };

    render() {
        return (<Dialog
            title={this.renderTitle()}
            open={this.props.open}
            onRequestClose={this.closeAndReset}
            actions={this.renderActions()}
        >
            <LimitedTextField onChange={this.changeName}
                              maxCharacters={250}
                              value={this.state.name}
                              fullWidth={true}
                              floatingLabelText={PowerLocalize.get("ViewProfileDialog.Name")}
            />
            <LimitedTextField onChange={this.changeDescription}
                              maxCharacters={500}
                              value={this.state.description}
                              fullWidth={true}
                              multiLine={true}
                              floatingLabelText={PowerLocalize.get("ViewProfileDialog.Description")}
            />
            <TextField onChange={this.changeLocale}
                       value={this.state.locale}
                       floatingLabelText={PowerLocalize.get("ViewProfileDialog.Locale")}
                       disabled={this.props.type === "edit"}
            />
            <div style={{width: "100%"}}>
                <TextField
                    value={this.state.charsPerLine}
                    floatingLabelText={PowerLocalize.get("ViewProfileDialog.CharsPerLine")}
                    disabled={true}
                />
                <Slider
                    value={this.state.charsPerLine}
                    min={10}
                    step={1}
                    max={99}
                    onChange={this.changeCharsPerLine}
                />
            </div>
        </Dialog>);
    }
}
