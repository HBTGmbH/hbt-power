import * as React from 'react';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {TemplateActionCreator} from '../../../reducers/template/TemplateActionCreator';
import * as redux from 'redux';
import {TemplateSlice} from '../../../model/view/Template';
import Dialog from '@material-ui/core/Dialog/Dialog';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import Icon from '@material-ui/core/Icon/Icon';
import Button from '@material-ui/core/Button/Button';
import TextField from '@material-ui/core/TextField/TextField';
import {PwrIconButton} from '../../general/pwr-icon-button';
import {connect} from 'react-redux';

interface ReportManagerEditDialogProps {
    currentUser: string;
}


interface ReportManagerEditLocalProps {
    open: boolean;

    onClose():void;

    templateId: string;
}
interface ReportManagerEditDialogDispatch {
    deleteTemplate(id: string): void;

    changeTemplate(templateSlice: TemplateSlice): void;
}

interface ReportManagerEditDialogState {
    tempName:string;
    tempDescription:string;
}

class ReportManagerEditDialog_Module extends React.Component<ReportManagerEditDialogProps & ReportManagerEditLocalProps & ReportManagerEditDialogDispatch, ReportManagerEditDialogState> {

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ReportManagerEditDialogDispatch {
        return {
            deleteTemplate: (id: string) => dispatch(TemplateActionCreator.AsyncDeleteTemplate(id)),
            changeTemplate: (templateSlice: TemplateSlice) => dispatch(TemplateActionCreator.AsyncChangeTemplate(templateSlice)),
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: ReportManagerEditLocalProps): ReportManagerEditDialogProps {
        return {
            currentUser: state.adminReducer.adminName(),
        };
    }

    private changeTemplate  = () => {
        this.props.changeTemplate(new TemplateSlice(this.props.templateId,this.state.tempName,this.state.tempDescription,"tst"));
        this.props.onClose();
    };

    private deleteTemplate = () => {
        this.props.deleteTemplate(this.props.templateId);
        this.props.onClose();
    };

    render() {
        return (<Dialog open={this.props.open} fullWidth onClose={this.props.onClose}>
            <DialogContent>
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
                        <Button
                            style={{marginTop: '10px'}}
                            variant={'contained'}
                            className={'vertical-align'}
                            color={'primary'}
                            onClick={() => {
                                this.changeTemplate();
                            }}
                        >
                            <Icon>send</Icon>
                            Upload
                        </Button>
                    </div>
                    <div className={'Aligner'}>
                        <PwrIconButton iconName={"delete"} tooltip={"Löschen"} onClick={this.deleteTemplate} isDeleteButton />
                    </div>
                </div>
            </DialogContent>
        </Dialog>);
    }
}



export const ReportManagerEditDialog: React.ComponentClass<ReportManagerEditLocalProps> = connect(ReportManagerEditDialog_Module.mapStateToProps, ReportManagerEditDialog_Module.mapDispatchToProps)(ReportManagerEditDialog_Module);