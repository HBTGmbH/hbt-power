import * as React from 'react';
import {Link} from 'react-router-dom';
import iconPower from '../../img/icon-hbt-power.svg';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {Paths} from '../../Paths';

/**
 * Brand in the app bar: the HBT Power icon and the name next to it; on narrow screens the icon only (#123). Leads to
 * the start page of the account: the consultant management for admins, the own profile for everyone else (#263).
 */
export const PwrBrand = () => {
    const name = PowerLocalize.get('App.Name');
    return <div className="vertical-align pwr-brand">
        <Link to={Paths.START} className="pwr-brand-link" title={PowerLocalize.get('App.Start')}>
            <img className="pwr-brand-icon" src={iconPower} alt={name}/>
            <span className="pwr-brand-name" aria-hidden="true">{name}</span>
        </Link>
    </div>;
};
