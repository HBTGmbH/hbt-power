import * as React from 'react';
import iconPower from '../../img/icon-hbt-power.svg';
import {PowerLocalize} from '../../localization/PowerLocalizer';

/**
 * Brand in the app bar: the HBT Power icon and the name next to it; on narrow screens the icon only (#123)
 */
export const PwrBrand = () => {
    const name = PowerLocalize.get('App.Name');
    return <div className="vertical-align pwr-brand">
        <img className="pwr-brand-icon" src={iconPower} alt={name}/>
        <span className="pwr-brand-name" aria-hidden="true">{name}</span>
    </div>;
};
