import * as React from "react";
import {ApplicationState} from '../../../reducers/reducerIndex';
import * as redux from 'redux';
import {AdminActionCreator} from '../../../reducers/admin/AdminActionCreator';
import * as Immutable from "immutable";
import {ConsultantInfo} from '../../../model/ConsultantInfo';
import {Template} from '../../../model/view/Template';
import {TemplateActionCreator} from '../../../reducers/template/TemplateActionCreator';
import Paper from '@material-ui/core/Paper/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon/ListItemIcon';
import Icon from '@material-ui/core/Icon/Icon';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import Button from '@material-ui/core/Button/Button';
import Divider from '@material-ui/core/Divider/Divider';
import {PwrIconHeader} from '../../general/pwr-icon-header';
import TextField from '@material-ui/core/TextField/TextField';
import {connect} from 'react-redux';
import Typography from '@material-ui/core/Typography/Typography';



interface ReportManagerProps{
    consultantsByInitials: Immutable.Map<string, ConsultantInfo>;
    templates: Immutable.Map<string, Template>;
    allTemplates:Array<Template>;
}

interface ReportManagerLocalProps{

}

interface ReportManagerDispatch{
    refreshConsultants():void;

    refreshTemplates():void;
    deleteTemplate(id:string):void;
    createTemplate(name:string,description:string):void;
    changeTemplate(name:string,description:string):void;
}

interface ReportManagerState {
    selectedTemplate:Template;

    templateName:string;
    templateDescription:string;

}

class ReportManagerModul extends React.Component<ReportManagerProps  & ReportManagerLocalProps & ReportManagerDispatch, ReportManagerState> {

    constructor(props: ReportManagerProps & ReportManagerLocalProps & ReportManagerDispatch){
        super(props);
        this.props.refreshTemplates();
        this.state={
            selectedTemplate : null,
            templateName:"",
            templateDescription:"",
        }
    }


    static mapStateToProps(state: ApplicationState, localProps: ReportManagerLocalProps): ReportManagerProps {
        return {
            consultantsByInitials: state.adminReducer.consultantsByInitials(),
            templates: state.templateSlice.templates(),
            allTemplates: state.templateSlice.templates().toArray(),
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ReportManagerDispatch {
        return {
            refreshConsultants: () => dispatch(AdminActionCreator.AsyncGetAllConsultants()),

            refreshTemplates: () => dispatch(TemplateActionCreator.AsyncLoadAllTemplates()),
            deleteTemplate: (id:string) => dispatch(TemplateActionCreator.RemoveTemplate(id)),
            createTemplate: (name:string,description:string)=>dispatch(TemplateActionCreator.CreateTemplate(name,description)),
            changeTemplate: (name:string,description:string) => dispatch(TemplateActionCreator.ChangeTemplate(name,description)),
        }
    }

    public componentDidMount(){
        if(this.props.templates == null){
            console.log("Templates == null");
            this.props.refreshTemplates();
        }else{
            console.log("Template != null");
        }

        if(this.props.allTemplates == null){
            console.log("TemplatesArray == null");
            this.props.refreshTemplates();
        }else{
            console.log("TemplateArray != null");
            console.log("allTem: "+this.props.allTemplates.length);
        }
    }

    private selectTemplate = (newTemplate:Template) => {
        this.setState({
            selectedTemplate:newTemplate,
            templateName:newTemplate.name,
            templateDescription:newTemplate.description,
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


        if(this.props.allTemplates == null)
        {
            this.props.refreshTemplates();
            console.log("Template Refresh");
            items.push(<ListItem>Keine Templates vorhanden</ListItem>);
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

    render(){

        return <div>
            <div className={"col-md-2"} style={{height:"100%"}}>
                <Paper>
                    <List style={{margin:"3px"}}>
                        <ListItem button onClick={()=>{}}>
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
            <div className={"col-md-7"}>
                <Paper>
                    hi
                    <br/>hi
                    <br/>hi
                    <br/>hi
                    <br/>hi
                    <br/>hi
                    <br/>hi
                    <br/>hi
                    <br/>hi
                    <br/>hi
                    <br/>hi
                    <br/>hi
                    <br/>hi
                    <br/>hi
                    <br/>hi
                    <br/>hi
                    <br/>hi
                    <br/>hi
                    <br/>hi
                    <br/>hi
                    <br/>hi
                    <br/>hi
                    <br/>hi
                    <br/>hi
                    <br/>hi
                </Paper>
            </div>
            <div className={"col-md-3"}>
                <Paper>
                    <PwrIconHeader muiIconName={"info_outline"} title={"Info"}/>
                    {
                        (this.state.selectedTemplate == null) ? <></> :
                            <div>
                                <div className={"report-text-field"}>
                                    <Typography variant={'caption'}>Name</Typography>
                                    <Typography variant={'subheading'}>{this.state.selectedTemplate.name}</Typography>
                                </div>
                                <div className={"report-text-field"}>
                                    <Typography variant={'caption'}>Beschreibung</Typography>
                                    <Typography variant={'subheading'}>{this.state.selectedTemplate.description}</Typography>
                                </div>
                                <div className={"report-text-field"}>
                                    <Typography variant={'caption'}>Ersteller</Typography>
                                    <Typography variant={'subheading'}>{this.state.selectedTemplate.name}</Typography>
                                </div>
                                <div className={"report-text-field"}>
                                    <Typography variant={'caption'}>Datum</Typography>
                                    <Typography variant={'subheading'}>{this.state.selectedTemplate.name}</Typography>
                                </div>
                                <Divider/>
                                <div className={"vertical-align"} style={{margin:"5px"}}>
                                    <Button variant={'raised'} style={{width:"30%"}} onClick={() => {}} >Verändern</Button>
                                    <Button variant={'raised'} style={{width:"30%", marginLeft:"4%",marginRight:"4%"}} onClick={() => {}} >Löschen</Button>
                                    <Button variant={'raised'} style={{width:"30%"}} onClick={() => {}} color={'primary'} >Generate</Button>
                                </div>
                            </div>
                    }
                </Paper>
            </div>
        </div>
        ;
    }
}


export const ReportManager: React.ComponentClass<ReportManagerLocalProps> = connect(ReportManagerModul.mapStateToProps, ReportManagerModul.mapDispatchToProps)(ReportManagerModul);