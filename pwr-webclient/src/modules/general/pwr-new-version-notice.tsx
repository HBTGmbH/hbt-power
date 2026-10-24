import * as React from 'react';
import {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {Snackbar, SnackbarContent} from '@material-ui/core';
import Refresh from '@material-ui/icons/Refresh';
import {AppInfoClient} from '../../clients/AppInfoClient';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {confirmLeavingUnsavedChanges} from '../../reducers/navigation/UnsavedChanges';
import {PwrButton} from './pwr-button';

/** How often to look for a new version, besides when the tab becomes visible again */
const CHECK_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Tells the user when the server delivers another webclient than the one running in this tab, and offers to reload
 * (#247). The bundle knows its commit from the build (REACT_APP_COMMIT, withCommit.js) and compares it with
 * build_info.json. The notice stays until the user reloads; nothing reloads by itself. Without an own commit, or while
 * build_info.json can't be loaded (e.g. a 502 while the container is replaced), nothing shows.
 */
export const PwrNewVersionNotice = () => {
    const dispatch = useDispatch();
    const [newVersion, setNewVersion] = useState(false);

    useEffect(() => {
        const own = process.env.REACT_APP_COMMIT;
        if (!own) {
            return undefined;
        }
        const check = () => AppInfoClient.instance().getDeliveredCommit()
            .then(delivered => {
                if (delivered && delivered !== own) {
                    setNewVersion(true);
                }
            });
        const checkWhenVisible = () => {
            if (document.visibilityState === 'visible') {
                check();
            }
        };
        check();
        const timer = window.setInterval(check, CHECK_INTERVAL_MS);
        document.addEventListener('visibilitychange', checkWhenVisible);
        return () => {
            window.clearInterval(timer);
            document.removeEventListener('visibilitychange', checkWhenVisible);
        };
    }, []);

    // Unsaved changes in a project ask first, like every other way of leaving the page
    const reload = () => dispatch(confirmLeavingUnsavedChanges(() => window.location.reload()) as any);

    return <Snackbar open={newVersion} anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}>
        <SnackbarContent
            message={PowerLocalize.get('App.NewVersion.Message')}
            action={<PwrButton color="inherit" text={PowerLocalize.get('App.NewVersion.Reload')} icon={<Refresh/>}
                               onClick={reload}/>}
        />
    </Snackbar>;
};
