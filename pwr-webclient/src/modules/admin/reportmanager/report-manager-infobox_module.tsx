import {TextField} from '@material-ui/core';
import * as React from 'react';
import {Template} from '../../../model/view/Template';
import {InfoPaper} from '../../general/info-paper_module.';
import {PwrFormActions} from '../../general/pwr-form-actions';
import {PwrSpacer} from '../../general/pwr-spacer_module';
import {TemplateActionCreator} from '../../../reducers/template/TemplateActionCreator';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {connect} from 'react-redux';
import {ThunkDispatch} from 'redux-thunk';

interface ReportManagerInfoLocalProps {
    selectedTemplate: Template;
}

interface ReportManagerInfoProps {
}


interface ReportManagerInfoDispatch {
    saveChanges(template: Template): void;

    deleteTemplate(id: string): void;
}

interface ReportManagerInfoState {
    template: Template | null;
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

    static mapStateToProps(_: ApplicationState, __: ReportManagerInfoLocalProps): ReportManagerInfoProps {
        return {};
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): ReportManagerInfoDispatch {
        return {
            deleteTemplate: (id: string) => dispatch(TemplateActionCreator.AsyncDeleteTemplate(id)),
            saveChanges: (template: Template) => dispatch(TemplateActionCreator.AsyncChangeTemplate(template))
        };
    }

    public componentDidUpdate(prevProps: ReportManagerInfoProps & ReportManagerInfoLocalProps & ReportManagerInfoDispatch) {
        if (this.props.selectedTemplate.id != prevProps.selectedTemplate.id || this.state.template === null) {
            this.setState({
                template: this.props.selectedTemplate,
            });
        }

    }

    private templateChanged = () => {
        return this.state.template != this.props.selectedTemplate;
    };

    private changeTemplateData = () => {
        if (this.templateChanged()) {
            this.setState({
                edit: false,
            });
            this.props.saveChanges(this.state.template);
        }

    };

    private deleteTemplate = () => {
        this.props.deleteTemplate(this.props.selectedTemplate.id);
    };

    private beginEdit = () => {
        this.setState({edit: true});
    };

    private cancelEdit = () => {
        this.setState({template: this.props.selectedTemplate, edit: false});
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
            case 'createUser':
                newTemplate.createUser = value;
                this.setState({template: newTemplate});
                break;
            default:
                break;
        }
    };

    render() {
        if (!this.state.template) {
            this.setState({
                template: this.props.selectedTemplate,
            });
            return <div/>;
        }


        return <InfoPaper title={'Info'}>
            <div>

                <TextField
                    id="standard-name"
                    fullWidth
                    InputProps={{
                        readOnly: !this.state.edit,
                        disableUnderline: !this.state.edit
                    }}
                    label="Name"
                    error={this.state.template.name != this.props.selectedTemplate.name}
                    value={this.state.template.name}
                    onChange={(e: any) => this.handleChange('name', e.target.value)}
                />
                <PwrSpacer/>
                <TextField
                    id="description"
                    multiline
                    rows={4}
                    fullWidth
                    InputProps={{
                        readOnly: !this.state.edit,
                        disableUnderline: !this.state.edit
                    }}
                    label="Beschreibung"
                    value={this.state.template.description}
                    onChange={(e: any) => this.handleChange('description', e.target.value)}
                />
                <PwrSpacer/>
                <TextField
                    id="createUser"
                    fullWidth
                    InputProps={{
                        readOnly: !this.state.edit,
                        disableUnderline: !this.state.edit
                    }}
                    label="Ersteller"
                    value={this.state.template.createUser}
                    onChange={(e: any) => this.handleChange('createUser', e.target.value)}
                />
                <PwrSpacer/>
                <TextField
                    id="createdDate"
                    fullWidth
                    InputProps={{
                        readOnly: true,
                        disableUnderline: true
                    }}
                    label="Datum"
                    value={this.state.template.createdDate}
                />
                {/* No technical ids (#111): the template id is only used in URLs, fileId points to the BIRT file and
                    must not be edited by hand, previewId is a leftover of stored previews */}
                <PwrFormActions editing={this.state.edit}
                                onEdit={this.beginEdit}
                                onSave={this.changeTemplateData}
                                onCancel={this.cancelEdit}
                                onDelete={this.deleteTemplate}/>
            </div>
        </InfoPaper>;
    }
}


export const ReportManagerInfoBox = connect(ReportManagerInfoBox_Module.mapStateToProps, ReportManagerInfoBox_Module.mapDispatchToProps)(ReportManagerInfoBox_Module);
