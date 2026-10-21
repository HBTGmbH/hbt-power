import * as React from 'react';
import {makeStyles} from '@material-ui/core/styles';

/**
 * Spacing scale of the forms (#40), on the 8 px grid of theme.spacing:
 * - tight (8 px): label and value, chips, elements in one row
 * - field (16 px): between the fields of a group
 * - section (32 px): between sections, before the button bar
 */
export type PwrSpacing = 'tight' | 'field' | 'section';

const useStyles = makeStyles(theme => ({
    tight: {height: theme.spacing(1)},
    field: {height: theme.spacing(2)},
    section: {height: theme.spacing(4)},
}));

/**
 * Vertical space of one level of the scale. A height, not a margin: margins of adjacent elements would collapse.
 */
export const PwrSpacer = (props: { size?: PwrSpacing }) => {
    const classes = useStyles();
    return <div className={classes[props.size || 'field']} aria-hidden="true"/>;
};
