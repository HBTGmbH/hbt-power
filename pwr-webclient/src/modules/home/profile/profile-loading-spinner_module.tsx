import {connect} from 'react-redux';
import * as React from 'react';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {PwrLoadingButton} from '../../general/pwr-loading-button_module';
import {ThunkDispatch} from 'redux-thunk';

interface ProfileSnackbarProps {
    requestPending: boolean;
}


class LoadingSpinnerModule extends React.Component<ProfileSnackbarProps, {}> {

    static mapStateToProps(state: ApplicationState, localProps: {}): ProfileSnackbarProps {
        return {
            requestPending: state.crossCutting.requestPending
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): {} {
        return {};
    }


    render() {
        if (this.props.requestPending) {
            return <div className="refresh-indicator"><PwrLoadingButton loading={true} iconName={'save'}/></div>;
        }
        return <div/>;
    }
}

export const ProfileLoadingSpinner = connect(LoadingSpinnerModule.mapStateToProps, LoadingSpinnerModule.mapDispatchToProps)(LoadingSpinnerModule);
