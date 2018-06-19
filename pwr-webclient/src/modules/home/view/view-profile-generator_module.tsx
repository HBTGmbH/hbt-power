import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {ViewProfile} from '../../../model/view/ViewProfile';
import {Card, CardActions, CardHeader, Dialog, FlatButton, FontIcon, List, ListItem, RaisedButton} from 'material-ui';
import {formatFullLocalizedDate} from '../../../utils/DateUtil';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ViewProfileDialog} from './view-profile-dialog_module';
import {ViewProfileActionCreator} from '../../../reducers/view/ViewProfileActionCreator';
import {NavigationActionCreator} from '../../../reducers/navigation/NavigationActionCreator';
import {Paths} from '../../../Paths';
import {isNullOrUndefined} from 'util';


interface ViewProfileGeneratorProps{
    open: boolean;
    viewProfiles?: ViewProfile[];

    onRequestClose() : void;
    generate(): void;
}

interface ViewProfileGeneratorState {
    activeTemplateId : number;
}

export class ViewProfileGenerator extends React.Component<ViewProfileGeneratorProps,ViewProfileGeneratorState>{

    constructor(props : ViewProfileGeneratorProps){
        super(props);
        this.resetState(props);
    }

    private resetState(props: ViewProfileGeneratorProps){
        this.state={
            activeTemplateId: null,
        }
    }

    private setTemplateId(id:number){
        this.setState(
            {activeTemplateId: id}
        )
    }

    private closeAndReset = () => {
        this.resetState(this.props);
        this.props.onRequestClose();
    };



    private renderActions = () => {
        let actions = [];
        let label = "";
        let icon = "";

        actions.push(<FlatButton
            className="mui-margin"
            primary={true}
            disabled={this.state.activeTemplateId === null}
            label={PowerLocalize.get("Action.Generate.Word")}
            onClick={this.props.generate}
            icon={<FontIcon className="material-icons">open_in_new</FontIcon>}
        />);
        actions.push(<FlatButton
            label={PowerLocalize.get("Action.Close")}
            onClick={this.props.onRequestClose}
            icon={<FontIcon className="material-icons">close</FontIcon>}
        />);

        actions.push(<FlatButton
            label={"SetActiveProfile"}
            onClick={() => this.setTemplateId(1)}
            />

        )
        return actions;
    };

            // TODO alle templates
    render() {
        return (
            <Dialog
                title={PowerLocalize.get("Generator.Title")}
                open={this.props.open}
                onRequestClose={this.closeAndReset}
                actions={this.renderActions()}
            >
                <div className="col-md-3" >
                    <h4>{PowerLocalize.get("Generator.TemplateList")}</h4>
                    <div style={{maxHeight: "80%", overflow: "auto"}}>
                        <List style={{maxHeight:'100%',  overflow: "auto"}}>
                            <ListItem title={"Template"} className={"Hallo"}>Template</ListItem>
                            <ListItem title={"Template"} className={"Hallo"}>Template</ListItem>
                            <ListItem title={"Template"} className={"Hallo"}>Template</ListItem>
                            <ListItem title={"Template"} className={"Hallo"}>Template</ListItem>
                            <ListItem title={"Template"} className={"Hallo"}>Template</ListItem>
                            <ListItem title={"Template"} className={"Hallo"}>Template</ListItem>
                            <ListItem title={"Template"} className={"Hallo"}>Template</ListItem>
                            <ListItem title={"Template"} className={"Hallo"}>Template</ListItem>
                            <ListItem title={"Template"} className={"Hallo"}>Template</ListItem>
                        </List>
                    </div>
                    <div className="fittingContainer">
                        <RaisedButton
                            className="mui-margin"
                            label={PowerLocalize.get("Generator.Template.New")}
                            icon={<FontIcon className="material-icons">add</FontIcon>}
                        />
                    </div>
                </div>
                <div className="col-md-6" color="red">
                        <h1>Preview</h1>
                    <div className="row"></div>
                </div>

            </Dialog>
        )

        // TODO weiter - mp
    }
}

