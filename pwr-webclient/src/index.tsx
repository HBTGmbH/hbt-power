import * as React from 'react';
import { createRoot } from 'react-dom/client';

import './css/bootstrap.css';
// Icon font from the build instead of Google: works in every browser and sends nothing to a third party (#109)
import 'material-icons/iconfont/filled.css';
import './index.css';
import {ApplicationState, store} from './reducers/reducerIndex';
import {AppWrapper} from './app-wrapper-module';
import {storeHasUnsavedChanges} from './utils/PwrStoreUtils';
import {OIDCService} from './OIDCService';
import {Provider} from "react-redux";
import {PWR_HISTORY, setTransitionConfirmation} from './reducers/navigation/NavigationActionCreator';
import {confirmLeavingUnsavedChanges} from './reducers/navigation/UnsavedChanges';

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

/**
 * Every navigation inside the app (tabs, toolbar, menu, links, browser back/forward) that would leave a project with
 * unsaved changes waits for the UnsavedChangesDialog. Reload and closing the tab are left to the browser dialog above.
 */
export function registerUnsavedChangesGuard() {
    setTransitionConfirmation((message, callback) =>
        store.dispatch(confirmLeavingUnsavedChanges(() => callback(true), () => callback(false)) as any));
    PWR_HISTORY.block(location =>
        storeHasUnsavedChanges(store.getState()) && location.pathname !== PWR_HISTORY.location.pathname
            ? 'unsaved-changes' : undefined);
}

registerPageLeavePrevention();
registerUnsavedChangesGuard();
// Init OIDC
OIDCService.instance();
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<AppWrapper/>);

