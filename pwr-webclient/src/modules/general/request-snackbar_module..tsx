import * as React from 'react';
import {RequestStatus} from '../../Store';
import {CircularProgress, Icon, Snackbar} from '@material-ui/core';

interface RequestSnackbarProps {
    APIRequestStatus: RequestStatus;
}

interface RequestSnackbarState {

}

//  (Provisorisch verbessert )Snackbox muss wieder verschwinden -mp

export class RequestSnackbar extends React.Component<RequestSnackbarProps, RequestSnackbarState> {



    private static renderSingleSnackbar(requestStatus: RequestStatus, open : boolean) {
        let msgSuccess: JSX.Element = (
            <div className="row">
                <Icon className="material-icons" style={{color: 'green', fontSize: 45}}>done</Icon>
            </div>
        );
// col-md-offset-5   col-md-2
        let msgFail: JSX.Element = (
            <div className="row">
                <Icon className="material-icons " style={{color: 'red', fontSize: 45}}>error</Icon>
            </div>
        );

        let msgPending: JSX.Element = (
            <div className="row">
                <div className="">
                    <CircularProgress size={40}/>
                </div>
            </div>
        );

        let msg: JSX.Element;
        if(requestStatus === RequestStatus.Successful) {
            msg = msgSuccess;
        } else if(requestStatus === RequestStatus.Failiure) {
            msg = msgFail;
        } else if(requestStatus === RequestStatus.Pending) {
            msg = msgPending;
        } else {
            msg =(<div/>);
        }

        return (<Snackbar open={open} autoHideDuration={300} message={msg}/>);
    }


    render() {
        return(<div>
            {RequestSnackbar.renderSingleSnackbar(this.props.APIRequestStatus, this.props.APIRequestStatus !== RequestStatus.Successful)}
        </div>)
    }
}
