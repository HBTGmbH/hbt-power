import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {Avatar, Paper} from '@material-ui/core';
import {getProfileImageLocation} from '../../../API_CONFIG';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {NavigationActionCreator} from '../../../reducers/navigation/NavigationActionCreator';
import {Paths} from '../../../Paths';
import {getRandomGreeting} from '../../../model/PwrConstants';
import {formatToFullLocalizedDateTime} from '../../../utils/DateUtil';
import {ProfileDataAsyncActionCreator} from '../../../reducers/profile-new/profile/ProfileDataAsyncActionCreator';
import {Profile} from '../../../reducers/profile-new/profile/model/Profile';
import {PwrRaisedButton} from '../../general/pwr-raised-button';
import Edit from '@material-ui/icons/Edit';
import {ThunkDispatch} from 'redux-thunk';

interface BaseDataDashboardElementProps {
    initials: string;
    name: string;
    lastEdited: Date;
    profile: Profile;
}

interface BaseDataDashboardElementLocalProps {
    greeting: string;
}

interface BaseDataDashboardElementLocalState {

}

interface BaseDataDashboardElementDispatch {
    requestSingleProfile(initials: string): void;

    navigateTo(target: string): void;
}

class BaseDataDashboardElementModule extends React.Component<BaseDataDashboardElementProps & BaseDataDashboardElementLocalProps & BaseDataDashboardElementDispatch, BaseDataDashboardElementLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: BaseDataDashboardElementLocalProps): BaseDataDashboardElementProps {
        return {
            initials: state.profileStore.consultant.initials,
            name: state.profileStore.consultant.firstName,
            lastEdited: new Date(state.profileStore.profile.lastEdited),
            profile: state.profileStore.profile
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): BaseDataDashboardElementDispatch {
        return {
            requestSingleProfile: function (initials: string = 'n/a') {
                dispatch(ProfileDataAsyncActionCreator.loadFullProfile(initials));
            },
            navigateTo: target => dispatch(NavigationActionCreator.AsyncNavigateTo(target)),
        };
    }

    private handleEditButtonClick = () => {
        //this.props.requestSingleProfile(this.props.initials);
        this.props.navigateTo(Paths.USER_PROFILE);
    };

    render() {
        return (
            <Paper className="dashboard-element">
                <div className="row">
                    <div className="col-md-12 vertical-align fullWidth">
                        <span style={{fontSize: '16px', fontWeight: 'bold', marginTop: '8px'}}>
                            {this.props.greeting} {this.props.name}!
                        </span>
                    </div>
                    <div className="col-md-12 vertical-align fullWidth">
                        <Avatar sizes={'80'} src={getProfileImageLocation(this.props.initials)}/>
                    </div>
                    <div className="col-md-12 vertical-align fullWidth" style={{marginTop: '8px'}}>
                        {PowerLocalize.get('Overview.Base.LastEdited')}
                    </div>
                    <div className="col-md-12 vertical-align fullWidth" style={{marginTop: '8px'}}>
                        {formatToFullLocalizedDateTime(this.props.lastEdited)}
                    </div>
                    <div className="col-md-12 vertical-align fullWidth">
                        <PwrRaisedButton color={'primary'} icon={<Edit/>} text={PowerLocalize.get('Profile.BaseData.Edit')}
                                         onClick={this.handleEditButtonClick}/>
                    </div>
                </div>
            </Paper>);
    }
}

/**
 * @see BaseDataDashboardElementModule
 * @author nt
 * @since 27.09.2017
 */
export const BaseDataDashboardElement = connect(BaseDataDashboardElementModule.mapStateToProps, BaseDataDashboardElementModule.mapDispatchToProps)(BaseDataDashboardElementModule);
