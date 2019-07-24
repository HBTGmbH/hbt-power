import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {Avatar, Button, Icon, Paper} from '@material-ui/core';
import {getProfileImageLocation} from '../../../API_CONFIG';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {NavigationActionCreator} from '../../../reducers/navigation/NavigationActionCreator';
import {Paths} from '../../../Paths';
import {ProfileAsyncActionCreator} from '../../../reducers/profile/ProfileAsyncActionCreator';
import {getRandomGreeting} from '../../../model/PwrConstants';
import {formatToFullLocalizedDateTime} from '../../../utils/DateUtil';
import {ProfileDataAsyncActionCreator} from '../../../reducers/profile-new/profile/ProfileDataAsyncActionCreator';
import {Profile} from '../../../reducers/profile-new/profile/model/Profile';

interface BaseDataDashboardElementProps {
    initials: string;
    name: string;
    lastEdited: Date;
    profile:Profile;
}

interface BaseDataDashboardElementLocalProps {

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
            initials: state.databaseReducer.loggedInUser().initials(),
            name: state.databaseReducer.loggedInUser().firstName(),
            lastEdited: state.databaseReducer.profile().lastEdited(), // TODO changed
            profile: state.profileStore.profile
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): BaseDataDashboardElementDispatch {
        return {
            requestSingleProfile: function (initials: string = 'ppp') {
                console.log("initials: ",initials);
                //dispatch(ProfileAsyncActionCreator.requestSingleProfile(initials));
                dispatch(ProfileDataAsyncActionCreator.loadFullProfile(initials));
            },
            navigateTo: target => dispatch(NavigationActionCreator.AsyncNavigateTo(target)),
        };
    }

    private handleEditButtonClick = () => {
        this.props.requestSingleProfile(this.props.initials);
        this.props.navigateTo(Paths.USER_PROFILE);
    };

    render() {
        return (
            <Paper className="dashboard-element">
                <div className="row">
                    <div className="col-md-12 vertical-align fullWidth">
                        <span style={{fontSize: '16px', fontWeight: 'bold', marginTop: '8px'}}>
                            {getRandomGreeting()} {this.props.name}!
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
                        <Button
                            variant={'contained'}
                            style={{marginTop: '8px'}}
                            color={'primary'}
                            onClick={this.handleEditButtonClick}
                        >
                            <Icon className="material-icons">edit</Icon>
                            {PowerLocalize.get('Action.Edit')}
                        </Button>
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
export const BaseDataDashboardElement: React.ComponentClass<BaseDataDashboardElementLocalProps> = connect(BaseDataDashboardElementModule.mapStateToProps, BaseDataDashboardElementModule.mapDispatchToProps)(BaseDataDashboardElementModule);