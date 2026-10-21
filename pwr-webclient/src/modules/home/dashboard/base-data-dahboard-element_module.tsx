import {connect} from 'react-redux';
import * as React from 'react';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {Paper, Tooltip} from '@material-ui/core';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {NavigationActionCreator} from '../../../reducers/navigation/NavigationActionCreator';
import {Paths} from '../../../Paths';
import {formatToFullLocalizedDateTime, formatToRelativeTime} from '../../../utils/DateUtil';
import {PwrRaisedButton} from '../../general/pwr-raised-button';
import Edit from '@material-ui/icons/Edit';
import {ThunkDispatch} from 'redux-thunk';
import {PwrProfilePicture} from '../../general/pwr-profile-picture';
import {withRouter} from 'react-router-dom';

interface BaseDataDashboardElementProps {
    profilePictureId: string;
    name: string;
    lastEdited: Date;
}

interface BaseDataDashboardElementLocalProps {
    greeting: string;
    match?: any; // From react-router
}
interface BaseDataDashboardElementDispatch {
    navigateTo(target: string): void;
}

class BaseDataDashboardElementModule extends React.Component<BaseDataDashboardElementProps & BaseDataDashboardElementLocalProps & BaseDataDashboardElementDispatch, {}> {

    static mapStateToProps(state: ApplicationState): BaseDataDashboardElementProps {
        return {
            name: state.profileStore.consultant.firstName,
            lastEdited: new Date(state.profileStore.consultant.profileLastUpdated),
            profilePictureId: state.profileStore.consultant.profilePictureId
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): BaseDataDashboardElementDispatch {
        return {
            navigateTo: target => dispatch(NavigationActionCreator.AsyncNavigateTo(target)),
        };
    }

    private handleEditButtonClick = () => {
        const initials = this.props.match.params.initials;
        this.props.navigateTo(Paths.build(Paths.USER_PROFILE, {initials}));
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
                        <PwrProfilePicture pictureId={this.props.profilePictureId}/>
                    </div>
                    <div className="col-md-12 vertical-align fullWidth" style={{marginTop: '8px'}}>
                        {PowerLocalize.get('Overview.Base.LastEdited')}
                    </div>
                    {/* Fuzzy time for how up to date the profile is (#139), the exact time in the tooltip */}
                    <div className="col-md-12 vertical-align fullWidth" style={{marginTop: '8px'}}>
                        <Tooltip title={formatToFullLocalizedDateTime(this.props.lastEdited)}>
                            <span>{formatToRelativeTime(this.props.lastEdited)}</span>
                        </Tooltip>
                    </div>
                    <div className="col-md-12 vertical-align fullWidth">
                        <PwrRaisedButton color={'primary'} icon={<Edit/>} text={PowerLocalize.get('Profile.BaseData.Edit')}
                                         onClick={this.handleEditButtonClick}/>
                    </div>
                </div>
            </Paper>);
    }
}

const WithRouterComponent = withRouter((props: any) => <BaseDataDashboardElementModule {...props}/>);

/**
 * @see BaseDataDashboardElementModule
 * @author nt
 * @since 27.09.2017
 */
export const BaseDataDashboardElement = connect(BaseDataDashboardElementModule.mapStateToProps, BaseDataDashboardElementModule.mapDispatchToProps)(WithRouterComponent);
