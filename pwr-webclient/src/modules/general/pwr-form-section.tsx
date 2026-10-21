import * as React from 'react';
import {PropsWithChildren} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {PwrSpacer} from './pwr-spacer_module';
import {PwrFormSubCaption} from './pwr-typography';

interface PwrFormSectionProps {
    title?: string;
    /** The first section of a form: no section space above it */
    first?: boolean;
}

/**
 * A group of fields in a form (#40): section space above, the title close to its fields. Separate the fields inside
 * with PwrSpacer (field).
 */
export const PwrFormSection = (props: PropsWithChildren<PwrFormSectionProps>) => <section>
    {!props.first && <PwrSpacer size="section"/>}
    {props.title && <>
        <PwrFormSubCaption>{props.title}</PwrFormSubCaption>
        <PwrSpacer size="tight"/>
    </>}
    {props.children}
</section>;

const useRowStyles = makeStyles(theme => ({
    row: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: theme.spacing(1),
    },
}));

/**
 * Chips, small buttons and similar elements in a row that wraps, with the tight space (8 px) between them (#40)
 */
export const PwrRow = (props: PropsWithChildren<{}>) => {
    const classes = useRowStyles();
    return <div className={classes.row}>{props.children}</div>;
};
