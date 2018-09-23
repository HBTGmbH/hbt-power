import * as React from 'react';
import {Icon} from '@material-ui/core';

interface NoStatisticsAvailableProps {

}

interface NoStatisticsAvailableState {

}

export class NoStatisticsAvailable extends React.Component<NoStatisticsAvailableProps, NoStatisticsAvailableState> {

    render() {
        return (<div><Icon className="material-icons">not_interest</Icon> No statistics available.</div>);
    }
}
