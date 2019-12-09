import * as React from 'react';
import {Template} from '../../../model/view/Template';
import Typography from '@material-ui/core/Typography/Typography';
import {InfoPaper} from '../../general/info-paper_module.';
import {PwrIconButton} from '../../general/pwr-icon-button';
import TextField from '@material-ui/core/TextField/TextField';
import ExpansionPanel from '@material-ui/core/ExpansionPanel/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails/ExpansionPanelDetails';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions/ExpansionPanelActions';
import Icon from '@material-ui/core/Icon/Icon';
import * as redux from 'redux';
import {TemplateActionCreator} from '../../../reducers/template/TemplateActionCreator';
import {ApplicationState} from '../../../reducers/reducerIndex';
import Divider from '@material-ui/core/Divider/Divider';
import {connect} from 'react-redux';

interface ReportManagerInfoLocalProps {
    selectedTemplate: Template;
}

interface ReportManagerInfoProps {
    currentUser: string;
}


interface ReportManagerInfoDispatch {
    saveChanges(template: Template): void;

    deleteTemplate(id: string): void;
}

interface ReportManagerInfoState {
    template: Template;
    edit: boolean;
}

export class ReportManagerInfoBox_Module extends React.Component<ReportManagerInfoProps & ReportManagerInfoLocalProps & ReportManagerInfoDispatch, ReportManagerInfoState> {

    constructor(props: ReportManagerInfoProps & ReportManagerInfoLocalProps & ReportManagerInfoDispatch) {
        super(props);
        this.state = {
            template: null,
            edit: false,
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: ReportManagerInfoLocalProps): ReportManagerInfoProps {
        return {
            currentUser: state.adminReducer.adminName(),
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ReportManagerInfoDispatch {
        return {
            deleteTemplate: (id: string) => dispatch(TemplateActionCreator.AsyncDeleteTemplate(id)),
            saveChanges: (template: Template) => dispatch(TemplateActionCreator.AsyncChangeTemplate(template))
        };
    }

    public componentDidUpdate(prevProps: ReportManagerInfoProps & ReportManagerInfoLocalProps & ReportManagerInfoDispatch) {
        if (this.props.selectedTemplate.id != prevProps.selectedTemplate.id || this.state.template == null) {
            this.setState({
                template: this.props.selectedTemplate,
            });
        }

    }

    private templateChanged = () => {
        return this.state.template != this.props.selectedTemplate;
    };

    private changeTemplateData = () => {
        if (this.templateChanged) {
            this.setState({
                edit: false,
            });
            this.props.saveChanges(this.state.template);
        }

    };

    private deleteTemplate = () => {
        this.props.deleteTemplate(this.props.selectedTemplate.id);
    };

    private toggleEdit = () => {
        this.setState({
            edit: !this.state.edit
        });
    };


    private handleChange = (type: string, value: string) => {
        let newTemplate: Template = Template.empty();
        newTemplate.name = this.state.template.name;
        newTemplate.description = this.state.template.description;
        newTemplate.fileId = this.state.template.fileId;
        newTemplate.previewId = this.state.template.previewId;
        newTemplate.createUser = this.state.template.createUser;
        newTemplate.createdDate = this.state.template.createdDate;
        newTemplate.id = this.state.template.id;

        switch (type) {
            case 'name':
                newTemplate.name = value;
                this.setState({template: newTemplate});
                break;
            case 'description':
                newTemplate.description = value;
                this.setState({template: newTemplate});
                break;
            case 'fileId':
                newTemplate.fileId = value;
                this.setState({template: newTemplate});
                break;
            case 'previewId':
                newTemplate.previewId = value;
                this.setState({template: newTemplate});
                break;
            case 'createUser':
                newTemplate.createUser = value;
                this.setState({template: newTemplate});
                break;
            default:
                break;
        }
    };

    render() {
        if (this.state.template == null) {
            this.setState({
                template: this.props.selectedTemplate,
            });
            return <div/>;
        }


        return <InfoPaper title={'Info'}>
            <div>

                <div className={'report-text-field'}>
                    <TextField
                        id="standard-name"
                        fullWidth
                        InputProps={{
                            readOnly: !this.state.edit,
                            disableUnderline: !this.state.edit
                        }}
                        label="Name"
                        error={this.state.template.name != this.props.selectedTemplate.name}
                        value={this.state.template != null ? this.state.template.name : this.props.selectedTemplate.name}
                        onChange={(e: any) => this.handleChange('name', e.target.value)}
                        margin="normal"
                    />
                </div>
                <div className={'report-text-field'}>
                    <TextField
                        id="description"
                        multiline
                        fullWidth
                        InputProps={{
                            readOnly: !this.state.edit,
                            disableUnderline: !this.state.edit
                        }}
                        label="Beschreibung"
                        value={this.state.template != null ? this.state.template.description : this.props.selectedTemplate.description}
                        onChange={(e: any) => this.handleChange('description', e.target.value)}
                        margin="normal"
                    />
                </div>
                <div className={'report-text-field'}>
                    <TextField
                        id="createUser"
                        fullWidth
                        InputProps={{
                            readOnly: !this.state.edit,
                            disableUnderline: !this.state.edit
                        }}
                        label="Ersteller"
                        value={this.state.template != null ? this.state.template.createUser : this.props.selectedTemplate.createUser}
                        onChange={(e: any) => this.handleChange('createUser', e.target.value)}
                        margin="normal"
                    />
                </div>
                <div className={'report-text-field'}>
                    <TextField
                        id="createdDate"
                        fullWidth
                        variant={'standard'}
                        InputProps={{
                            readOnly: true,
                            disableUnderline: true
                        }}
                        label="Datum"
                        value={this.state.template != null ? this.state.template.createdDate : this.props.selectedTemplate.createdDate}
                        margin="normal"
                    />
                </div>
                <ExpansionPanel>
                    <ExpansionPanelSummary>
                        <Icon>arrow_drop_down</Icon>
                        <Typography variant={'button'}>Advanced</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <div className={'report-text-field col-md-12'}>
                            <TextField
                                id="standard-name"
                                fullWidth
                                InputProps={{
                                    readOnly: true,
                                    disableUnderline: true,
                                }}
                                label="ID"
                                value={this.state.template != null ? this.state.template.id : this.props.selectedTemplate.id}
                                margin="normal"
                            />
                        </div>
                        <div className={'report-text-field col-md-12'}>
                            <TextField
                                id="fileId"
                                fullWidth
                                InputProps={{
                                    readOnly: !this.state.edit,
                                    disableUnderline: !this.state.edit
                                }}
                                label="fileId"
                                value={this.state.template != null ? this.state.template.fileId : this.props.selectedTemplate.fileId}
                                onChange={(e: any) => this.handleChange('fileId', e.target.value)}
                                margin="normal"
                            />
                        </div>
                        <div className={'report-text-field col-md-12'}>
                            <TextField
                                id="previewId"
                                fullWidth
                                InputProps={{
                                    readOnly: !this.state.edit,
                                    disableUnderline: !this.state.edit
                                }}
                                label="previewId"
                                value={this.state.template != null ? this.state.template.previewId : this.props.selectedTemplate.previewId}
                                onChange={(e: any) => this.handleChange('previewId', e.target.value)}
                                margin="normal"
                            />
                        </div>
                    </ExpansionPanelDetails>
                    <Divider/>
                    <ExpansionPanelActions>
                        <PwrIconButton iconName={'settings'} tooltip={'Bearbeiten'}
                                       onClick={this.toggleEdit}/>
                        <PwrIconButton iconName={'save'} tooltip={'Bestätigen'}
                                       onClick={this.changeTemplateData}/>
                        <PwrIconButton iconName={'delete'} tooltip={'Löschen'}
                                       onClick={this.deleteTemplate}/>
                    </ExpansionPanelActions>
                </ExpansionPanel>
            </div>
        </InfoPaper>;
    }
}


export const ReportManagerInfoBox: React.ComponentClass<ReportManagerInfoLocalProps> = connect(ReportManagerInfoBox_Module.mapStateToProps, ReportManagerInfoBox_Module.mapDispatchToProps)(ReportManagerInfoBox_Module);
