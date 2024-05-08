import {connect} from 'react-redux';
import * as React from 'react';
import {Template} from '../../../model/view/Template';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {TemplateActionCreator} from '../../../reducers/template/TemplateActionCreator';
import {ReportPreview} from './report-preview_module';
import ListItem from '@material-ui/core/ListItem/ListItem';
import Icon from '@material-ui/core/Icon/Icon';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import Divider from '@material-ui/core/Divider/Divider';
import Paper from '@material-ui/core/Paper/Paper';
import List from '@material-ui/core/List/List';
import {UploadTemplateDialog} from './report-upload-template-dialog';
import {ReportManagerInfoBox} from './report-manager-infobox_module';
import {ThunkDispatch} from 'redux-thunk';

interface ReportManagerProps {
    allTemplates: Array<Template>;
}

interface ReportManagerLocalProps {

}

interface ReportManagerDispatch {

    loadPreview(id: string): void;

    loadAllTemplates(): void;
}

interface ReportManagerState {
    selectedTemplate: Template;
    createDialogOpen: boolean;
}

class ReportManagerModule extends React.Component<ReportManagerProps & ReportManagerLocalProps & ReportManagerDispatch, ReportManagerState> {

    constructor(props: ReportManagerProps & ReportManagerLocalProps & ReportManagerDispatch) {
        super(props);

        this.state = {
            selectedTemplate: null,
            createDialogOpen: false,
        };
    }

    static mapStateToProps(state: ApplicationState): ReportManagerProps {
        return {
            allTemplates: state.templateSlice.templates.toArray()
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): ReportManagerDispatch {
        return {
            loadPreview: (id: string) => dispatch(TemplateActionCreator.AsyncLoadPreview(id)),
            loadAllTemplates: () => dispatch(TemplateActionCreator.AsyncLoadAllTemplates()),
        };
    }

    public componentDidMount() {
        if (this.props.allTemplates.length == 0) {
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

    private selectTemplate = (template: Template) => {
        this.setState({
            selectedTemplate: template,
        });
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
                    <div style={{height: 'calc(100vh - 88px)'}}>
                        <ReportPreview
                            templateId={this.state.selectedTemplate != null ? this.state.selectedTemplate.id : ''}/>
                    </div>
                </Paper>
            </div>

            <div className={'col-md-3'} style={{marginLeft: '10px'}}>
                <Paper>
                    {
                        this.state.selectedTemplate == null ? <></> :
                            <div>
                                <ReportManagerInfoBox selectedTemplate={this.state.selectedTemplate}/>
                            </div>
                    }
                </Paper>
            </div>
        </div>;
    }

}

export const ReportManager = connect(ReportManagerModule.mapStateToProps, ReportManagerModule.mapDispatchToProps)(ReportManagerModule);
