import * as React from 'react';
import {Paper} from '@material-ui/core';
import {useParams} from 'react-router-dom';
import {ViewProfileSection} from './view-profile-section';

/**
 * All view profiles of a profile (#213), opened from the menu and from the link below the newest three on the overview
 */
export const ViewProfilesPage = () => {
    const {initials} = useParams<{ initials: string }>();
    return <div className="col-md-10 col-md-offset-1">
        <Paper className="dashboard-element">
            <div className="mui-margin">
                <ViewProfileSection initials={initials}/>
            </div>
        </Paper>
    </div>;
};
