import * as React from 'react';
import {useSelector} from 'react-redux';
import {LinearProgress} from '@material-ui/core';
import {ApplicationState} from '../../reducers/reducerIndex';

/**
 * A thin bar along the lower edge of the app bar while requests run (#320), in place of a spinner in the middle of the
 * page: it covers nothing and gets in the way of no click. It counts every request of the clients
 * (PowerHttpClient.counted) and goes once the last one is answered; only after a moment, so quick ones don't flash.
 * Goes into the AppBar.
 */
export const PwrRequestProgress = () => {
    const running = useSelector((state: ApplicationState) => state.crossCutting.pendingRequests > 0);
    return running ? <LinearProgress className="pwr-request-progress" color="secondary"/> : null;
};
