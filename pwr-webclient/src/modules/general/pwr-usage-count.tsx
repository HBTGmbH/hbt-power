import * as React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {PowerLocalize} from '../../localization/PowerLocalizer';

const useStyles = makeStyles(theme => ({
    unused: {
        color: theme.palette.text.secondary,
    },
}));

/**
 * How many consultants use a profile element or skill, in a column of a list of the admin area (#271), right aligned
 * by the column (<code>alignRight</code>): 0 recognizably unused; nothing while the numbers are not loaded
 */
export const PwrUsageCount = ({count}: { count: number | undefined }) => {
    const classes = useStyles();
    if (count === undefined) {
        return null;
    }
    return <span className={count === 0 ? classes.unused : undefined}
                 title={count === 0 ? PowerLocalize.get('AdminClient.Overview.Unused') : undefined}>{count}</span>;
};

/** Width of the column of the numbers */
export const USAGE_COLUMN_WIDTH = 80;
