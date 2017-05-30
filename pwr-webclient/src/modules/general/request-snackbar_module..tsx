import * as React from 'react';
import {RequestStatus} from '../../Store';
import {CircularProgress, FontIcon, Snackbar} from 'material-ui';

interface RequestSnackbarProps {
    APIRequestStatus: RequestStatus;
}

interface RequestSnackbarState {

}

export class RequestSnackbar extends React.Component<RequestSnackbarProps, RequestSnackbarState> {

    private static renderSingleSnackbar(requestStatus: RequestStatus) {
        let msgSuccess: JSX.Element = (
            <div className="row">
                <FontIcon className="material-icons col-md-2 col-md-offset-5" style={{color: 'green', fontSize: 45}}>done</FontIcon>
            </div>
        );

        let msgFail: JSX.Element = (
            <div className="row">
                <FontIcon className="material-icons col-md-2 col-md-offset-5" style={{color: 'red', fontSize: 45}}>error</FontIcon>
            </div>
        );

        let msgPending: JSX.Element = (
            <div className="row">
                <div className="col-md-2 col-md-offset-5">
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


        return (<Snackbar open={true} message={msg}/>);
    }

    render() {
        return(<div>
            {RequestSnackbar.renderSingleSnackbar(this.props.APIRequestStatus)}
        </div>)
    }
}
