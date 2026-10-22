import {Divider, Icon, List, ListItem, ListItemText, Paper} from '@material-ui/core';
import {connect} from 'react-redux';
import * as React from 'react';
import {Template} from '../../../model/view/Template';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {TemplateActionCreator} from '../../../reducers/template/TemplateActionCreator';
import {ReportPreview} from './report-preview_module';
import {PreviewSource, ReportPreviewSource} from './report-preview-source_module';
import {UploadTemplateDialog} from './report-upload-template-dialog';
import {ReportManagerInfoBox} from './report-manager-infobox_module';
import {ThunkDispatch} from 'redux-thunk';

interface ReportManagerProps {
    allTemplates: Array<Template>;
}

interface ReportManagerLocalProps {

}

interface ReportManagerDispatch {

    loadAllTemplates(): void;
}

interface ReportManagerState {
    selectedTemplateId: string;
    createDialogOpen: boolean;
    previewSource: PreviewSource;
}

class ReportManagerModule extends React.Component<ReportManagerProps & ReportManagerLocalProps & ReportManagerDispatch, ReportManagerState> {

    constructor(props: ReportManagerProps & ReportManagerLocalProps & ReportManagerDispatch) {
        super(props);

        this.state = {
            selectedTemplateId: null,
            createDialogOpen: false,
            previewSource: {initials: '', viewProfileId: ''},
        };
    }

    static mapStateToProps(state: ApplicationState): ReportManagerProps {
        return {
            allTemplates: state.templateSlice.templates.toArray()
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): ReportManagerDispatch {
        return {
            loadAllTemplates: () => dispatch(TemplateActionCreator.AsyncLoadAllTemplates()),
        };
    }

    public componentDidMount() {
        if (this.props.allTemplates.length === 0) {
            this.props.loadAllTemplates();
        }
    }

    private onCreateDialogOpen = () => {
        this.setState({
            createDialogOpen: true,
        });
    };

    private onCreateDialogClose = () => {
        this.setState({
            createDialogOpen: false,
        });
    };

    private setPreviewSource = (previewSource: PreviewSource) => {
        this.setState({previewSource});
    };

    private selectTemplate = (template: Template) => {
        this.setState({
            selectedTemplateId: template.id,
        });
    };

    /**
     * Looked up by id in the loaded templates, so a change or a deletion shows right away
     */
    private selectedTemplate = (): Template => {
        return this.props.allTemplates.find(template => template.id === this.state.selectedTemplateId);
    };

    private renderListItems = () => {
        let items: any = [];

        this.props.allTemplates.map((value, key) => {
            items.push(<ListItem key={key} button onClick={() => this.selectTemplate(value)}>
                <ListItemText
                    style={{fontSize: '1rem'}}
                    primary={value.name}
                    secondary={value.createdDate + '  |  ' + value.createUser}/>
            </ListItem>);
        });

        return items;
    };

    render() {
        return <div>
            <UploadTemplateDialog
                open={this.state.createDialogOpen}
                onClose={() => this.onCreateDialogClose()}
            />

            <div className={'col-md-2'} style={{height: '100%'}}>
                <Paper style={{height: 'calc(100vh - 88px)'}}>
                    <List>
                        <ListItem button onClick={() => {
                            this.onCreateDialogOpen();
                        }}>
                            <Icon className={'material-icons'}>add</Icon>
                            <ListItemText primary={'Neues Template'}/>
                        </ListItem>
                    </List>
                    <Divider/>
                    <List style={{height: 'calc(100vh - 88px)', overflowY: 'auto'}}>
                        {
                            this.renderListItems()
                        }
                    </List>
                </Paper>
            </div>

            <div className={'col-md-6'} style={{height: '100%'}}>
                <Paper style={{height: '100%'}}>
                    {/* Consultant and view profile whose data the preview shows, the preview fills the rest */}
                    <div style={{height: 'calc(100vh - 88px)', display: 'flex', flexDirection: 'column'}}>
                        <ReportPreviewSource value={this.state.previewSource} onChange={this.setPreviewSource}/>
                        <div style={{flex: 1, minHeight: 0}}>
                            <ReportPreview
                                templateId={this.selectedTemplate() ? this.state.selectedTemplateId : ''}
                                initials={this.state.previewSource.initials}
                                viewProfileId={this.state.previewSource.viewProfileId}/>
                        </div>
                    </div>
                </Paper>
            </div>

            <div className={'col-md-3'} style={{marginLeft: '10px'}}>
                <Paper>
                    {
                        !this.selectedTemplate() ? <></> :
                            <div>
                                <ReportManagerInfoBox selectedTemplate={this.selectedTemplate()}/>
                            </div>
                    }
                </Paper>
            </div>
        </div>;
    }

}

export const ReportManager = connect(ReportManagerModule.mapStateToProps, ReportManagerModule.mapDispatchToProps)(ReportManagerModule);
