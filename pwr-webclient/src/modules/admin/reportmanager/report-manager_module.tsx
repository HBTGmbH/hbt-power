import * as React from "react";
import {ApplicationState} from '../../../reducers/reducerIndex';
import * as redux from 'redux';
import {AdminActionCreator} from '../../../reducers/admin/AdminActionCreator';
import * as Immutable from "immutable";
import {ConsultantInfo} from '../../../model/ConsultantInfo';
import {Template, TemplateSlice} from '../../../model/view/Template';
import {TemplateActionCreator} from '../../../reducers/template/TemplateActionCreator';
import Paper from '@material-ui/core/Paper/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem/ListItem';
import Icon from '@material-ui/core/Icon/Icon';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import Button from '@material-ui/core/Button/Button';
import Divider from '@material-ui/core/Divider/Divider';
import {PwrIconHeader} from '../../general/pwr-icon-header';
import {connect} from 'react-redux';
import Typography from '@material-ui/core/Typography/Typography';
import {ReportPreviewFile} from '../../../model/view/ReportPreviewFile';
import Iframe from 'react-iframe';
import {CreateTemplateDialog} from './report-create-template-dialog';


interface ReportManagerProps{
    consultantsByInitials: Immutable.Map<string, ConsultantInfo>;
    templates: Immutable.Map<string, Template>;
    allTemplates:Array<Template>;
    previewFiles:Immutable.Map<string,ReportPreviewFile>;
}

interface ReportManagerLocalProps{

}

interface ReportManagerDispatch{
    refreshConsultants():void;

    refreshTemplates():void;
    deleteTemplate(id:string):void;
    createTemplate(name:string,description:string):void;
    changeTemplate(templateSlice:TemplateSlice):void;
    loadPreview(id:string):void;
}

interface ReportManagerState {
    selectedTemplate:Template;

    templateName:string;
    templateDescription:string;

    createDialogOpen:boolean;
}

class ReportManagerModule extends React.Component<ReportManagerProps  & ReportManagerLocalProps & ReportManagerDispatch, ReportManagerState> {

    constructor(props: ReportManagerProps & ReportManagerLocalProps & ReportManagerDispatch){
        super(props);
        this.props.refreshTemplates();
        this.state={
            selectedTemplate : null,
            templateName:"",
            templateDescription:"",
            createDialogOpen:false,
        }
    }

    static mapStateToProps(state: ApplicationState, localProps: ReportManagerLocalProps): ReportManagerProps {
        return {
            consultantsByInitials: state.adminReducer.consultantsByInitials(),
            templates: state.templateSlice.templates(),
            allTemplates: state.templateSlice.templates().toArray(),
            previewFiles: state.templateSlice.previews(),
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ReportManagerDispatch {
        return {
            refreshConsultants: () => dispatch(AdminActionCreator.AsyncGetAllConsultants()),

            refreshTemplates: () => dispatch(TemplateActionCreator.AsyncLoadAllTemplates()),
            deleteTemplate: (id:string) => dispatch(TemplateActionCreator.RemoveTemplate(id)),
            createTemplate: (name:string,description:string)=>dispatch(TemplateActionCreator.CreateTemplate(name,description,"","")),
            changeTemplate: (templateSlice:TemplateSlice) => dispatch(TemplateActionCreator.ChangeTemplate(templateSlice)),
            loadPreview: (id:string) => dispatch(TemplateActionCreator.AsyncLoadPreview(id)),
        }
    }

    public componentDidMount(){
        if(this.props.templates == null){
            console.log("Templates == null");
            this.props.refreshTemplates();
        }

        if(this.props.allTemplates == null){
            console.log("TemplatesArray == null");
            this.props.refreshTemplates();
        }
    }

    private selectTemplate = (newTemplate:Template) => {
        //this.props.loadPreview(newTemplate.id);

        this.setState({
            selectedTemplate:newTemplate,
            templateName:newTemplate.name,
            templateDescription:newTemplate.description,
        });
        this.renderPreview();
    };

    private changeTemplate(){

    }

    private openCreateTemplateDialog = () => {
        this.setState({
            createDialogOpen : true
        })
    };

    private onCloseCreateTemplateDialog(){
        this.setState({
            createDialogOpen : false
        })
    };

    private onNameChange = (event:any) => {
        this.setState({
            templateName:event.target.value,
        })
    };

    private onDescriptionChange = (event:any) => {
        this.setState({
            templateDescription:event.target.value,
        })
    };

    private renderListItems = () => {
        let items:any = [];


        if(this.props.allTemplates.length == 0)
        {
            items.push(<ListItem key = "unique">Keine Templates vorhanden</ListItem>);
        }

        this.props.allTemplates.map((template,key)=> {
           items.push(
               <ListItem key={key} button onClick={() => this.selectTemplate(template)}>
                   <ListItemText primary={template.name} secondary={template.createdDate+"  |  "+template.createUser}/>
               </ListItem>
           );
        });
            return items;
    };

    private renderPreview = () => {
        let result: string = "http://www.hbt.de"; // TODO preview html fertig machen

        if (this.state.selectedTemplate != null
            && this.state.selectedTemplate.previewUrl != ""
            && this.state.selectedTemplate.previewUrl != null) {

            result = this.state.selectedTemplate.previewUrl;
        }

        return <div style={{height:'calc(100vh - 88px)'}}>
            <Iframe
                url={result}
                position={"relative"}
            />
        </div>
    };

    // TODO localize
    render(){
        return <div style={{height:"100%"}}>
            <CreateTemplateDialog
                open={ this.state.createDialogOpen}
                onClose={() => this.onCloseCreateTemplateDialog()}
            />

            <div className={"col-md-2"} style={{height:"100%"}}>
                <Paper>
                    <List>
                        <ListItem button onClick={()=>{this.openCreateTemplateDialog()}}>
                            <Icon className={"material-icons"}>add</Icon>
                            <ListItemText primary={"Neues Template"}/>
                        </ListItem>
                        <Divider/>
                        {
                            this.renderListItems()
                        }
                    </List>
                </Paper>
            </div>
            <div className={"col-md-7"} style={{height:"100%"}}>
                <Paper style={{height:"100%"}}>
                    {this.renderPreview()}
                </Paper>
            </div>
            <div className={"col-md-3"}>
                <Paper>
                    <PwrIconHeader muiIconName={"info_outline"} title={"Info"}/>
                    {
                        (this.state.selectedTemplate == null) ? <></> :
                            <div>
                                <div className={"report-text-field"}>
                                    <Typography variant={'body2'}>Name</Typography>
                                    <Typography variant={'subheading'}>{this.state.selectedTemplate.name}</Typography>
                                </div>
                                <div className={"report-text-field"}>
                                    <Typography variant={'body2'}>Beschreibung</Typography>
                                    <Typography variant={'subheading'}>{this.state.selectedTemplate.description}</Typography>
                                </div>
                                <div className={"report-text-field"}>
                                    <Typography variant={'body2'}>Ersteller</Typography>
                                    <Typography variant={'subheading'}>{this.state.selectedTemplate.createUser}</Typography>
                                </div>
                                <div className={"report-text-field"}>
                                    <Typography variant={'body2'}>Datum</Typography>
                                    <Typography variant={'subheading'}>{this.state.selectedTemplate.createdDate}</Typography>
                                </div>
                                <div className={"report-text-field"}>
                                    <Typography variant={'body2'}>Preview - Path</Typography>
                                    <Typography variant={'subheading'}>{this.state.selectedTemplate.previewUrl}</Typography>
                                </div>
                                <div className={"report-text-field"}>
                                    <Typography variant={'body2'}>Id</Typography>
                                    <Typography variant={'subheading'}>{this.state.selectedTemplate.id}</Typography>
                                </div>

                                <Divider/>
                                <div className={"vertical-align row"} style={{paddingTop:"5px",paddingBottom:"5px"}}>
                                    <Button className={"vertical-align"} variant={'raised'} onClick={() => {this.openCreateTemplateDialog()}} >Bearbeiten</Button>
                                    <Button className={"vertical-align"} variant={'raised'} onClick={() => {}} color={'primary'} >Generate</Button>
                                </div>
                            </div>
                    }
                </Paper>
            </div>
        </div>
        ;
    }
}

export const ReportManager: React.ComponentClass<ReportManagerLocalProps> = connect(ReportManagerModule.mapStateToProps, ReportManagerModule.mapDispatchToProps)(ReportManagerModule);