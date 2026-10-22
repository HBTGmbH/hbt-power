import * as React from 'react';
import {connect} from 'react-redux';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {TemplateActionCreator} from '../../../reducers/template/TemplateActionCreator';
import Dropzone from 'react-dropzone';
import CloudUpload from '@material-ui/icons/CloudUpload';
import {Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, TextField, Typography} from '@material-ui/core';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {PwrFormActions} from '../../general/pwr-form-actions';
import {PwrSpacer} from '../../general/pwr-spacer_module';
import {ThunkDispatch} from 'redux-thunk';


interface ReportUploadTemplateLocalProps {
    open: boolean;
    onClose(): void;
}

interface ReportUploadTemplateProps {
    progressPercent: number;
    pending: boolean;
}

interface ReportUploadTemplateDispatch {

    saveTemplate(file: File, name: string, desc: string): void;

}

interface ReportUploadTemplateState {
    fileName: string;
    tempName: string;
    tempDescription: string;
    file: File;
    previewTemplateId: string;
}


class ReportUploadTemplateDialog extends React.Component<ReportUploadTemplateProps & ReportUploadTemplateLocalProps & ReportUploadTemplateDispatch, ReportUploadTemplateState> {

    static mapStateToProps(state: ApplicationState, _: ReportUploadTemplateLocalProps): ReportUploadTemplateProps {
        return {
            pending: state.adminReducer.templateUploadPending,
            progressPercent: state.adminReducer.templateUploadProgress
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): ReportUploadTemplateDispatch {
        return {
            saveTemplate: (file: any, name: string, desc: string) => dispatch(TemplateActionCreator.AsyncUploadFileAsTemplate(file, name, desc)),
        };
    }


    constructor(props: ReportUploadTemplateProps
        & ReportUploadTemplateLocalProps
        & ReportUploadTemplateDispatch) {
        super(props);
        this.resetState();
    }

    private resetState() {
        this.state = {
            fileName: '',
            tempName: '',
            tempDescription: '',
            file: null,
            previewTemplateId: '',
        };
    }

    private uploadTemplate = () => {
        if (this.state.file != null) {
            console.debug('trying to upload file... ', this.state.file);
            this.props.saveTemplate(this.state.file, this.state.tempName, this.state.tempDescription);
        }
    };

    private isValidFile = (): boolean => {
        if (this.state.file) {
            return /.*\.rptdesign/.test(this.state.file.name);
        }
        return false;
    };


    private handleFileDrop = (acceptedFiles: Array<File>, _: Array<File>) => {
        if (acceptedFiles.length > 0) {
            this.setState({
                file: acceptedFiles[0]
            });
        }
    };

    private canUpload = (): boolean => {
        return this.isValidFile() && this.state.tempName.trim().length > 0 && !this.props.pending;
    };

    /**
     * A dialog like the other form dialogs (#134): drop zone, name and description, the button bar below
     */
    render() {
        return <Dialog open={this.props.open} onClose={this.props.onClose} fullWidth maxWidth={'sm'}>
            <DialogTitle>{PowerLocalize.get('TemplateUpload.Title')}</DialogTitle>
            <DialogContent>
                <Dropzone onDrop={this.handleFileDrop} multiple={false} accept=".rptdesign"
                          style={{width: '100%', minHeight: '120px', border: '2px dashed rgba(0, 0, 0, 0.3)', borderRadius: '4px', cursor: 'pointer'}}>
                    <div className="Aligner" style={{minHeight: '120px', textAlign: 'center', flexDirection: 'column'}}>
                        <CloudUpload/>
                        <Typography>
                            {this.state.file
                                ? PowerLocalize.getFormatted('TemplateUpload.SelectedFile', this.state.file.name)
                                : PowerLocalize.get('TemplateUpload.DropHint')}
                        </Typography>
                    </div>
                </Dropzone>
                {this.state.file && !this.isValidFile() &&
                <Typography color="error">{PowerLocalize.get('TemplateUpload.WrongFile')}</Typography>}
                <PwrSpacer/>
                <TextField fullWidth label={PowerLocalize.get('TemplateUpload.Name')} value={this.state.tempName}
                           onChange={(e: any) => this.setState({tempName: e.target.value})}/>
                <PwrSpacer/>
                <TextField fullWidth multiline label={PowerLocalize.get('TemplateUpload.Description')}
                           value={this.state.tempDescription}
                           onChange={(e: any) => this.setState({tempDescription: e.target.value})}/>
                {this.props.pending && <>
                    <PwrSpacer/>
                    <LinearProgress variant="determinate" value={this.props.progressPercent}/>
                </>}
            </DialogContent>
            <DialogActions>
                <PwrFormActions editing noSpace saveText={PowerLocalize.get('TemplateUpload.Upload')} saveIcon="cloud_upload"
                                saveDisabled={!this.canUpload()} onSave={this.uploadTemplate} onCancel={this.props.onClose}/>
            </DialogActions>
        </Dialog>;
    }
}


export const UploadTemplateDialog = connect(ReportUploadTemplateDialog.mapStateToProps, ReportUploadTemplateDialog.mapDispatchToProps)(ReportUploadTemplateDialog);
