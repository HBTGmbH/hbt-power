import * as React from 'react';
import {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {Redirect} from 'react-router-dom';
import Typography from '@material-ui/core/Typography/Typography';
import {PowerLocalize} from '../localization/PowerLocalizer';
import iconPower from '../img/icon-hbt-power.svg';
import {PwrSpacer} from './general/pwr-spacer_module';
import {navigateReplacing} from '../reducers/navigation/NavigationActionCreator';
import {Paths} from '../Paths';
import {ConsultantClient} from '../reducers/profile-new/consultant/ConsultantClient';
import {OIDCService} from '../OIDCService';

/**
 * Where the app starts after the login (#263): admins in the consultant management, everyone else in their own
 * profile, found by the initials in the token (#135). The page itself only shows while the own profile is looked up,
 * and a message if there is none or the account has no initials. Without an account (MSAL lost it while the app
 * still counts as logged in) the login starts again (#311). Nobody chooses a profile here any more: a user
 * only sees the own one (#255), admins open one from the consultant management.
 */
export const StartPage = () => {
    const dispatch = useDispatch();
    const account = OIDCService.instance().getCurrentAccount();
    const isAdmin = !!account && account.roles.includes('Power.Admin');
    const hasAccount = !!account;
    const ownInitials = account && account.initials;
    const [message, setMessage] = useState(!hasAccount || ownInitials ? '' : PowerLocalize.get('ProfileSelect.NoOwnInitials'));

    useEffect(() => {
        if (!hasAccount) {
            OIDCService.instance().loginAgain();
        }
    }, [hasAccount]);

    useEffect(() => {
        if (isAdmin || !ownInitials) {
            return undefined;
        }
        let unmounted = false;
        ConsultantClient.instance().findConsultant(ownInitials)
            .then(consultant => {
                if (unmounted) {
                    return;
                }
                if (consultant) {
                    // Replacing the start, so going back doesn't land on it and jump forward again
                    navigateReplacing(Paths.build(Paths.USER_HOME, {initials: ownInitials}), dispatch);
                } else {
                    setMessage(PowerLocalize.getFormatted('ProfileSelect.NoOwnProfile', ownInitials));
                }
            })
            .catch(() => !unmounted && setMessage(PowerLocalize.getFormatted('ProfileSelect.NoOwnProfile', ownInitials)));
        return () => {
            unmounted = true;
        };
    }, [isAdmin, ownInitials, dispatch]);

    if (isAdmin) {
        return <Redirect to={Paths.ADMIN_CONSULTANTS}/>;
    }
    return <React.Fragment>
        <div className="hbt-schild-background">
        </div>
        <div>
            <div className="vertical-align" style={{height: '100vh'}}>
                <div style={{padding: '64px', backgroundColor: 'white'}}>
                    {/* Dark only behind the icon, its colours are made for Dunkelblau (#125) */}
                    <div className="vertical-align">
                        <div className="pwr-login-icon-tile">
                            <img alt={PowerLocalize.get('App.Name')} className="pwr-login-icon" src={iconPower}/>
                        </div>
                    </div>
                    <div className="vertical-align">
                        <h1>{PowerLocalize.get('App.Name')}</h1>
                    </div>
                    <PwrSpacer size="tight"/>
                    <div className="vertical-align">
                        {message
                            ? <Typography color="error" className="pwr-profile-select-message">{message}</Typography>
                            : <Typography color="textSecondary">
                                {PowerLocalize.get(hasAccount ? 'ProfileSelect.OpeningOwnProfile' : 'ProfileSelect.RenewingLogin')}
                            </Typography>}
                    </div>
                </div>
            </div>
        </div>
    </React.Fragment>;
};
