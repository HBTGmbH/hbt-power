import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {ViewProfile} from '../../../model/view/ViewProfile';
import {
    Dialog,
    Button,
    Icon,
    List,
    ListItem,
} from '@material-ui/core';
import {formatFullLocalizedDate} from '../../../utils/DateUtil';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ViewProfileActionCreator} from '../../../reducers/view/ViewProfileActionCreator';
import {Template} from '../../../model/view/Template';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';


interface ViewProfileGeneratorProps{
    viewProfile?: ViewProfile;
    template?: Template;
    allTemplates?: Array<Template>;

}

interface ViewProfileGeneratorLocalProps{
    open: boolean;
    viewProfileId : string;
    onClose() : void;

}
interface ViewProfileGeneratorState {
    activeTemplateId : string;
    activeTemplateNumber: number;
}


interface ViewProfileGeneratorDispatch{
    generate(viewProfileId: string, templateId: string) : void;
}

class ViewProfileGenerator extends React.Component<
    ViewProfileGeneratorProps
    & ViewProfileGeneratorLocalProps
    & ViewProfileGeneratorDispatch,
    ViewProfileGeneratorState>{

    static mapStateToProps(state: ApplicationState, localProps: ViewProfileGeneratorLocalProps): ViewProfileGeneratorProps {
        return{
            viewProfile: state.viewProfileSlice.viewProfiles().get(localProps.viewProfileId),
            allTemplates: state.templateSlice.templates().toArray(),
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ViewProfileGeneratorDispatch {
        return {
            generate: (viewProfileId, templateId) => dispatch(ViewProfileActionCreator.AsyncGenerateDocX(viewProfileId, templateId)),
        };
    }

    constructor(props : ViewProfileGeneratorProps
        & ViewProfileGeneratorLocalProps
        & ViewProfileGeneratorDispatch){
        super(props);
        this.resetState(props);
    }

    private resetState(props: ViewProfileGeneratorProps
        & ViewProfileGeneratorLocalProps
        & ViewProfileGeneratorDispatch){
        this.state={
            activeTemplateId : "",
            activeTemplateNumber: -1,
        }
    }

    private setTemplateId(id: string,localNumber : number){
        this.setState(
            {
                activeTemplateId: id,
                activeTemplateNumber: localNumber,
            }
        )
    }

    private closeAndReset = () => {
        this.resetState(this.props);
        this.props.onClose();
    };



    private renderActions = () => {
        let actions = [];
        let label = "";
        let icon = "";

        // New Template
        actions.push(<Button
            variant={'flat'}
            className="mui-margin"
            color={'primary'}
            //onClick={}
        >
            <Icon className="material-icons">add</Icon>
            {PowerLocalize.get("Action.Generate.NewTemplate")}</Button>);
        // Generate
        actions.push(<Button
            variant={'raised'}
            className="mui-margin"
            color={'primary'}
            disabled={this.state.activeTemplateId === ""}
            onClick={() => this.props.generate(this.props.viewProfileId, this.state.activeTemplateId)}
        >
            <Icon className="material-icons">open_in_new</Icon>
            {PowerLocalize.get("Action.Generate.Word")}</Button>);
        // Close
        actions.push(<Button
            onClick={this.props.onClose}
        >
            <Icon className="material-icons">close</Icon>
            {PowerLocalize.get("Action.Close")}
            </Button>);
        return actions;
    };

    private renderListItems = () => {
        let items = [];
        let label = "";

        // TODO localize
        if (this.props.allTemplates.length === 0){
            items.push(
                <p key={"noTemp"}> Keine Templates vorhanden.</p>
            )
        }
        // TODO bessere schleife
        for (let i = 0; i < this.props.allTemplates.length; i++){
            let temp = this.props.allTemplates[i];
            items.push(
                <ListItem title={temp.name} className={"Template"} key={"TempalteItem_" + i} onClick={() => this.setTemplateId(temp.id,i)}>
                    {temp.name}
                </ListItem>
            );
        }
        return items;
    }


    // TODO neues Template erstellen anzeigen / Dialog o.ä.
    render() {
        return (
            <Dialog
                title={PowerLocalize.get("Generator.Title")}
                open={this.props.open}
                onClose={this.closeAndReset}
            >
                <div className="col-md-4">
                    <h4 className="row">{PowerLocalize.get("Generator.TemplateList")}</h4>
                    <div className="row" style={{ maxHeight: 300, overflow: 'auto' }}>
                        <List>
                            {this.renderListItems()}
                        </List>
                    </div>
                </div>
                <div className="col-md-6" color="red">
                    <h4> {this.state.activeTemplateId !== "" ? this.props.allTemplates[this.state.activeTemplateNumber].name : " "}</h4>
                    <div style={{height: '60%'}}>
                        {this.state.activeTemplateId !== "" ? this.props.allTemplates[this.state.activeTemplateNumber].description : PowerLocalize.get("Generator.DescriptionPlaceholder")}
                    </div>
                    <div>
                        <hr/>
                        {this.state.activeTemplateId !== "" ? this.props.allTemplates[this.state.activeTemplateNumber].createUser + "  |  " : " "}
                        {this.state.activeTemplateId !== "" ? this.props.allTemplates[this.state.activeTemplateNumber].createdDate : " "}
                    </div>
                </div>

                <DialogActions>{this.renderActions()}</DialogActions>
            </Dialog>
        )
    }
}

export const ProfileGenerator: React.ComponentClass<ViewProfileGeneratorLocalProps> = connect(ViewProfileGenerator.mapStateToProps, ViewProfileGenerator.mapDispatchToProps)(ViewProfileGenerator);