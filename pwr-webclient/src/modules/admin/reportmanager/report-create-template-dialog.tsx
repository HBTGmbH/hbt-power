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


interface ReportCreateTemplateLocalProps {
    open: boolean;

    onClose(): void;
}

interface ReportCreateTemplateProps {
    currentUser: string;
}

interface ReportCreateTemplateDispatch {
    loadPreview(id: string): void;

    saveTemplate(file: File, name: string, desc: string, createUser: string): void;

    renderTemplate(file: File): void;

    createTemplate(name: string, descr: string, initials: string, path: string): void;

}

interface ReportCreateTemplateState {
    fileName: string;
    tempName: string;
    tempDescription: string;
    tempInitials: string;
    tempPath: string;
    file: any;
    previewServerUrl: string;
}


class ReportCreateTemplateDialog extends React.Component<ReportCreateTemplateProps & ReportCreateTemplateLocalProps & ReportCreateTemplateDispatch, ReportCreateTemplateState> {

    static mapStateToProps(state: ApplicationState, localProps: ReportCreateTemplateLocalProps): ReportCreateTemplateProps {
        return {
            currentUser: state.adminReducer.adminName(),
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ReportCreateTemplateDispatch {
        return {
            loadPreview: (id: string) => dispatch(TemplateActionCreator.AsyncLoadPreview(id)),
            saveTemplate: (file: any, name: string, desc: string, createUser: string) => dispatch(TemplateActionCreator.AsyncUploadFileAsTemplate(file, name, desc, createUser)),
            renderTemplate: (file: any) => dispatch(TemplateActionCreator.AsyncRenderTemplatePreview(file)),
            createTemplate: (name: string, descr: string, initials: string, path: string) => dispatch(TemplateActionCreator.AsyncCreateTemplate(name, descr, initials, path)),
        };
    }


    constructor(props: ReportCreateTemplateProps
        & ReportCreateTemplateLocalProps
        & ReportCreateTemplateDispatch) {
        super(props);
        this.resetState(props);
    }

    private resetState(props: ReportCreateTemplateProps
        & ReportCreateTemplateLocalProps
        & ReportCreateTemplateDispatch) {
        this.state = {
            fileName: '',
            tempName: '',
            tempDescription: '',
            tempInitials: '',
            tempPath: '',
            file: null,
            previewServerUrl: '',
        };
    }

    private uploadTemplate = () => {
        if (this.state.file != null) {
            this.props.saveTemplate(this.state.file, this.state.tempName, this.state.tempDescription, this.props.currentUser);
            console.log('trying to upload file... ', this.state.file);
        }
    };

    private createTemplate = () => {
        console.log('Create Template');
        this.props.createTemplate(this.state.tempName, this.state.tempDescription, this.state.tempInitials, this.state.tempPath);
    };

    private renderTemplate = () => {
        if (this.state.file != null) {
            this.props.renderTemplate(this.state.file);
            console.log('trying to render file... ', this.state.file);
        }
    };

    private onInputChange = (e: any) => {
        this.setState({
            fileName: e.target.value,
            file: e.target.files[0],
        });

        this.props.renderTemplate(this.state.file);
    };

    private verifyFile = () => {
        // TODO geht wahrscheinlich besser
        return this.state.fileName.split('.')[1] == 'rptdesign';
    };

    private renderUpload = () => {
        return <div style={{padding: '2em'}}>
            {/* Für das freie Erstellen von Templates

            <Typography className={"vertical-align"}>Template hochladen</Typography>
            < Button className={""} onClick={() => {}} ><Icon>attach_file</Icon></Button>
            */}
            <input
                type={'file'}
                value={this.state.fileName}
                onChange={(e: any) => {
                    this.onInputChange(e);
                }}
            />

            {/*
                start async rendering after onChange
                - display loading bar/ circle
                - verify file type .rptdesign ??
                - if rendered and file received display the preview
            */}
            { //this.verifyFile() == false ? <div className={"vertical-align"}>Select a .rptdesing file</div> :
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
                            this.setState({tempPath: e.target.value});
                        }}
                    />

                    <Button
                        style={{marginTop: '5px'}}
                        variant={'contained'}
                        className={'vertical-align'}
                        onClick={() => {
                            this.renderTemplate();
                        }}
                    >
                        <Icon>present_to_all</Icon>
                        Render
                    </Button>

                    <Button
                        style={{marginTop: '5px'}}
                        variant={'contained'}
                        className={'vertical-align'}
                        color={'primary'}
                        onClick={() => {
                            this.uploadTemplate();
                        }}// createTemplate for old version
                    >
                        <Icon>send</Icon>
                        Upload
                    </Button>
                </div>
            }
        </div>;
    };

    private renderTemplatePreview = () => {
        return <div>
            {/*
          TODO render preview // system dafür ausdenken, axios response in den state laden und in mapstatetoprops rausladen
          TODO als html oder als docx??


          */}
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
                        {/*<Button variant={'raised'} style={{margin:"5px"}} onClick={()=>{} }><Icon>save</Icon><Icon>close</Icon></Button>
                        <Button variant={'raised'} style={{margin:"5px"}} onClick={()=>{} }><Icon className={"mui-icons"}>save</Icon></Button>*/}

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
                            <ReportPreview url={this.state.previewServerUrl}/>
                        </Paper>
                    </div>
                </div>
            </DialogContent>
        </Dialog>;
    }

}


export const CreateTemplateDialog: React.ComponentClass<ReportCreateTemplateLocalProps> = connect(ReportCreateTemplateDialog.mapStateToProps, ReportCreateTemplateDialog.mapDispatchToProps)(ReportCreateTemplateDialog);