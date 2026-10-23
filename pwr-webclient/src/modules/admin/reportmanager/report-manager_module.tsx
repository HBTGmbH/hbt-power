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
import {matchPath, RouteComponentProps, withRouter} from 'react-router-dom';
import {Paths} from '../../../Paths';
import {StringUtils} from '../../../utils/StringUtil';
import {PowerLocalize} from '../../../localization/PowerLocalizer';

interface ReportManagerProps {
    allTemplates: Array<Template>;
}

type ReportManagerLocalProps = RouteComponentProps;

interface ReportManagerDispatch {

    loadAllTemplates(): void;
}

interface ReportManagerState {
    createDialogOpen: boolean;
    previewSource: PreviewSource;
}

class ReportManagerModule extends React.Component<ReportManagerProps & ReportManagerLocalProps & ReportManagerDispatch, ReportManagerState> {

    constructor(props: ReportManagerProps & ReportManagerLocalProps & ReportManagerDispatch) {
        super(props);

        this.state = {
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

    public componentDidUpdate() {
        // A deleted or unknown template: the list without a selection
        const id = this.selectedTemplateId();
        if (id && this.props.allTemplates.length > 0 && !this.selectedTemplate()) {
            this.props.history.replace(Paths.ADMIN_TEMPLATES);
        }
    }

    /**
     * The selected template is in the URL (#211), the slug is only for reading
     */
    private selectedTemplateId = (): string | null => {
        const match = matchPath<{ templateId: string }>(this.props.location.pathname,
            {path: Paths.ADMIN_TEMPLATE, exact: true});
        return match ? match.params.templateId : null;
    };

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
        this.props.history.push(Paths.build(Paths.ADMIN_TEMPLATE,
            {templateId: template.id, slug: StringUtils.slug(template.name)}));
    };

    /**
     * Looked up by id in the loaded templates, so a change or a deletion shows right away
     */
    private selectedTemplate = (): Template => {
        const id = this.selectedTemplateId();
        return this.props.allTemplates.find(template => template.id === id);
    };

    private renderListItems = () => {
        let items: any = [];

        this.props.allTemplates.map((value, key) => {
            items.push(<ListItem key={key} button selected={value.id === this.selectedTemplateId()}
                                 onClick={() => this.selectTemplate(value)}>
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
                            <ListItemText primary={PowerLocalize.get('Action.Generate.NewTemplate')}/>
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
                                templateId={this.selectedTemplate() ? this.selectedTemplateId() : ''}
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

export const ReportManager = withRouter(connect(ReportManagerModule.mapStateToProps, ReportManagerModule.mapDispatchToProps)(ReportManagerModule));
