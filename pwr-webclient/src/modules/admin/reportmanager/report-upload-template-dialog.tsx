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
import Dropzone from 'react-dropzone';
import {isNullOrUndefined} from 'util';
import CloudUpload from '@material-ui/icons/CloudUpload';
import {LinearProgress} from '@material-ui/core';


interface ReportUploadTemplateLocalProps {
    open: boolean;

    onClose(): void;
}

interface ReportUploadTemplateProps {
    currentUser: string;
    progressPercent: number;
    pending: boolean;
}

interface ReportUploadTemplateDispatch {

    saveTemplate(file: File, name: string, desc: string, createUser: string): void;

}

interface ReportUploadTemplateState {
    fileName: string;
    tempName: string;
    tempDescription: string;
    tempInitials: string;
    file: File;
    previewTemplateId: string;
}


class ReportUploadTemplateDialog extends React.Component<ReportUploadTemplateProps & ReportUploadTemplateLocalProps & ReportUploadTemplateDispatch, ReportUploadTemplateState> {

    static mapStateToProps(state: ApplicationState, localProps: ReportUploadTemplateLocalProps): ReportUploadTemplateProps {
        return {
            currentUser: state.adminReducer.adminName(),
            pending: state.adminReducer.templateUploadPending(),
            progressPercent: state.adminReducer.templateUploadProgress()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ReportUploadTemplateDispatch {
        return {
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
            console.debug('trying to upload file... ', this.state.file);
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

    private isValidFile = (): boolean => {
        if (this.state.file) {
            return /.*\.rptdesign/.test(this.state.file.name);
        }
        return false;
    };

    private dropZoneClassNames = (isDragActive: boolean) => {
        let classes = ['dropzone'];
        if (isDragActive) {
            classes.push('dropzone--isActive');
        }
        return classes.join(' ');
    };

    private handleFileDrop = (acceptedFiles: Array<File>, rejectedFiles: Array<File>) => {
        if (acceptedFiles.length > 0) {
            this.setState({
                file: acceptedFiles[0]
            });
        }
    };

    private Progress = () => this.props.pending ?
        <LinearProgress variant="determinate" value={this.props.progressPercent}/> : <></>;

    private renderUpload = () => {
        return <div style={{padding: '2em'}} className={'Report-Uploader'}>
            <Typography className={'vertical-align'}>Template hochladen</Typography>
            <div className="Report-Uploader">
                <div style={{width: '100%'}}>
                    <div className="Aligner">
                        <Dropzone
                            onDrop={this.handleFileDrop}
                            multiple={false}
                            accept=".rptdesign"
                        >
                            <div className="Aligner" style={{height: '100%', textAlign: 'center'}}>
                                {!isNullOrUndefined(this.state.file) ?
                                    <span>
                                        Selected File:<br/>
                                        {this.state.file.name}
                                    </span> :
                                    <div className="Aligner"><CloudUpload/></div>}
                            </div>
                        </Dropzone>
                    </div>
                </div>
            </div>
            {this.isValidFile() == false ? <div className={'row'}>Select a .rptdesing file</div> :
                <div>
                    <div className={'Aligner'}>
                        <TextField
                            label={'Name'}
                            onChange={(e: any) => {
                                this.setState({tempName: e.target.value});
                            }
                            }
                        />
                    </div>
                    <div className={'Aligner'}>
                        <TextField
                            label={'Description'}
                            onChange={(e: any) => {
                                this.setState({tempDescription: e.target.value});
                            }
                            }
                        />
                    </div>
                    <div className={'Aligner'}>
                        <TextField
                            label={'Initials'}
                            onChange={(e: any) => {
                                this.setState({tempInitials: e.target.value});
                            }}
                        />
                    </div>

                    <div className={'Aligner'}>
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
                </div>
            }
            <div>
                <this.Progress/>
            </div>

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
                        <Button variant={'contained'} style={{margin: '5px'}} onClick={() => {
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

                </div>

            </DialogContent>
        </Dialog>;
    }
}


export const UploadTemplateDialog: React.ComponentClass<ReportUploadTemplateLocalProps> = connect(ReportUploadTemplateDialog.mapStateToProps, ReportUploadTemplateDialog.mapDispatchToProps)(ReportUploadTemplateDialog);
