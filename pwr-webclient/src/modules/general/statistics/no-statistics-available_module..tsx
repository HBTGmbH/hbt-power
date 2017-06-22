import * as React from 'react';
import {FontIcon} from 'material-ui';

interface NoStatisticsAvailableProps {

}

interface NoStatisticsAvailableState {

}

export class NoStatisticsAvailable extends React.Component<NoStatisticsAvailableProps, NoStatisticsAvailableState> {

    render() {
        return (<div><FontIcon className="material-icons">not_interest</FontIcon> No statistics available.</div>);
    }
}
