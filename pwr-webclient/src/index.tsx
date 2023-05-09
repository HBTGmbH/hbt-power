import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './index.css';
import {ApplicationState, store} from './reducers/reducerIndex';
import {AppWrapper} from './app-wrapper-module';
import {storeHasUnsavedChanges} from './utils/PwrStoreUtils';
import {OIDCService} from './OIDCService';

export function registerPageLeavePrevention() {
    // Prevents navigation
    const pageLeavePreventer = (ev: any) => {
        let state: ApplicationState = store.getState() as ApplicationState;
        return storeHasUnsavedChanges(store.getState()) ? 'DoNotLeave' : null;
    };

    /**
     * Register a listener that is called before the page is closed.
     */
    window.onbeforeunload = pageLeavePreventer;
}

registerPageLeavePrevention();
// Init OIDC
OIDCService.instance();
ReactDOM.render(
    (<AppWrapper/>),
    document.getElementById('root')
);

