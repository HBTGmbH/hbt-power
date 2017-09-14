import * as React from 'react';
import {Dialog, FlatButton} from 'material-ui';
import {ViewProfile} from '../../../model/view/ViewProfile';
import {LimitedTextField} from '../../general/limited-text-field-module.';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {isNullOrUndefined} from 'util';

interface ViewProfileDialogProps {
    open: boolean;
    viewProfile?: ViewProfile;
    type?: "edit" | "new";

    onRequestClose(): void;
    onSave?(name: string, description: string): void;
}

interface ViewProfileDialogState {
    name: string;
    description: string;
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
            description: isNullOrUndefined(props.viewProfile) || isNullOrUndefined(props.viewProfile.viewProfileInfo.viewDescription) ? "" : props.viewProfile.viewProfileInfo.viewDescription
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

    private closeAndReset = () => {
        this.resetState(this.props);
        this.props.onRequestClose();
    };

    private closeAndSave = () => {
        if(!isNullOrUndefined(this.props.onSave)) {
            this.props.onSave(this.state.name, this.state.description);
        }
    };

    private renderActions = () => {
        let actions = [];
        let label = "";
        if(this.props.type === "edit") {
            label = PowerLocalize.get("Action.Save");
        } else {
            label = PowerLocalize.get("Action.Create");
        }
        actions.push(<FlatButton
            label={label}
            onTouchTap={this.closeAndSave}
        />);
        actions.push(<FlatButton
            label={PowerLocalize.get("Action.Close")}
            onTouchTap={this.props.onRequestClose}
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
        </Dialog>);
    }
}
