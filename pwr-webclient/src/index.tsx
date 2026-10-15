import * as React from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import {ApplicationState, store} from './reducers/reducerIndex';
import {AppWrapper} from './app-wrapper-module';
import {storeHasUnsavedChanges} from './utils/PwrStoreUtils';
import {OIDCService} from './OIDCService';
import {Provider} from "react-redux";

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
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<AppWrapper/>);

