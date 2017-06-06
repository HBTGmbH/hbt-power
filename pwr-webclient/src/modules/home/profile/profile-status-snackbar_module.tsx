import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState, RequestStatus} from '../../../Store';
import {RequestSnackbar} from '../../general/request-snackbar_module.';

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
            APIRequestStatus: state.databaseReducer.APIRequestStatus()
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : ProfileSnackbarDispatch {
        return {

        }
    }

    render() {
        return(<RequestSnackbar APIRequestStatus={this.props.APIRequestStatus}/>)
    }
}

export const ProfileSnackbar: React.ComponentClass<ProfileSnackbarLocalProps> = connect(ProfileSnackbarModule.mapStateToProps, ProfileSnackbarModule.mapDispatchToProps)(ProfileSnackbarModule);