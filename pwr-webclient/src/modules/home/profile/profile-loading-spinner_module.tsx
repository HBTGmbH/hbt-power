import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {PwrLoadingButton} from '../../general/pwr-loading-button_module';

interface ProfileSnackbarProps {
    requestPending: boolean;
}


class LoadingSpinnerModule extends React.Component<ProfileSnackbarProps, {}> {

    static mapStateToProps(state: ApplicationState, localProps: {}): ProfileSnackbarProps {
        return {
            requestPending: state.crossCutting.requestPending()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): {} {
        return {};
    }


    render() {
        if (this.props.requestPending) {
            return <div className="refresh-indicator"><PwrLoadingButton loading={true} iconName={'save'}/></div>;
        }
        return <div/>;
    }
}

export const ProfileLoadingSpinner: React.ComponentClass<{}> = connect(LoadingSpinnerModule.mapStateToProps, LoadingSpinnerModule.mapDispatchToProps)(LoadingSpinnerModule);