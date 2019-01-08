import * as React from 'react';
import {connect} from 'react-redux';
import {ApplicationState} from '../../../reducers/reducerIndex';
import * as redux from 'redux';
import {TemplateActionCreator} from '../../../reducers/template/TemplateActionCreator';
import Dialog from '@material-ui/core/Dialog/Dialog';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import Typography from '@material-ui/core/Typography/Typography';
import Button from '@material-ui/core/Button/Button';
import AppBar from '@material-ui/core/AppBar/AppBar';
import Toolbar from '@material-ui/core/Toolbar/Toolbar';
import Icon from '@material-ui/core/Icon/Icon';
import Paper from '@material-ui/core/Paper/Paper';
import TextField from '@material-ui/core/TextField/TextField';
import {ReportPreview} from './report-preview_module';


interface ReportUploadTemplateLocalProps {
    open: boolean;

    onClose(): void;
}

interface ReportUploadTemplateProps {
    currentUser: string;
}

interface ReportUploadTemplateDispatch {
    loadPreview(id: string): void;

    saveTemplate(file: File, name: string, desc: string, createUser: string): void;

}

interface ReportUploadTemplateState {
    fileName: string;
    tempName: string;
    tempDescription: string;
    tempInitials: string;
    file: any;
    previewTemplateId: string;
}


class ReportUploadTemplateDialog extends React.Component<ReportUploadTemplateProps & ReportUploadTemplateLocalProps & ReportUploadTemplateDispatch, ReportUploadTemplateState> {

    static mapStateToProps(state: ApplicationState, localProps: ReportUploadTemplateLocalProps): ReportUploadTemplateProps {
        return {
            currentUser: state.adminReducer.adminName(),
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ReportUploadTemplateDispatch {
        return {
            loadPreview: (id: string) => dispatch(TemplateActionCreator.AsyncLoadPreview(id)),
            saveTemplate: (file: any, name: string, desc: string, createUser: string) => dispatch(TemplateActionCreator.AsyncUploadFileAsTemplate(file, name, desc, createUser)),
        };
    }


    constructor(props: ReportUploadTemplateProps
        & ReportUploadTemplateLocalProps
        & ReportUploadTemplateDispatch) {
        super(props);
        this.resetState(props);
    }

    private resetState(props: ReportUploadTemplateProps
        & ReportUploadTemplateLocalProps
        & ReportUploadTemplateDispatch) {
        this.state = {
            fileName: '',
            tempName: '',
            tempDescription: '',
            tempInitials: '',
            file: null,
            previewTemplateId: '',
        };
    }

    private uploadTemplate = () => {
        if (this.state.file != null) {
            console.log('trying to upload file... ', this.state.file);
            this.props.saveTemplate(this.state.file, this.state.tempName, this.state.tempDescription, this.props.currentUser);
        }
    };

    private renderTemplate = () => {
        if (this.state.file != null) {
            //this.props.renderTemplate(this.state.file);
            //console.log('trying to render file... ', this.state.file);
        }
    };

    private onInputChange = (e: any) => {
        this.setState({
            fileName: e.target.value,
            file: e.target.files[0],
        });

        //this.props.renderTemplate(this.state.file);
    };

    private verifyFile = () => {
        // TODO geht wahrscheinlich besser
        return this.state.fileName.split('.')[1] == 'rptdesign';
    };

    private renderUpload = () => {
        return <div style={{padding: '2em'}}>
            <Typography className={'vertical-align'}>Template hochladen</Typography>
            <input
                type={'file'}
                value={this.state.fileName}
                onChange={(e: any) => {
                    this.onInputChange(e);
                }}
            />

            {this.verifyFile() == false ? <div className={'row'}>Select a .rptdesing file</div> :
                <div>
                    <TextField
                        label={'Name'}
                        onChange={(e: any) => {
                            this.setState({tempName: e.target.value});
                        }
                        }
                    />
                    <TextField
                        label={'Description'}
                        onChange={(e: any) => {
                            this.setState({tempDescription: e.target.value});
                        }
                        }
                    />
                    <TextField
                        label={'Initials'}
                        onChange={(e: any) => {
                            this.setState({tempInitials: e.target.value});
                        }}
                    />

                    <Button
                        style={{marginTop: '10px'}}
                        variant={'contained'}
                        className={'vertical-align'}
                        color={'primary'}
                        onClick={() => {
                            this.uploadTemplate();
                        }}
                    >
                        <Icon>send</Icon>
                        Upload
                    </Button>
                </div>
            }
        </div>;
    };

    render() {
        return <Dialog
            onClose={() => {
                this.props.onClose();
            }}
            fullScreen
            open={this.props.open}
        >
            <DialogContent>
                <AppBar style={{height: '60px'}}>
                    <Toolbar>
                        <Button variant={'raised'} style={{margin: '5px'}} onClick={() => {
                            this.props.onClose();
                        }}><Icon>close</Icon></Button>
                        <Typography variant={'body1'} style={{marginLeft: '5em'}}
                                    color={'textSecondary'}> {this.state.tempName}</Typography>
                    </Toolbar>
                </AppBar>
                <div style={{height: 'calc(100vh - 60px)', paddingTop: '60px'}}>
                    <div className={'col-md-3'}>
                        <Paper>
                            {this.renderUpload()}
                        </Paper>
                    </div>
                    <div className={'col-md-6'}>
                        <Paper>
                            <ReportPreview templateId={this.state.previewTemplateId}/>
                        </Paper>
                    </div>
                </div>
            </DialogContent>
        </Dialog>;
    }
}


export const UploadTemplateDialog: React.ComponentClass<ReportUploadTemplateLocalProps> = connect(ReportUploadTemplateDialog.mapStateToProps, ReportUploadTemplateDialog.mapDispatchToProps)(ReportUploadTemplateDialog);