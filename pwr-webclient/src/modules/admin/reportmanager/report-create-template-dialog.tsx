import * as React from "react";
import {connect} from 'react-redux';
import {ApplicationState} from '../../../reducers/reducerIndex';
import * as redux from 'redux';
import {TemplateSlice} from '../../../model/view/Template';
import {AdminActionCreator} from '../../../reducers/admin/AdminActionCreator';
import {TemplateActionCreator} from '../../../reducers/template/TemplateActionCreator';
import Dialog from '@material-ui/core/Dialog/Dialog';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import Typography from '@material-ui/core/Typography/Typography';
import Button from '@material-ui/core/Button/Button';
import AppBar from '@material-ui/core/AppBar/AppBar';
import Toolbar from '@material-ui/core/Toolbar/Toolbar';


interface ReportCreateTemplateLocalProps{
    open: boolean;
    onClose(): void;
}

interface ReportCreateTemplateProps{

}

interface ReportCreateTemplateDispatch{

}

interface ReportCreateTemplateState{

}


class ReportCreateTemplateDialog extends React.Component<ReportCreateTemplateProps  & ReportCreateTemplateLocalProps & ReportCreateTemplateDispatch, ReportCreateTemplateState> {

    static mapStateToProps(state: ApplicationState, localProps: ReportCreateTemplateLocalProps): ReportCreateTemplateProps {
        return {

        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ReportCreateTemplateDispatch {
        return {

        }
    }


    constructor(props : ReportCreateTemplateProps
        & ReportCreateTemplateLocalProps
        & ReportCreateTemplateDispatch){
        super(props);
        this.resetState(props);
    }

    private resetState(props: ReportCreateTemplateProps
        & ReportCreateTemplateLocalProps
        & ReportCreateTemplateDispatch){
        this.state={

        }
    }

    render () {
        return <Dialog
            onClose = {() => {this.props.onClose()}}
            fullScreen
            open={this.props.open}
        >
            <DialogContent>
                <AppBar style={{height:"6vh"}}>
                    <Toolbar>
                        <Button variant={'raised'} onClick={()=>{this.props.onClose()} }>Close</Button>
                        <Button variant={'raised'} onClick={()=>{} }>Speichern und Beenden</Button>
                        <Button variant={'raised'} onClick={()=>{} }>Speichern</Button>
                    </Toolbar>
                </AppBar>
                <div style={{height:'93vh', paddingTop:"6vh"}}>
                    <Typography>Hallo</Typography>

                </div>
                </DialogContent>
            </Dialog>
    }

}


export const CreateTemplateDialog: React.ComponentClass<ReportCreateTemplateLocalProps> = connect(ReportCreateTemplateDialog.mapStateToProps, ReportCreateTemplateDialog.mapDispatchToProps)(ReportCreateTemplateDialog);