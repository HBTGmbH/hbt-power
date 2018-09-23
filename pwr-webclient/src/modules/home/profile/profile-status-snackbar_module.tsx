import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {CircularProgress} from '@material-ui/core';

interface ProfileSnackbarProps {
    requestPending: boolean;
}


class ProfileSnackbarModule extends React.Component<ProfileSnackbarProps , {}> {

    static mapStateToProps(state: ApplicationState, localProps: {}) : ProfileSnackbarProps {
        return {
            requestPending: state.crossCutting.requestPending()
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>) : {} {
        return {

        }
    }


    render() {
        if (this.props.requestPending) {
            return(<div className="refresh-indicator">
                <CircularProgress size={90}/>
            </div>)
        }
        return <div/>
    }
}

export const ProfileSnackbar: React.ComponentClass<{}> = connect(ProfileSnackbarModule.mapStateToProps, ProfileSnackbarModule.mapDispatchToProps)(ProfileSnackbarModule);