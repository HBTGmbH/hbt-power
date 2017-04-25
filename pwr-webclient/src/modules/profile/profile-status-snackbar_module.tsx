
import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState, RequestStatus} from '../../Store';
import {CircularProgress, FontIcon, Snackbar} from 'material-ui';

interface ProfileSnackbarProps {
    APIRequestStatus: RequestStatus;
}

/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for disply, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface ProfileSnackbarLocalProps {

}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface ProfileSnackbarLocalState {

}

interface ProfileSnackbarDispatch {

}

class ProfileSnackbarModule extends React.Component<ProfileSnackbarProps & ProfileSnackbarLocalProps & ProfileSnackbarDispatch, ProfileSnackbarLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: ProfileSnackbarLocalProps) : ProfileSnackbarProps {
        return {
            APIRequestStatus: state.databaseReducer.APIRequestStatus
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : ProfileSnackbarDispatch {
        return {

        }
    }

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
        }


        return (<Snackbar open={true} message={msg}/>);
    }

    render() {
        return(<div>
            {ProfileSnackbarModule.renderSingleSnackbar(this.props.APIRequestStatus)}
        </div>)
    }
}

export const ProfileSnackbar: React.ComponentClass<ProfileSnackbarLocalProps> = connect(ProfileSnackbarModule.mapStateToProps, ProfileSnackbarModule.mapDispatchToProps)(ProfileSnackbarModule);